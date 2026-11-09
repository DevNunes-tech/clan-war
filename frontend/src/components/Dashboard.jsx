import React, { useState, useEffect, useCallback } from 'react';
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
    TrendingUp,
    MessageSquare,
} from 'lucide-react';

import API_URL, { buildUrl } from '../utils/api';
import WarDashboard from '../pages/WarDashboard';
import MemberDetailModal from './guerra/MemberDetailModal';
import WarningsTable from './advertencias/WarningsTable';
import { normalizeMemberWarData } from '../utils/warRules';

// ─────────────────────────────────────────────────────────────
// Helpers de autenticação
// ─────────────────────────────────────────────────────────────
const getAuthHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { ...extraHeaders, Authorization: `Bearer ${token}` };
};

// ─────────────────────────────────────────────────────────────
// Normalizadores de dados
// ─────────────────────────────────────────────────────────────
const defaultPreferences = {
    notifications: true,
    dmAlerts: true,
    language: 'Português',
    darkMode: false,
};

const normalizeProfile = (data = {}) => ({
    id: data.id || data._id || '',
    name: data.name || 'Carregando...',
    tag: data.tag || data.clanTag || '#---',
    email: data.email || '',
    role: data.role || '...',
    preferences: { ...defaultPreferences, ...(data.preferences || {}) },
});

const normalizePreferences = (data = {}) => {
    const prefs = data.preferences && typeof data.preferences === 'object' ? data.preferences : data;
    return { ...defaultPreferences, ...prefs };
};

const translateRole = (role) => {
    const roles = { leader: 'Líder', coLeader: 'Co-líder', elder: 'Ancião', member: 'Membro' };
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
    members: Array.isArray(data.members) ? data.members : [],
});

const normalizeWarHistory = (data = {}) => ({
    weekHeaders: Array.isArray(data.warHeaders)
        ? data.warHeaders
        : Array.isArray(data.weekHeaders)
        ? data.weekHeaders
        : [],
    members: Array.isArray(data.members) ? data.members : [],
});

// ─────────────────────────────────────────────────────────────
// Abas do dashboard
// ─────────────────────────────────────────────────────────────
const dashboardTabs = [
    'guerra',
    'ranking',
    'membros',
    'historico',
    'advertencias',
    'relatorios',
    'perfil',
    'configs',
    'preferencias',
];

