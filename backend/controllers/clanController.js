const Clan = require('../models/Clan');
const crApi = require('../utils/crApi');

const normalizeTag = (tag) => String(tag || '')
    .trim()
    .replace(/["']/g, '')
    .toUpperCase();

exports.getClanStats = async (req, res) => {
    let clanTag = normalizeTag(req.query.tag || process.env.CLAN_TAG || '#L98JQV');
    console.log('Buscando dados para a Tag:', clanTag);


    try {
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

        res.json({
            name: apiClan.name,
            tag: apiClan.tag,
            warDay: (riverRace.periodIndex || 0) + 1,
            medals: riverRace.clan?.fame || riverRace.clan?.periodPoints || 0,
            pendingAttacks: isWarDay ? members.filter(m => m.decksUsed < 4).length : 0,
            membersParticipating: activeParticipants.length,
            totalMembers: apiClan.members,
            members: members,
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

