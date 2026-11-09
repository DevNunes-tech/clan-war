import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Swords } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

function DailyWarStats({ today = {}, isWarDay = false }) {
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
    
    // Garante que o progresso máximo seja 100
    const rawProgress = possible ? (used / possible) * 100 : 0;
    const progress = Math.min(100, rawProgress);

    const cards = [
        { label: 'Completos', value: today.playersComplete || 0, Icon: CheckCircle2, color: 'text-emerald-300' },
        { label: 'Pendentes', value: today.playersPending || 0, Icon: Clock3, color: 'text-amber-300' },
        { 
            label: 'Não começaram', 
            value: today.playersNotStarted || 0, 
            Icon: AlertTriangle, 
            color: 'text-red-300',
            subtitle: today.playersNotInRace > 0 ? `+${today.playersNotInRace} fora da corrida` : null
        }
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
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {cards.map(({ label, value, Icon, color, subtitle }) => (
                    <div key={label} className="flex flex-col gap-1 rounded-xl border border-white/7 bg-white/[0.03] p-3">
                        <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${color}`} />
                            <div>
                                <p className="text-xl font-black text-white">{value}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                            </div>
                        </div>
                        {subtitle && (
                            <p className="ml-8 text-[10px] font-bold text-slate-500">{subtitle}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default React.memo(DailyWarStats);
