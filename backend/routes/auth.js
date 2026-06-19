const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crApi = require('../utils/crApi');

router.post('/login', async (req, res) => {
    const { playerTag } = req.body;

    if (!playerTag) {
        return res.status(400).json({ success: false, message: 'Tag do jogador é obrigatória' });
    }

    try {
        const player = await crApi.getPlayer(playerTag);

        const role = player.role;
        const allowedRoles = ['leader', 'coLeader'];

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: `Acesso negado. Apenas Líderes e Co-líderes podem entrar. Seu cargo: ${player.role}`
            });
        }

        if (player.clan?.tag !== process.env.CLAN_TAG) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Você não pertence ao clã monitorado.'
            });
        }

        let user = await User.findOne({ clanTag: player.tag });
        if (!user) {
            user = await User.create({
                name: player.name,
                email: `${player.tag.replace('#', '')}@clash.com`,
                password: 'no-password',
                clanTag: player.tag,
                role: player.role
            });
        }

        const token = jwt.sign({ id: user.id, tag: player.tag }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.json({
            success: true,
            token,
            user: {
                name: user.name || player.name,
                role: user.role,
                tag: user.clanTag,
                clanTag: player.clan.tag
            }
        });

    } catch (error) {
        console.error('Auth Error:', error.message);
        const status = error.response?.status || 500;
        const message = status === 404 ? 'Jogador não encontrado na API do Clash Royale' : 'Erro na autenticação';
        res.status(status).json({ success: false, message });
    }
});

module.exports = router;

