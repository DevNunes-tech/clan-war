import React, { useMemo, useState, useCallback } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { formatMemberRole, formatNumber } from '../../utils/formatters';

// Exporta CSV com segurança
const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const getWarningRows = (attendance = [], members = []) => {
    const membersMap = new Map(members.map(m => [m.id || m.tag, m]));
    
    return attendance.map((entry, index) => {
        const member = membersMap.get(entry.memberTag) || members.find(m => m.tag === entry.memberTag);
        const cleanJustification = String(entry.justification || '').trim();
        const hasJustification = cleanJustification.length > 0;
        
        return {
            id: entry._id || `${entry.dateKey}-${entry.memberTag}-${index}`, // Chave única garantida
            date: entry.dateLabel || entry.dateKey || '-',
            memberName: entry.memberName || member?.name || 'Membro não identificado',
            role: formatMemberRole(member?.role),
            reason: cleanJustification || 'Ataques pendentes sem justificativa registrada.',
            appliedBy: entry.reportedBy || 'Liderança do clã',
            status: hasJustification ? 'Justificada' : 'Pendente',
            observation: `${entry.decksMissed || 0} ataque(s) pendente(s)`,
            tag: entry.memberTag || member?.tag || '-',
            decksMissed: Number(entry.decksMissed) || 0,
            // Pré-processa a string de busca para não recalcular toda hora
            searchString: `${entry.memberName || ''} ${entry.memberTag || ''} ${cleanJustification || ''} ${entry.reportedBy || ''}`.toLowerCase()
        };
    });
};

export default function WarningsTable({ attendance = [], members = [] }) {
    const [query, setQuery] = useState('');

    const rows = useMemo(() => getWarningRows(attendance, members), [attendance, members]);

    // Filtro usando a string pré-processada
    const filteredRows = useMemo(() => {
        const lowerQuery = query.toLowerCase();
        if (!lowerQuery) return rows;
        return rows.filter((row) => row.searchString.includes(lowerQuery));
    }, [rows, query]);

    const exportCsv = useCallback(() => {
        const headers = ['Data', 'Membro Advertido', 'Cargo no Clã', 'Motivo / Ocorrido', 'Aplicado Por (Autuador)', 'Status / Observação', 'Tag do jogador'];
        const content = [headers, ...filteredRows.map((row) => [row.date, row.memberName, row.role, row.reason, row.appliedBy, `${row.status} - ${row.observation}`, row.tag])]
            .map((line) => line.map(escapeCsv).join(';')).join('\n');
        
        const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'advertencias-clan-war.csv';
        link.click();
        
        // Limpa a URL após 100ms para garantir que o download iniciou
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }, [filteredRows]);

    const totalDecksMissed = useMemo(() => filteredRows.reduce((total, row) => total + row.decksMissed, 0), [filteredRows]);

    return (
        <section className="wt-surface overflow-hidden rounded-2xl print:border-0 print:bg-white print:text-black">
            <div className="flex flex-col gap-4 border-b border-white/7 p-5 print:hidden lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Registro disciplinar</p>
                    <h2 className="mt-1 text-xl font-black text-white">Advertências e pendências</h2>
                    <p className="mt-1 text-sm text-slate-400">Cada justificativa registrada na ficha aparece aqui para acompanhamento da liderança.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5">
                        <Download className="h-4 w-4" />Exportar planilha
                    </button>
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950 hover:bg-slate-200">
                        <FileText className="h-4 w-4" />Exportar PDF
                    </button>
                </div>
            </div>

            <div className="hidden border-b border-slate-200 p-5 print:block">
                <h1 className="text-xl font-black">Advertências do clã</h1>
                <p className="mt-1 text-sm">Registro disciplinar exportado em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="border-b border-white/7 p-5 print:hidden">
                <label className="flex max-w-sm items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input 
                        value={query} 
                        onChange={(event) => setQuery(event.target.value)} 
                        placeholder="Buscar membro, tag ou motivo" 
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" 
                    />
                </label>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm print:min-w-0 print:text-[10px]">
                    <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.16em] text-slate-500 print:bg-slate-100 print:text-slate-700">
                        <tr>
                            <th className="px-4 py-4">Data</th>
                            <th className="px-4 py-4">Membro advertido</th>
                            <th className="px-4 py-4">Cargo no clã</th>
                            <th className="px-4 py-4">Motivo / ocorrido</th>
                            <th className="px-4 py-4">Aplicado por</th>
                            <th className="px-4 py-4">Status / observação</th>
                            <th className="px-4 py-4">Tag do jogador</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/7 print:divide-slate-200">
                        {filteredRows.map((row) => (
                            <tr key={row.id} className="hover:bg-white/[0.03] print:text-black">
                                <td className="px-4 py-4 whitespace-nowrap">{row.date}</td>
                                <td className="px-4 py-4 font-bold">{row.memberName}</td>
                                <td className="px-4 py-4">{row.role}</td>
                                <td className="max-w-xs px-4 py-4 text-slate-300 print:text-black">{row.reason}</td>
                                <td className="px-4 py-4">{row.appliedBy}</td>
                                <td className="px-4 py-4">
                                    <span className={row.status === 'Justificada' ? 'text-emerald-300 print:text-black' : 'text-red-300 print:text-black'}>
                                        {row.status}
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500 print:text-black">{row.observation}</span>
                                </td>
                                <td className="px-4 py-4 font-mono text-xs">{row.tag}</td>
                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-5 py-16 text-center text-slate-500 print:text-black">
                                    Nenhuma advertência registrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-white/7 px-5 py-4 text-xs text-slate-500 print:text-black">
                <span>{filteredRows.length} registro(s)</span>
                <span>{formatNumber(totalDecksMissed)} ataque(s) pendente(s)</span>
            </div>
        </section>
    );
}
