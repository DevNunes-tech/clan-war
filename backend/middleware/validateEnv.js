const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'CLASH_ROYALE_API_KEY', 'CLAN_TAG'];

const normalizeTag = (tag) => {
  let normalized = String(tag || '').trim();
  if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1).trim();
  }
  if (!normalized.startsWith('#')) normalized = `#${normalized}`;
  return normalized.toUpperCase();
};

function getMissingEnvVars() {
  return requiredEnvVars.filter((name) => !process.env[name] || String(process.env[name]).trim() === '');
}

function ensureEnv() {
  const missing = getMissingEnvVars();
  if (missing.length > 0) {
    const message = `Variáveis de ambiente ausentes: ${missing.join(', ')}`;
    console.error(message);
    throw new Error(message);
  }

  process.env.CLAN_TAG = normalizeTag(process.env.CLAN_TAG);
  if (process.env.CLAN_TAG === '#') {
    const message = 'CLAN_TAG inválida. Verifique o arquivo .env.';
    console.error(message);
    throw new Error(message);
  }
}

function validateEnvMiddleware(req, res, next) {
  try {
    ensureEnv();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  ensureEnv,
  validateEnvMiddleware,
};
