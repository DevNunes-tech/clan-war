// Instância global para performance (criada uma vez só)
export const ptBrNumber = new Intl.NumberFormat('pt-BR');

// Formata números com segurança contra NaN e Infinity
export const formatNumber = (value = 0) => {
    const num = Number(value);
    // Se não for um número finito (NaN, Infinity), retorna 0
    if (!Number.isFinite(num)) return '0';
    return ptBrNumber.format(num);
};

// Traduz os cargos com normalização (aceita Leader, LEADER, leader, co_leader, etc)
export const formatMemberRole = (role = '') => {
    const normalized = String(role).trim().toLowerCase();
    
    const roles = {
        leader: 'Líder',
        coleader: 'Co-líder',      // Aceita 'coLeader', 'COLEADER', 'co-leader'? 
        'co-leader': 'Co-líder',   // Adicionado suporte a hífen
        elder: 'Ancião',
        member: 'Membro'
    };

    // Retorna a tradução ou o valor original (capitalizado) se não encontrar
    return roles[normalized] || (role ? String(role) : 'Membro');
};