const getDashboardTab = () => {
    const pathTab = window.location.pathname.match(/^\/dashboard\/?([^/]+)?/)?.[1];
    if (dashboardTabs.includes(pathTab)) return pathTab;
    const storedTab = localStorage.getItem('activeTab');
    return dashboardTabs.includes(storedTab) ? storedTab : 'guerra';
};

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(getDashboardTab);
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
                preferences: defaultPreferences,
            };
        }
        try {
            const userData = JSON.parse(storedUser);
            return { ...normalizeProfile(userData), role: translateRole(userData.role) };
        } catch {
            return normalizeProfile();
        }
    });

    const [prefs, setPrefs] = useState(defaultPreferences);
    const [clanStats, setClanStats] = useState({
        name: 'Carregando...',
        tag: '#---',
        war: {},
        today: {},
        fame: 0,
        pendingAttacks: 0,
        membersParticipating: 0,
        totalMembers: 0,
        isWarDay: false,
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
    const [minMedalsTarget, setMinMedalsTarget] = useState(2400);

    // ─── Navegação por abas ───
    const handleTabChange = useCallback((tab) => {
        if (!dashboardTabs.includes(tab)) return;
        setActiveTab(tab);
        localStorage.setItem('activeTab', tab);
        setSidebarOpen(false);
        const nextPath = `/dashboard/${tab}`;
        if (window.location.pathname !== nextPath) {
            window.history.pushState({ tab }, '', nextPath);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const handlePopState = () => setActiveTab(getDashboardTab());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // ─── Helpers ───
    const handleMarkAllAsRead = () => {
        setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getInitials = (name) => {
        if (!name || name === 'Carregando...') return '??';
        return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    };

    // ─── Busca de dados ───
    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            onNavigate('login');
            return;
        }

        try {
            // 1. Perfil
            const profileRes = await fetch(`${API_URL}/api/user/profile`, { headers });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile((prev) => ({
                    ...prev,
                    ...normalizeProfile(profileData),
                    role: translateRole(profileData.role),
                }));
            } else if (profileRes.status === 401) {
                onNavigate('login');
                return;
            }

            // 2. Preferências
            const prefsRes = await fetch(`${API_URL}/api/user/preferences`, { headers });
            if (prefsRes.ok) {
                setPrefs(normalizePreferences(await prefsRes.json()));
            } else if (prefsRes.status === 401) {
                onNavigate('login');
                return;
            }

            // 3. Estatísticas do clã
            const clanRes = await fetch(`${API_URL}/api/clan/stats`, { headers });
            const clanData = await clanRes.json();

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
                    members: [],
                });
                setWarAttendance([]);
            }

            // 4. Histórico
            const historyRes = await fetch(`${API_URL}/api/clan/history`, { headers });
            if (historyRes.ok) {
                setWarHistory(normalizeWarHistory(await historyRes.json()));
            }

            // 5. Notificações
            const war = clanData.war || {};
            const newNotifs = [];
            if (war.isWarDay) {
                newNotifs.push({
                    id: 101,
                    text: `${war.label || 'Guerra atual'} · Dia ${war.day || '-'}/4.`,
                    time: war.periodType === 'colosseum' ? 'Coliseu' : 'Dia de guerra',
                    icon: Swords,
                    read: false,
                });
                newNotifs.push({
                    id: 102,
                    text: 'Cada guerreiro precisa dos 4 ataques de hoje.',
                    time: 'Prioridade alta',
                    icon: BellRing,
                    read: false,
                });
                if (clanData.endOfDayAlert) {
                    newNotifs.push({
                        id: 104,
                        text: `${clanData.pendingAttacks} membro(s) ainda estão com ataques de hoje pendentes.`,
                        time: 'Fechamento do dia',
                        icon: ShieldAlert,
                        read: false,
                    });
                }
            } else if (war.isTraining) {
                newNotifs.push({
                    id: 103,
                    text: `${war.label || 'Corrida atual'} está em treino. Os 4 ataques ainda não valem para a guerra.`,
                    time: 'Treino',
                    icon: Info,
                    read: false,
                });
            } else {
                newNotifs.push({
                    id: 103,
                    text: 'A API não retornou uma corrida ativa no momento.',
                    time: 'Sem corrida',
                    icon: Info,
                    read: false,
                });
            }
            setNotificationsList(newNotifs);
        } catch (err) {
            console.error('Erro ao conectar com o backend:', err);
        }
    }, [onNavigate]);

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            fetchData();
        }, 0);
        return () => window.clearTimeout(requestId);
    }, [fetchData]);

    // ─── Ações ───
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
                    justification: attendanceJustification,
                }),
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
            const res = await fetch(`${API_URL}/api/user/profile`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name: profile.name, email: profile.email }),
            });
            if (res.ok) alert('Perfil salvo com sucesso!');
            else if (res.status === 401) onNavigate('login');
        } catch (err) {
            console.error('Erro ao salvar perfil:', err);
            alert('Erro ao conectar com o servidor.');
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
            const res = await fetch(`${API_URL}/api/user/preferences`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(newPrefs),
            });
            if (res.status === 401) onNavigate('login');
        } catch (err) {
            console.error('Erro ao salvar preferências:', err);
        }
    };

    const handlePrint = () => window.print();

    const handleShare = async () => {
        const topMembers = warHistory.members
            .slice(0, 5)
            .map((m, i) => `${i + 1}. ${m.name} - Média: ${m.average}`)
            .join('\n');

        const text =
            `🏆 *QG ${clanStats.name} - TOP 5 GUERREIROS*\n\n` +
            `Acompanhe o desempenho do clã:\n\n${topMembers}\n\n` +
            `Confira o QG completo em: ${window.location.origin}`;

        try {
            await navigator.clipboard.writeText(text);
            alert('Resumo do Top 5 copiado para a área de transferência! Prontinho para enviar no WhatsApp.');
        } catch (err) {
            console.error('Falha ao copiar:', err);
            alert('Não foi possível copiar automaticamente. Por favor, copie manualmente.');
        }
    };

    // ─── Dados derivados ───
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
        .filter(
            (member) =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const reportMetrics = [
        { label: 'Top 5', value: rankingMembers.length },
        { label: 'Histórico', value: historicalMembers.length },
        { label: 'Alertas', value: notificationsList.filter((item) => !item.read).length },
    ];

    // ─── Render ───
    return (
        <div className="wt-dashboard min-h-screen bg-[#050f21] flex font-sans text-slate-100">
            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#091b38] text-slate-300 transform transition-transform duration-300 ease-in-out border-r-2 border-[#1c3f73] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
                <div className="h-full flex flex-col">
                    <div className="h-20 flex items-center px-5 bg-[#071733] border-b-2 border-[#0d2242] cursor-pointer" onClick={() => handleTabChange('guerra')}>
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#4f3100] bg-gradient-to-b from-[#ffdb4d] to-[#c78000] shadow-[0_3px_0_#694000]">
                                <div className="btn-gloss" />
                                <Crown className="relative h-6 w-6 fill-[#0b1730] text-[#0b1730]" />
                            </div>
                            <div>
                                <span className="font-clash text-yellow-300 text-lg block leading-none stroke-black-sm">{clanStats.name}</span>
                                <span className="text-[10px] text-blue-300 font-bold uppercase">{clanStats.tag} • QG de guerra</span>
                            </div>
                        </div>
                        <button className="lg:hidden ml-auto text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
                        {navigationTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-3 px-3.5 py-3 w-full rounded-2xl font-clash text-base uppercase tracking-wide transition-all ${activeTab === tab.id ? 'bg-gradient-to-b from-[#ffbe0b] to-[#c78000] text-white border border-[#6b4200] shadow-[0_3px_0_#5e3800]' : 'text-blue-200 hover:bg-[#102a54] hover:text-white'}`}
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

                    <div className="p-4 bg-[#071733] border-t border-[#0d2242]">
                        <button
                            onClick={() => onNavigate('landing')}
                            className="flex items-center gap-3 px-4 py-3 w-full text-red-300 hover:bg-red-400/10 rounded-2xl font-clash uppercase transition-colors"
                        >
                            <LogOut className="h-5 w-5" /> Sair do Painel
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* HEADER */}
                <header className="h-20 bg-[#071733]/95 backdrop-blur border-b-4 border-[#030a17] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shadow-[0_6px_20px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-blue-200 hover:text-white p-2 bg-[#0e274f] rounded-xl border border-[#225096]" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="hidden sm:flex items-center bg-[#051124] rounded-xl px-4 py-2.5 w-72 border-2 border-[#1c4078] focus-within:border-yellow-400 transition-colors">
                            <Search className="h-5 w-5 text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar membro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full text-white font-medium placeholder:text-blue-400/50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notificações */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowProfileMenu(false);
                                }}
                                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-amber-500/15 text-amber-300' : 'text-slate-400 hover:text-amber-300 bg-white/5'}`}
                            >
                                <Bell className="h-6 w-6" />
                                {notificationsList.some((n) => !n.read) && (
                                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#0B1220] rounded-2xl border border-white/6 overflow-hidden z-50 shadow-2xl">
                                    <div className="p-4 border-b border-white/6 bg-white/3 flex justify-between items-center">
                                        <span className="font-black text-white uppercase text-[11px] tracking-[0.28em]">Notificações</span>
                                        <button onClick={handleMarkAllAsRead} className="text-[10px] text-blue-300 font-bold hover:underline cursor-pointer bg-transparent border-none p-0">
                                            Marcar tudo lido
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notificationsList.map((n) => (
                                            <div
                                                key={n.id}
                                                onClick={() => {
                                                    setNotificationsList((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
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

                        {/* Menu Perfil */}
                        <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200">
                            <button
                                onClick={() => {
                                    setShowProfileMenu(!showProfileMenu);
                                    setShowNotifications(false);
                                }}
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
                                            onClick={() => {
                                                handleTabChange('perfil');
                                                setShowProfileMenu(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <User className="h-4 w-4 text-slate-400" /> Meu Perfil
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleTabChange('preferencias');
                                                setShowProfileMenu(false);
                                            }}
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

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-[#050f21]">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* ABA GUERRA */}
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

                        {/* ABA RANKING */}
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
                                            {participationRanking.length > 0 ? (
                                                participationRanking.map((member) => (
                                                    <div key={member.tag} className="rounded-2xl border border-white/6 bg-[#0B1220] p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{member.name}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {member.attacksUsed}/{member.attacksPossible} ataques
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                                                                {member.participation}%
                                                            </span>
                                                        </div>
                                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                                                            <div
                                                                className="h-full rounded-full bg-amber-400"
                                                                style={{ width: `${Math.max(0, Math.min(100, member.participation || 0))}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-500">Sem dados suficientes no histórico para calcular participação.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ABA RELATÓRIOS */}
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

                        {/* ABA PERFIL */}
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
                                    <div className="
