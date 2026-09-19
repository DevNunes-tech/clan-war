const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getWarState, formatMembers, inferCurrentSeasonId, getWarLabel } = require('./warFormatter');
const {
    analyzeToday,
    analyzeParticipation,
    analyzePerformance,
    analyzeLeaderAttention,
    createWarSnapshot
} = require('./warAnalyzer');

test('calcula dia da guerra a partir de periodIndex, não do calendário', () => {
    const state = getWarState({ periodType: 'warDay', periodIndex: 17, sectionIndex: 2 });
    assert.equal(state.periodDay, 3);
    assert.equal(state.warDay, 1);
    assert.equal(state.isWarDay, true);
    assert.equal(state.isTraining, false);
});

test('colosseum no periodDay 6 é dia 4', () => {
    const state = getWarState({ periodType: 'colosseum', periodIndex: 20 });
    assert.equal(state.periodDay, 6);
    assert.equal(state.warDay, 4);
});

test('treino não vira dia de guerra', () => {
    const state = getWarState({ periodType: 'training', periodIndex: 14 });
    assert.equal(state.warDay, null);
    assert.equal(state.isTraining, true);
    assert.equal(state.isWarDay, false);
});

test('separa decksUsedToday de decksUsed acumulado', () => {
    const warState = getWarState({ periodType: 'warDay', periodIndex: 18 });
    const members = formatMembers(
        [{ name: 'Mt-Bala', tag: '#AAA', role: 'member', trophies: 1000 }],
        [{ tag: '#AAA', decksUsed: 12, decksUsedToday: 4, fame: 2100 }],
        warState
    );

    assert.equal(members[0].today.decksUsed, 4);
    assert.equal(members[0].war.decksUsed, 12);
    assert.equal(members[0].war.fame, 2100);
    assert.equal(members[0].statusKey, 'complete');
});

test('membro fora de participants não é acusado de falta', () => {
    const warState = getWarState({ periodType: 'warDay', periodIndex: 18 });
    const members = formatMembers(
        [{ name: 'Novo', tag: '#BBB', role: 'member', trophies: 800 }],
        [],
        warState
    );

    assert.equal(members[0].inRace, false);
    assert.equal(members[0].statusKey, 'not_in_race');
    assert.equal(members[0].statusText, 'Ainda não iniciou');
});

test('ataques de hoje usam decksUsedToday', () => {
    const today = analyzeToday([
        { today: { decksUsed: 4 }, statusKey: 'complete' },
        { today: { decksUsed: 2 }, statusKey: 'in_progress' },
        { today: { decksUsed: 0 }, statusKey: 'not_started' }
    ], true);

    assert.equal(today.attacksUsed, 6);
    assert.equal(today.attacksPossible, 12);
    assert.equal(today.playersComplete, 1);
    assert.equal(today.playersPending, 1);
    assert.equal(today.playersNotStarted, 1);
});

test('dados realistas separam ataques de hoje dos ataques acumulados', () => {
    const members = formatMembers(
        [
            { name: 'Jogador A', tag: '#A' },
            { name: 'Jogador B', tag: '#B' },
            { name: 'Jogador C', tag: '#C' },
            { name: 'Jogador D', tag: '#D' },
            { name: 'Jogador E', tag: '#E' }
        ],
        [
            { tag: '#A', decksUsedToday: 0, decksUsed: 0 },
            { tag: '#B', decksUsedToday: 1, decksUsed: 5 },
            { tag: '#C', decksUsedToday: 2, decksUsed: 9 },
            { tag: '#D', decksUsedToday: 3, decksUsed: 12 },
            { tag: '#E', decksUsedToday: 4, decksUsed: 16 }
        ],
        getWarState({ periodType: 'warDay', periodIndex: 4 })
    );

    assert.deepEqual(members.map((member) => member.today.decksUsed), [0, 1, 2, 3, 4]);
    assert.deepEqual(members.map((member) => member.war.decksUsed), [0, 5, 9, 12, 16]);
    assert.equal(analyzeToday(members, true).attacksPossible, 20);
});

