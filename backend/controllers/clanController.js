const Clan = require('../models/Clan');
const User = require('../models/User');
const crApi = require('../utils/crApi');
const {
    normalizeTag,
    getWarState,
    formatMembers,
    getHistoryWarMeta,
} = require('../services/warFormatter');
const { createWarSnapshot } = require('../services/warAnalyzer');

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────
const DECKS_PER_DAY = 4;
const ATTACKS_PER_WEEK = 16; // 4 war days × 4 decks
const MAX_MEMBER_NAME_LEN = 100;
const MAX_JUSTIFICATION_LEN = 500;

// ─────────────────────────────────────────────────────────────
// Cache em memória (TTL) — economiza quota da API do CR
// ─────────────────────────────────────────────────────────────
const _cache = new Map();

const cachedFetch = async (key, ttlMs, fetcher) => {
    const now = Date.now();
    const hit = _cache.get(key);
    if (hit && hit.expiresAt > now) return hit.value;

    const value = await fetcher();
    _cache.set(key, { value, expiresAt: now + ttlMs });
    return value;
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const normalizeConfiguredTag = (tag) => {
    const normalized = normalizeTag(tag);
    if (!normalized) return '';
    return normalized.startsWith('#') ? normalized : `#${normalized}`;
};

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getDateLabel = (date = new Date()) =>
    date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

const getConfiguredClanTag = () => normalizeConfiguredTag(process.env.CLAN_TAG);

const ensureClanRecord = async ({ clanTag, clanName, fame, members }) => {
    const update = {
        $set: {
            name: String(clanName || clanTag || '').trim(),
            fame: Number(fame || 0),
            members: Array.isArray(members) ? members : [],
        },
        $setOnInsert: {
            tag: clanTag,
            warAttendance: [],
        },
    };

    return Clan.findOneAndUpdate({ tag: clanTag }, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
    });
};

const sortAttendanceDesc = (list) =>
    Array.isArray(list)
        ? list
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

