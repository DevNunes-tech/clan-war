import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Swords } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export default function DailyWarStats({ today = {}, isWarDay = false }) {
    if (!isWarDay) {
        return (
            <section className="wt-surface rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Ataques de hoje</p>
                <h2 className="mt-1 text-lg font-black text-white">Fora do dia de guerra</h2>
                <p className="mt-2 text-sm text-slate-400">A API está em treino ou sem corrida ativa. Não há meta de 4 ataques agora.</p>
            </section>
        );
    }

    const used = Number(today.attacksUsed || 0);
    const possible = Number(today.attacksPossible || 0);
    const progress = possible ? (used / possible) * 100 : 0;
    const cards = [
        ['Completos', today.playersComplete || 0, CheckCircle2, 'text-emerald-300'],
        ['Pendentes', today.playersPending || 0, Clock3, 'text-amber-300'],
        ['Não começaram', (today.playersNotStarted || 0) + (today.playersNotInRace || 0), AlertTriangle, 'text-red-300']
    ];

    return (
        <section className="wt-surface rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Ataques de hoje</p>
                    <h2 className="mt-1 text-lg font-black text-white">{formatNumber(used)} / {formatNumber(possible)}</h2>
                </div>
                <span className="flex items-center gap-2 text-sm font-black text-white">
                    <Swords className="h-4 w-4 text-amber-300" />
                    {possible ? `${progress.toFixed(1).replace('.', ',')}% concluído` : 'Sem dados'}
                </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {cards.map(([label, value, Icon, color]) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl border border-white/7 bg-white/[0.03] p-3">
                        {React.createElement(Icon, { className: `h-5 w-5 ${color}` })}
                        <div>
                            <p className="text-xl font-black text-white">{value}</p>
                            <p className="text-xs text-slate-400">{label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
