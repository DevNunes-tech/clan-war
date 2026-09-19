import React, { useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { formatMemberRole, formatNumber } from '../../utils/formatters';
import { matchesMemberFilter, getTodayDecks, getWarDecks, getMemberFame } from '../../utils/warRules';

const FILTERS = [
    ['all', 'Todos'],
    ['notStarted', 'Não atacaram'],
    ['pending', 'Pendentes'],
    ['complete', 'Completos']
];

export default function MemberTable({ members = [], onSelect }) {
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const visibleMembers = useMemo(() => members.filter((member) => {
        const matchesQuery = `${member.name} ${member.tag}`.toLowerCase().includes(query.toLowerCase());
        return matchesQuery && matchesMemberFilter(member, filter);
    }), [filter, members, query]);

    return (
        <section className="wt-surface overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-4 border-b border-white/7 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Todos os guerreiros</p>
                    <h2 className="mt-1 text-lg font-black text-white">Situação de hoje</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map(([value, label]) => (
                            <button key={value} onClick={() => setFilter(value)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${filter === value ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-white/7 text-slate-400 hover:text-white'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                        <Search className="h-4 w-4 text-slate-500" />
                        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nome ou tag" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 lg:w-52" />
                    </label>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Jogador</th>
                            <th className="px-5 py-4">Hoje</th>
                            <th className="px-5 py-4">Guerra</th>
                            <th className="px-5 py-4">Fama</th>
                            <th className="px-5 py-4">Situação</th>
                            <th className="px-5 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/7">
                        {visibleMembers.map((member) => {
                            const today = getTodayDecks(member);
                            return (
                                <tr key={member.tag || member.name} className="hover:bg-white/[0.03]">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-slate-400">
                                                <UserRound className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{member.name}</p>
                                                <p className="text-xs text-slate-500">{formatMemberRole(member.role)} · {member.tag}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            {[0, 1, 2, 3].map((slot) => (
                                                <span key={slot} className={`h-2.5 w-2.5 rounded-full ${slot < today ? 'bg-amber-400' : 'bg-slate-700'}`} />
                                            ))}
                                            <span className="ml-2 text-xs font-bold text-slate-200">{today}/4</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-200">{getWarDecks(member)} ataques</td>
                                    <td className="px-5 py-4 text-slate-200">{formatNumber(getMemberFame(member))}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${member.badgeStyle}`}>{member.statusText}</span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button onClick={() => onSelect?.(member)} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-bold text-slate-200 hover:border-amber-400/40 hover:text-white">Detalhes</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
