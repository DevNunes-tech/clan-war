import React, { useState } from 'react';
import { Crown, ArrowRight, ShieldCheck, Loader2, LockKeyhole, Sparkles, BadgeCheck } from 'lucide-react';
import { buildUrl } from '../utils/api';

export default function LoginPage({ onNavigate }) {
    const [playerTag, setPlayerTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('Informe sua tag para consultar a arena.');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStatusMessage(`Consultando a tag ${playerTag.trim()} na API oficial...`);
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(buildUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerTag }),
                signal: controller.signal
            });

            const data = await response.json();

            if (data.success) {
                setStatusMessage('Cargo confirmado. Liberando o QG de guerra...');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onNavigate('dashboard');
            } else {
                setStatusMessage('A arena recusou esta tag.');
                setError(data.message || 'Erro ao realizar login');
            }
        } catch (err) {
            setStatusMessage('Não foi possível concluir a consulta.');
            setError(err.name === 'AbortError'
                ? 'O servidor demorou para responder. Verifique o backend e tente novamente.'
                : 'Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            window.clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#061122] text-slate-100">
            <div className="pointer-events-none absolute inset-0 wt-grid opacity-30" />

            <header className="relative z-10 border-b-2 border-[#0d2242] bg-[#071733]/85 px-4 py-4 backdrop-blur sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <button className="flex items-center gap-3" onClick={() => onNavigate('landing')}>
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#4f3100] bg-gradient-to-b from-[#ffdb4d] to-[#c78000] shadow-[0_3px_0_#694000]">
                            <div className="btn-gloss" />
                            <Crown className="relative h-6 w-6 fill-[#0b1730] text-[#0b1730]" />
                        </div>
                        <div className="text-left">
                            <span className="font-clash text-xl tracking-wider text-yellow-300 stroke-black-sm">WARTRACKER</span>
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-blue-300">Quartel de guerra</span>
                        </div>
                    </button>
                    <button onClick={() => onNavigate('landing')} className="hidden items-center gap-2 font-clash text-sm uppercase text-blue-200 transition-colors hover:text-yellow-300 sm:flex">
                        <ArrowRight className="h-4 w-4 rotate-180" /> Voltar para a arena
                    </button>
                </div>
            </header>

            <div className="mx-auto grid min-h-[calc(100vh-78px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
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

                        <div className="rounded-2xl border-2 border-[#1c3e70] bg-gradient-to-b from-[#0f2342] to-[#071326] p-6 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-clash text-xs uppercase tracking-wider text-blue-300 stroke-black-sm">Como o portão funciona</p>
                                    <h2 className="mt-2 font-clash text-2xl text-white stroke-black-sm">Conectado ao Clash Royale</h2>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                                    <BadgeCheck className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {['Você digita sua tag de jogador', 'O sistema checa seu cargo no clã', 'Painel WarRoom liberado'].map((step, index) => (
                                    <div key={step} className="flex items-center gap-3 rounded-xl border border-[#1a3863] bg-[#0a182e] px-3 py-2.5">
                                        <span className={`flex h-7 w-7 items-center justify-center rounded-full font-clash text-xs font-bold text-stone-950 ${index === 2 ? 'bg-emerald-400' : 'bg-yellow-400'}`}>{index + 1}</span>
                                        <span className="text-sm font-medium text-slate-300">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-xl">
                    <div className="arena-stone wt-border-glow rounded-3xl p-4 sm:p-5">
                        <div className="rounded-[1.75rem] border-2 border-[#1d437d] bg-[#09172e]/80 p-6 sm:p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600">
                                        <Crown className="h-6 w-6 text-[#080B14] fill-[#080B14]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-clash text-sm text-white stroke-black-sm">WARTRACKER QG</p>
                                        <p className="text-[10px] font-bold text-blue-300">API oficial • conectado</p>
                                    </div>
                                </div>
                                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                                    Online
                                </div>
                            </div>

                            <div className="mb-8 space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b5ba3] bg-[#122b52] px-3 py-1 text-xs font-clash uppercase tracking-wider text-yellow-300 stroke-black-sm">
                                    <Sparkles className="h-4 w-4" /> Acesso ao quartel
                                </div>
                                <h2 className="font-clash text-3xl tracking-wide text-white stroke-black-md sm:text-4xl">Acesse o QG</h2>
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
                                    <label className="font-clash text-sm uppercase tracking-wider text-yellow-300 stroke-black-sm">🎯 Tag do jogador ou do clã</label>
                                    <input
                                        type="text"
                                        required
                                        value={playerTag}
                                        onChange={(e) => setPlayerTag(e.target.value.toUpperCase())}
                                        className="w-full rounded-2xl border-4 border-[#28579e] bg-[#071426] px-4 py-4 text-xl font-clash uppercase tracking-widest text-white outline-none transition-colors placeholder:text-blue-400/40 focus:border-yellow-400"
                                        placeholder="#YJ08GRQU"
                                    />
                                    <p className="px-1 text-xs text-blue-300">Localize no perfil do jogo abaixo do seu nome. Sem senha.</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300">
                                    <span className="font-bold uppercase">Sugestões:</span>
                                    {['#YJ08GRQU', '#2PP9UU0L'].map((tag) => (
                                        <button key={tag} type="button" onClick={() => setPlayerTag(tag)} className="rounded-lg border border-[#234f8c] bg-[#0e2447] px-2.5 py-1 font-clash text-yellow-300 transition-colors hover:bg-[#18396e]">{tag}</button>
                                    ))}
                                </div>

                                {(loading || error) && (
                                    <div className={`rounded-2xl border-2 p-3.5 ${error ? 'border-red-500/40 bg-red-950/30' : 'border-[#1f4b8c] bg-[#091e3d]'}`}>
                                        <div className="flex items-center justify-between text-xs font-bold uppercase">
                                            <span className="text-blue-200">Validação com a arena</span>
                                            <span className={error ? 'text-red-300' : 'text-yellow-300'}>{error ? 'RECUSADO' : 'CONSULTANDO...'}</span>
                                        </div>
                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#061122]"><div className={`h-full transition-all duration-500 ${error ? 'w-full bg-red-500' : 'w-2/3 bg-gradient-to-r from-yellow-400 to-amber-500'}`} /></div>
                                        <p className={`mt-2 text-[11px] font-medium ${error ? 'text-red-200' : 'text-blue-300'}`}>{error || statusMessage}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#543200] bg-gradient-to-b from-[#ffe543] via-[#ffbe0b] to-[#c77a00] px-5 py-4 text-sm font-clash uppercase tracking-wider text-white shadow-[0_6px_0_#804900,0_10px_20px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <div className="btn-gloss" />
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
                                className="mt-5 flex w-full items-center justify-center gap-2 font-clash text-sm uppercase text-blue-300 transition-colors hover:text-yellow-300"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" /> Voltar para a apresentação do clã
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
