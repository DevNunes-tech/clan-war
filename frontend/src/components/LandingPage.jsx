import React, { useState } from 'react';
import { Crown, Swords, Users, Menu, X, Flame, Target, History } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen scroll-smooth">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Crown className="h-8 w-8 text-amber-500 fill-amber-500" />
                            <span className="font-extrabold text-xl tracking-tight text-slate-800">WarTracker</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#recursos" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Recursos</a>
                            <a href="#sobre" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">O Projeto</a>
                            <button
                                onClick={() => onNavigate('login')}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                            >
                                Acessar QG do Clã
                            </button>
                        </nav>

                        <button
                            className="md:hidden p-2 text-slate-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-lg">
                        <a href="#recursos" className="block text-slate-600 font-medium">Recursos</a>
                        <a href="#sobre" className="block text-slate-600 font-medium">O Projeto</a>
                        <button
                            onClick={() => onNavigate('login')}
                            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-bold border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                        >
                            Acessar QG do Clã
                        </button>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                <section className="relative overflow-hidden bg-slate-900 pt-16 pb-32 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/50 text-blue-300 font-semibold mb-6 border border-blue-700">
                                <Flame className="h-4 w-4 text-amber-500" /> A melhor ferramenta para Líderes
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase">
                                Domine as Guerras e <span className="text-amber-400">Alcance o Topo</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-medium">
                                Monitore os ataques do seu clã, cobre os membros inativos e garanta o baú lendário toda semana com o nosso painel de gestão focado em vitórias.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => onNavigate('login')}
                                    className="bg-amber-500 text-slate-900 px-8 py-4 rounded-xl font-black text-lg hover:bg-amber-400 transition-all shadow-lg border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 uppercase"
                                >
                                    Criar Painel do Clã <Swords className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-600 opacity-20 blur-3xl"></div>
                </section>

                <section id="sobre" className="py-20 bg-white border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <p className="text-xs font-black uppercase tracking-[0.35em] text-blue-600 mb-4">O Projeto</p>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                                Um painel para organizar o clã sem ruído desnecessário
                            </h2>
                            <p className="mt-4 text-slate-600 font-medium leading-relaxed">
                                O WarTracker centraliza guerras, histórico e membros ativos em um painel simples, deixando visível só o que importa para a liderança.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight mb-3">Visão rápida</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    Veja ataques pendentes, participação e desempenho semanal em uma única tela.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight mb-3">Menos poluição</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    Ex-membros e dados antigos são filtrados para evitar ruído no histórico do clã.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight mb-3">Acesso simples</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    O login valida o cargo via API oficial e libera o painel só para líderes e co-líderes.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="recursos" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Estratégia Impecável</h2>
                            <p className="mt-4 text-slate-600 font-medium">Chega de perder a corrida fluvial por causa de ataques esquecidos.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Target, title: 'Monitoramento de Ataques', desc: 'Saiba exatamente quem já usou os 4 decks diários e quem está devendo ataques no rio.' },
                                { icon: Users, title: 'Gestão de Membros', desc: 'Identifique rapidamente os sanguessugas e promova os membros que mais colaboram com o clã.' },
                                { icon: History, title: 'Histórico de Desempenho', desc: 'Analise o ganho de medalhas de cada jogador ao longo das semanas de guerra.' }
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border-b-4 border-slate-200">
                                        <feature.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-950 text-slate-400 py-8">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Crown className="h-6 w-6 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-xl text-slate-200 tracking-tight">WarTracker</span>
                    </div>
                    <p className="text-sm font-medium">© 2026 WarTracker. Não afiliado à Supercell.</p>
                </div>
            </footer>
        </div>
    );
}
