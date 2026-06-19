import React, { useState } from 'react';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        localStorage.setItem('activeTab', tab);
        setSidebarOpen(false); // Common behavior for sidebar buttons
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
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

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
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(API_URL + '/api/clan/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clanTag: clanStats.tag,
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
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_URL + '/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            if (res.ok) alert("Perfil salvo com sucesso!");
        } catch (err) {
            console.error("Erro ao salvar perfil:", err);
            alert("Erro ao conectar com o servidor.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePrefs = async (newPrefs) => {
        setPrefs(newPrefs);
        const token = localStorage.getItem('token');
        try {
            await fetch(API_URL + '/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newPrefs)
            });
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
        <div className="wt-dashboard min-h-screen bg-slate-100 flex font-sans">
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block shadow-xl
      `}>
                <div className="h-full flex flex-col">
                    <div className="h-20 flex items-center px-6 bg-slate-950 border-b border-slate-800 cursor-pointer" onClick={() => handleTabChange('guerra')}>
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

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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

                    <div className="p-4 bg-slate-950">
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
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-slate-500 hover:text-slate-700 p-2 bg-slate-100 rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-4 py-2.5 w-72 border border-slate-200 focus-within:border-blue-400 focus-within:bg-white transition-colors">
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
                                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-amber-500 bg-slate-100'}`}
                            >
                                <Bell className="h-6 w-6" />
                                {notificationsList.some(n => !n.read) && (
                                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <span className="font-black text-slate-900 uppercase text-xs">Notificações</span>
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
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
                                                className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <n.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${!n.read ? 'font-black text-slate-900' : 'font-medium text-slate-600'}`}>{n.text}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{n.time}</p>
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
                                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                                    <div className="p-2">
                                        <button
                                            onClick={() => { handleTabChange('perfil'); setShowProfileMenu(false); }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            <User className="h-4 w-4 text-slate-400" /> Meu Perfil
                                        </button>
                                        <button
                                            onClick={() => { handleTabChange('preferencias'); setShowProfileMenu(false); }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            <Settings className="h-4 w-4 text-slate-400" /> Preferências
                                        </button>
                                        <div className="h-px bg-slate-100 my-2"></div>
                                        <button
                                            onClick={() => onNavigate('landing')}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" /> Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
                    <div className="mx-auto max-w-7xl space-y-8">

                        <section className="wt-surface wt-border-glow overflow-hidden rounded-[2rem]">
                            <div className="grid gap-6 p-6 xl:grid-cols-[1.25fr_0.75fr] xl:p-8">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                                        <Sparkles className="h-4 w-4 text-[#F5B100]" /> Visão estratégica do clã
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                                            {clanStats.name} <span className="wt-text-gradient">{clanStats.isWarDay ? `Guerra: Dia ${clanStats.warDay}` : 'Modo treino'}</span>
                                        </h1>
                                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                                            Acompanhe guerra, atividade, ranking e risco de inatividade com uma interface pensada para liderança tática.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {shellMetrics.map((metric) => (
                                            <div key={metric.label} className={`rounded-3xl border border-white/6 bg-gradient-to-br ${metric.accent} p-4`}>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
                                                <p className="mt-2 text-3xl font-black text-white">{metric.value}</p>
                                                <p className="mt-2 text-xs font-medium text-slate-400">{metric.hint}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[1.75rem] border border-white/6 bg-[#0B1220] p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Radar tático</p>
                                            <h2 className="mt-2 text-xl font-black text-white">Performance instantânea</h2>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 p-3 text-amber-400">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {insightCards.map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-white/6 bg-white/5 p-4">
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
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="wt-surface rounded-[1.75rem] p-3 sm:p-4">
                            <div className="flex flex-wrap gap-2">
                                {navigationTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-[#5B5FFF] to-[#7C3AED] text-white shadow-[0_16px_40px_rgba(91,95,255,0.22)]'
                                            : 'border border-white/6 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {activeTab === 'guerra' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                                    {stats.map((stat, idx) => (
                                        <div key={idx} className={`wt-surface wt-hover-lift rounded-[1.5rem] p-5 flex items-center gap-4`}>
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                                <stat.icon className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.28em] mb-1">{stat.label}</p>
                                                <p className="text-3xl font-black text-white">{stat.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="wt-surface rounded-[2rem] overflow-hidden">
                                    <div className="p-6 border-b border-white/6 flex justify-between items-center bg-white/5">
                                        <h2 className="text-lg font-black text-white uppercase tracking-[0.22em]">Status dos Ataques Diários</h2>
                                        <span className="bg-white/10 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.24em]">Hoje</span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-[0.28em]">
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
                            <div className="animate-in fade-in duration-500 space-y-6">
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
                                    <div className="wt-surface rounded-[1.75rem] p-6">
                                        <h3 className="text-lg font-black text-white uppercase tracking-[0.22em]">Top 5 do clã</h3>
                                        <div className="mt-5 space-y-4">
                                            {rankingMembers.map((member, index) => (
                                                <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/5 p-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B5FFF]/20 to-[#7C3AED]/20 text-sm font-black text-white">
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

                                    <div className="wt-surface rounded-[1.75rem] p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-black text-white uppercase tracking-[0.22em]">Comparação de guerra</h3>
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
                            <div className="animate-in fade-in duration-500 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                <div className="wt-surface rounded-[1.75rem] p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#5B5FFF]">Heatmap de atividade</p>
                                            <h2 className="mt-2 text-3xl font-black text-white">Últimos 35 dias</h2>
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

                                <div className="wt-surface rounded-[1.75rem] p-6 space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-[0.22em]">Leitura rápida</h3>
                                    {[
                                        { label: 'Dias mais fortes', value: 'Quinta a Domingo' },
                                        { label: 'Queda de atividade', value: 'Segunda e Terça' },
                                        { label: 'Alertas', value: '2 membros com risco médio' },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-white/6 bg-white/5 p-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                                            <p className="mt-2 text-lg font-black text-white">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'analise' && (
                            <div className="animate-in fade-in duration-500 space-y-6">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F5B100]">Análise inteligente</p>
                                        <h2 className="mt-2 text-3xl font-black text-white">Insights táticos para liderança</h2>
                                    </div>
                                    <Radar className="h-6 w-6 text-amber-400" />
                                </div>

                                <div className="grid gap-6 md:grid-cols-3">
                                    {insightCards.map((item) => (
                                        <div key={item.label} className="wt-surface rounded-[1.6rem] p-6">
                                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                                            <p className={`mt-3 text-3xl font-black ${item.color}`}>{item.value}</p>
                                            <p className="mt-3 text-sm text-slate-400">{item.hint}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'relatorios' && (
                            <div className="animate-in fade-in duration-500 space-y-6">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#22C55E]">Relatórios</p>
                                        <h2 className="mt-2 text-3xl font-black text-white">Exportações e resumos estratégicos</h2>
                                    </div>
                                    <FileText className="h-6 w-6 text-emerald-400" />
                                </div>

                                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                                    <div className="wt-surface rounded-[1.75rem] p-6 space-y-4">
                                        {reportMetrics.map((item) => (
                                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/5 px-4 py-3">
                                                <span className="text-sm font-semibold text-slate-300">{item.label}</span>
                                                <span className="text-lg font-black text-white">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="wt-surface rounded-[1.75rem] p-6">
                                        <h3 className="text-lg font-black text-white uppercase tracking-[0.22em]">Relatório visual</h3>
                                        <div className="mt-5 space-y-3">
                                            {historicalMembers.slice(0, 4).map((member) => (
                                                <div key={member.tag} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/5 px-4 py-3">
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
                            <div className="animate-in fade-in duration-500">
                                <div className="wt-surface overflow-hidden rounded-[2rem]">
                                    <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Modo TV</p>
                                            <h2 className="mt-1 text-2xl font-black text-white">Painel ao vivo</h2>
                                        </div>
                                        <Monitor className="h-6 w-6 text-[#5B5FFF]" />
                                    </div>
                                    <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-4">
                                        {shellMetrics.map((metric) => (
                                            <div key={metric.label} className="rounded-[1.5rem] border border-white/6 bg-[#0B1220] p-5 text-center">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                                                <p className="mt-3 text-4xl font-black text-white">{metric.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'perfil' && (
                            <div className="animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Meu Perfil</h1>
                                        <p className="text-slate-500 font-medium">Gerencie suas informações de Líder</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <User className="h-3 w-3" /> Nome de Guerra
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Hash className="h-3 w-3" /> Tag do Jogador
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.tag}
                                                disabled
                                                className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-100 rounded-xl font-bold text-slate-400 cursor-not-allowed uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> E-mail de Acesso
                                        </label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-all"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 uppercase w-full sm:w-auto disabled:opacity-50"
                                        >
                                            {isSaving ? 'Salvando...' : 'Salvar Alterações'} <Save className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                        <Info className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-amber-800 uppercase text-sm mb-1">Dica de Líder</h4>
                                        <p className="text-amber-700 text-sm font-medium leading-relaxed">
                                            Mantenha seu e-mail atualizado para receber relatórios semanais de desempenho do clã e alertas de inatividade.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferencias' && (
                            <div className="animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <Settings className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Preferências</h1>
                                        <p className="text-slate-500 font-medium">Personalize sua experiência no QG</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                                    {/* Notificações Push */}
                                    <div className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                                <BellRing className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Notificações Push</h4>
                                                <p className="text-xs text-slate-500 font-medium">Alertas sobre o status da guerra no navegador</p>
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
                                    <div className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                                <Smartphone className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Mensagens Automáticas</h4>
                                                <p className="text-xs text-slate-500 font-medium">Notificar automaticamente membros com ataques pendentes</p>
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
                                    <div className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                                <Globe className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Idioma do Painel</h4>
                                                <p className="text-xs text-slate-500 font-medium">Configure o idioma da interface</p>
                                            </div>
                                        </div>
                                        <select
                                            value={prefs.language}
                                            onChange={(e) => handleUpdatePrefs({ ...prefs, language: e.target.value })}
                                            className="bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-sm text-slate-700 outline-none"
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
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Gestão de Membros</h1>
                                    <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase border border-blue-200 shadow-sm">
                                        Total: {clanStats.totalMembers}
                                    </span>
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-600">
                                            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                                                <tr>
                                                    <th className="px-8 py-5">Nome / Cargo</th>
                                                    <th className="px-8 py-5 text-center">Troféus Atuais</th>
                                                    <th className="px-8 py-5 text-center">Tag</th>
                                                    <th className="px-8 py-5 text-right">Ficha</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {clanMembers.length > 0 ? (
                                                    [...clanMembers]
                                                        .filter(m =>
                                                            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            m.id.toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .sort((a, b) => b.trophies - a.trophies)
                                                        .map((member) => (
                                                            <tr key={member.id} className="hover:bg-slate-50/80 transition-all group">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all uppercase">
                                                                            {member.name.slice(0, 1)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-slate-900 text-base leading-tight">{member.name}</p>
                                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.role}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-center">
                                                                    <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 shadow-sm">
                                                                        <Trophy className="h-4 w-4 text-amber-500" />
                                                                        <span className="font-black text-slate-800 text-base">{member.trophies.toLocaleString()}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-center">
                                                                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">
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
                                                                        className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 hover:border-blue-600 shadow-sm"
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
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Histórico de Guerras</h1>
                                    <div className="flex gap-2 no-print">
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                        >
                                            <Share2 className="h-4 w-4" /> Enviar Top 5
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                        >
                                            <Printer className="h-4 w-4" /> Gerar Relatório
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none">
                                    <div className="overflow-x-auto print:overflow-visible no-scrollbar">
                                        <table className="w-full text-left text-[11px] font-medium text-slate-600 border-collapse print:table">
                                            <thead className="bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest sticky top-0 z-20">
                                                <tr>
                                                    <th className="px-3 py-4 text-center bg-slate-900 sticky left-0 z-30">Nº</th>
                                                    <th className="px-4 py-4 min-w-[140px] bg-slate-800 sticky left-[36px] z-30 border-r border-slate-700">Jogador</th>
                                                    <th className="px-3 py-4 text-center">Semanas</th>
                                                    <th className="px-3 py-4 text-center">Total</th>
                                                    <th className="px-3 py-4 text-center">Média</th>
                                                    {warHistory.weekHeaders.map((week, idx) => (
                                                        <th key={idx} className="px-2 py-4 text-center border-l border-slate-700 bg-slate-800/50 min-w-[60px]">{week}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
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

                                                            const rankColor = idx < 3 ? 'bg-blue-50/50' : (idx < 10 ? 'bg-slate-50/30' : 'bg-white');
                                                            const numColor = idx === 0 ? 'bg-amber-400 text-white' : (idx === 1 ? 'bg-slate-400 text-white' : (idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'));

                                                            return (
                                                                <tr key={member.tag} className={`group hover:bg-blue-50/80 transition-colors ${rankColor}`}>
                                                                    <td className={`px-1 py-3 text-center sticky left-0 z-10 ${rankColor}`}>
                                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-[10px] shadow-sm ${numColor}`}>
                                                                            {member.rank < 10 ? `0${member.rank}` : member.rank}
                                                                        </span>
                                                                    </td>
                                                                    <td className={`px-4 py-3 sticky left-[36px] z-10 border-r border-slate-100 ${rankColor}`}>
                                                                        <div>
                                                                            <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">{member.name}</p>
                                                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{role}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center font-black text-slate-800">
                                                                        {member.weeks}
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center">
                                                                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-black">
                                                                            {member.total.toLocaleString()}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center">
                                                                        <div className="inline-flex items-center gap-1 font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                                                            {member.average.toLocaleString()}
                                                                        </div>
                                                                    </td>
                                                                    {member.history.map((fame, fIdx) => (
                                                                        <td key={fIdx} className={`px-2 py-3 text-center border-l border-slate-50 font-bold ${fame >= minMedalsTarget ? 'text-green-600' : (fame > 0 ? 'text-red-500' : 'text-slate-300')}`}>
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
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <Settings className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Configurações do QG</h1>
                                        <p className="text-slate-500 font-medium">Controle as regras e monitoramento do clã</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Card: Monitoramento do Clã */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
                                        <div className="flex items-center gap-3 text-blue-600 mb-4">
                                            <ShieldAlert className="h-6 w-6" />
                                            <h3 className="font-black uppercase tracking-tight text-lg text-slate-900">Monitoramento</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tag do Clã Primário</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={clanStats.tag}
                                                        disabled
                                                        className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-100 rounded-xl font-bold text-slate-500 cursor-not-allowed uppercase"
                                                    />
                                                    <button className="px-4 py-2 bg-slate-100 text-slate-400 font-black rounded-xl hover:bg-slate-200 transition-colors" disabled>
                                                        EDITAR
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Meta de Medalhas (Mínimo)</label>
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
                                                <p className="text-[10px] text-slate-400 font-bold uppercase italic">Abaixo disso, o histórico ficará vermelho</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card: Dias de Guerra */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
                                        <div className="flex items-center gap-3 text-amber-600 mb-4">
                                            <Swords className="h-6 w-6" />
                                            <h3 className="font-black uppercase tracking-tight text-lg text-slate-900">Agenda de Guerra</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                                                <span className="font-bold text-amber-900">Status de Hoje</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${new Date().getDay() === 0 || new Date().getDay() >= 4 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {new Date().getDay() === 0 || new Date().getDay() >= 4 ? 'EM GUERRA' : 'DESCANSO'}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-slate-500 uppercase">Período Ativo</span>
                                                    <span className="text-slate-900">Quinta a Domingo</span>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                                                        <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 || i >= 4 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                            {d}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <div>
                                            <h3 className="text-2xl font-black uppercase mb-2">Relatórios de Inatividade</h3>
                                            <p className="text-slate-400 font-medium max-w-md">Envie automaticamente mensagens para quem não atacou nas últimas 24h.</p>
                                        </div>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap">
                                            Configurar Bot
                                        </button>
                                    </div>
                                    <Crown className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
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
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-900 uppercase">Ficha do Guerreiro</h3>
                            <button onClick={() => {
                                setShowMemberModal(false);
                                setAttendanceJustification('');
                            }} className="text-slate-400 hover:text-slate-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-blue-200 shadow-inner">
                                    <Users className="h-10 w-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedMember.name}</h2>
                                <p className="text-amber-600 font-bold text-sm uppercase px-3 py-1 bg-amber-50 inline-block rounded-full mt-2 border border-amber-100">
                                    {selectedMember.role}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-xs font-black text-slate-400 uppercase mb-2">Decks Usados</p>
                                    <p className="text-2xl font-black text-slate-900">{selectedMember.decksUsed}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-xs font-black text-slate-400 uppercase mb-2">Medalhas</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        <p className="text-2xl font-black text-slate-900">{selectedMember.medals}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-black text-slate-400 uppercase">Status de Batalha</p>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedMember.score}`}>
                                        {selectedMember.status}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${selectedMember.status === 'Concluído' ? 'bg-green-500' : 'bg-amber-500'}`}
                                        style={{ width: `${(parseInt(selectedMember.decksUsed) / 4) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-amber-600">Resumo do dia</p>
                                            <p className="mt-2 text-sm font-semibold text-amber-900">
                                                {selectedMember.decksMissing > 0
                                                    ? `${selectedMember.decksMissing} deck(s) não usados neste dia.`
                                                    : 'Todos os 4 decks foram usados.'}
                                            </p>
                                        </div>
                                        <MessageSquare className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>

                                {selectedMember.decksMissing > 0 && (
                                    <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Justificativa</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Registre aqui o motivo dos decks não usados para manter o histórico do dia.
                                            </p>
                                        </div>
                                        <textarea
                                            value={attendanceJustification}
                                            onChange={(e) => setAttendanceJustification(e.target.value)}
                                            rows="4"
                                            placeholder="Ex.: Problema de conexão, trabalho, indisponibilidade temporária..."
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:bg-white"
                                        ></textarea>
                                        <button
                                            onClick={handleSaveAttendance}
                                            disabled={isSavingAttendance}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSavingAttendance ? 'Salvando...' : 'Salvar justificativa'}
                                            <Save className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Histórico de ausências</p>
                                            <p className="mt-1 text-sm text-slate-500">Registros com decks não usados e justificativas.</p>
                                        </div>
                                        <History className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
                                        {warAttendance.filter((entry) => entry.memberTag === selectedMember.id).length > 0 ? (
                                            warAttendance
                                                .filter((entry) => entry.memberTag === selectedMember.id)
                                                .map((entry) => (
                                                    <div key={`${entry.dateKey}-${entry.memberTag}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="text-sm font-black text-slate-900">{entry.dateLabel}</p>
                                                            <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
                                                                {entry.decksMissed} deck(s) faltando
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-slate-600">
                                                            {entry.justification || 'Sem justificativa registrada.'}
                                                        </p>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="text-sm text-slate-400">Nenhum histórico registrado para este membro.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setShowMemberModal(false);
                                    setAttendanceJustification('');
                                }}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
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
