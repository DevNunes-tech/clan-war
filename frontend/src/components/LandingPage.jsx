import React, { useState } from 'react';
import { Crown, Swords, Users, Menu, X, Flame, Target, History, ShieldCheck, Sparkles, ChevronRight, Trophy, Activity, Radar, ArrowRight } from 'lucide-react';

const featureCards = [
    { icon: Target, title: 'Controle de guerra', desc: 'Ataques pendentes, decks usados e progresso estratégico em tempo real.' },
    { icon: Users, title: 'Leitura do clã', desc: 'Membros ativos, cargos e histórico organizados sem poluição visual.' },
    { icon: History, title: 'Memória tática', desc: 'Histórico filtrado para destacar o que realmente importa para a liderança.' },
    { icon: ShieldCheck, title: 'Acesso seguro', desc: 'Somente líderes e co-líderes entram no painel após validação pela API oficial.' }
];

const metrics = [
    { label: 'Fama', value: '32.850', accent: 'text-amber-400' },
    { label: 'Ativos', value: '42/50', accent: 'text-blue-300' },
    { label: 'Ataques hoje', value: '4/4', accent: 'text-emerald-400' },
];

export default function LandingPage({ onNavigate }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#061124] text-slate-100">
            <div className="pointer-events-none absolute inset-0 wt-grid opacity-30" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[rgba(63,136,242,0.22)] blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 right-0 h-80 w-80 rounded-full bg-[rgba(191,29,179,0.18)] blur-3xl" />

            <header className="sticky top-0 z-50 border-b-4 border-[#071733] bg-[#0c244d]/95 backdrop-blur-md shadow-[0_6px_15px_rgba(0,0,0,0.7)]">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#523300] bg-gradient-to-b from-[#ffdb4d] to-[#d68b00] shadow-[0_4px_0_#754700]">
                            <div className="btn-gloss" />
                            <Crown className="relative h-6 w-6 text-[#0b1730] fill-[#0b1730]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-clash text-2xl tracking-wider text-[#ffde43] stroke-black-sm">WARTRACKER</span>
                                <span className="rounded-full border border-[#520808] bg-[#e62e2e] px-2 py-0.5 text-[10px] font-clash uppercase text-white shadow">Clã QG</span>
                            </div>
                            <p className="hidden text-xs font-semibold tracking-wide text-blue-200 sm:block">Painel Oficial para Líderes & Co-Líderes</p>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-8 md:flex">
                        <a href="#guerra" className="font-clash flex items-center gap-1.5 text-lg tracking-wide text-blue-100 transition-colors hover:text-[#ffbe0b] stroke-black-sm"><span>⚔️</span> Corrida Fluvial</a>
                        <a href="#recursos" className="font-clash flex items-center gap-1.5 text-lg tracking-wide text-blue-100 transition-colors hover:text-[#ffbe0b] stroke-black-sm"><span>🛡️</span> Ferramentas de Clã</a>
                        <a href="#sanguessugas" className="font-clash flex items-center gap-1.5 text-lg tracking-wide text-red-300 transition-colors hover:text-red-200 stroke-black-sm"><span>🚨</span> Cobrança & Expulsão</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate('login')}
                            className="group relative rounded-2xl border-2 border-[#093d14] bg-gradient-to-b from-[#69f580] via-[#2fc447] to-[#1a8c2d] px-6 py-2.5 shadow-[0_5px_0_0_#10591f,0_8px_15px_rgba(0,0,0,0.6)] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#10591f]"
                        >
                            <div className="btn-gloss" />
                            <span className="font-clash flex items-center gap-2 text-lg uppercase tracking-wider text-white stroke-black-sm"><span>⚔️</span> Entrar no QG</span>
                        </button>
                    </div>

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
                            <a href="#guerra" className="block rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">Corrida Fluvial</a>
                            <a href="#recursos" className="block rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">Ferramentas</a>
                            <button
                                onClick={() => onNavigate('login')}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2fc447] to-[#1a8c2d] px-4 py-3 text-sm font-bold text-white"
                            >
                                Entrar no QG <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <div className="bg-gradient-to-r from-[#941111] via-[#c92626] to-[#941111] border-b-2 border-[#540707] py-2 px-4 text-center shadow-inner">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3">
                    <span className="text-xl animate-bounce">🔥</span>
                    <p className="font-clash text-sm text-white tracking-wide md:text-base stroke-black-sm">
                        GUERRA EM ANDAMENTO: <span className="text-yellow-300">8 COMBATENTES</span> AINDA NÃO USARAM OS DECK DE GUERRA HOJE!
                    </p>
                    <button
                        onClick={() => onNavigate('login')}
                        className="rounded-lg border border-[#6b4207] bg-[#ffe142] px-3 py-1 text-xs font-clash uppercase tracking-wider text-[#422600] shadow hover:bg-yellow-300"
                    >
                        Cobrar Agora 📢
                    </button>
                </div>
            </div>

            <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 lg:px-8">
                <section className="grid grid-cols-1 items-center gap-10 pt-4 lg:grid-cols-12">
                    <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b5ba3] bg-[#0e2c5e] px-4 py-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                            <span className="text-lg">🏆</span>
                            <span className="font-clash text-sm uppercase tracking-wider text-yellow-300 stroke-black-sm">Rumo à Liga Lendária</span>
                            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500" />
                        </div>

                        <h1 className="font-clash text-4xl leading-none tracking-wide text-white sm:text-5xl lg:text-6xl stroke-black-lg">
                            NENHUM BARCO FICA PARA TRÁS.<br />
                            <span className="bg-gradient-to-b from-[#ffe543] via-[#ffbe0b] to-[#d67b00] bg-clip-text text-transparent drop-shadow-[0_4px_0_#543200]">
                                LIDERE SEU CLÃ
                            </span>
                            {' '}À VITÓRIA!
                        </h1>

                        <p className="max-w-2xl text-lg font-medium leading-relaxed text-blue-100 drop-shadow sm:text-xl">
                            Chega de perder guerra por membro sanguessuga que não ataca. Monitore os <strong className="text-yellow-300">4 ataques diários</strong>, cobre medalhas com 1 clique no WhatsApp e mantenha apenas quem joga de verdade.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-5 pt-2 sm:flex-row lg:justify-start">
                            <button
                                onClick={() => onNavigate('login')}
                                className="group relative w-full rounded-2xl border-2 border-[#573500] bg-gradient-to-b from-[#ffe759] via-[#ffbe0b] to-[#d67b00] px-8 py-4 shadow-[0_6px_0_0_#874b00,0_10px_20px_rgba(0,0,0,0.7)] transition-all active:translate-y-1.5 active:shadow-[0_1px_0_0_#874b00] sm:w-auto"
                            >
                                <div className="btn-gloss" />
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl">⚔️</span>
                                    <span className="font-clash text-2xl uppercase tracking-wider text-white stroke-black-md">Acessar WarRoom</span>
                                </div>
                            </button>

                            <button
                                onClick={() => onNavigate('login')}
                                className="group relative w-full rounded-2xl border-2 border-[#09224c] bg-gradient-to-b from-[#3a8bf7] via-[#1c5cb5] to-[#103a78] px-6 py-4 shadow-[0_6px_0_0_#0a224a,0_10px_20px_rgba(0,0,0,0.5)] transition-all active:translate-y-1.5 active:shadow-[0_1px_0_0_#0a224a] sm:w-auto"
                            >
                                <div className="btn-gloss" />
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xl">📜</span>
                                    <span className="font-clash text-xl uppercase tracking-wider text-blue-100 stroke-black-sm">Ver Demonstração</span>
                                </div>
                            </button>
                        </div>

                        <div className="grid max-w-lg grid-cols-3 gap-3 pt-4">
                            {metrics.map((metric) => (
                                <div key={metric.label} className="rounded-2xl border-2 border-[#204a87] bg-[#0b1e42]/80 p-3 text-center shadow-md">
                                    <p className={`font-clash text-2xl stroke-black-sm ${metric.accent}`}>{metric.value}</p>
                                    <p className="text-xs font-bold uppercase text-blue-200">{metric.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div id="guerra" className="lg:col-span-5">
                        <div className="relative rounded-3xl border-4 border-[#2b5ca8] bg-gradient-to-b from-[#1c3a6b] via-[#102547] to-[#0a172e] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)]">
                            <div className="rivet absolute left-3 top-3" />
                            <div className="rivet absolute right-3 top-3" />
                            <div className="rivet absolute bottom-3 left-3" />
                            <div className="rivet absolute bottom-3 right-3" />

                            <div className="mb-4 flex -mt-10 justify-center">
                                <div className="relative rounded-2xl border-2 border-[#573500] bg-gradient-to-b from-[#ffcc00] to-[#b87400] px-6 py-2 shadow-[0_4px_0_#573500,0_8px_15px_rgba(0,0,0,0.6)]">
                                    <div className="btn-gloss" />
                                    <h2 className="font-clash flex items-center gap-2 text-lg uppercase tracking-wider text-white stroke-black-md"><span>🛡️</span> WARROOM OPERACIONAL</h2>
                                </div>
                            </div>

                            <div className="mb-4 flex items-center justify-between border-b-2 border-[#20437a] pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/40 bg-gradient-to-br from-red-600 to-red-900 text-2xl shadow">⚔️</div>
                                    <div>
                                        <h3 className="font-clash text-xl tracking-wide text-white stroke-black-sm">OS IMPERADORES</h3>
                                        <p className="text-xs font-bold text-blue-300">#2PP9UU0L • LIGA OURO III</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block rounded-full border border-emerald-500 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-clash uppercase text-emerald-300 animate-pulse">AO VIVO</span>
                                    <p className="mt-1 text-[11px] font-bold text-blue-200">DIA 2 DE 4</p>
                                </div>
                            </div>

                            <div className="mb-5 grid grid-cols-2 gap-3">
                                <div className="relative overflow-hidden rounded-2xl border-2 border-[#1a3b6e] bg-[#08152b] p-3">
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Ataques Pendentes</span>
                                        <span className="text-lg">🚨</span>
                                    </div>
                                    <p className="mt-1 font-clash text-4xl text-[#ff4242] stroke-black-md" id="stat-pendentes">8</p>
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1b2f52]">
                                        <div className="h-full w-[16%] bg-red-500" />
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-2xl border-2 border-[#1a3b6e] bg-[#08152b] p-3">
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Combatentes</span>
                                        <span className="text-lg">👥</span>
                                    </div>
                                    <p className="mt-1 font-clash text-4xl text-emerald-400 stroke-black-md">42<span className="text-xl text-blue-200">/50</span></p>
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1b2f52]">
                                        <div className="h-full w-[84%] bg-emerald-400" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border-2 border-[#1a3b6e] bg-[#08152b] p-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Fama / Medalhas</span>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="font-clash text-3xl text-yellow-300 stroke-black-md">32.850</span>
                                        <span className="text-xs font-bold text-yellow-400">🛡️</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border-2 border-[#1a3b6e] bg-[#08152b] p-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Decks Usados Hoje</span>
                                    <p className="mt-1 font-clash text-3xl text-blue-100 stroke-black-md">168<span className="text-xl text-blue-400">/200</span></p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1 text-xs font-clash uppercase tracking-wider text-blue-200">
                                    <span>Membro</span>
                                    <span>Status dos 4 Ataques</span>
                                </div>

                                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                    <div className="flex items-center justify-between rounded-xl border border-[#254b85] bg-[#0c1f3d] p-2.5 transition-colors hover:border-emerald-400">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">👑</span>
                                            <div>
                                                <p className="font-clash text-sm text-white stroke-black-sm">ShadowKing (Líder)</p>
                                                <p className="text-[10px] font-bold text-emerald-300">3.600 Medalhas</p>
                                            </div>
                                        </div>
                                        <span className="rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-2 py-0.5 text-xs font-clash text-emerald-400">4/4 PRONTO</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-[#254b85] bg-[#0c1f3d] p-2.5 transition-colors hover:border-emerald-400">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">⚡</span>
                                            <div>
                                                <p className="font-clash text-sm text-white stroke-black-sm">Goku_BR (Co-líder)</p>
                                                <p className="text-[10px] font-bold text-emerald-300">3.450 Medalhas</p>
                                            </div>
                                        </div>
                                        <span className="rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-2 py-0.5 text-xs font-clash text-emerald-400">4/4 PRONTO</span>
                                    </div>

                                    <div className="animate-pulse rounded-xl border-2 border-[#801723] bg-[#240b0f] p-2.5 transition-colors hover:border-red-400">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-lg">⚠️</span>
                                                <div>
                                                    <p className="font-clash text-sm text-red-200 stroke-black-sm">Lucas_CR (Membro)</p>
                                                    <p className="text-[10px] font-bold text-red-400">Faltam 3 ataques! (1/4)</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onNavigate('login')}
                                                className="rounded-lg border border-[#6b0808] bg-[#d92323] px-2.5 py-1 text-xs font-clash uppercase text-white shadow hover:bg-red-600"
                                            >
                                                Cobrar 📲
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onNavigate('login')}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2e62b0] bg-[#14376b] py-2.5 text-sm font-clash uppercase tracking-wider text-yellow-300 transition-colors hover:bg-[#1c4b91] stroke-black-sm"
                            >
                                <span>🔍</span> Abrir Gestão Completa de 50 Membros
                            </button>
                        </div>
                    </div>
                </section>

                <section id="recursos" className="space-y-8 pt-8">
                    <div className="space-y-2 text-center">
                        <div className="inline-block rounded-full border border-[#2b5ba3] bg-[#163666] px-4 py-1">
                            <span className="font-clash text-sm uppercase tracking-wider text-yellow-300 stroke-black-sm">Arsenal de Liderança</span>
                        </div>
                        <h2 className="font-clash text-3xl tracking-wide text-white sm:text-4xl stroke-black-md">PODER DE FOGO PARA DOMINAR A ARENA</h2>
                        <p className="mx-auto max-w-xl text-sm font-medium text-blue-200 sm:text-base">
                            Esqueça anotações no bloco de notas e bots que quebram toda semana.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featureCards.map((feature, index) => (
                            <div key={feature.title} className={`cr-card relative overflow-hidden rounded-3xl border-4 bg-gradient-to-b ${index === 0 ? 'from-[#18396b] via-[#102447] to-[#09152b]' : index === 1 ? 'from-[#3a154a] via-[#240b30] to-[#14051c]' : index === 2 ? 'from-[#472e0f] via-[#2e1d07] to-[#1a1002]' : 'from-[#192b45] via-[#0f1c30] to-[#070e1a]'} ${index === 0 ? 'border-[#3f88f2]' : index === 1 ? 'border-[#c238d6]' : index === 2 ? 'border-[#f09a24]' : 'border-[#789ec9]'} p-5`}>
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-purple-600 font-clash text-white shadow"><feature.icon className="h-4 w-4" /></span>
                                    <span className="rounded-full border border-[#2a5699] bg-[#0d2242] px-2.5 py-1 text-[10px] font-clash uppercase tracking-wider text-yellow-300">{index === 0 ? 'Lendária' : index === 1 ? 'Épica' : index === 2 ? 'Rara' : 'Blindada'}</span>
                                </div>
                                <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/50 text-3xl shadow-lg ${index === 0 ? 'bg-gradient-to-tr from-blue-600 to-cyan-400' : index === 1 ? 'bg-gradient-to-tr from-purple-700 to-pink-500' : index === 2 ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-[#422200]' : 'bg-gradient-to-tr from-blue-700 to-indigo-500'}`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="mb-2 text-center font-clash text-xl text-white stroke-black-sm">{feature.title}</h3>
                                <p className="text-center text-xs leading-relaxed text-blue-200">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="sanguessugas" className="relative rounded-3xl border-4 border-[#254f8f] bg-gradient-to-b from-[#1c3661] to-[#0b182e] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.8)] sm:p-10">
                    <div className="rivet absolute left-3 top-3" />
                    <div className="rivet absolute right-3 top-3" />
                    <div className="rivet absolute bottom-3 left-3" />
                    <div className="rivet absolute bottom-3 right-3" />

                    <div className="mx-auto max-w-4xl space-y-6">
                        <div className="flex flex-col items-center justify-between gap-4 border-b-2 border-[#20457d] pb-6 sm:flex-row">
                            <div>
                                <h3 className="font-clash flex items-center gap-3 text-3xl tracking-wide text-white stroke-black-md"><span>🚨</span> GERADOR DE COBRANÇA DO BARCO</h3>
                                <p className="mt-1 text-sm text-blue-200">Copie a lista pronta de quem ainda não atacou para enviar no WhatsApp ou Discord.</p>
                            </div>
                            <button
                                onClick={() => onNavigate('login')}
                                className="group relative rounded-2xl border-2 border-[#543400] bg-gradient-to-b from-[#ffe043] via-[#ffbe0b] to-[#c77a00] px-6 py-3 shadow-[0_5px_0_0_#804800] transition-all active:translate-y-1 active:shadow-none"
                            >
                                <div className="btn-gloss" />
                                <span className="font-clash flex items-center gap-2 text-sm uppercase tracking-wider text-white stroke-black-sm"><span>📋</span> Copiar Alerta do Clã</span>
                            </button>
                        </div>

                        <div className="select-all space-y-1 rounded-2xl border-2 border-[#16315c] bg-[#071121] p-4 font-mono text-sm text-green-400 shadow-inner">
                            <p className="font-clash text-base font-bold tracking-wide text-yellow-300">⚔️ [AVISO DE GUERRA - CLÃ OS IMPERADORES] ⚔️</p>
                            <p className="text-slate-300">Faltam menos de 6 horas para o reset da Corrida Fluvial!</p>
                            <p className="font-bold text-red-400">Combatentes com ataques pendentes hoje:</p>
                            <p className="pl-2 text-white">🔴 1. @Lucas_CR (1/4 ataques)</p>
                            <p className="pl-2 text-white">🔴 2. @ValkyrieBR (0/4 ataques)</p>
                            <p className="pl-2 text-white">🔴 3. @PekkaMaster (2/4 ataques)</p>
                            <p className="pl-2 text-white">🔴 4. @MegaCavaleiroX (0/4 ataques)</p>
                            <p className="pt-2 text-xs text-yellow-400">⚠️ Quem não zerar os 4 ataques até as 20h estará sujeito a rebaixamento ou banimento!</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t-4 border-[#091b38] bg-[#050e1f] px-4 py-8 text-center">
                <div className="mx-auto max-w-7xl space-y-3">
                    <div className="flex items-center justify-center gap-2 font-clash text-xl text-yellow-300 stroke-black-sm">
                        <span>👑</span> WARTRACKER
                    </div>
                    <p className="text-xs font-medium text-blue-300">
                        Desenvolvido por e para Líderes de Clãs de Clash Royale. Este projeto não é afiliado à Supercell.
                    </p>
                    <div className="flex justify-center gap-4 pt-2 text-xs font-bold uppercase text-blue-400">
                        <a href="#guerra" className="hover:text-yellow-300">Corrida Fluvial</a>
                        <span>•</span>
                        <a href="#recursos" className="hover:text-yellow-300">Ferramentas</a>
                        <span>•</span>
                        <a href="#sanguessugas" className="hover:text-yellow-300">Radar de Cobrança</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
