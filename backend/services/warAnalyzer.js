const {
    ATTACKS_PER_DAY,
    STATUS,
    getWarState,
    inferCurrentSeasonId,
    getWarLabel,
    normalizeTag,
    toNumber
} = require('./warFormatter');

const analyzeToday = (members = [], isWarDay = false) => {
    const roster = Array.isArray(members) ? members : [];
    const participating = roster.filter((member) => member.inRace !== false);
    const possible = isWarDay ? participating.length * ATTACKS_PER_DAY : 0;
    const used = isWarDay
        ? participating.reduce((total, member) => total + toNumber(member.today?.decksUsed ?? member.decksUsedToday, 0), 0)
        : 0;

    const complete = roster.filter((member) => member.statusKey === STATUS.complete).length;
    const pending = roster.filter((member) => member.statusKey === STATUS.inProgress).length;
    const notStarted = roster.filter((member) => member.statusKey === STATUS.notStarted).length;
    const notInRace = roster.filter((member) => member.statusKey === STATUS.notInRace).length;

    return {
        attacksPossible: possible,
        attacksUsed: used,
        playersComplete: complete,
        playersPending: pending,
        playersNotStarted: notStarted,
        playersNotInRace: notInRace
    };
};

const analyzePeriodLogs = (riverRace = {}, clanTag) => {
    const logs = Array.isArray(riverRace.periodLogs) ? riverRace.periodLogs : [];
    const ourTag = normalizeTag(clanTag);

    return logs.map((log) => {
        const item = (log.items || []).find((entry) => normalizeTag(entry.clan?.tag) === ourTag);
        if (!item) return null;

        const rankRaw = Number(item.endOfDayRank);
        const rankPending = rankRaw === -1 || !Number.isFinite(rankRaw);

        return {
            periodIndex: toNumber(log.periodIndex, 0),
            pointsEarned: toNumber(item.pointsEarned, 0),
            progressStartOfDay: toNumber(item.progressStartOfDay, 0),
            progressEndOfDay: toNumber(item.progressEndOfDay, 0),
            progressEarned: toNumber(item.progressEarned, 0),
            rank: rankPending ? null : rankRaw + 1,
            rankPending,
            defensesRemaining: toNumber(item.numOfDefensesRemaining, 0),
            defensePoints: toNumber(item.progressEarnedFromDefenses, 0)
        };
    }).filter(Boolean);
};

const calculatePercentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

const analyzeParticipation = (members = [], isWarDay = false) => {
    const participants = members.filter((member) => member.inRace);
    const attacksPossible = isWarDay ? participants.length * ATTACKS_PER_DAY : 0;
    const attacksUsed = isWarDay
        ? participants.reduce((total, member) => total + toNumber(member.decksUsedToday, 0), 0)
        : 0;

    return {
        attacksPossible,
        attacksUsed,
        percentage: calculatePercentage(attacksUsed, attacksPossible),
        playersComplete: participants.filter((member) => member.decksUsedToday >= ATTACKS_PER_DAY).length,
        playersInProgress: participants.filter((member) => member.decksUsedToday > 0 && member.decksUsedToday < ATTACKS_PER_DAY).length,
        playersNotStarted: participants.filter((member) => member.decksUsedToday === 0).length,
        playersNotInRace: members.filter((member) => !member.inRace).length
    };
};

const analyzePerformance = (members = []) => {
    const participants = members.filter((member) => member.inRace);
    const fameTotal = participants.reduce((total, member) => total + toNumber(member.fame, 0), 0);
    const attacksUsed = participants.reduce((total, member) => total + toNumber(member.decksUsed, 0), 0);

    return {
        fameTotal,
        averageFame: participants.length ? Math.round(fameTotal / participants.length) : 0,
        averageFamePerAttack: attacksUsed ? Math.round(fameTotal / attacksUsed) : 0,
        players: participants
            .map((member) => ({
                name: member.name,
                tag: member.tag,
                fame: toNumber(member.fame, 0),
                attacksUsed: toNumber(member.decksUsed, 0),
                famePerAttack: member.decksUsed ? Math.round(member.fame / member.decksUsed) : 0
            }))
            .sort((a, b) => b.fame - a.fame)
    };
};