test('membro fora da corrida não aumenta ataques possíveis nem vira falta', () => {
    const today = analyzeToday([
        { inRace: true, today: { decksUsed: 2 }, statusKey: 'in_progress' },
        { inRace: false, today: { decksUsed: 0 }, statusKey: 'not_in_race' }
    ], true);

    assert.equal(today.attacksPossible, 4);
    assert.equal(today.attacksUsed, 2);
    assert.equal(today.playersNotInRace, 1);
});

test('rótulo de guerra usa temporada e seção, não S1 S2', () => {
    assert.equal(getWarLabel(136, 0), 'Guerra 136.1');
    assert.equal(inferCurrentSeasonId({ sectionIndex: 0 }, { seasonId: 135, sectionIndex: 4 }), 136);
    assert.equal(inferCurrentSeasonId({ sectionIndex: 3 }, { seasonId: 136, sectionIndex: 2 }), 136);
});

test('snapshot expõe fama e dia atual', () => {
    const riverRace = {
        periodType: 'warDay',
        periodIndex: 18,
        sectionIndex: 2,
        clan: { fame: 12340, participants: [] },
        periodLogs: []
    };
    const members = formatMembers(
        [{ name: 'Biel', tag: '#C', role: 'member', trophies: 1 }],
        [{ tag: '#C', decksUsedToday: 3, decksUsed: 11, fame: 980 }],
        getWarState(riverRace)
    );
    const snapshot = createWarSnapshot({
        apiClan: { name: 'BrootherWood', tag: '#YJ08GRQU', members: 1 },
        riverRace,
        members,
        lastLogEntry: { seasonId: 136, sectionIndex: 1 }
    });

    assert.equal(snapshot.war.day, 2);
    assert.equal(snapshot.war.label, 'Guerra 136.3');
    assert.equal(snapshot.war.fame, 12340);
    assert.equal(snapshot.today.attacksUsed, 3);
    assert.equal(snapshot.members[0].statusKey, 'in_progress');
});

test('periodIndex 4 representa dia 2 e treino não representa dia de guerra', () => {
    assert.equal(getWarState({ periodType: 'warDay', periodIndex: 4 }).warDay, 2);
    assert.equal(getWarState({ periodType: 'training', periodIndex: 4 }).warDay, null);
    assert.equal(getWarState({ periodType: 'training', periodIndex: 4 }).isTraining, true);
});

test('análise resume participação e desempenho sem misturar ataques diários e acumulados', () => {
    const members = [
        { name: 'Biel', tag: '#C', inRace: true, decksUsedToday: 4, decksUsed: 8, fame: 2000 },
        { name: 'Ana', tag: '#D', inRace: true, decksUsedToday: 1, decksUsed: 5, fame: 1000 },
        { name: 'Novo', tag: '#E', inRace: false, decksUsedToday: 0, decksUsed: 0, fame: 0 }
    ];

    assert.deepEqual(analyzeParticipation(members, true), {
        attacksPossible: 8,
        attacksUsed: 5,
        percentage: 63,
        playersComplete: 1,
        playersInProgress: 1,
        playersNotStarted: 0,
        playersNotInRace: 1
    });

    assert.equal(analyzePerformance(members).fameTotal, 3000);
    assert.equal(analyzePerformance(members).averageFamePerAttack, 231);
});

test('atenção do líder aponta apenas fatos observáveis', () => {
    const attention = analyzeLeaderAttention([
        { name: 'Ana', tag: '#D', inRace: true, decksUsedToday: 1 },
        { name: 'Biel', tag: '#C', inRace: true, decksUsedToday: 4 }
    ], [{ memberTag: '#D' }, { memberTag: '#D' }]);

    assert.deepEqual(attention, [{
        name: 'Ana',
        tag: '#D',
        today: 1,
        attacksRemaining: 3,
        incompleteHistory: 2,
        reason: 'participação abaixo do esperado'
    }]);
});
