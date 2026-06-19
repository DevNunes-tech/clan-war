import React, { useState } from 'react';
import { Crown, Swords, Users, Menu, X, Flame, Target, History, ShieldCheck, Sparkles, ChevronRight, Bell, Trophy, Activity, Radar, ArrowRight } from 'lucide-react';

const featureCards = [
    { icon: Target, title: 'Controle de guerra', desc: 'Ataques pendentes, decks usados e progresso estratégico em tempo real.' },
    { icon: Users, title: 'Leitura do clã', desc: 'Membros ativos, cargos e histórico organizados sem poluição visual.' },
    { icon: History, title: 'Memória tática', desc: 'Histórico filtrado para destacar o que realmente importa para a liderança.' },
    { icon: ShieldCheck, title: 'Acesso seguro', desc: 'Somente líderes e co-líderes entram no painel após validação pela API oficial.' }
];

const metrics = [
    { label: 'Medalhas', value: '32.850', accent: 'text-amber-400' },
    { label: 'Ativos', value: '42/50', accent: 'text-blue-300' },
    { label: 'Risco', value: 'Baixo', accent: 'text-emerald-400' },
];

export default function LandingPage({ onNavigate }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080B14] text-slate-100">
            <div className="pointer-events-none absolute inset-0 wt-grid opacity-30"></div>
            <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[rgba(91,95,255,0.22)] blur-3xl"></div>
            <div className="pointer-events-none absolute top-1/3 right-0 h-80 w-80 rounded-full bg-[rgba(124,58,237,0.18)] blur-3xl"></div>

            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080B14]/80 backdrop-blur-2xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 shadow-[0_10px_30px_rgba(245,177,0,0.25)]">
                            <Crown className="h-6 w-6 text-[#080B14] fill-[#080B14]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">WarTracker</p>
                            <p className="text-sm font-semibold text-slate-200">Painel inteligente para líderes de clãs</p>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-2 md:flex">
                        <a href="#sobre" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white">O Projeto</a>
                        <a href="#recursos" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white">Recursos</a>
                        <button
                            onClick={() => onNavigate('login')}
                            className="ml-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B5FFF] to-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(91,95,255,0.25)] transition-transform hover:-translate-y-0.5"
                        >
                            Acessar painel <ChevronRight className="h-4 w-4" />
                        </button>
                    </nav>

                    <button
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <div className="border-t border-white/5 bg-[#0D1320]/95 px-4 py-4 backdrop-blur-xl md:hidden">
                        <div className="mx-auto max-w-7xl space-y-3">
                            <a href="#sobre" className="block rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">O Projeto</a>
                            <a href="#recursos" className="block rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">Recursos</a>
                            <button
                                onClick={() => onNavigate('login')}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B5FFF] to-[#7C3AED] px-4 py-3 text-sm font-bold text-white"
                            >
                                Acessar painel <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <main>
                <section className="relative overflow-hidden">
                    <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
                        <div className="relative z-10 space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                                <Flame className="h-4 w-4 text-amber-400" /> Dashboard estratégico premium
                            </div>

                            <div className="space-y-5 max-w-3xl">
                                <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                                    Controle o clã como uma{' '}
                                    <span className="wt-text-gradient">operação tática</span>
                                </h1>
                                <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                                    O WarTracker combina estética premium, leitura rápida de guerra e organização de liderança para transformar dados em decisão estratégica.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => onNavigate('login')}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F5B100] to-[#F7C94D] px-7 py-4 text-sm font-black uppercase tracking-[0.24em] text-[#080B14] shadow-[0_24px_50px_rgba(245,177,0,0.18)] transition-transform hover:-translate-y-0.5"
                                >
                                    Entrar no QG <Swords className="h-5 w-5" />
                                </button>
                                <a
                                    href="#sobre"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-bold uppercase tracking-[0.24em] text-slate-100 transition-colors hover:bg-white/10"
                                >
                                    Ver conceito <Sparkles className="h-5 w-5 text-amber-400" />
                                </a>
                            </div>

                            <div className="grid max-w-2xl grid-cols-3 gap-4">
                                {metrics.map((metric) => (
                                    <div key={metric.label} className="wt-surface rounded-3xl p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                                        <p className={`mt-2 text-2xl font-black ${metric.accent}`}>{metric.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="wt-surface wt-border-glow rounded-[2rem] p-4 sm:p-5">
                                <div className="rounded-[1.5rem] border border-white/5 bg-[#0B1220] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Visão operacional</p>
                                            <h2 className="mt-1 text-xl font-black text-white">WarRoom live</h2>
                                        </div>
                                        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                                            Online
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {[
                                            { label: 'Ataques pendentes', value: '8', color: 'text-red-400', icon: Swords },
                                            { label: 'Membros ativos', value: '42/50', color: 'text-blue-300', icon: Users },
                                            { label: 'Medalhas do clã', value: '32.850', color: 'text-amber-400', icon: Trophy },
                                            { label: 'Risco inatividade', value: 'Baixo', color: 'text-emerald-400', icon: Radar },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-white/6 bg-white/5 p-4">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                                                    <item.icon className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-white/5 bg-gradient-to-r from-[#111A2A] to-[#0D1422] p-4">
                                        <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                                            <span>Progresso de guerra</span>
                                            <span>Dia 2 de 2</span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-white/5">
                                            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[#5B5FFF] via-[#7C3AED] to-[#F5B100]"></div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-3">
                                            {['Shadow', 'Goku', 'Lucas'].map((member, index) => (
                                                <div key={member} className="rounded-2xl border border-white/5 bg-black/20 p-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-semibold text-slate-200">{member}</span>
                                                        <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-emerald-400' : index === 1 ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                                                    </div>
                                                    <p className="mt-2 text-xs text-slate-500">{index === 2 ? '1 ataque restante' : 'Ataques concluídos'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="sobre" className="border-y border-white/5 bg-[#0A1020]/90 py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-14 max-w-3xl text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#5B5FFF]">O Projeto</p>
                            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                                Uma interface para liderar o clã com leitura rápida e controle total
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-slate-300">
                                O WarTracker foi pensado para líderes que precisam de um painel com presença, clareza e hierarquia visual, sem ficar preso em uma UI genérica de admin.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {[
                                { title: 'Visão estratégica', desc: 'Um painel que destaca guerra, ranking e risco sem poluir a leitura.' },
                                { title: 'Identidade gamer premium', desc: 'Dark mode, brilho sutil, profundidade e sensação de produto de alto valor.' },
                                { title: 'Menos ruído, mais decisão', desc: 'Informações órfãs e dados desnecessários ficam fora do foco principal.' },
                            ].map((item) => (
                                <div key={item.title} className="wt-surface wt-hover-lift rounded-[1.75rem] p-6">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#F5B100]">
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-white">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="recursos" className="py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 flex flex-col gap-3 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#7C3AED]">Recursos</p>
                            <h2 className="text-3xl font-black text-white sm:text-4xl">Componentes com presença e utilidade real</h2>
                            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400">
                                Cada bloco visual foi desenhado para reforçar hierarquia, leitura rápida e sensação de comando.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {featureCards.map((feature, index) => (
                                <div key={feature.title} className="wt-surface wt-hover-lift rounded-[1.65rem] p-6">
                                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${index === 0 ? 'bg-blue-500/10 text-blue-300' : index === 1 ? 'bg-violet-500/10 text-violet-300' : index === 2 ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-black text-white">{feature.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/5 bg-[#060910] py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Crown className="h-6 w-6 fill-amber-400 text-amber-400" />
                        <span className="text-lg font-black tracking-tight text-white">WarTracker</span>
                    </div>
                    <p className="text-sm text-slate-500">© 2026 WarTracker. Não afiliado à Supercell.</p>
                </div>
            </footer>
        </div>
    );
}
