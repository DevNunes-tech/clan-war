import React, { useRef, useState } from 'react';
import {
    Crown,
    Swords,
    Users,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    Trophy,
    History,
    ShieldAlert,
    Ship,
    User,
    Settings,
    ChevronDown,
    Info,
    Mail,
    Hash,
    Save,
    BellRing,
    Smartphone,
    Globe,
    Loader2,
    Printer,
    Share2,
    FileText,
    Sparkles,
    Radar,
    LayoutGrid,
    Activity,
    TrendingUp,
    Monitor,
    MessageSquare
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://clan-war-yyeq-293jzglkg-oliverws7s-projects.vercel.app';

const getAuthHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return null;
    }

    return {
        ...extraHeaders,
        Authorization: `Bearer ${token}`
    };
};

const defaultPreferences = {
    notifications: true,
    dmAlerts: true,
    language: 'Português',
    darkMode: false
};

const normalizeProfile = (data = {}) => ({
    id: data.id || data._id || '',
    name: data.name || 'Carregando...',
    tag: data.tag || data.clanTag || '#---',
    email: data.email || '',
    role: data.role || '...',
    preferences: { ...defaultPreferences, ...(data.preferences || {}) }
});

const normalizePreferences = (data = {}) => {
    const prefs = data.preferences && typeof data.preferences === 'object' ? data.preferences : data;
    return { ...defaultPreferences, ...prefs };
};

const normalizeClanStats = (data = {}) => ({
    name: data.name || 'Clã não encontrado',
    tag: data.tag || '#---',
    warDay: data.warDay ?? '?',
    medals: Number(data.medals || 0),
    pendingAttacks: Number(data.pendingAttacks || 0),
    membersParticipating: Number(data.membersParticipating || 0),
    totalMembers: Number(data.totalMembers || 0),
    isWarDay: Boolean(data.isWarDay),
    missedDecksToday: Array.isArray(data.missedDecksToday) ? data.missedDecksToday : [],
    endOfDayAlert: Boolean(data.endOfDayAlert),
    warAttendance: Array.isArray(data.warAttendance) ? data.warAttendance : [],
    members: Array.isArray(data.members) ? data.members : []
});

const normalizeClanMember = (member = {}, isWarDay = false) => {
    const status = isWarDay ? member.status : 'Treino';
    const decksUsedCount = Number(member.decksUsed || 0);
    const decksMissing = Math.max(0, 4 - decksUsedCount);
    let scoreClass = 'bg-white/5 text-slate-300 border border-white/5';

    if (isWarDay) {
        scoreClass = member.status === 'Concluído'
            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
            : (member.status === 'Em Batalha' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'bg-red-500/15 text-red-300 border border-red-500/20');
    }

    return {
        id: member.id || member.tag || member._id || '',
        name: member.name || 'Sem nome',
        role: member.role || 'member',
        trophies: Number(member.trophies || 0),
        decksUsed: `${decksUsedCount}/4`,
        decksUsedCount,
        decksMissing,
        medals: Number(member.medals || 0),
        status,
        score: scoreClass
    };
};

const normalizeWarHistory = (data = {}) => ({
    weekHeaders: Array.isArray(data.weekHeaders) ? data.weekHeaders : [],
    members: Array.isArray(data.members) ? data.members : []
});

