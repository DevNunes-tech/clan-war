const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    try {
        // 1. Validar header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res
                .status(401)
                .json({ message: 'Token não fornecido ou formato inválido.' });
        }

        const token = authHeader.slice(7).trim();
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido.' });
        }

        // 2. Validar configuração do servidor (não do cliente)
        if (!JWT_SECRET) {
            console.error(
                '[auth middleware] JWT_SECRET não definido no ambiente!'
            );
            return res
                .status(500)
                .json({ message: 'Erro de configuração do servidor.' });
        }

        // 3. Verificar token (com tolerância de clock)
        const decoded = jwt.verify(token, JWT_SECRET, { clockTolerance: 60 });

        // 4. Validar payload mínimo
        if (!decoded || !decoded.id) {
            return res
                .status(401)
                .json({ message: 'Token inválido: payload incompleto.' });
        }

        // 5. Expor só o necessário
        req.user = { id: decoded.id, tag: decoded.tag };
        return next();
    } catch (error) {
        console.warn(
            `[auth middleware] Falha (${error.name}) — IP: ${req.ip} — ${error.message}`
        );

        if (error.name === 'TokenExpiredError') {
            return res
                .status(401)
                .json({ message: 'Token expirado. Faça login novamente.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido.' });
        }
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({ message: 'Token ainda não é válido.' });
        }

        return res.status(401).json({ message: 'Falha na autenticação.' });
    }
};