// ─────────────────────────────────────────────────────────────
// GET /api/clan/stats
// ─────────────────────────────────────────────────────────────
exports.getClanStats = async (req, res) => {
    const clanTag = getConfiguredClanTag();
    console.log('[clanController] getClanStats:', clanTag);

    if (!clanTag) {
        return res
            .status(500)
            .json({ message: 'Tag do clã não está configurada no servidor.' });
    }

    try {
        // 1. Clã (cache 60s)
        const apiClan = await cachedFetch(`clan:${clanTag}`, 60_000, () =>
            crApi.getClan(clanTag)
        );

        // 2. River race (cache 30s; 404 vira objeto vazio)
        let riverRace;
        try {
            riverRace = await cachedFetch(`race:${clanTag}`, 30_000, () =>
                crApi.getRiverRace(clanTag)
            );
        } catch (error) {
            if (error.response?.status !== 404) throw error;
            riverRace = {
                periodType: 'none',
                periodIndex: 0,
                sectionIndex: 0,
                clan: { participants: [], fame: 0 },
                periodLogs: [],
            };
        }

        // 3. War log (cache 5min; falha vira { items: [] })
        const warLog = await cachedFetch(`warlog:${clanTag}`, 5 * 60_000, () =>
            crApi.getWarLog(clanTag).catch(() => ({ items: [] }))
        );

        const lastLogEntry = Array.isArray(warLog.items) ? warLog.items[0] : null;
        const warState = getWarState(riverRace);
        const members = formatMembers(
            apiClan.memberList || [],
            riverRace.clan?.participants || [],
            warState
        );

        // 4. Atualiza registro do clã ANTES de montar snapshot
        //    (assim warAttendance está fresco para o snapshot)
        const updatedClanRecord = await ensureClanRecord({
            clanTag: apiClan.tag,
            clanName: apiClan.name,
            fame: 0,
            members: apiClan.memberList || [],
        });

        const warAttendance = Array.isArray(updatedClanRecord?.warAttendance)
            ? updatedClanRecord.warAttendance
            : [];

        // 5. Snapshot
        let snapshot;
        try {
            snapshot = createWarSnapshot({
                apiClan,
                riverRace,
                members,
                lastLogEntry,
                previousWar: lastLogEntry,
                warAttendance,
            });
        } catch (err) {
            console.error('[clanController] createWarSnapshot falhou:', err);
            return res
                .status(500)
                .json({ message: 'Erro ao processar dados de guerra' });
        }

        const { isWarDay } = warState;
        const activeWarWindow = isWarDay && new Date().getHours() >= 22;

        const missedDecksToday = members
            .filter(
                (m) =>
                    m.inRace && Number(m.decksUsedToday || 0) < DECKS_PER_DAY
            )
            .map((m) => ({
                name: m.name,
                tag: m.tag,
                decksUsedToday: Number(m.decksUsedToday || 0),
                decksMissed: Math.max(
                    0,
                    DECKS_PER_DAY - Number(m.decksUsedToday || 0)
                ),
            }));

        return res.json({
            name: apiClan.name,
            tag: apiClan.tag,
            war: snapshot.war,
            clan: snapshot.clan,
            today: snapshot.today,
            latestDay: snapshot.latestDay,
            periodLogs: snapshot.periodLogs,
            analysis: snapshot.analysis,
            fame: snapshot.war.fame,
            pendingAttacks:
                snapshot.today.playersPending + snapshot.today.playersNotStarted,
            membersParticipating: snapshot.clan.membersParticipating,
            totalMembers: apiClan.members,
            members,
            missedDecksToday,
            warAttendance: sortAttendanceDesc(warAttendance),
            endOfDayAlert: activeWarWindow && missedDecksToday.length > 0,
            fromApi: true,
            isWarDay,
        });
    } catch (error) {
        console.error('[clanController] getClanStats erro:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });

        const status = error.response?.status || 500;
        let message = 'Erro na API do Clash Royale';

        if (status === 403) {
            message =
                'Erro de Autenticação (Verifique CLASH_ROYALE_API_KEY e o IP de saída)';
        } else if (status === 404) {
            message = `Clã não encontrado (Verifique a Tag: ${clanTag})`;
        } else if (status === 429) {
            message =
                'Limite de requisições da API atingido. Tente novamente em alguns minutos.';
        }

        return res.status(status).json({
            message,
            error: error.response?.data?.reason || error.message,
            members: [],
            name: 'Clã não encontrado',
            tag: clanTag,
        });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/clan/attendance
// ─────────────────────────────────────────────────────────────
exports.saveWarAttendance = async (req, res) => {
    const clanTag = getConfiguredClanTag();
    const memberTag = normalizeTag(req.body.memberTag);
    const memberName = String(req.body.memberName || '').trim();
    const justification = String(req.body.justification || '').trim();
    const decksUsed = Number(req.body.decksUsed);

    if (!clanTag) {
        return res
            .status(500)
            .json({ message: 'Tag do clã não está configurada no servidor.' });
    }
    if (!memberTag || !memberName) {
        return res
            .status(400)
            .json({ message: 'Tag e nome do membro são obrigatórios.' });
    }
    if (memberName.length > MAX_MEMBER_NAME_LEN) {
        return res.status(400).json({ message: 'Nome do membro muito longo.' });
    }
    if (justification.length > MAX_JUSTIFICATION_LEN) {
        return res.status(400).json({ message: 'Justificativa muito longa.' });
    }
    if (
        !Number.isFinite(decksUsed) ||
        decksUsed < 0 ||
        decksUsed > DECKS_PER_DAY
    ) {
        return res.status(400).json({
            message: `Decks usados deve ser entre 0 e ${DECKS_PER_DAY}.`,
        });
    }

    try {
        const reportingUser = await User.findById(req.user.id).select(
            'name clanTag email'
        );
        if (!reportingUser) {
            return res
                .status(401)
                .json({ message: 'Usuário autenticado não encontrado.' });
        }

        const reportedBy =
            reportingUser.name ||
            reportingUser.clanTag ||
            reportingUser.email ||
            'desconhecido';

        const existingClan = await Clan.findOne({ tag: clanTag });
        const clan = await ensureClanRecord({
            clanTag,
            clanName: existingClan?.name || clanTag,
            fame: existingClan?.fame || 0,
            members: existingClan?.members || [],
        });

        if (!clan) {
            return res.status(404).json({
                message: 'Clã não encontrado para registrar a justificativa.',
            });
        }

        if (!Array.isArray(clan.warAttendance)) {
            clan.warAttendance = [];
        }

        const now = new Date();
        const dateKey = getDateKey(now);
        const dateLabel = getDateLabel(now);
        const decksMissed = Math.max(0, DECKS_PER_DAY - decksUsed);

        const existingIndex = clan.warAttendance.findIndex(
            (e) =>
                e.dateKey === dateKey &&
                normalizeTag(e.memberTag) === memberTag
        );

        const attendanceRecord = {
            dateKey,
            dateLabel,
            memberName,
            memberTag,
            decksUsed,
            decksMissed,
            justification,
            reportedBy,
        };

        if (existingIndex >= 0) {
            const current = clan.warAttendance[existingIndex];
            clan.warAttendance[existingIndex] = {
                ...(current.toObject?.() || current),
                ...attendanceRecord,
            };
        } else {
            clan.warAttendance.push(attendanceRecord);
        }

        await clan.save();

        return res.json({
            success: true,
            attendance: attendanceRecord,
            warAttendance: sortAttendanceDesc(clan.warAttendance),
        });
    } catch (error) {
        console.error('[clanController] saveWarAttendance erro:', error.stack);
        return res.status(500).json({
            message: 'Erro ao salvar justificativa de guerra',
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/clan/history
// ─────────────────────────────────────────────────────────────
exports.getWarHistory = async (req, res) => {
    const clanTag = getConfiguredClanTag();

    if (!clanTag) {
        return res
            .status(500)
            .json({ message: 'Tag do clã não está configurada no servidor.' });
    }

    try {
        const warLog = await crApi.getWarLog(clanTag);
        const pastWars = Array.isArray(warLog.items) ? warLog.items : [];
        const weeksCount = pastWars.length;

        if (weeksCount === 0) {
            return res.json({
                warHeaders: [],
                weekHeaders: [],
                members: [],
                empty: true,
            });
        }

        const warHeaders = pastWars.map(
            (war, index) => getHistoryWarMeta(war, index).label
        );

        const aggregated = {};

        pastWars.forEach((war, weekIdx) => {
            const clanData = (war.standings || []).find(
                (s) => s.clan && normalizeTag(s.clan.tag) === clanTag
            );
            if (!clanData?.clan?.participants) return;

            clanData.clan.participants.forEach((p) => {
                const memberTag = normalizeTag(p.tag);
                if (!memberTag) return;

                if (!aggregated[memberTag]) {
                    aggregated[memberTag] = {
                        name: p.name,
                        tag: p.tag,
                        role: '...',
                        weeks: 0,
                        total: 0,
                        decksUsedTotal: 0,
                        history: new Array(weeksCount).fill(0),
                        decksHistory: new Array(weeksCount).fill(0),
                    };
                }

                aggregated[memberTag].weeks += 1;
                aggregated[memberTag].total += Number(p.fame || 0);
                aggregated[memberTag].decksUsedTotal += Number(p.decksUsed || 0);
                aggregated[memberTag].history[weekIdx] = Number(p.fame || 0);
                aggregated[memberTag].decksHistory[weekIdx] = Number(
                    p.decksUsed || 0
                );
            });
        });

        const apiClan = await crApi.getClan(clanTag);
        const currentMembersTags = new Set(
            (apiClan.memberList || [])
                .map((m) => normalizeTag(m.tag))
                .filter(Boolean)
        );

        let historyArray = Object.values(aggregated)
            .filter((item) => currentMembersTags.has(normalizeTag(item.tag)))
            .map((item) => {
                const attacksPossible = item.weeks * ATTACKS_PER_WEEK;
                return {
                    rank: 0,
                    name: item.name,
                    tag: item.tag,
                    weeks: item.weeks,
                    total: item.total,
                    average: Math.round(item.total / (item.weeks || 1)),
                    history: item.history,
                    decksHistory: item.decksHistory,
                    attacksPossible,
                    attacksUsed: item.decksUsedTotal,
                    participation: attacksPossible
                        ? Math.round(
                              (item.decksUsedTotal / attacksPossible) * 100
                          )
                        : 0,
                };
            });

        historyArray.sort((a, b) => b.total - a.total);
        historyArray = historyArray.map((item, idx) => ({
            ...item,
            rank: idx + 1,
        }));

        return res.json({
            warHeaders,
            weekHeaders: warHeaders,
            members: historyArray,
        });
    } catch (error) {
        console.error('[clanController] getWarHistory erro:', error.stack);
        return res.status(500).json({
            message: 'Erro ao buscar histórico',
            error: error.message,
        });
    }
};