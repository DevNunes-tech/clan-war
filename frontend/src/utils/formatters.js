export const ptBrNumber = new Intl.NumberFormat('pt-BR');

export const formatNumber = (value = 0) => ptBrNumber.format(Number(value) || 0);

export const formatMemberRole = (role = '') => ({
    leader: 'Líder',
    coLeader: 'Co-líder',
    elder: 'Ancião',
    member: 'Membro'
}[role] || role || 'Membro');