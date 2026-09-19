import React, { useState } from 'react';
import { AlertTriangle, Clipboard, Check } from 'lucide-react';
import { getNeedsAttention, getTodayDecks } from '../../utils/warRules';

export default function LeaderAlerts({ members = [], clanName = '', isWarDay = false }) {
    const [copied, setCopied] = useState(false);
    const CopyIcon = copied ? Check : Clipboard;
    const pending = isWarDay ? getNeedsAttention(members) : [];

    const copyList = async () => {
        const listText = pending
            .map((member) => `*${member.name}* - ${getTodayDecks(member)}/4 hoje`)
            .join('\n');
        const message = `COBRANÇA DE HOJE - ${clanName}\n\n${listText || 'Todos os guerreiros em corrida já fizeram os 4 ataques de hoje.'}`;
        await navigator.clipboard.writeText(message);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    if (!isWarDay) return null;

    return (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-200">Atenção</p>
                        <h2 className="mt-1 text-lg font-black text-white">
                            {pending.length ? `${pending.length} jogador(es) ainda precisam atacar hoje` : 'Todos os 4 ataques de hoje estão feitos'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            {pending.slice(0, 5).map((member) => `${member.name} (${getTodayDecks(member)}/4)`).join(' · ') || 'Nenhuma cobrança pendente com base nos ataques de hoje.'}
                        </p>
                    </div>
                </div>
                <button onClick={copyList} disabled={!pending.length} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                    <CopyIcon className="h-4 w-4" />
                    {copied ? 'Copiado' : 'Copiar cobrança'}
                </button>
            </div>
        </section>
    );
}
