import React from 'react';
import { Crown, Swords, Target, History, ShieldCheck, ArrowRight, CheckCircle2, Zap, TrendingUp, Users, Flame } from 'lucide-react';

const BENEFITS = [
    { icon: Target, title: 'Fim dos Sangue-sugas', desc: 'Identifique em segundos quem não usou os 4 decks e cobre com 1 clique.' },
    { icon: TrendingUp, title: 'Gestão de Elite', desc: 'Acompanhe a evolução da fama, histórico de guerras e desempenho individual.' },
    { icon: Zap, title: 'Automação Inteligente', desc: 'Copie a lista de cobrança formatada para o WhatsApp ou Discord sem esforço.' }
];

const FEATURES = [
    { title: 'Radar de Ataques', desc: 'Saiba exatamente quantos ataques faltam e quem está inativo na guerra atual.' },
    { title: 'Ranking da Corrida', desc: 'Veja quem mais contribuiu com fama e quem está apenas sendo carregado.' },
    { title: 'Controle de Acesso', desc: 'Painel seguro. Apenas o líder e co-líderes têm a visão privilegiada do clã.' }
];

export default function LandingPage({ onNavigate }) {
    return (
        <div className="min-h-screen bg-[#060b13] text-slate-100 font-sans selection:bg-amber-500/30 overflow-hidden relative">
            {/* Fundo Premium com textura sutil */}
            <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-900/20 via-[#060b13] to-transparent blur-3xl"></div>

            {/* NAVBAR */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060b13]/80 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
                            <Swords className="h-5 w-5 text-[#060b13]" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-white font-clash">River <span className="text-amber-400">Vanguard</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                        <a href="#beneficios" className="hover:text-amber-400 transition-colors">Benefícios</a>
                        <a href="#funcionalidades" className="hover:text-amber-400 transition-colors">Funcionalidades</a>
                        <a href="#planos" className="hover:text-amber-400 transition-colors">Planos</a>
                    </nav>

                    <button
                        onClick={() => onNavigate('login')}
                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#060b13] transition-all hover:bg-slate-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        Entrar no Painel
                    </button>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
                {/* HERO SECTION */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                            <Flame className="h-4 w-4" />
                            A ferramenta definitiva para líderes
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] text-white">
                            Pare de perder guerras por <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">membros inativos.</span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            O River Vanguard dá aos líderes de clã o poder de monitorar ataques, cobrar participação e gerenciar a Corrida Fluvial com precisão cirúrgica. Tudo em um painel rápido e sem complicação.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => onNavigate('login')}
                                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 font-black text-white shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95"
                            >
                                Acessar WarRoom
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Acesso via API Oficial.
                            </div>
                        </div>

                        {/* Social Proof */}
                        <div className="pt-8 border-t border-white/5">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Utilizado por líderes de elite</p>
                            <div className="flex gap-6 opacity-40 grayscale">
                                <span className="font-black text-xl italic">OS IMPERADORES</span>
                                <span className="font-black text-xl italic">DARK SIDE</span>
                                <span className="font-black text-xl italic">ELITE ROYALE</span>
                            </div>
                        </div>
                    </div>

                    {/* MOCKUP DO DASHBOARD (Mais detalhado e tecnológico) */}
                    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-blue-500/20 blur-3xl -z-10 rounded-full"></div>
                        <div className="rounded-3xl border border-white/10 bg-[#0B1220]/90 p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden">

                            {/* Detalhe decorativo no topo do painel */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Os Imperadores</h3>
                                        <p className="text-xs text-slate-400">Dia 2 de 4 • Liga Lendária</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 animate-pulse">
                                    AO VIVO
                                </div>
                            </div>

                            {/* Grid de Stats com mais dados */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 relative overflow-hidden">
                                    <p className="text-xs font-medium text-slate-400 mb-1">Ataques Pendentes</p>
                                    <p className="text-3xl font-black text-red-400">8</p>
                                    <div className="absolute bottom-0 left-0 h-1 bg-red-500 w-[30%]"></div>
                                </div>
                                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 relative overflow-hidden">
                                    <p className="text-xs font-medium text-slate-400 mb-1">Fama do Clã</p>
                                    <p className="text-3xl font-black text-amber-400">32.850</p>
                                    <div className="absolute bottom-0 left-0 h-1 bg-amber-500 w-[75%]"></div>
                                </div>
                                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-slate-400 mb-1">Participação</p>
                                    <p className="text-3xl font-black text-emerald-400">84%</p>
                                </div>
                                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-slate-400 mb-1">Decks Usados</p>
                                    <p className="text-3xl font-black text-blue-400">168<span className="text-sm text-slate-500">/200</span></p>
                                </div>
                            </div>

                            {/* Lista de Membros */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-500 px-2 uppercase tracking-wider mb-2">
                                    <span>Membros (Amostra)</span>
                                    <span>Status</span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">⚠️</span>
                                        <div>
                                            <p className="font-bold text-white text-sm">Lucas_CR</p>
                                            <p className="text-xs text-red-400">1 de 4 ataques feitos</p>
                                        </div>
                                    </div>
                                    <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors">
                                        Cobrar
                                    </button>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🛡️</span>
                                        <div>
                                            <p className="font-bold text-white text-sm">ValkyrieBR</p>
                                            <p className="text-xs text-amber-400">2 de 4 ataques feitos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">👑</span>
                                        <div>
                                            <p className="font-bold text-white text-sm">ShadowKing</p>
                                            <p className="text-xs text-emerald-400">4 de 4 ataques feitos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO DE BENEFÍCIOS */}
                <section id="beneficios" className="py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Por que os líderes assinam o River Vanguard?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Gastar 30 minutos anotando quem atacou no bloco de notas é coisa do passado.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {BENEFITS.map((b, i) => (
                            <div key={i} className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.05] hover:border-white/10">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                                    <b.icon className="h-6 w-6 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{b.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SEÇÃO DE FUNCIONALIDADES */}
                <section id="funcionalidades" className="py-24 border-t border-white/5">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Tudo o que você precisa, em um só lugar.</h2>
                            <div className="space-y-8">
                                {FEATURES.map((f, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{f.title}</h4>
                                            <p className="text-sm text-slate-400 mt-1">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Gráfico visual de fama: evolução dos quatro dias da corrida */}
                        <div className="relative flex h-96 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220] p-8">
                            <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

                            <div className="relative z-10 mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Evolução da Fama</h3>
                                    <p className="text-sm text-slate-400">Últimos 4 dias de guerra</p>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                                    <TrendingUp className="h-4 w-4" /> +12% de rendimento
                                </div>
                            </div>

                            <div className="relative z-10 mt-4 flex flex-1 items-end justify-between gap-4">
                                <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                                    <div className="group relative h-[40%] w-full rounded-t-lg bg-blue-500/20">
                                        <div className="absolute inset-x-0 bottom-0 h-full rounded-t-lg bg-gradient-to-t from-blue-700 to-blue-400" />
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">8.4k</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase text-slate-500">Dia 1</span>
                                </div>
                                <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                                    <div className="group relative h-[60%] w-full rounded-t-lg bg-blue-500/20">
                                        <div className="absolute inset-x-0 bottom-0 h-full rounded-t-lg bg-gradient-to-t from-blue-700 to-blue-400" />
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">12.1k</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase text-slate-500">Dia 2</span>
                                </div>
                                <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                                    <div className="group relative h-[80%] w-full rounded-t-lg bg-amber-500/20">
                                        <div className="absolute inset-x-0 bottom-0 h-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400" />
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">18.2k</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase text-amber-400">Dia 3</span>
                                </div>
                                <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                                    <div className="group relative h-[95%] w-full rounded-t-lg border-2 border-emerald-500/50 bg-emerald-500/20">
                                        <div className="absolute inset-x-0 bottom-0 h-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400" />
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">32.8k</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase text-emerald-400">Hoje</span>
                                </div>
                            </div>

                            <div className="pointer-events-none absolute bottom-[52px] left-0 h-px w-full bg-white/10" />
                        </div>
                    </div>
                </section>

                {/* SEÇÃO DE CTA FINAL / ACESSO VIP */}
                <section id="planos" className="relative overflow-hidden py-24">
                    {/* Fundo de destaque */}
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />

                    <div className="relative z-10 mx-auto max-w-4xl rounded-[3rem] border border-amber-500/30 bg-[#0B1220] p-10 text-center shadow-[0_0_50px_rgba(245,158,11,0.1)] md:p-16">
                        {/* Ícone de Coroa / VIP */}
                        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                            <Crown className="h-10 w-10 text-[#060b13]" />
                        </div>

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                            <Zap className="h-4 w-4" /> Acesso Restrito
                        </div>

                        <h2 className="mb-6 text-3xl font-black leading-tight text-white md:text-5xl">
                            Pronto para assumir o <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Comando do seu Clã?</span>
                        </h2>

                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
                            O <strong className="text-white">River Vanguard</strong> é uma ferramenta premium com vagas limitadas para garantir a melhor performance. Entre em contato com nossa equipe para liberar o seu acesso exclusivo e começar a dominar a arena hoje mesmo.
                        </p>

                        {/* Botões de Ação (WhatsApp e acesso existente) */}
                        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <a
                                href="https://wa.me/5589999830234"
                                target="_blank"
                                rel="noreferrer"
                                className="group relative inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-4 font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-95 sm:w-auto"
                            >
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                                Falar com o Suporte
                            </a>
                            <button
                                onClick={() => onNavigate('login')}
                                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:bg-white/10 active:scale-95 sm:w-auto"
                            >
                                <ShieldCheck className="h-5 w-5 text-slate-400" />
                                Já tenho acesso
                            </button>
                        </div>

                        <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Liberação imediata após a confirmação.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-600">
                <p>© {new Date().getFullYear()} River Vanguard. Não afiliado à Supercell.</p>
            </footer>
        </div>
    );
}
