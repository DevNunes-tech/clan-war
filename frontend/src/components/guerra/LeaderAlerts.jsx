import React, { useState, useMemo, useCallback } from 'react';
import { AlertTriangle, Clipboard, Check } from 'lucide-react';
import { getNeedsAttention, getTodayDecks } from '../../utils/warRules';

export default function LeaderAlerts({ members = [], clanName = '', isWarDay = false }) {
    const [copied, setCopied] = useState(false);

    // Filtra apenas quem está na race e ainda precisa atacar
    const pending = useMemo(() => {
        if (!isWarDay) return [];
        return getNeedsAttention(members).filter(
            (member) => member.inRace && (member.decksUsedToday || 0) < 4
        );
    }, [members, isWarDay]);

    // Verifica se há alguém na race para não mostrar mensagem falsa
    const hasParticipants = useMemo(
        () => members.some((member) => member.inRace),
        [members]
    );

    const copyList = useCallback(async () => {
        const listText = pending
            .map((member) => `*${member.name}* - ${getTodayDecks(member)}/4 hoje`)
            .join('\n');

        let emptyMessage = 'Todos os guerreiros em corrida já fizeram os 4 ataques de hoje.';
        if (!hasParticipants) {
            emptyMessage = 'Não há guerreiros participando da corrida hoje.';
        }

        const message = `COBRANÇA DE HOJE - ${clanName}\n\n${listText || emptyMessage}`;

        try {
            await navigator.clipboard.writeText(message);
        } catch (error) {
            // Fallback para navegadores antigos ou sem permissão
            const textarea = document.createElement('textarea');
            textarea.value = message;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Falha ao copiar:', err);
                alert('Não foi possível copiar. Selecione o texto manualmente.');
                return;
            } finally {
                document.body.removeChild(textarea);
            }
        }

        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    }, [pending, hasParticipants, clanName]);

    if (!isWarDay) return null;

    const CopyIcon = copied ? Check : Clipboard;

    return (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-200">Atenção</p>
                        <h2 className="mt-1 text-lg font-black text-white">
                            {pending.length > 0
                                ? `${pending.length} jogador(es) ainda precisam atacar hoje`
                                : hasParticipants
                                    ? 'Todos os 4 ataques de hoje estão feitos'
                                    : 'Ninguém está participando da corrida hoje'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            {pending.slice(0, 5).map((member) => `${member.name} (${getTodayDecks(member)}/4)`).join(' · ')
                                || (hasParticipants
                                    ? 'Nenhuma cobrança pendente com base nos ataques de hoje.'
                                    : 'Aguarde o início da corrida para ver as pendências.')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={copyList}
                    disabled={pending.length === 0}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CopyIcon className="h-4 w-4" />
                    {copied ? 'Copiado!' : 'Copiar cobrança'}
                </button>
            </div>
        </section>
    );
}