export default function Dashboard({ onNavigate }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'guerra');
    const sectionRefs = useRef({});

    const registerSectionRef = (tab) => (node) => {
        if (node) {
            sectionRefs.current[tab] = node;
        }
    };

    const tabViews = {
        guerra: {
            kicker: 'Visão estratégica do clã',
            title: 'Guerra Atual',
            description: 'Ataques pendentes, status diário, justificativas e risco de inatividade em um só painel.',
            badge: 'Controle de guerra',
            highlights: ['Ataques de hoje', 'Justificativas registradas', 'Fechamento diário']
        },
        ranking: {
            kicker: 'Desempenho competitivo',
            title: 'Ranking',
            description: 'Compare medalhas, consistência e força dos 5 melhores jogadores do clã.',
            badge: 'Top 5 do clã',
            highlights: ['Top guerreiros', 'Comparação semanal', 'Média por membro']
        },
        membros: {
            kicker: 'Gestão operacional',
            title: 'Membros',
            description: 'Veja troféus, tags e detalhe de cada jogador sem sair do painel principal.',
            badge: 'Ficha do guerreiro',
            highlights: ['Lista completa', 'Busca rápida', 'Perfil individual']
        },
        historico: {
            kicker: 'Memória de guerra',
            title: 'Histórico',
            description: 'Acompanhe a evolução semanal e o desempenho consolidado dos últimos ciclos.',
            badge: 'Linha do tempo',
            highlights: ['Semanas anteriores', 'Média histórica', 'Exportação rápida']
        },
        heatmap: {
            kicker: 'Mapa de atividade',
            title: 'Heatmap',
            description: 'Identifique os dias mais fortes e os períodos de queda de atividade do clã.',
            badge: 'Atividade recente',
            highlights: ['Últimos 35 dias', 'Picos de atividade', 'Janelas fracas']
        },
        analise: {
            kicker: 'Leitura tática',
            title: 'Análise',
            description: 'Resumo inteligente para priorizar quem precisa de atenção, incentivo ou cobrança.',
            badge: 'Insights do líder',
            highlights: ['Alertas de risco', 'Leitura rápida', 'Ação tática']
        },
        relatorios: {
            kicker: 'Entrega executiva',
            title: 'Relatórios',
            description: 'Agrupe métricas importantes para compartilhar com o clã ou guardar como registro.',
            badge: 'Resumo exportável',
            highlights: ['Top 5', 'Resumo visual', 'Compartilhar']
        },
        tv: {
            kicker: 'Modo exibição',
            title: 'TV',
            description: 'Painel ao vivo com métricas amplas para deixar aberto em tela cheia ou no monitor do clã.',
            badge: 'Painel ao vivo',
            highlights: ['Tela grande', 'Acesso rápido', 'Visão ao vivo']
        },
        perfil: {
            kicker: 'Conta do líder',
            title: 'Perfil',
            description: 'Atualize nome, tag e e-mail do responsável pelo painel com segurança.',
            badge: 'Identidade do líder',
            highlights: ['Nome de guerra', 'Tag vinculada', 'E-mail de acesso']
        },
        configs: {
            kicker: 'Ajustes do painel',
            title: 'Configurações',
            description: 'Gerencie preferências de notificação, mensagens automáticas e idioma da interface.',
            badge: 'Preferências gerais',
            highlights: ['Notificações', 'DM automática', 'Idioma']
        },
        preferencias: {
            kicker: 'Ajustes pessoais',
            title: 'Preferências',
            description: 'Customize as notificações e a experiência de uso sem sair do painel.',
            badge: 'Preferências do usuário',
            highlights: ['Push', 'Mensagens automáticas', 'Idioma']
        }
    };

    const activeView = tabViews[activeTab] || tabViews.guerra;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        localStorage.setItem('activeTab', tab);
        setSidebarOpen(false); // Common behavior for sidebar buttons
        window.requestAnimationFrame(() => {
            sectionRefs.current[tab]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [profile, setProfile] = useState({
        id: '',
        name: 'Carregando...',
        tag: '#---',
        email: '',
        role: '...',
        preferences: defaultPreferences
    });

    const [prefs, setPrefs] = useState({
        notifications: true,
        dmAlerts: true,
        language: 'Português',
        darkMode: false
    });

    const [clanStats, setClanStats] = useState({
        name: 'Carregando...',
        tag: '#---',
        warDay: '...',
        medals: 0,
        pendingAttacks: 0,
        membersParticipating: 0,
        totalMembers: 0,
        isWarDay: false
    });

    const [clanMembers, setClanMembers] = useState([]);
    const [warHistory, setWarHistory] = useState({ weekHeaders: [], members: [] });
    const [warAttendance, setWarAttendance] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [attendanceJustification, setAttendanceJustification] = useState('');
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [notificationsList, setNotificationsList] = useState([]);
    const [minMedalsTarget, setMinMedalsTarget] = useState(2400); // Meta de medalhas

    const handleMarkAllAsRead = () => {
        setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getInitials = (name) => {
        if (!name || name === 'Carregando...') return '??';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const translateRole = (role) => {
        const roles = {
            'leader': 'Líder',
            'coLeader': 'Co-líder',
            'elder': 'Ancião',
            'member': 'Membro'
        };
        return roles[role] || role;
    };

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setProfile(prev => ({
                ...prev,
                ...normalizeProfile(userData),
                role: translateRole(userData.role)
            }));
        }

        const fetchData = async () => {
            const headers = getAuthHeaders();

            if (!headers) {
                onNavigate('login');
                return;
            }

            try {
                const profileRes = await fetch(API_URL + '/api/user/profile', { headers });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(prev => ({
                        ...prev,
                        ...normalizeProfile(profileData),
                        role: translateRole(profileData.role)
                    }));
                }
                else if (profileRes.status === 401) onNavigate('login');

                const prefsRes = await fetch(API_URL + '/api/user/preferences', { headers });
                if (prefsRes.ok) setPrefs(normalizePreferences(await prefsRes.json()));
                else if (prefsRes.status === 401) onNavigate('login');

                const clanRes = await fetch(API_URL + '/api/clan/stats');
                const clanData = await clanRes.json();

                if (clanRes.ok) {
                    const normalizedClan = normalizeClanStats(clanData);
                    setClanStats(normalizedClan);
                    setClanMembers(normalizedClan.members.map((m) => normalizeClanMember(m, normalizedClan.isWarDay)));
                    setWarAttendance(normalizedClan.warAttendance);
                } else {
                    setClanStats({
                        name: 'Clã não encontrado',
                        tag: 'Verifique o .env',
                        warDay: '?',
                        medals: 0,
                        pendingAttacks: 0,
                        membersParticipating: 0,
                        totalMembers: 0,
                        isWarDay: false,
                        missedDecksToday: [],
                        warAttendance: [],
                        members: []
                    });
                    setWarAttendance([]);
                }

                const historyRes = await fetch(API_URL + '/api/clan/history');
                if (historyRes.ok) {
                    setWarHistory(normalizeWarHistory(await historyRes.json()));
                }

                // Lógica de Notificações Baseada no Dia
                const today = new Date();
                const dayIdx = today.getDay(); // 0-Sun, 4-Thu
                const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
                const isWarDay = dayIdx === 0 || dayIdx >= 4;

                const newNotifs = [];
                if (isWarDay) {
                    newNotifs.push({
                        id: 101,
                        text: `Guerra em andamento! Hoje é ${dayNames[dayIdx]}.`,
                        time: 'Status: ATIVO',
                        icon: Swords,
                        read: false
                    });
                    newNotifs.push({
                        id: 102,
                        text: 'Lembre-se: use todos os 4 decks diários!',
                        time: 'Prioridade Alta',
                        icon: BellRing,
                        read: false
                    });
                    if (clanData.endOfDayAlert) {
                        newNotifs.push({
                            id: 104,
                            text: `${clanData.pendingAttacks} membro(s) ainda estão com decks pendentes no fechamento do dia.`,
                            time: 'Fechamento do dia',
                            icon: ShieldAlert,
                            read: false
                        });
                    }
                } else {
                    newNotifs.push({
                        id: 103,
                        text: `Próxima guerra começa na Quinta-feira. Hoje é ${dayNames[dayIdx]}.`,
                        time: 'Status: TREINO',
                        icon: Info,
                        read: false
                    });
                }
                setNotificationsList(newNotifs);

            } catch (err) {
                console.error("Erro ao conectar com o backend:", err);
            }
        };
        fetchData();
    }, []);

    const handleSaveAttendance = async () => {
        if (!selectedMember) return;

        setIsSavingAttendance(true);
        const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

        if (!headers) {
            setIsSavingAttendance(false);
            onNavigate('login');
            return;
        }

        try {
            const res = await fetch(API_URL + '/api/clan/attendance', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    clanTag: clanStats.tag,
                    clanName: clanStats.name,
                    memberTag: selectedMember.id,
                    memberName: selectedMember.name,
                    decksUsed: selectedMember.decksUsedCount,
                    justification: attendanceJustification,
                    reportedBy: profile.name
                })
            });

            if (res.ok) {
                const data = await res.json();
                setWarAttendance(Array.isArray(data.warAttendance) ? data.warAttendance : []);
                setAttendanceJustification('');
                alert('Justificativa registrada com sucesso.');
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.message || 'Não foi possível salvar a justificativa.');
            }
        } catch (err) {
            console.error('Erro ao salvar justificativa:', err);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setIsSavingAttendance(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

        if (!headers) {
            setIsSaving(false);
            onNavigate('login');
            return;
        }

        try {
            const res = await fetch(API_URL + '/api/user/profile', {
                method: 'PUT',
                headers,
                body: JSON.stringify(profile)
            });
            if (res.ok) alert("Perfil salvo com sucesso!");
            else if (res.status === 401) onNavigate('login');
        } catch (err) {
            console.error("Erro ao salvar perfil:", err);
            alert("Erro ao conectar com o servidor.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePrefs = async (newPrefs) => {
        setPrefs(newPrefs);
        const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

        if (!headers) {
            onNavigate('login');
            return;
        }

        try {
            const res = await fetch(API_URL + '/api/user/preferences', {
                method: 'PUT',
                headers,
                body: JSON.stringify(newPrefs)
            });
            if (res.status === 401) onNavigate('login');
        } catch (err) {
            console.error("Erro ao salvar preferências:", err);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        const topMembers = warHistory.members.slice(0, 5).map((m, i) =>
            `${i + 1}. ${m.name} - Média: ${m.average}`
        ).join('\n');

        const text = `🏆 *QG ${clanStats.name} - TOP 5 GUERREIROS*\n\n` +
            `Acompanhe o desempenho do clã:\n\n${topMembers}\n\n` +
            `Confira o QG completo em: ${window.location.origin}`;

        navigator.clipboard.writeText(text);
        alert("Resumo do Top 5 copiado para a área de transferência! Prontinho para enviar no WhatsApp.");
    };

    const stats = [
        { label: 'Medalhas do Clã', value: clanStats.medals.toLocaleString(), icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' },
        { label: 'Ataques Pendentes', value: clanStats.isWarDay ? `${clanStats.pendingAttacks}` : 'OFF', icon: Swords, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' },
        { label: 'Membros Participando', value: `${clanStats.membersParticipating}/${clanStats.totalMembers || 50}`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
    ];

    const navigationTabs = [
        { id: 'guerra', label: 'Guerra' },
        { id: 'ranking', label: 'Ranking' },
        { id: 'membros', label: 'Membros' },
        { id: 'historico', label: 'Histórico' },
        { id: 'heatmap', label: 'Heatmap' },
        { id: 'analise', label: 'Análise' },
        { id: 'relatorios', label: 'Relatórios' },
        { id: 'tv', label: 'TV' },
        { id: 'perfil', label: 'Perfil' },
        { id: 'configs', label: 'Config.' },
    ];

    const rankingMembers = [...clanMembers]
        .sort((a, b) => b.medals - a.medals || b.trophies - a.trophies)
        .slice(0, 5);

    const historicalMembers = warHistory.members
        .filter((member) => clanMembers.some((currentMember) => currentMember.id === member.tag))
        .filter((member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const heatmapGrid = Array.from({ length: 35 }, (_, index) => {
        const level = (index * 7 + (clanStats.medals % 5)) % 5;
        return level;
    });

    const insightCards = [
        {
            label: 'Ataques restantes',
            value: clanStats.pendingAttacks,
            hint: clanStats.isWarDay ? 'Janela de guerra ativa' : 'Modo treino',
            color: 'text-red-400'
        },
        {
            label: 'Membros ativos',
            value: `${clanStats.membersParticipating}/${clanStats.totalMembers || 50}`,
            hint: 'Participação consolidada',
            color: 'text-blue-300'
        },
        {
            label: 'Medalhas totais',
            value: clanStats.medals.toLocaleString(),
            hint: 'Meta semanal monitorada',
            color: 'text-amber-400'
        },
        {
            label: 'Risco de inatividade',
            value: 'Baixo',
            hint: 'Baseada nos últimos ciclos',
            color: 'text-emerald-400'
        }
    ];

    const reportMetrics = [
        { label: 'Top 5', value: rankingMembers.length },
        { label: 'Histórico', value: historicalMembers.length },
        { label: 'Alertas', value: notificationsList.filter((item) => !item.read).length },
    ];

    const shellMetrics = [
        {
            label: 'Ataques pendentes',
            value: clanStats.isWarDay ? clanStats.pendingAttacks : 0,
            hint: clanStats.isWarDay ? 'Ativo no ciclo atual' : 'Fora da janela de guerra',
            accent: 'from-red-500/20 to-red-500/5 text-red-300'
        },
        {
            label: 'Medalhas do clã',
            value: clanStats.medals.toLocaleString(),
            hint: 'Meta acompanhada semanalmente',
            accent: 'from-amber-500/20 to-amber-500/5 text-amber-300'
        },
        {
            label: 'Membros ativos',
            value: `${clanStats.membersParticipating}/${clanStats.totalMembers || 50}`,
            hint: 'Participação consolidada',
            accent: 'from-blue-500/20 to-blue-500/5 text-blue-300'
        },
        {
            label: 'Risco de inatividade',
            value: 'Baixo',
            hint: 'Monitorado por atividade recente',
            accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300'
        }
    ];

    return (
        <div className="wt-dashboard min-h-screen bg-[#070B14] flex font-sans text-slate-100">
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1220] text-slate-300 transform transition-transform duration-300 ease-in-out border-r border-white/6
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block
      `}>
                <div className="h-full flex flex-col">
                    <div className="h-20 flex items-center px-6 bg-[#09101C] border-b border-white/6 cursor-pointer" onClick={() => handleTabChange('guerra')}>
                        <div className="flex items-center gap-3">
                            <Crown className="h-8 w-8 text-amber-500 fill-amber-500" />
                            <div>
                                <span className="font-black text-white text-lg block leading-none underline decoration-amber-500 underline-offset-4 decoration-2">{clanStats.name}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">{clanStats.tag}</span>
                            </div>
                        </div>
                        <button className="lg:hidden ml-auto text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
                        <button
                            onClick={() => handleTabChange('guerra')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'guerra' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Ship className="h-5 w-5" /> Guerra Atual
                        </button>
                        <button
                            onClick={() => handleTabChange('membros')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'membros' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Users className="h-5 w-5" /> Membros
                        </button>
                        <button
                            onClick={() => handleTabChange('historico')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'historico' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <History className="h-5 w-5" /> Histórico
                        </button>
                        <button
                            onClick={() => handleTabChange('configs')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'configs' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <ShieldAlert className="h-5 w-5" /> Configurações
                        </button>
                    </nav>

                    <div className="p-4 bg-[#09101C] border-t border-white/6">
                        <button
                            onClick={() => onNavigate('landing')}
                            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-colors"
                        >
                            <LogOut className="h-5 w-5" /> Sair do Painel
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-20 bg-[#0B1220]/95 backdrop-blur border-b border-white/6 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-slate-500 hover:text-slate-700 p-2 bg-slate-100 rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="hidden sm:flex items-center bg-white/5 rounded-xl px-4 py-2.5 w-72 border border-white/6 focus-within:border-blue-400/50 focus-within:bg-white/8 transition-colors">
                            <Search className="h-5 w-5 text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar membro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-amber-500/15 text-amber-300' : 'text-slate-400 hover:text-amber-300 bg-white/5'}`}
                            >
                                <Bell className="h-6 w-6" />
                                {notificationsList.some(n => !n.read) && (
                                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#0B1220] rounded-2xl border border-white/6 overflow-hidden z-50 shadow-2xl">
                                    <div className="p-4 border-b border-white/6 bg-white/3 flex justify-between items-center">
                                        <span className="font-black text-white uppercase text-[11px] tracking-[0.28em]">Notificações</span>
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-[10px] text-blue-300 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                                        >
                                            Marcar tudo lido
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notificationsList.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => {
                                                    setNotificationsList(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                                                }}
                                                className={`p-4 border-b border-white/6 last:border-0 hover:bg-white/5 transition-colors flex gap-3 cursor-pointer ${!n.read ? 'bg-blue-500/10' : ''}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-blue-500/15 text-blue-300' : 'bg-white/5 text-slate-400'}`}>
                                                    <n.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${!n.read ? 'font-semibold text-white' : 'font-medium text-slate-400'}`}>{n.text}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{n.time}</p>
                                                </div>
                                                {!n.read && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full my-auto"></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200">
                            <button
                                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200">
                                    {getInitials(profile.name)}
                                </div>
                                <div className="hidden sm:block text-sm text-left">
                                    <p className="font-black text-slate-800 leading-tight flex items-center gap-1">
                                        {profile.name} <ChevronDown className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                                    </p>
                                    <p className="text-amber-600 font-bold text-xs uppercase tracking-wider">{profile.role}</p>
                                </div>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 top-full mt-3 w-56 bg-[#0B1220] rounded-2xl border border-white/6 overflow-hidden z-50 shadow-2xl">
                                    <div className="p-2">
                                        <button
                                            onClick={() => { handleTabChange('perfil'); setShowProfileMenu(false); }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <User className="h-4 w-4 text-slate-400" /> Meu Perfil
                                        </button>
                                        <button
                                            onClick={() => { handleTabChange('preferencias'); setShowProfileMenu(false); }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <Settings className="h-4 w-4 text-slate-400" /> Preferências
                                        </button>
                                        <div className="h-px bg-slate-100 my-2"></div>
                                        <button
                                            onClick={() => onNavigate('landing')}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" /> Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-[#070B14]">
                    <div className="mx-auto max-w-7xl space-y-6">

                        <section className="wt-surface rounded-[1.5rem] p-2.5 sm:p-3">
                            <div className="flex flex-wrap gap-2">
                                {navigationTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.id
                                            ? 'bg-white/8 text-white border border-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.22)]'
                                            : 'border border-white/6 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="wt-surface wt-border-glow overflow-hidden rounded-[1.75rem]">
                            <div className="grid gap-5 p-5 xl:grid-cols-[1.25fr_0.75fr] xl:p-6">
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                                        <Sparkles className="h-4 w-4 text-[#F5B100]" /> {activeView.kicker}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                            {activeView.title} <span className="wt-text-gradient">{clanStats.name}</span>
                                        </h1>
                                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                                            {activeView.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                                            {activeView.badge}
                                        </span>
                                        {activeView.highlights.map((item) => (
                                            <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                {item}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {shellMetrics.map((metric) => (
                                            <div key={metric.label} className="rounded-2xl border border-white/6 bg-[#0B1220] p-4">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
                                                <p className="mt-2 text-3xl font-black text-white">{metric.value}</p>
                                                <p className="mt-2 text-xs font-medium text-slate-400">{metric.hint}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-white/6 bg-[#0B1220] p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{activeView.badge}</p>
                                            <h2 className="mt-2 text-xl font-black text-white">{activeView.title}</h2>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 p-3 text-slate-300 border border-white/6">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {insightCards.map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-white/6 bg-white/4 p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                                                        <p className={`mt-2 text-2xl font-black ${item.color}`}>{item.value}</p>
                                                    </div>
                                                    <div className="h-2.5 w-2.5 rounded-full bg-[#5B5FFF]"></div>
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500">{item.hint}</p>
                                            </div>
                                        ))}
                                            <div className="rounded-2xl border border-white/6 bg-white/4 p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">O que você abriu</p>
                                                <p className="mt-2 text-sm font-semibold text-slate-200">{activeView.description}</p>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {activeTab === 'guerra' && (
                            <div ref={registerSectionRef('guerra')} className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {stats.map((stat, idx) => (
                                        <div key={idx} className={`wt-surface wt-hover-lift rounded-[1.25rem] p-4 flex items-center gap-4`}>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                                <stat.icon className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.28em] mb-1">{stat.label}</p>
                                                <p className="text-3xl font-black text-white">{stat.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="wt-surface rounded-[1.5rem] overflow-hidden">
                                    <div className="p-5 border-b border-white/6 flex justify-between items-center bg-white/4">
                                        <h2 className="text-base font-semibold text-white tracking-[0.08em]">Status dos ataques diários</h2>
                                        <span className="bg-white/8 text-slate-300 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]">Hoje</span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="bg-white/4 text-slate-500 text-[10px] uppercase font-bold tracking-[0.22em]">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">Membro do Clã</th>
                                                    <th scope="col" className="px-6 py-4 text-center">Decks Usados</th>
                                                    <th scope="col" className="px-6 py-4 text-center">Medalhas (Hoje)</th>
                                                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                                                    <th scope="col" className="px-6 py-4 text-right">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {clanMembers.map((member) => (
                                                    <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/6 group-hover:border-blue-300 group-hover:text-blue-300 transition-all">
                                                                    <Users className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-white text-base">{member.name}</p>
                                                                    <p className="text-xs text-slate-500 font-semibold">{member.role}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-black text-slate-800 text-base">
                                                            {member.decksUsed}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="inline-flex items-center gap-1 font-black text-amber-500 text-base">
                                                                <Trophy className="h-4 w-4" /> {member.medals}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md ${member.score}`}>
                                                                {member.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMember(member);
                                                                    const latestAttendance = warAttendance.find((entry) => entry.memberTag === member.id);
                                                                    setAttendanceJustification(latestAttendance?.justification || '');
                                                                    setShowMemberModal(true);
                                                                }}
                                                                className="rounded-xl border border-white/8 bg-white/5 px-3 py-1.5 text-sm font-bold text-[#B8C5FF] transition-colors hover:bg-white/10 hover:text-white"
                                                            >
                                                                Ver Perfil
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ranking' && (
                            <div ref={registerSectionRef('ranking')} className="animate-in fade-in duration-500 space-y-6">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7C3AED]">Ranking do clã</p>
                                        <h2 className="mt-2 text-3xl font-black text-white">Top guerreiro e consistência semanal</h2>
                                    </div>
                                    <div className="rounded-full border border-white/6 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-300">
                                        Atualizado agora
                                    </div>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
                                        <div className="wt-surface rounded-[1.5rem] p-5">
                                            <h3 className="text-base font-semibold text-white tracking-[0.08em]">Top 5 do clã</h3>
                                        <div className="mt-5 space-y-4">
                                            {rankingMembers.map((member, index) => (
                                                    <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/4 p-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-sm font-black text-white border border-white/6">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-bold text-white">{member.name}</p>
                                                        <p className="text-xs text-slate-500">{member.role}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-amber-400">{member.medals.toLocaleString()}</p>
                                                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">medalhas</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="wt-surface rounded-[1.5rem] p-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-white tracking-[0.08em]">Comparação de guerra</h3>
                                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                            {rankingMembers.map((member) => (
                                                <div key={member.id} className="rounded-2xl border border-white/6 bg-[#0B1220] p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{member.name}</p>
                                                            <p className="text-xs text-slate-500">{member.decksUsed} decks usados</p>
                                                        </div>
                                                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">#{member.id}</span>
                                                    </div>
                                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-[#5B5FFF] to-[#F5B100]" style={{ width: `${Math.max(35, Math.min(100, member.medals / 50))}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'heatmap' && (
                            <div ref={registerSectionRef('heatmap')} className="animate-in fade-in duration-500 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                <div className="wt-surface rounded-[1.5rem] p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8FA2FF]">Heatmap de atividade</p>
                                            <h2 className="mt-2 text-2xl font-black text-white">Últimos 35 dias</h2>
                                        </div>
                                        <Activity className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-3">
                                        {heatmapGrid.map((level, index) => (
                                            <div
                                                key={index}
                                                className={`aspect-square rounded-lg border border-white/5 ${
                                                    level === 0 ? 'bg-white/5' : level === 1 ? 'bg-[#1E2A44]' : level === 2 ? 'bg-[#2D3D66]' : level === 3 ? 'bg-[#5B5FFF]' : 'bg-[#F5B100]'
                                                }`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="wt-surface rounded-[1.5rem] p-5 space-y-4">
                                    <h3 className="text-base font-semibold text-white tracking-[0.08em]">Leitura rápida</h3>
                                    {[
                                        { label: 'Dias mais fortes', value: 'Quinta a Domingo' },
                                        { label: 'Queda de atividade', value: 'Segunda e Terça' },
                                        { label: 'Alertas', value: '2 membros com risco médio' },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-white/6 bg-white/4 p-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                                            <p className="mt-2 text-lg font-black text-white">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'analise' && (
                            <div ref={registerSectionRef('analise')} className="animate-in fade-in duration-500 space-y-6">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F5B100]">Análise inteligente</p>
                                        <h2 className="mt-2 text-3xl font-black text-white">Insights táticos para liderança</h2>
                                    </div>
                                    <Radar className="h-6 w-6 text-amber-400" />
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {insightCards.map((item) => (
                                        <div key={item.label} className="wt-surface rounded-[1.25rem] p-5">
                                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                                            <p className={`mt-3 text-3xl font-black ${item.color}`}>{item.value}</p>
                                            <p className="mt-3 text-sm text-slate-400">{item.hint}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'relatorios' && (
                            <div ref={registerSectionRef('relatorios')} className="animate-in fade-in duration-500 space-y-6">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#22C55E]">Relatórios</p>
                                        <h2 className="mt-2 text-3xl font-black text-white">Exportações e resumos estratégicos</h2>
                                    </div>
                                    <FileText className="h-6 w-6 text-emerald-400" />
                                </div>

                                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                                    <div className="wt-surface rounded-[1.5rem] p-5 space-y-4">
                                        {reportMetrics.map((item) => (
                                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/4 px-4 py-3">
                                                <span className="text-sm font-semibold text-slate-300">{item.label}</span>
                                                <span className="text-lg font-black text-white">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="wt-surface rounded-[1.5rem] p-5">
                                        <h3 className="text-base font-semibold text-white tracking-[0.08em]">Relatório visual</h3>
                                        <div className="mt-5 space-y-3">
                                            {historicalMembers.slice(0, 4).map((member) => (
                                                <div key={member.tag} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/4 px-4 py-3">
                                                    <span className="text-sm font-bold text-white">{member.name}</span>
                                                    <span className="text-sm text-slate-400">{member.total.toLocaleString()} medalhas</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tv' && (
                            <div ref={registerSectionRef('tv')} className="animate-in fade-in duration-500">
                                <div className="wt-surface overflow-hidden rounded-[1.75rem]">
                                    <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Modo TV</p>
                                            <h2 className="mt-1 text-2xl font-black text-white">Painel ao vivo</h2>
                                        </div>
                                        <Monitor className="h-6 w-6 text-[#5B5FFF]" />
                                    </div>
                                    <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-4">
                                        {shellMetrics.map((metric) => (
                                            <div key={metric.label} className="rounded-2xl border border-white/6 bg-[#0B1220] p-4 text-center">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                                                <p className="mt-3 text-4xl font-black text-white">{metric.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'perfil' && (
                            <div ref={registerSectionRef('perfil')} className="animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-white/5 text-white rounded-2xl flex items-center justify-center border border-white/6">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-white tracking-tight">Meu Perfil</h1>
                                        <p className="text-slate-400 font-medium">Gerencie suas informações de líder</p>
                                    </div>
                                </div>

                                <div className="wt-surface rounded-[1.5rem] p-6 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em] flex items-center gap-2">
                                                <User className="h-3 w-3" /> Nome de Guerra
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/4 border border-white/6 rounded-xl focus:border-blue-500 outline-none font-semibold text-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em] flex items-center gap-2">
                                                <Hash className="h-3 w-3" /> Tag do Jogador
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.tag}
                                                disabled
                                                className="w-full px-4 py-3 bg-white/5 border border-white/6 rounded-xl font-semibold text-slate-400 cursor-not-allowed uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em] flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> E-mail de Acesso
                                        </label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/4 border border-white/6 rounded-xl focus:border-blue-500 outline-none font-semibold text-white transition-all"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-sm hover:bg-slate-200 transition-all border border-white/10 active:translate-y-0.5 flex items-center justify-center gap-2 uppercase w-full sm:w-auto disabled:opacity-50"
                                        >
                                            {isSaving ? 'Salvando...' : 'Salvar Alterações'} <Save className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl border border-amber-500/15 bg-amber-500/8 p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/20">
                                        <Info className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-amber-200 uppercase text-xs tracking-[0.22em] mb-1">Dica de líder</h4>
                                        <p className="text-amber-100/80 text-sm font-medium leading-relaxed">
                                            Mantenha seu e-mail atualizado para receber relatórios semanais de desempenho do clã e alertas de inatividade.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferencias' && (
                            <div ref={registerSectionRef('preferencias')} className="animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-white/5 text-white rounded-2xl flex items-center justify-center border border-white/6">
                                        <Settings className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-white tracking-tight">Preferências</h1>
                                        <p className="text-slate-400 font-medium">Personalize sua experiência no QG</p>
                                    </div>
                                </div>

                                <div className="wt-surface rounded-[1.5rem] overflow-hidden divide-y divide-white/6">
                                    {/* Notificações Push */}
                                    <div className="p-6 flex items-center justify-between hover:bg-white/3 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-500/10 text-blue-300 rounded-2xl flex items-center justify-center border border-blue-500/15">
                                                <BellRing className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Notificações Push</h4>
                                                <p className="text-xs text-slate-400 font-medium">Alertas sobre o status da guerra no navegador</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUpdatePrefs({ ...prefs, notifications: !prefs.notifications })}
                                            className={`w-14 h-8 rounded-full transition-all relative ${prefs.notifications ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${prefs.notifications ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    {/* Alertas via DM */}
                                    <div className="p-6 flex items-center justify-between hover:bg-white/3 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-violet-500/10 text-violet-300 rounded-2xl flex items-center justify-center border border-violet-500/15">
                                                <Smartphone className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Mensagens Automáticas</h4>
                                                <p className="text-xs text-slate-400 font-medium">Notificar automaticamente membros com ataques pendentes</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUpdatePrefs({ ...prefs, dmAlerts: !prefs.dmAlerts })}
                                            className={`w-14 h-8 rounded-full transition-all relative ${prefs.dmAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${prefs.dmAlerts ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    {/* Idioma */}
                                    <div className="p-6 flex items-center justify-between hover:bg-white/3 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-300 rounded-2xl flex items-center justify-center border border-emerald-500/15">
                                                <Globe className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Idioma do Painel</h4>
                                                <p className="text-xs text-slate-400 font-medium">Configure o idioma da interface</p>
                                            </div>
                                        </div>
                                        <select
                                            value={prefs.language}
                                            onChange={(e) => handleUpdatePrefs({ ...prefs, language: e.target.value })}
                                            className="bg-white/5 border border-white/6 rounded-xl px-4 py-2 font-semibold text-sm text-white outline-none"
                                        >
                                            <option>Português</option>
                                            <option>English</option>
                                            <option>Español</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'membros' && (
                            <div ref={registerSectionRef('membros')} className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h1 className="text-3xl font-black text-white tracking-tight">Gestão de Membros</h1>
                                    <span className="bg-white/5 text-blue-200 px-4 py-2 rounded-xl text-xs font-black uppercase border border-white/6">
                                        Total: {clanStats.totalMembers}
                                    </span>
                                </div>

                                <div className="wt-surface rounded-[1.5rem] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="bg-white/4 text-slate-500 text-[10px] uppercase font-bold tracking-[0.22em] border-b border-white/6">
                                                <tr>
                                                    <th className="px-8 py-5">Nome / Cargo</th>
                                                    <th className="px-8 py-5 text-center">Troféus Atuais</th>
                                                    <th className="px-8 py-5 text-center">Tag</th>
                                                    <th className="px-8 py-5 text-right">Ficha</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/6">
                                                {clanMembers.length > 0 ? (
                                                    [...clanMembers]
                                                        .filter(m =>
                                                            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            m.id.toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .sort((a, b) => b.trophies - a.trophies)
                                                        .map((member) => (
                                                            <tr key={member.id} className="hover:bg-white/3 transition-all group">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-slate-300 border border-white/6 group-hover:bg-blue-500/10 group-hover:text-blue-200 group-hover:border-blue-500/15 transition-all uppercase">
                                                                            {member.name.slice(0, 1)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-white text-base leading-tight">{member.name}</p>
                                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.role}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-center">
                                                                    <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/6">
                                                                        <Trophy className="h-4 w-4 text-amber-400" />
                                                                        <span className="font-black text-white text-base">{member.trophies.toLocaleString()}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-center">
                                                                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded uppercase border border-white/6">
                                                                        {member.id}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedMember(member);
                                                                            const latestAttendance = warAttendance.find((entry) => entry.memberTag === member.id);
                                                                            setAttendanceJustification(latestAttendance?.justification || '');
                                                                            setShowMemberModal(true);
                                                                        }}
                                                                        className="p-2.5 text-blue-200 hover:bg-blue-500/15 hover:text-white rounded-xl transition-all border border-white/6 hover:border-blue-500/20"
                                                                    >
                                                                        <User className="h-5 w-5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-8 py-20 text-center">
                                                            <Loader2 className="h-10 w-10 text-blue-200 animate-spin mx-auto mb-4" />
                                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Convocando Guerreiros...</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'historico' && (
                            <div ref={registerSectionRef('historico')} className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h1 className="text-3xl font-black text-white tracking-tight">Histórico de Guerras</h1>
                                    <div className="flex gap-2 no-print">
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-300 border border-white/6 hover:bg-white/8 transition-all"
                                        >
                                            <Share2 className="h-4 w-4" /> Enviar Top 5
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-950 hover:bg-slate-200 transition-all"
                                        >
                                            <Printer className="h-4 w-4" /> Gerar Relatório
                                        </button>
                                    </div>
                                </div>

                                <div className="wt-surface rounded-[1.5rem] overflow-hidden print:border-none">
                                    <div className="overflow-x-auto print:overflow-visible no-scrollbar">
                                        <table className="w-full text-left text-[11px] font-medium text-slate-300 border-collapse print:table">
                                            <thead className="bg-white/6 text-white uppercase text-[9px] font-black tracking-widest sticky top-0 z-20">
                                                <tr>
                                                    <th className="px-3 py-4 text-center bg-[#0B1220] sticky left-0 z-30">Nº</th>
                                                    <th className="px-4 py-4 min-w-[140px] bg-[#0B1220] sticky left-[36px] z-30 border-r border-white/6">Jogador</th>
                                                    <th className="px-3 py-4 text-center">Semanas</th>
                                                    <th className="px-3 py-4 text-center">Total</th>
                                                    <th className="px-3 py-4 text-center">Média</th>
                                                    {warHistory.weekHeaders.map((week, idx) => (
                                                        <th key={idx} className="px-2 py-4 text-center border-l border-white/6 bg-white/5 min-w-[60px]">{week}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/6">
                                                {warHistory.members.length > 0 ? (
                                                    warHistory.members
                                                        .filter(member => clanMembers.some(currentMember => currentMember.id === member.tag))
                                                        .filter(m =>
                                                            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            m.tag.toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map((member, idx) => {
                                                            const currentMember = clanMembers.find(m => m.id === member.tag);
                                                            const role = currentMember ? currentMember.role : '-';

                                                            const rankColor = idx < 3 ? 'bg-white/4' : 'bg-transparent';
                                                            const numColor = idx === 0 ? 'bg-amber-400 text-slate-950' : (idx === 1 ? 'bg-slate-300 text-slate-950' : (idx === 2 ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-300'));

                                                            return (
                                                                <tr key={member.tag} className={`group hover:bg-white/4 transition-colors ${rankColor}`}>
                                                                    <td className={`px-1 py-3 text-center sticky left-0 z-10 ${rankColor}`}>
                                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-[10px] shadow-sm ${numColor}`}>
                                                                            {member.rank < 10 ? `0${member.rank}` : member.rank}
                                                                        </span>
                                                                    </td>
                                                                    <td className={`px-4 py-3 sticky left-[36px] z-10 border-r border-white/6 ${rankColor}`}>
                                                                        <div>
                                                                            <p className="font-black text-white group-hover:text-blue-200 transition-colors whitespace-nowrap">{member.name}</p>
                                                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{role}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center font-black text-white">
                                                                        {member.weeks}
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center">
                                                                        <span className="bg-white/5 px-2 py-1 rounded text-white font-black border border-white/6">
                                                                            {member.total.toLocaleString()}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center">
                                                                        <div className="inline-flex items-center gap-1 font-black text-blue-200 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/15">
                                                                            {member.average.toLocaleString()}
                                                                        </div>
                                                                    </td>
                                                                    {member.history.map((fame, fIdx) => (
                                                                        <td key={fIdx} className={`px-2 py-3 text-center border-l border-white/6 font-bold ${fame >= minMedalsTarget ? 'text-emerald-300' : (fame > 0 ? 'text-red-300' : 'text-slate-500')}`}>
                                                                            {fame > 0 ? fame.toLocaleString() : '-'}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            );
                                                        })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={100} className="px-8 py-20 text-center">
                                                            <Loader2 className="h-10 w-10 text-blue-200 animate-spin mx-auto mb-4" />
                                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">Lendo pergaminhos de guerra...</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'configs' && (
                            <div ref={registerSectionRef('configs')} className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <Settings className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-white tracking-tight">Configurações do QG</h1>
                                        <p className="text-slate-400 font-medium">Controle as regras e monitoramento do clã</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Card: Monitoramento do Clã */}
                                    <div className="wt-surface rounded-[1.5rem] p-6 space-y-6">
                                        <div className="flex items-center gap-3 text-blue-300 mb-4">
                                            <ShieldAlert className="h-6 w-6" />
                                            <h3 className="font-semibold tracking-[0.08em] text-base text-white">Monitoramento</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em]">Tag do Clã Primário</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={clanStats.tag}
                                                        disabled
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/6 rounded-xl font-semibold text-slate-400 cursor-not-allowed uppercase"
                                                    />
                                                    <button className="px-4 py-2 bg-white/5 text-slate-500 font-black rounded-xl hover:bg-white/10 transition-colors border border-white/6" disabled>
                                                        EDITAR
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em]">Meta de Medalhas (Mínimo)</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="3600"
                                                        step="100"
                                                        value={minMedalsTarget}
                                                        onChange={(e) => setMinMedalsTarget(parseInt(e.target.value))}
                                                        className="flex-1 accent-blue-600"
                                                    />
                                                    <span className="font-black text-blue-600 text-xl w-16 text-center">{minMedalsTarget}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase italic">Abaixo disso, o histórico ficará em destaque</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card: Dias de Guerra */}
                                    <div className="wt-surface rounded-[1.5rem] p-6 space-y-6">
                                        <div className="flex items-center gap-3 text-amber-300 mb-4">
                                            <Swords className="h-6 w-6" />
                                            <h3 className="font-semibold tracking-[0.08em] text-base text-white">Agenda de Guerra</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/6 flex items-center justify-between">
                                                <span className="font-bold text-white">Status de Hoje</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${new Date().getDay() === 0 || new Date().getDay() >= 4 ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                                                    {new Date().getDay() === 0 || new Date().getDay() >= 4 ? 'EM GUERRA' : 'DESCANSO'}
                                                </span>
                                            </div>

                                            <div className="bg-white/4 p-5 rounded-2xl space-y-3 border border-white/6">
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-slate-500 uppercase tracking-[0.18em]">Período Ativo</span>
                                                    <span className="text-white">Quinta a Domingo</span>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                                                        <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 || i >= 4 ? 'bg-amber-400 text-slate-950' : 'bg-white/8 text-slate-500'}`}>
                                                            {d}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl p-6 text-white relative overflow-hidden group border border-white/6 bg-[#0B1220]">
                                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <div>
                                            <h3 className="text-xl font-black uppercase mb-2 tracking-[0.08em]">Relatórios de Inatividade</h3>
                                            <p className="text-slate-400 font-medium max-w-md">Envie automaticamente mensagens para quem não atacou nas últimas 24h.</p>
                                        </div>
                                        <button className="bg-white text-slate-950 hover:bg-slate-200 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 whitespace-nowrap">
                                            Configurar Bot
                                        </button>
                                    </div>
                                    <Crown className="absolute -right-8 -bottom-8 h-48 w-48 text-white/4 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Click outside overlays for menus */}
                {(showNotifications || showProfileMenu) && (
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => { setShowNotifications(false); setShowProfileMenu(false); }}
                    ></div>
                )}
            </main>

            {/* Overlay mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
            {/* Modal de Perfil do Membro */}
            {showMemberModal && selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowMemberModal(false);
                            setAttendanceJustification('');
                        }}
                    ></div>
                    <div className="relative bg-[#0B1220] w-full max-w-md rounded-3xl border border-white/6 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 bg-white/4 border-b border-white/6 flex justify-between items-center">
                            <h3 className="font-black text-white uppercase tracking-[0.22em]">Ficha do Guerreiro</h3>
                            <button onClick={() => {
                                setShowMemberModal(false);
                                setAttendanceJustification('');
                            }} className="text-slate-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-white/5 text-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/6">
                                    <Users className="h-10 w-10" />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">{selectedMember.name}</h2>
                                <p className="text-amber-300 font-bold text-sm uppercase px-3 py-1 bg-amber-500/10 inline-block rounded-full mt-2 border border-amber-500/15">
                                    {selectedMember.role}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white/4 rounded-2xl border border-white/6 text-center">
                                    <p className="text-xs font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Decks Usados</p>
                                    <p className="text-2xl font-black text-white">{selectedMember.decksUsed}</p>
                                </div>
                                <div className="p-5 bg-white/4 rounded-2xl border border-white/6 text-center">
                                    <p className="text-xs font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Medalhas</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        <p className="text-2xl font-black text-white">{selectedMember.medals}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-5 bg-white/4 rounded-2xl border border-white/6">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Status de Batalha</p>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedMember.score}`}>
                                        {selectedMember.status}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-white/8 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${selectedMember.status === 'Concluído' ? 'bg-green-500' : 'bg-amber-500'}`}
                                        style={{ width: `${(parseInt(selectedMember.decksUsed) / 4) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl border border-amber-500/15 bg-amber-500/8 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">Resumo do dia</p>
                                            <p className="mt-2 text-sm font-semibold text-amber-50">
                                                {selectedMember.decksMissing > 0
                                                    ? `${selectedMember.decksMissing} deck(s) não usados neste dia.`
                                                    : 'Todos os 4 decks foram usados.'}
                                            </p>
                                        </div>
                                        <MessageSquare className="h-6 w-6 text-amber-300" />
                                    </div>
                                </div>

                                {selectedMember.decksMissing > 0 && (
                                    <div className="space-y-3 rounded-2xl border border-white/6 bg-white/4 p-5">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Justificativa</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Registre aqui o motivo dos decks não usados para manter o histórico do dia.
                                            </p>
                                        </div>
                                        <textarea
                                            value={attendanceJustification}
                                            onChange={(e) => setAttendanceJustification(e.target.value)}
                                            rows="4"
                                            placeholder="Ex.: Problema de conexão, trabalho, indisponibilidade temporária..."
                                            className="w-full rounded-2xl border border-white/6 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-500 focus:bg-white/8"
                                        ></textarea>
                                        <button
                                            onClick={handleSaveAttendance}
                                            disabled={isSavingAttendance}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSavingAttendance ? 'Salvando...' : 'Salvar justificativa'}
                                            <Save className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-white/6 bg-white/4 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Histórico de ausências</p>
                                            <p className="mt-1 text-sm text-slate-400">Registros com decks não usados e justificativas.</p>
                                        </div>
                                        <History className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
                                        {warAttendance.filter((entry) => entry.memberTag === selectedMember.id).length > 0 ? (
                                            warAttendance
                                                .filter((entry) => entry.memberTag === selectedMember.id)
                                                .map((entry) => (
                                                    <div key={`${entry.dateKey}-${entry.memberTag}`} className="rounded-2xl border border-white/6 bg-white/5 p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="text-sm font-black text-white">{entry.dateLabel}</p>
                                                            <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300 border border-red-500/15">
                                                                {entry.decksMissed} deck(s) faltando
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-slate-400">
                                                            {entry.justification || 'Sem justificativa registrada.'}
                                                        </p>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="text-sm text-slate-500">Nenhum histórico registrado para este membro.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white/4 border-t border-white/6">
                            <button
                                onClick={() => {
                                    setShowMemberModal(false);
                                    setAttendanceJustification('');
                                }}
                                className="w-full bg-white text-slate-950 py-4 rounded-xl font-black uppercase hover:bg-slate-200 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
