import React from 'react';
import { Check, Circle, Pause } from 'lucide-react';

const STATUS_LABEL = {
    done: 'Encerrado',
    today: 'Hoje',
    pending: 'Aguardando'
};

export default function WarTimeline({ currentDay = null, isTraining = false, isWarDay = false }) {
    if (isTraining || !isWarDay) {
        return (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                {isTraining
                    ? 'Período de treino. Os 4 ataques do dia ainda não valem para a corrida.'
                    : 'Não há dia de guerra ativo segundo a API.'}
            </div>
        );
    }

    // Valida se o currentDay está entre 1 e 4
    const safeCurrentDay = Number(currentDay);
    const isValidCurrentDay = safeCurrentDay >= 1 && safeCurrentDay <= 4;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Linha do tempo da guerra</p>
                <p className="text-xs font-bold text-amber-300">
                    {isValidCurrentDay ? `Dia ${safeCurrentDay} de 4` : 'Dia indefinido'}
                </p>
            </div>
            <div className="grid grid-cols-4 gap-2" aria-label="Dias da guerra">
                {[1, 2, 3, 4].map((dayNumber) => {
                    const isToday = isValidCurrentDay && dayNumber === safeCurrentDay;
                    const isDone = isValidCurrentDay && dayNumber < safeCurrentDay;

                    const statusKey = isDone ? 'done' : isToday ? 'today' : 'pending';
                    const statusLabel = STATUS_LABEL[statusKey];

                    return (
                        <div
                            key={dayNumber}
                            role="status"
                            aria-label={`Dia ${dayNumber}: ${statusLabel}`}
                            className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                                isToday
                                    ? 'border-amber-400/60 bg-amber-400/12 text-amber-200'
                                    : isDone
                                        ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-200'
                                        : 'border-white/8 bg-white/[0.02] text-slate-500'
                            }`}
                        >
                            <p className="text-[10px] font-black tracking-[0.22em]">DIA {dayNumber}</p>
                            <div className="mt-2 flex items-center justify-center gap-1.5">
                                {isDone ? (
                                    <Check aria-hidden="true" className="h-4 w-4 text-emerald-400" />
                                ) : isToday ? (
                                    <Circle aria-hidden="true" className="h-3 w-3 fill-amber-300 text-amber-300" />
                                ) : (
                                    <Pause aria-hidden="true" className="h-3 w-3 text-slate-600" />
                                )}
                                <span className="text-[10px] font-bold">{statusLabel}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
