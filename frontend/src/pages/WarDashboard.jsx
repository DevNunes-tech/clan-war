import React from 'react';
import { Swords } from 'lucide-react';
import WarTimeline from '../components/guerra/WarTimeline';
import DailyWarStats from '../components/guerra/DailyWarStats';
import LeaderAlerts from '../components/guerra/LeaderAlerts';
import MemberTable from '../components/guerra/MemberTable';
import { formatNumber } from '../utils/formatters';

export default function WarDashboard({ clanStats, members, onSelectMember }) {
    const war = clanStats.war || {};
    const today = clanStats.today || {};
    const latestDay = clanStats.latestDay;
    const isWarDay = Boolean(war.isWarDay);
    const loading = !members.length || clanStats?.name === 'Carregando...';

    return (
        <div className="space-y-5">
            <section className="arena-stone relative overflow-hidden rounded-3xl p-5 sm:p-6">
                <div className="relative flex flex-col gap-5 border-b-2 border-royale-border/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="crown-banner rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">{war.label || 'Guerra atual'}</span>
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {isWarDay ? `Dia ${war.day || '-'}/${war.totalDays || 4}` : (war.isTraining ? 'Treino' : 'Sem corrida ativa')}
                            </span>
                        </div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Central de Guerra</h1>
                        <p className="mt-1 text-sm text-slate-300">
                            {loading ? 'Sincronizando com a API...' : `${clanStats?.name || 'Clã'} · Fama ${formatNumber(war.fame || 0)}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border-2 border-amber-500/30 bg-[#070c16]/80 px-4 py-3 shadow-inner">
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 p-2 text-amber-300"><Swords className="h-5 w-5" /></div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Ataques de hoje</span>
                            <span className="font-mono text-base font-bold text-amber-300">{formatNumber(today.attacksUsed || 0)} / {formatNumber(today.attacksPossible || 0)}</span>
                        </div>
                    </div>
                </div>

                <div className="relative pt-5">
                    <WarTimeline currentDay={war.day} isTraining={war.isTraining} isWarDay={isWarDay} />
                </div>
            </section>

            {latestDay && (
                <section className="grid gap-3 sm:grid-cols-4">
                    <div className="wt-surface rounded-2xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Posição no dia</p>
                        <p className="mt-1 text-xl font-black text-white">{latestDay.rankPending ? 'Pendente' : `${latestDay.rank}º`}</p>
                    </div>
                    <div className="wt-surface rounded-2xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fama no fim do dia</p>
                        <p className="mt-1 text-xl font-black text-white">{formatNumber(latestDay.progressEndOfDay)}</p>
                    </div>
                    <div className="wt-surface rounded-2xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Progresso do dia</p>
                        <p className="mt-1 text-xl font-black text-white">+{formatNumber(latestDay.progressEarned)}</p>
                    </div>
                    <div className="wt-surface rounded-2xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Defesas restantes</p>
                        <p className="mt-1 text-xl font-black text-white">{war.periodType === 'colosseum' ? '—' : latestDay.defensesRemaining}</p>
                    </div>
                </section>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="wt-surface rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.24em] text-emerald-300">Completos</span><span className="text-xl font-black text-white">{today.playersComplete || 0}</span></div></div>
                <div className="wt-surface rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.24em] text-amber-300">Pendentes</span><span className="text-xl font-black text-white">{today.playersPending || 0}</span></div></div>
                <div className="wt-surface rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.24em] text-red-300">Não começaram</span><span className="text-xl font-black text-white">{(today.playersNotStarted || 0) + (today.playersNotInRace || 0)}</span></div></div>
            </div>

            <DailyWarStats today={today} isWarDay={isWarDay} />
            <LeaderAlerts members={members} clanName={clanStats?.name} isWarDay={isWarDay} />
            <MemberTable members={members} onSelect={onSelectMember} />
        </div>
    );
}
