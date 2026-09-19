import React from 'react';
import { Check, Circle, Pause } from 'lucide-react';

export default function WarTimeline({ currentDay = null, isTraining = false, isWarDay = false }) {
    if (isTraining || !isWarDay) {
        return (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                {isTraining ? 'Período de treino. Os 4 ataques do dia ainda não valem para a corrida.' : 'Não há dia de guerra ativo segundo a API.'}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 gap-2" aria-label="Dias da guerra">
            {[1, 2, 3, 4].map((dayNumber) => {
                const isToday = dayNumber === currentDay;
                const isDone = currentDay != null && dayNumber < currentDay;

                return (
                    <div
                        key={dayNumber}
                        className={`rounded-xl border px-3 py-3 text-center ${
                            isToday
                                ? 'border-amber-400/60 bg-amber-400/12 text-amber-200'
                                : isDone
                                    ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-200'
                                    : 'border-white/8 bg-white/[0.02] text-slate-500'
                        }`}
                    >
                        <p className="text-[10px] font-black tracking-[0.22em]">DIA {dayNumber}</p>
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                            {isDone ? <Check className="h-4 w-4 text-emerald-400" /> : isToday ? <Circle className="h-3 w-3 fill-amber-300 text-amber-300" /> : <Pause className="h-3 w-3 text-slate-600" />}
                            <span className="text-[10px] font-bold">{isToday ? 'Hoje' : isDone ? 'Encerrado' : 'Aguardando'}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
