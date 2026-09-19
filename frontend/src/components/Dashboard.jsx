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
    LayoutGrid,
    TrendingUp,
    MessageSquare
} from 'lucide-react';

import API_URL, { buildUrl } from '../utils/api';
import WarDashboard from '../pages/WarDashboard';
import MemberDetailModal from './guerra/MemberDetailModal';
import WarningsTable from './advertencias/WarningsTable';
import { normalizeMemberWarData } from '../utils/warRules';

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

const translateRole = (role) => {
    const roles = {
        leader: 'Líder',
        coLeader: 'Co-líder',
        elder: 'Ancião',
        member: 'Membro'
    };
    return roles[role] || role;
};

const normalizeClanStats = (data = {}) => ({
    name: data.name || 'Clã não encontrado',
    tag: data.tag || '#---',
    war: data.war || {},
    today: data.today || {},
    analysis: data.analysis || null,
    latestDay: data.latestDay || null,
    periodLogs: Array.isArray(data.periodLogs) ? data.periodLogs : [],
    fame: Number(data.fame || data.war?.fame || 0),
    pendingAttacks: Number(data.pendingAttacks || 0),
    membersParticipating: Number(data.membersParticipating || 0),
    totalMembers: Number(data.totalMembers || 0),
    isWarDay: Boolean(data.war?.isWarDay ?? data.isWarDay),
    missedDecksToday: Array.isArray(data.missedDecksToday) ? data.missedDecksToday : [],
    endOfDayAlert: Boolean(data.endOfDayAlert),
    warAttendance: Array.isArray(data.warAttendance) ? data.warAttendance : [],
    members: Array.isArray(data.members) ? data.members : []
});

const normalizeWarHistory = (data = {}) => ({
    weekHeaders: Array.isArray(data.warHeaders) ? data.warHeaders : (Array.isArray(data.weekHeaders) ? data.weekHeaders : []),
    members: Array.isArray(data.members) ? data.members : []
});

const dashboardTabs = ['guerra', 'ranking', 'membros', 'historico', 'advertencias', 'relatorios', 'perfil', 'configs', 'preferencias'];

const getDashboardTab = () => {
    const pathTab = window.location.pathname.match(/^\/dashboard\/?([^/]+)?/)?.[1];
    if (dashboardTabs.includes(pathTab)) return pathTab;
    const storedTab = localStorage.getItem('activeTab');
    return dashboardTabs.includes(storedTab) ? storedTab : 'guerra';
};

