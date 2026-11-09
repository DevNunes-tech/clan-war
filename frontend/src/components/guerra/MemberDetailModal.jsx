import React, { useEffect, useRef, useMemo } from 'react';
import { Trophy, X } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';
import { getTodayDecks, getWarDecks, getMemberFame, WAR_RULES } from '../../utils/warRules';

// Normaliza tags para comparação segura
const normalizeTag = (tag) => String(tag || '').trim().replace(/^#/, '').toUpperCase();

export default function MemberDetailModal({ member, attendance = [], history = [], justification, onJustificationChange, onSave, onClose, isSaving }) {
    const modalRef = useRef(null);

    // Fecha com Esc
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Foco automático no modal
    useEffect(() => {
        if (member && modalRef.current) {
            modalRef.current.focus();
        }
    }, [member]);

    // Normaliza tag do membro uma única vez
    const memberTagNormalized = useMemo(() => normalizeTag(member?.tag), [member?.tag]);

    // Filtra os registros de advertência com tag normalizada
    const memberAttendance = useMemo(() => {
        if (!member) return [];
        return attendance.filter((entry) => normalizeTag(entry.memberTag) === memberTagNormalized);
    }, [attendance, memberTagNormalized, member]);

    // Busca o histórico com tag normalizada
    const memberHistory = useMemo(() => {
        if (!member) return null;
        return history.find((item) => normalizeTag(item.tag) === memberTagNormalized);
    }, [history, memberTagNormalized, member]);

    if (!member) return null;

    const today = getTodayDecks(member);
    const warDecks = getWarDecks(member);
    const fame = getMemberFame(member);
    const canJustify = member.statusKey === 'in_progress' || member.statusKey === 'not_started';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button aria-label="Fechar ficha" className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1220] shadow-2xl outline-none"
            >
                <div className="flex items-center justify-between border-b border-white/8 p-5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ficha do guerreiro</p>
                        <h2 className="mt-1 text-xl font-black text-white">{member.name}</h2>
                        <p className="text-xs text-slate-500">{member.tag}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                            <p className="text-[10px] text-slate-500">Hoje</p>
                            <p className="mt-1 text-xl font-black text-white">{today}/{WAR_RULES.attacksPerDay}</p>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                            <p className="text-[10px] text-slate-500">Guerra</p>
                            <p className="mt-1 text-xl font-black text-white">{warDecks} ataques</p>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                            <p className="text-[10px] text-slate-500">Fama</p>
                            <p className="mt-1 flex items-center gap-1 text-xl font-black text-amber-200"><Trophy className="h-4 w-4" />{formatNumber(fame)}</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-400">Situação: <span className="font-bold text-white">{member.statusText}</span>. Advertência só entra se a liderança registrar uma justificativa.</p>

                    {memberHistory && (
                        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Últimas guerras</p>
                            <p className="mt-2 text-sm text-slate-300">Participação {memberHistory.participation}% · {memberHistory.attacksUsed}/{memberHistory.attacksPossible} ataques</p>
                            <div className="mt-3 space-y-1">
                                {(memberHistory.history || []).slice(0, 4).map((value, index) => (
                                    <p key={`${member.tag}-h-${index}`} className="text-sm text-slate-400">
                                        {value > 0 ? formatNumber(value) : '—'} fama
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {canJustify && (
                        <div>
                            <label className="text-xs font-bold text-slate-400">Justificativa da liderança</label>
                            <textarea value={justification} onChange={(event) => onJustificationChange(event.target.value)} rows="4" placeholder="Registre o motivo dos ataques de hoje pendentes" className="mt-2 w-full rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-white outline-none focus:border-amber-400/50" />
                            <button onClick={onSave} disabled={isSaving} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{isSaving ? 'Salvando...' : 'Salvar justificativa'}</button>
                        </div>
                    )}

                    {memberAttendance.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Registros da liderança</p>
                            {memberAttendance.map((entry) => (
                                <p key={entry._id || entry.createdAt} className="rounded-lg border border-white/8 bg-white/[0.03] p-3 text-sm text-slate-300">{entry.dateLabel}: {entry.justification || 'Sem justificativa registrada.'}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
