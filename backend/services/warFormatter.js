const ATTACKS_PER_DAY = 4;
const WAR_DAYS = 4;
const MAX_WAR_ATTACKS = ATTACKS_PER_DAY * WAR_DAYS;

const STATUS = {
    complete: 'complete',
    inProgress: 'in_progress',
    notStarted: 'not_started',
    notInRace: 'not_in_race',
    training: 'training'
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const normalizeTag = (tag) => String(tag || '')
    .trim()
    .replace(/["']/g, '')
    .toUpperCase();

const isWarPeriodType = (periodType) => periodType === 'warDay' || periodType === 'colosseum';

const getWarState = (riverRace = {}) => {
    const periodType = riverRace.periodType || 'unknown';
    const isWarDay = isWarPeriodType(periodType);
    const isTraining = periodType === 'training';
    const periodIndex = toNumber(riverRace.periodIndex, 0);
    const sectionIndex = toNumber(riverRace.sectionIndex, Math.floor(periodIndex / 7));
    const periodDay = ((periodIndex % 7) + 7) % 7;
    const warDay = isWarDay && periodDay >= 3 ? periodDay - 2 : null;

    return {
        periodType,
        periodIndex,
        sectionIndex,
        periodDay,
        isWarDay,
        isTraining,
        hasActiveRace: periodType !== 'unknown' && periodType !== 'none',
        warDay,
        totalDays: WAR_DAYS
    };
};

const getMemberTodayStatus = ({ isWarDay, isTraining, inRace, decksUsedToday }) => {
    if (isTraining) {
        return {
            key: STATUS.training,
            label: 'Treino'
        };
    }

    if (!isWarDay) {
        return {
            key: STATUS.notInRace,
            label: 'Fora da guerra'
        };
    }

    if (!inRace) {
        return {
            key: STATUS.notInRace,
            label: 'Ainda não iniciou'
        };
    }

    if (decksUsedToday >= ATTACKS_PER_DAY) {
        return {
            key: STATUS.complete,
            label: 'Completo'
        };
    }

    if (decksUsedToday > 0) {
        const remaining = ATTACKS_PER_DAY - decksUsedToday;
        return {
            key: STATUS.inProgress,
            label: remaining === 1 ? 'Falta 1' : `Faltam ${remaining}`
        };
    }

    return {
        key: STATUS.notStarted,
        label: 'Não começou'
    };
};

const formatParticipant = (member, participant, warState) => {
    const inRace = Boolean(participant);
    const decksUsedToday = clamp(toNumber(participant?.decksUsedToday, 0), 0, ATTACKS_PER_DAY);
    const decksUsed = clamp(toNumber(participant?.decksUsed, 0), 0, MAX_WAR_ATTACKS);
    const fame = toNumber(participant?.fame, 0);
    const status = getMemberTodayStatus({
        isWarDay: warState.isWarDay,
        isTraining: warState.isTraining,
        inRace,
        decksUsedToday
    });

    return {
        id: member.tag,
        name: member.name,
        tag: member.tag,
        role: member.role,
        trophies: toNumber(member.trophies, 0),
        inRace,
        fame,
        decksUsed,
        decksUsedToday,
        today: {
            decksUsed: decksUsedToday,
            decksRemaining: Math.max(0, ATTACKS_PER_DAY - decksUsedToday),
            status: status.key
        },
        war: {
            decksUsed,
            fame
        },
        statusKey: status.key,
        statusText: status.label
    };
};

const formatMembers = (memberList = [], participants = [], warState = getWarState()) => {
    const participantsMap = new Map(
        participants.map((participant) => [normalizeTag(participant.tag), participant])
    );

    return memberList.map((member) => formatParticipant(
        member,
        participantsMap.get(normalizeTag(member.tag)),
        warState
    ));
};

const inferCurrentSeasonId = (riverRace = {}, lastLogEntry) => {
    if (!lastLogEntry || !Number.isFinite(Number(lastLogEntry.seasonId))) {
        return null;
    }

    const currentSection = toNumber(riverRace.sectionIndex, 0);
    const lastSection = toNumber(lastLogEntry.sectionIndex, 0);
    const lastSeason = Number(lastLogEntry.seasonId);

    if (currentSection < lastSection) {
        return lastSeason + 1;
    }

    return lastSeason;
};

const getWarLabel = (seasonId, sectionIndex) => {
    if (!Number.isFinite(Number(seasonId))) {
        return `Semana ${(toNumber(sectionIndex, 0) + 1)}`;
    }

    return `Guerra ${Number(seasonId)}.${toNumber(sectionIndex, 0) + 1}`;
};

const getHistoryWarMeta = (war = {}, index = 0) => {
    const seasonId = Number(war.seasonId);
    const sectionIndex = toNumber(war.sectionIndex, 0);

    return {
        seasonId: Number.isFinite(seasonId) ? seasonId : null,
        sectionIndex,
        label: getWarLabel(seasonId, sectionIndex),
        createdDate: war.createdDate || null,
        fallbackIndex: index + 1
    };
};

module.exports = {
    ATTACKS_PER_DAY,
    WAR_DAYS,
    MAX_WAR_ATTACKS,
    STATUS,
    clamp,
    normalizeTag,
    toNumber,
    getWarState,
    formatMembers,
    inferCurrentSeasonId,
    getWarLabel,
    getHistoryWarMeta
};
