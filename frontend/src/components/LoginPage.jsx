import React, { useState } from 'react';
import { Crown, ArrowRight, ShieldCheck, Loader2, Swords, LockKeyhole, Sparkles, BadgeCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LoginPage({ onNavigate }) {
    const [playerTag, setPlayerTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerTag })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onNavigate('dashboard');
            } else {
                setError(data.message || 'Erro ao realizar login');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080B14] text-slate-100">
            <div className="pointer-events-none absolute inset-0 wt-grid opacity-30"></div>
            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[rgba(91,95,255,0.22)] blur-3xl"></div>
            <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[rgba(124,58,237,0.18)] blur-3xl"></div>

            <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                <div className="relative z-10 hidden lg:block">
                    <div className="max-w-2xl space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-slate-300">
                            <LockKeyhole className="h-4 w-4 text-[#F5B100]" /> Acesso estratégico
                        </div>

                        <div className="space-y-5">
                            <h1 className="text-5xl font-black tracking-tight text-white xl:text-6xl">
                                Entre no{' '}
                                <span className="wt-text-gradient">QG de guerra</span>
                            </h1>
                            <p className="max-w-xl text-lg leading-relaxed text-slate-300">
                                Autenticação por tag, validação pela API oficial e acesso apenas para líderes e co-líderes do clã monitorado.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Segurança', value: 'JWT + API' },
                                { label: 'Leitura', value: 'Tempo real' },
                                { label: 'Perfil', value: 'Liderança' },
                            ].map((item) => (
                                <div key={item.label} className="wt-surface rounded-3xl p-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                                    <p className="mt-2 text-lg font-black text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="wt-surface rounded-[2rem] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Fluxo de entrada</p>
                                    <h2 className="mt-2 text-2xl font-black text-white">Conectado ao Clash Royale</h2>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                                    <BadgeCheck className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {[
                                    'Tag do jogador',
                                    'Cargo validado',
                                    'Token gerado',
                                    'Dashboard liberado',
                                ].map((step, index) => (
                                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white">0{index + 1}</span>
                                        <span className="text-sm font-medium text-slate-300">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-xl">
                    <div className="wt-surface wt-border-glow rounded-[2.25rem] p-4 sm:p-5">
                        <div className="rounded-[1.75rem] border border-white/5 bg-[#0B1220] p-6 sm:p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <button className="flex items-center gap-3" onClick={() => onNavigate('landing')}>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600">
                                        <Crown className="h-6 w-6 text-[#080B14] fill-[#080B14]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">WarTracker</p>
                                        <p className="text-sm font-semibold text-slate-200">Acesso ao painel do clã</p>
                                    </div>
                                </button>
                                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                                    Online
                                </div>
                            </div>

                            <div className="mb-8 space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                                    <Sparkles className="h-4 w-4 text-[#F5B100]" /> Login estratégico
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Acesse o QG</h2>
                                <p className="max-w-md text-sm leading-relaxed text-slate-400">
                                    Informe sua tag para validar o cargo e liberar o painel completo do WarTracker.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                                        <p className="text-sm font-medium leading-relaxed text-red-200">{error}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Tag do jogador</label>
                                    <input
                                        type="text"
                                        required
                                        value={playerTag}
                                        onChange={(e) => setPlayerTag(e.target.value.toUpperCase())}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold uppercase tracking-[0.18em] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#5B5FFF] focus:bg-white/7"
                                        placeholder="#YJ08GRQU"
                                    />
                                    <p className="px-1 text-xs text-slate-500">Sem senha. A validação é feita pela API oficial do Clash Royale.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#5B5FFF] via-[#7C3AED] to-[#F5B100] px-5 py-4 text-sm font-black uppercase tracking-[0.26em] text-white shadow-[0_18px_50px_rgba(91,95,255,0.22)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            Validando acesso <Loader2 className="h-5 w-5 animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            Entrar no painel <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <button
                                onClick={() => onNavigate('landing')}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" /> Voltar para a landing
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