const analyzeDeclines = (members = [], periodLogs = []) => {
    const hasIndividualDailyHistory = periodLogs.some((day) => Array.isArray(day.members));
    if (!hasIndividualDailyHistory) return [];

    const previousDay = periodLogs[periodLogs.length - 2];
    const currentDay = periodLogs[periodLogs.length - 1];
    if (!previousDay || !currentDay) return [];

    const previousByTag = new Map(previousDay.members.map((member) => [normalizeTag(member.tag), member]));
    return members
        .filter((member) => {
            const previous = previousByTag.get(normalizeTag(member.tag));
            return previous && toNumber(member.decksUsedToday, 0) < toNumber(previous.decksUsedToday, 0);
        })
        .map((member) => ({
            name: member.name,
            tag: member.tag,
            today: member.decksUsedToday,
            previousDay: previousDay.periodIndex
        }));
};

const analyzeLeaderAttention = (members = [], attendance = []) => members
    .filter((member) => member.inRace && member.decksUsedToday < ATTACKS_PER_DAY)
    .map((member) => {
        const historyCount = attendance.filter((entry) => normalizeTag(entry.memberTag) === normalizeTag(member.tag)).length;
        return {
            name: member.name,
            tag: member.tag,
            today: member.decksUsedToday,
            attacksRemaining: Math.max(0, ATTACKS_PER_DAY - member.decksUsedToday),
            incompleteHistory: historyCount,
            reason: 'participação abaixo do esperado'
        };
    });

const summarizePreviousWar = (war = {}, clanTag) => {
    const clanData = (war.standings || []).find((entry) => normalizeTag(entry.clan?.tag) === normalizeTag(clanTag));
    if (!clanData?.clan) return null;

    const participants = Array.isArray(clanData.clan.participants) ? clanData.clan.participants : [];
    const attacksUsed = participants.reduce((total, participant) => total + toNumber(participant.decksUsed, 0), 0);
    const fame = toNumber(clanData.clan.fame, toNumber(clanData.clan.periodPoints, 0));
    const rank = Number(clanData.clan.rank);

    return {
        fame,
        averageFame: participants.length ? Math.round(fame / participants.length) : 0,
        attacksUsed,
        participation: calculatePercentage(attacksUsed, participants.length * 16),
        rank: Number.isFinite(rank) ? rank : null
    };
};

const createWarSnapshot = ({ apiClan, riverRace, members, lastLogEntry = null, warAttendance = [], previousWar = null }) => {
    const warState = getWarState(riverRace);
    const seasonId = inferCurrentSeasonId(riverRace, lastLogEntry);
    const today = analyzeToday(members, warState.isWarDay);
    const periodLogs = analyzePeriodLogs(riverRace, apiClan.tag);
    const latestDay = periodLogs.length ? periodLogs[periodLogs.length - 1] : null;
    const participation = analyzeParticipation(members, warState.isWarDay);
    const performance = analyzePerformance(members);

    return {
        war: {
            seasonId,
            section: warState.sectionIndex,
            sectionIndex: warState.sectionIndex,
            periodType: warState.periodType,
            periodIndex: warState.periodIndex,
            periodDay: warState.periodDay,
            day: warState.warDay,
            totalDays: warState.totalDays,
            isWarDay: warState.isWarDay,
            isTraining: warState.isTraining,
            hasActiveRace: warState.hasActiveRace,
            label: getWarLabel(seasonId, warState.sectionIndex),
            fame: toNumber(riverRace.clan?.fame, toNumber(riverRace.clan?.periodPoints, 0))
        },
        clan: {
            name: apiClan.name,
            tag: apiClan.tag,
            fame: toNumber(riverRace.clan?.fame, toNumber(riverRace.clan?.periodPoints, 0)),
            totalMembers: toNumber(apiClan.members, members.length),
            membersParticipating: members.filter((member) => member.inRace).length
        },
        today,
        latestDay,
        periodLogs,
        members,
        warAttendance,
        analysis: {
            participation,
            performance,
            declines: analyzeDeclines(members, periodLogs),
            leaderAttention: analyzeLeaderAttention(members, warAttendance),
            comparison: previousWar ? {
                current: {
                    fame: performance.fameTotal,
                    averageFame: performance.averageFame,
                    attacksUsed: participation.attacksUsed,
                    participation: participation.percentage,
                    rank: latestDay?.rank ?? null
                },
                previous: summarizePreviousWar(previousWar, apiClan.tag)
            } : null
        }
    };
};

module.exports = {
    analyzeToday,
    analyzePeriodLogs,
    analyzeParticipation,
    analyzePerformance,
    analyzeDeclines,
    analyzeLeaderAttention,
    createWarSnapshot
};
