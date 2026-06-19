const Clan = require('../models/Clan');
const crApi = require('../utils/crApi');

const normalizeTag = (tag) => String(tag || '')
    .trim()
    .replace(/["']/g, '')
    .toUpperCase();

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getDateLabel = (date = new Date()) => date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

exports.getClanStats = async (req, res) => {
    let clanTag = normalizeTag(req.query.tag || process.env.CLAN_TAG || '#L98JQV');
    console.log('Buscando dados para a Tag:', clanTag);


    try {
        const clanRecord = await Clan.findOne({ tag: clanTag });
        const apiClan = await crApi.getClan(clanTag);
        const riverRace = await crApi.getRiverRace(clanTag);

        const participantsMap = {};
        if (riverRace.clan && riverRace.clan.participants) {
            riverRace.clan.participants.forEach(p => {
                participantsMap[normalizeTag(p.tag)] = p;
            });
        }

        const currentMembersTags = new Set((apiClan.memberList || []).map(m => normalizeTag(m.tag)));

        const members = (apiClan.memberList || []).map(m => {
            const warInfo = participantsMap[normalizeTag(m.tag)] || { decksUsed: 0, fame: 0 };
            return {
                name: m.name,
                tag: m.tag,
                role: m.role,
                trophies: m.trophies || 0,
                decksUsed: warInfo.decksUsed || 0,
                medals: warInfo.fame || 0,
                status: warInfo.decksUsed >= 4 ? 'Concluído' : (warInfo.decksUsed > 0 ? 'Em Batalha' : 'Pendente')
            };
        });

        const activeParticipants = (riverRace.clan?.participants || []).filter(p => currentMembersTags.has(normalizeTag(p.tag)));

        const today = new Date();
        const dayIdx = today.getDay(); // 0-Dom, 4-Qui, 5-Sex, 6-Sab
        const isWarDay = dayIdx === 0 || dayIdx >= 4;
        const activeWarWindow = isWarDay && today.getHours() >= 22;
        const missedDecksToday = members
            .filter(member => Number(member.decksUsed || 0) < 4)
            .map(member => ({
                name: member.name,
                tag: member.tag,
                decksUsed: Number(member.decksUsed || 0),
                decksMissed: Math.max(0, 4 - Number(member.decksUsed || 0))
            }));

        res.json({
            name: apiClan.name,
            tag: apiClan.tag,
            warDay: (riverRace.periodIndex || 0) + 1,
            medals: riverRace.clan?.fame || riverRace.clan?.periodPoints || 0,
            pendingAttacks: isWarDay ? members.filter(m => m.decksUsed < 4).length : 0,
            membersParticipating: activeParticipants.length,
            totalMembers: apiClan.members,
            members: members,
            missedDecksToday,
            warAttendance: Array.isArray(clanRecord?.warAttendance) ? clanRecord.warAttendance.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [],
            endOfDayAlert: activeWarWindow && missedDecksToday.length > 0,
            fromApi: true,
            isWarDay: isWarDay
        });

    } catch (error) {
        console.error('CR API Error:', error.response?.data || error.message);

        const status = error.response?.status || 500;
        let message = 'Erro na API do Clash Royale';

        if (status === 403) message = 'Erro de Autenticação (Verifique IP/Chave no .env)';
        if (status === 404) message = `Clã não encontrado (Verifique a Tag: ${clanTag})`;

        res.status(status).json({
            message,
            error: error.response?.data?.reason || error.message,
            members: [],
            name: 'Clã não encontrado',
            tag: clanTag
        });
    }
};

exports.saveWarAttendance = async (req, res) => {
    const clanTag = normalizeTag(req.body.clanTag || req.query.tag || process.env.CLAN_TAG || '#L98JQV');
    const memberTag = normalizeTag(req.body.memberTag);
    const memberName = String(req.body.memberName || '').trim();
    const justification = String(req.body.justification || '').trim();
    const decksUsed = Number(req.body.decksUsed);
    const reportedBy = String(req.body.reportedBy || '').trim();

    if (!memberTag || !memberName) {
        return res.status(400).json({ message: 'Tag e nome do membro são obrigatórios.' });
    }

    if (!Number.isFinite(decksUsed) || decksUsed < 0) {
        return res.status(400).json({ message: 'Quantidade de decks usada inválida.' });
    }

    try {
        const clan = await Clan.findOne({ tag: clanTag });
        if (!clan) {
            return res.status(404).json({ message: 'Clã não encontrado para registrar a justificativa.' });
        }

        const now = new Date();
        const dateKey = getDateKey(now);
        const dateLabel = getDateLabel(now);
        const decksMissed = Math.max(0, 4 - decksUsed);

        const existingIndex = clan.warAttendance.findIndex((entry) =>
            entry.dateKey === dateKey && normalizeTag(entry.memberTag) === memberTag
        );

        const attendanceRecord = {
            dateKey,
            dateLabel,
            memberName,
            memberTag,
            decksUsed,
            decksMissed,
            justification,
            reportedBy
        };

        if (existingIndex >= 0) {
            clan.warAttendance[existingIndex] = {
                ...clan.warAttendance[existingIndex].toObject?.() || clan.warAttendance[existingIndex],
                ...attendanceRecord
            };
        } else {
            clan.warAttendance.push(attendanceRecord);
        }

        await clan.save();

        res.json({
            success: true,
            attendance: attendanceRecord,
            warAttendance: clan.warAttendance.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        });
    } catch (error) {
        console.error('War Attendance Error:', error.stack);
        res.status(500).json({ message: 'Erro ao salvar justificativa de guerra', error: error.message });
    }
};

exports.getWarHistory = async (req, res) => {
    let clanTag = normalizeTag(req.query.tag || process.env.CLAN_TAG || '#L98JQV');


    try {
        const warLog = await crApi.getWarLog(clanTag);
        const aggregated = {};

        const pastWars = warLog.items || [];
        const weeksCount = pastWars.length;

        const weekHeaders = pastWars.map((war) => {
            return `S${(war.sectionIndex || 0) + 1}`;
        });

        pastWars.forEach((war, weekIdx) => {
            const clanData = war.standings?.find(s => normalizeTag(s.clan?.tag) === clanTag);
            if (clanData && clanData.clan.participants) {
                clanData.clan.participants.forEach(p => {
                    const memberTag = normalizeTag(p.tag);
                    if (!aggregated[memberTag]) {
                        aggregated[memberTag] = {
                            name: p.name,
                            tag: p.tag,
                            role: '...',
                            weeks: 0,
                            total: 0,
                            history: new Array(weeksCount).fill(0)
                        };
                    }
                    aggregated[memberTag].weeks += 1;
                    aggregated[memberTag].total += p.fame;
                    aggregated[memberTag].history[weekIdx] = p.fame;
                });
            }
        });

        const apiClan = await crApi.getClan(clanTag);
        const currentMembersTags = new Set((apiClan.memberList || []).map(m => normalizeTag(m.tag)));

        let historyArray = Object.values(aggregated)
            .filter(item => currentMembersTags.has(normalizeTag(item.tag)))
            .map(item => ({
                rank: 0,
                name: item.name,
                tag: item.tag,
                weeks: item.weeks,
                total: item.total,
                average: Math.round(item.total / (item.weeks || 1)),
                history: item.history
            }));

        historyArray.sort((a, b) => b.total - a.total);

        historyArray = historyArray.map((item, idx) => ({
            ...item,
            rank: idx + 1
        }));

        res.json({
            weekHeaders,
            members: historyArray
        });

    } catch (error) {
        console.error('War History Error:', error.stack);
        res.status(500).json({ message: 'Erro ao buscar histórico', error: error.message });
    }
};

