export const WAR_RULES = {
    attacksPerDay: 4,
    warDays: 4,
    maxTotalAttacks: 16
};

const STATUS_STYLES = {
    complete: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80',
    in_progress: 'text-amber-300 bg-amber-950/60 border-amber-800/80',
    not_started: 'text-red-300 bg-red-950/60 border-red-800/80',
    not_in_race: 'text-slate-300 bg-slate-900/80 border-slate-700/80',
    training: 'text-slate-300 bg-slate-900/80 border-slate-700/80'
};

export const getMemberFame = (member = {}) =>
    Number(member.war?.fame ?? member.fame ?? 0) || 0;

export const getTodayDecks = (member = {}) =>
    Number(member.today?.decksUsed ?? member.decksUsedToday ?? 0) || 0;

export const getWarDecks = (member = {}) =>
    Number(member.war?.decksUsed ?? member.decksUsed ?? 0) || 0;

export const getStatusKey = (member = {}) => member.statusKey || member.today?.status || 'not_started';

export const getStatusStyle = (statusKey) => STATUS_STYLES[statusKey] || STATUS_STYLES.not_started;

export const normalizeMemberWarData = (member = {}) => {
    const todayDecks = getTodayDecks(member);
    const warDecks = getWarDecks(member);
    const fame = getMemberFame(member);
    const statusKey = getStatusKey(member);
    const tag = member.tag || member.id || '#000000';

    return {
        ...member,
        id: member.id || tag,
        tag,
        name: member.name || 'Guerreiro',
        role: member.role || 'membro',
        trophies: Number(member.trophies || 0),
        inRace: Boolean(member.inRace),
        fame,
        decksUsed: warDecks,
        decksUsedToday: todayDecks,
        today: member.today || {
            decksUsed: todayDecks,
            decksRemaining: Math.max(0, WAR_RULES.attacksPerDay - todayDecks),
            status: statusKey
        },
        war: member.war || {
            decksUsed: warDecks,
            fame
        },
        statusKey,
        statusText: member.statusText || 'Sem status',
        badgeStyle: getStatusStyle(statusKey)
    };
};

export const normalizeWarMembers = (members = []) => members.map(normalizeMemberWarData);

export const getNeedsAttention = (members = []) => members.filter((member) =>
    ['in_progress', 'not_started'].includes(getStatusKey(member))
);

export const matchesMemberFilter = (member, filter) => {
    const statusKey = getStatusKey(member);
    if (filter === 'all') return true;
    if (filter === 'complete') return statusKey === 'complete';
    if (filter === 'pending') return statusKey === 'in_progress';
    if (filter === 'notStarted') return statusKey === 'not_started' || statusKey === 'not_in_race';
    return true;
};
