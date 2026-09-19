const Clan = require('../models/Clan');
const User = require('../models/User');
const crApi = require('../utils/crApi');
const {
    normalizeTag,
    getWarState,
    formatMembers,
    getHistoryWarMeta
} = require('../services/warFormatter');
const { createWarSnapshot } = require('../services/warAnalyzer');

const normalizeConfiguredTag = (tag) => {
    const normalized = normalizeTag(tag);
    if (!normalized) return '';
    return normalized.startsWith('#') ? normalized : `#${normalized}`;
};

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getDateLabel = (date = new Date()) => date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

const getConfiguredClanTag = () => normalizeConfiguredTag(process.env.CLAN_TAG);

const ensureClanRecord = async ({ clanTag, clanName, fame, members }) => {
    const update = {
        $set: {
            name: clanName,
            fame: Number(fame || 0),
            members: Array.isArray(members) ? members : []
        },
        $setOnInsert: {
            tag: clanTag,
            warAttendance: []
        }
    };

    return Clan.findOneAndUpdate(
        { tag: clanTag },
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

exports.getClanStats = async (req, res) => {
    const clanTag = getConfiguredClanTag();
    console.log('Buscando dados para a Tag:', clanTag);

    if (!clanTag) {
        return res.status(500).json({ message: 'Tag do clã não está configurada no servidor.' });
    }

    try {
        const clanRecord = await Clan.findOne({ tag: clanTag });
        const apiClan = await crApi.getClan(clanTag);

        let riverRace = null;
        try {
            riverRace = await crApi.getRiverRace(clanTag);
        } catch (error) {
            if (error.response?.status !== 404) throw error;
            riverRace = {
                periodType: 'none',
                periodIndex: 0,
                sectionIndex: 0,
                clan: { participants: [], fame: 0 },
                periodLogs: []
            };
        }

        const warLog = await crApi.getWarLog(clanTag).catch(() => ({ items: [] }));
        const lastLogEntry = Array.isArray(warLog.items) ? warLog.items[0] : null;
        const warState = getWarState(riverRace);
        const members = formatMembers(apiClan.memberList || [], riverRace.clan?.participants || [], warState);
        const snapshot = createWarSnapshot({
            apiClan,
            riverRace,
            members,
            lastLogEntry,
            previousWar: lastLogEntry,
            warAttendance: Array.isArray(clanRecord?.warAttendance) ? clanRecord.warAttendance : []
        });
        const { isWarDay } = warState;
        const activeWarWindow = isWarDay && new Date().getHours() >= 22;
        const missedDecksToday = members
            .filter((member) => member.inRace && Number(member.decksUsedToday || 0) < 4)
            .map((member) => ({
                name: member.name,
                tag: member.tag,
                decksUsedToday: Number(member.decksUsedToday || 0),
                decksMissed: Math.max(0, 4 - Number(member.decksUsedToday || 0))
            }));

        await ensureClanRecord({
            clanTag: apiClan.tag,
            clanName: apiClan.name,
            fame: snapshot.war.fame,
            members: apiClan.memberList || []
        });

        res.json({
            name: apiClan.name,
            tag: apiClan.tag,
            war: snapshot.war,
            clan: snapshot.clan,
            today: snapshot.today,
            latestDay: snapshot.latestDay,
            periodLogs: snapshot.periodLogs,
            analysis: snapshot.analysis,
            fame: snapshot.war.fame,
            pendingAttacks: snapshot.today.playersPending + snapshot.today.playersNotStarted,
            membersParticipating: snapshot.clan.membersParticipating,
            totalMembers: apiClan.members,
            members,
            missedDecksToday,
            warAttendance: Array.isArray(clanRecord?.warAttendance) ? clanRecord.warAttendance.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [],
            endOfDayAlert: activeWarWindow && missedDecksToday.length > 0,
            fromApi: true,
            isWarDay
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
    const clanTag = getConfiguredClanTag();
    const memberTag = normalizeTag(req.body.memberTag);
    const memberName = String(req.body.memberName || '').trim();
    const justification = String(req.body.justification || '').trim();
    const decksUsed = Number(req.body.decksUsed);

    if (!clanTag) {
        return res.status(500).json({ message: 'Tag do clã não está configurada no servidor.' });
    }

    if (!memberTag || !memberName) {
        return res.status(400).json({ message: 'Tag e nome do membro são obrigatórios.' });
    }

    if (!Number.isFinite(decksUsed) || decksUsed < 0) {
        return res.status(400).json({ message: 'Quantidade de decks usada inválida.' });
    }

    try {
        const reportingUser = await User.findById(req.user.id).select('name clanTag email');
        if (!reportingUser) {
            return res.status(401).json({ message: 'Usuário autenticado não encontrado.' });
        }

        const reportedBy = reportingUser.name
            || reportingUser.clanTag
            || reportingUser.email;
        const existingClan = await Clan.findOne({ tag: clanTag });

        const clan = await ensureClanRecord({
            clanTag,
            clanName: existingClan?.name || clanTag,
            fame: existingClan?.fame || 0,
            members: existingClan?.members || []
        });
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
    const clanTag = getConfiguredClanTag();

    if (!clanTag) {
        return res.status(500).json({ message: 'Tag do clã não está configurada no servidor.' });
    }

    try {
        const warLog = await crApi.getWarLog(clanTag);
        const aggregated = {};

        const pastWars = warLog.items || [];
        const weeksCount = pastWars.length;

        const warHeaders = pastWars.map((war, index) => getHistoryWarMeta(war, index).label);

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
                            decksUsedTotal: 0,
                            history: new Array(weeksCount).fill(0),
                            decksHistory: new Array(weeksCount).fill(0)
                        };
                    }
                    aggregated[memberTag].weeks += 1;
                    aggregated[memberTag].total += p.fame;
                    aggregated[memberTag].decksUsedTotal += Number(p.decksUsed || 0);
                    aggregated[memberTag].history[weekIdx] = p.fame;
                    aggregated[memberTag].decksHistory[weekIdx] = Number(p.decksUsed || 0);
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
                history: item.history,
                decksHistory: item.decksHistory,
                attacksPossible: item.weeks * 16,
                attacksUsed: item.decksUsedTotal,
                participation: item.weeks
                    ? Math.round((item.decksUsedTotal / (item.weeks * 16)) * 100)
                    : 0
            }));

        historyArray.sort((a, b) => b.total - a.total);

        historyArray = historyArray.map((item, idx) => ({
            ...item,
            rank: idx + 1
        }));

        res.json({
            warHeaders,
            weekHeaders: warHeaders,
            members: historyArray
        });

    } catch (error) {
        console.error('War History Error:', error.stack);
        res.status(500).json({ message: 'Erro ao buscar histórico', error: error.message });
    }
};
