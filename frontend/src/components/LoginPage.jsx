import React, { useState } from 'react';
import { Crown, ArrowRight, ArrowLeft, ShieldCheck, Loader2, Swords } from 'lucide-react';
import { ApiError, apiPost, setToken } from '../utils/api';

export default function LoginPage({ onNavigate }) {
    const [playerTag, setPlayerTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('Informe sua tag para consultar a arena.');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!playerTag.trim()) {
            setError('Por favor, informe a sua tag.');
            return;
        }

        setLoading(true);
        setError('');
        setStatusMessage(`Consultando a tag ${playerTag.trim()} na API oficial...`);
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 60000);

        const warmUpTimer1 = window.setTimeout(() => {
            setStatusMessage('Conectando ao servidor na nuvem (inicializando instância)...');
        }, 4000);

        const warmUpTimer2 = window.setTimeout(() => {
            setStatusMessage('O backend do Fly.io está inicializando, quase pronto...');
        }, 14000);

        try {
            const data = await apiPost(
                '/api/auth/login',
                { playerTag },
                { skipAuth: true, signal: controller.signal }
            );

            if (data.success) {
                setStatusMessage('Cargo confirmado. Liberando o QG de guerra...');
                setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onNavigate('dashboard');
            } else {
                setStatusMessage('A arena recusou esta tag.');
                setError(data.message || 'Erro ao realizar login');
            }
        } catch (err) {
            setStatusMessage('Não foi possível concluir a consulta.');
            setError(err.name === 'AbortError'
                ? 'O servidor do Fly.io demorou mais de 60s para responder. Tente novamente em instantes.'
                : err instanceof ApiError
                    ? err.message
                    : 'Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            window.clearTimeout(timeoutId);
            window.clearTimeout(warmUpTimer1);
            window.clearTimeout(warmUpTimer2);
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-river-arena font-sans text-slate-100 selection:bg-amber-500/30">
            <div className="pointer-events-none absolute inset-0 wt-grid opacity-20" />

            <header className="relative z-10 p-6">
                <button
                    onClick={() => onNavigate('landing')}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" /> Voltar para a Arena
                </button>
            </header>

            <main className="relative z-10 flex flex-1 items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center">
                        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f2d99a]/30 bg-gradient-to-br from-amber-300 to-amber-600 shadow-lg shadow-amber-500/20">
                            <Crown className="h-8 w-8 text-[#17202a]" />
                        </div>
                        <h1 className="mb-2 text-3xl font-black text-white">Acesse o QG</h1>
                        <p className="text-slate-400">Validação segura via API oficial do Clash Royale.</p>
                    </div>

                    <div className="wt-surface relative overflow-hidden rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="player-tag" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <Swords className="h-4 w-4 text-amber-500" /> Tag do Jogador
                                </label>
                                <div className="relative">
                                    <input
                                        id="player-tag"
                                        type="text"
                                        required
                                        value={playerTag}
                                        onChange={(e) => setPlayerTag(e.target.value.toUpperCase())}
                                        placeholder="Digite sua tag de jogador"
                                        autoComplete="off"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-4 pl-4 pr-12 font-mono text-lg text-white outline-none transition-colors placeholder:text-slate-600 focus:border-amber-500/50 focus:bg-slate-950/60"
                                    />
                                    <ShieldCheck className="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-emerald-500/60" />
                                </div>
                                <p className="text-xs text-slate-500">Apenas líderes e co-líderes do clã monitorado.</p>
                            </div>

                            {error && (
                                <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-300">
                                    {error}
                                </div>
                            )}

                            {loading && (
                                <div aria-live="polite" className="rounded-xl border border-sky-400/15 bg-sky-950/30 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase">
                                        <span className="text-sky-200">Validação com a arena</span>
                                        <span className="text-amber-300">CONSULTANDO...</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-950/70">
                                        <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-amber-400 to-sky-400" />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-300">{statusMessage}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-amber-200/20 bg-gradient-to-r from-amber-500 to-orange-600 py-4 font-bold text-white shadow-lg shadow-amber-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Validando acesso...</>
                                ) : (
                                    <>Entrar no Painel <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Conexão criptografada e segura.
                    </div>
                </div>
            </main>
        </div>
    );
}