export default function Dashboard({ onNavigate }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(getDashboardTab);

    const handleTabChange = (tab) => {
        if (!dashboardTabs.includes(tab)) return;
        setActiveTab(tab);
        localStorage.setItem('activeTab', tab);
        setSidebarOpen(false);
        const nextPath = `/dashboard/${tab}`;
        if (window.location.pathname !== nextPath) {
            window.history.pushState({ tab }, '', nextPath);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    React.useEffect(() => {
        const handlePopState = () => setActiveTab(getDashboardTab());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [profile, setProfile] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return {
                id: '',
                name: 'Carregando...',
                tag: '#---',
                email: '',
                role: '...',
                preferences: defaultPreferences
            };
        }

        try {
            const userData = JSON.parse(storedUser);
            return {
                ...normalizeProfile(userData),
                role: translateRole(userData.role)
            };
        } catch {
            return normalizeProfile();
        }
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
        war: {},
        today: {},
        fame: 0,
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

    const fetchData = React.useCallback(async () => {
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

            const clanRes = await fetch(`${API_URL}/api/clan/stats`, { headers });
            const clanData = await clanRes.json();

            console.log('=== PAYLOAD BRUTO RECEBIDO DA GUERRA ===', clanData);
            if (clanData?.clan?.participants || clanData?.participants || Array.isArray(clanData)) {
                const participantSample = clanData?.clan?.participants || clanData?.participants || clanData;
                console.log('=== EXEMPLO DE 1 PARTICIPANTE BRUTO ===', Array.isArray(participantSample) ? participantSample[0] : participantSample);
            }

            if (clanRes.ok) {
                const normalizedClan = normalizeClanStats(clanData);
                setClanStats(normalizedClan);
                setClanMembers(normalizedClan.members.map((member) => normalizeMemberWarData(member)));
                setWarAttendance(normalizedClan.warAttendance);
            } else {
                setClanStats({
                    name: 'Clã não encontrado',
                    tag: 'Verifique o .env',
                    war: {},
                    today: {},
                    fame: 0,
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

            const historyRes = await fetch(`${API_URL}/api/clan/history`, { headers });
            if (historyRes.ok) {
                setWarHistory(normalizeWarHistory(await historyRes.json()));
            }

            const war = clanData.war || {};
            const newNotifs = [];
            if (war.isWarDay) {
                newNotifs.push({
                    id: 101,
                    text: `${war.label || 'Guerra atual'} · Dia ${war.day || '-'}/4.`,
                    time: war.periodType === 'colosseum' ? 'Coliseu' : 'Dia de guerra',
                    icon: Swords,
                    read: false
                });
                newNotifs.push({
                    id: 102,
                    text: 'Cada guerreiro precisa dos 4 ataques de hoje.',
                    time: 'Prioridade alta',
                    icon: BellRing,
                    read: false
                });
                if (clanData.endOfDayAlert) {
                    newNotifs.push({
                        id: 104,
                        text: `${clanData.pendingAttacks} membro(s) ainda estão com ataques de hoje pendentes.`,
                        time: 'Fechamento do dia',
                        icon: ShieldAlert,
                        read: false
                    });
                }
            } else if (war.isTraining) {
                newNotifs.push({
                    id: 103,
                    text: `${war.label || 'Corrida atual'} está em treino. Os 4 ataques ainda não valem para a guerra.`,
                    time: 'Treino',
                    icon: Info,
                    read: false
                });
            } else {
                newNotifs.push({
                    id: 103,
                    text: 'A API não retornou uma corrida ativa no momento.',
                    time: 'Sem corrida',
                    icon: Info,
                    read: false
                });
            }
            setNotificationsList(newNotifs);

        } catch (err) {
            console.error("Erro ao conectar com o backend:", err);
        }
    }, [onNavigate]);

    React.useEffect(() => {
        const requestId = window.setTimeout(() => {
            fetchData();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, [fetchData]);

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
            const res = await fetch(buildUrl('/api/clan/attendance'), {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    memberTag: selectedMember.tag || selectedMember.id,
                    memberName: selectedMember.name,
                    decksUsed: selectedMember.today?.decksUsed ?? selectedMember.decksUsedToday ?? 0,
                    justification: attendanceJustification
                })
            });

            if (res.ok) {
                const data = await res.json();
                setWarAttendance(Array.isArray(data.warAttendance) ? data.warAttendance : []);
                setAttendanceJustification('');
                await fetchData();
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
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email
                })
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
        { label: 'Fama do Clã', value: clanStats.fame.toLocaleString(), icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' },
        { label: 'Ataques Pendentes', value: clanStats.isWarDay ? `${clanStats.pendingAttacks}` : 'OFF', icon: Swords, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' },
        { label: 'Membros Participando', value: `${clanStats.membersParticipating}/${clanStats.totalMembers || 50}`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
    ];

    const navigationTabs = [
        { id: 'guerra', label: 'Guerra' },
        { id: 'ranking', label: 'Ranking' },
        { id: 'membros', label: 'Membros' },
        { id: 'historico', label: 'Histórico' },
        { id: 'advertencias', label: 'Advertências' },
        { id: 'relatorios', label: 'Relatórios' },
        { id: 'perfil', label: 'Perfil' },
        { id: 'configs', label: 'Config.' },
    ];

    const rankingMembers = [...clanMembers]
        .sort((a, b) => (b.fame || 0) - (a.fame || 0) || b.trophies - a.trophies)
        .slice(0, 5);

    const participationRanking = [...warHistory.members]
        .filter((member) => clanMembers.some((currentMember) => currentMember.tag === member.tag))
        .sort((a, b) => (b.participation || 0) - (a.participation || 0) || b.total - a.total)
        .slice(0, 5);

    const historicalMembers = warHistory.members
        .filter((member) => clanMembers.some((currentMember) => currentMember.tag === member.tag || currentMember.id === member.tag))
        .filter((member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const reportMetrics = [
        { label: 'Top 5', value: rankingMembers.length },
        { label: 'Histórico', value: historicalMembers.length },
        { label: 'Alertas', value: notificationsList.filter((item) => !item.read).length },
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
                        {navigationTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                {tab.id === 'guerra' && <Ship className="h-5 w-5" />}
                                {tab.id === 'membros' && <Users className="h-5 w-5" />}
                                {tab.id === 'historico' && <History className="h-5 w-5" />}
                                {tab.id === 'advertencias' && <ShieldAlert className="h-5 w-5" />}
                                {tab.id === 'configs' && <Settings className="h-5 w-5" />}
                                {!['guerra', 'membros', 'historico', 'advertencias', 'configs'].includes(tab.id) && <FileText className="h-5 w-5" />}
                                {tab.label}
                            </button>
                        ))}
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

                        {activeTab === 'guerra' && (
                            <WarDashboard
                                clanStats={clanStats}
                                members={clanMembers}
                                onSelectMember={(member) => {
                                    setSelectedMember(member);
                                    const latestAttendance = warAttendance.find((entry) => entry.memberTag === member.id);
                                    setAttendanceJustification(latestAttendance?.justification || '');
                                    setShowMemberModal(true);
                                }}
                            />
                        )}

                        {activeTab === 'legacy-guerra' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
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
                                                                <Trophy className="h-4 w-4" /> {member.fame}
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
                                        <h2 className="mt-2 text-3xl font-black text-white">Fama da guerra atual</h2>
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
                                                        <p className="text-sm font-black text-amber-400">{(member.fame || 0).toLocaleString()}</p>
                                                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">fama</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="wt-surface rounded-[1.5rem] p-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-white tracking-[0.08em]">Participação nas últimas guerras</h3>
                                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                            {participationRanking.length > 0 ? participationRanking.map((member) => (
                                                <div key={member.tag} className="rounded-2xl border border-white/6 bg-[#0B1220] p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{member.name}</p>
                                                            <p className="text-xs text-slate-500">{member.attacksUsed}/{member.attacksPossible} ataques</p>
                                                        </div>
                                                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">{member.participation}%</span>
                                                    </div>
                                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                                                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.max(0, Math.min(100, member.participation || 0))}%` }}></div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-slate-500">Sem dados suficientes no histórico para calcular participação.</p>
                                            )}
                                        </div>
                                    </div>
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
                                                    <span className="text-sm text-slate-400">{member.total.toLocaleString()} fama</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'perfil' && (
                            <div className="animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
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
                            <div className="animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
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
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
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
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
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
                                                        .filter(member => clanMembers.some(currentMember => currentMember.tag === member.tag || currentMember.id === member.tag))
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

                        {activeTab === 'advertencias' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Acompanhamento disciplinar</p>
                                    <h1 className="mt-2 text-3xl font-black text-white tracking-tight">Advertências</h1>
                                    <p className="mt-2 text-sm text-slate-400">Só entram registros feitos pela liderança. Ausência na lista de participantes da API não gera advertência sozinha.</p>
                                </div>
                                <WarningsTable attendance={warAttendance} members={clanMembers} />
                            </div>
                        )}

                        {activeTab === 'configs' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
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
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em]">Meta de Fama (Mínimo)</label>
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
                                                <span className="font-bold text-white">Status da API</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${clanStats.isWarDay ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                                                    {clanStats.war?.periodType === 'colosseum' ? 'COLISEU' : (clanStats.isWarDay ? 'DIA DE GUERRA' : (clanStats.war?.isTraining ? 'TREINO' : 'SEM CORRIDA'))}
                                                </span>
                                            </div>

                                            <div className="bg-white/4 p-5 rounded-2xl space-y-3 border border-white/6">
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span className="text-slate-500 uppercase tracking-[0.18em]">Corrida</span>
                                                    <span className="text-white">{clanStats.war?.label || '—'}</span>
                                                </div>
                                                <p className="text-sm text-slate-400">
                                                    {clanStats.isWarDay
                                                        ? `Dia ${clanStats.war?.day || '-'}/4 segundo periodIndex da River Race.`
                                                        : 'O dia da guerra não é inferido pelo calendário (quinta a domingo).'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
            {showMemberModal && selectedMember && activeTab === 'legacy-guerra' && (
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
                                    <p className="text-xs font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Fama</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        <p className="text-2xl font-black text-white">{selectedMember.fame}</p>
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
                                        style={{ width: `${(Number(selectedMember.decksUsed) / 16) * 100}%` }}
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
            <MemberDetailModal
                member={showMemberModal ? selectedMember : null}
                attendance={warAttendance}
                history={warHistory.members}
                justification={attendanceJustification}
                onJustificationChange={setAttendanceJustification}
                onSave={handleSaveAttendance}
                onClose={() => {
                    setShowMemberModal(false);
                    setAttendanceJustification('');
                }}
                isSaving={isSavingAttendance}
            />
        </div>
    );
}
