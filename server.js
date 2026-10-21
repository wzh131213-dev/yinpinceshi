'use strict';
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const EMUTIZE_API_KEY = process.env.EMUTIZE_API_KEY || '';
const EMUTIZE_BASE_URL = (process.env.EMUTIZE_BASE_URL || 'https://app.emutize.com').replace(/\/$/, '');
const APP_ACCESS_PASSWORD = process.env.APP_ACCESS_PASSWORD || '';
const MAX_APK_MB = Math.max(1, Number(process.env.MAX_APK_MB || 150));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
const sessions = new Map();
const uploadDir = path.join(os.tmpdir(), 'nangaios-apk-uploads');
require('node:fs').mkdirSync(uploadDir, { recursive: true });

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin(origin, cb) {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
  return cb(new Error('此网页来源不在 ALLOWED_ORIGINS 白名单中。'));
}, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'X-Access-Password'] }));
app.use(express.json({ limit: '32kb' }));

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && aa.length > 0 && crypto.timingSafeEqual(aa, bb);
}
function requireAccess(req, res, next) {
  if (!APP_ACCESS_PASSWORD) return res.status(503).json({ error: '服务器未设置 APP_ACCESS_PASSWORD；请先配置访问密码。' });
  if (!safeEqual(req.get('X-Access-Password'), APP_ACCESS_PASSWORD)) return res.status(401).json({ error: '访问密码错误或未填写。' });
  next();
}
function requireRuntime(req, res, next) {
  if (!EMUTIZE_API_KEY) return res.status(503).json({ error: '云端 Android 服务尚未配置：服务器管理员需要设置 EMUTIZE_API_KEY。' });
  next();
}
function validPackageId(v) {
  return typeof v === 'string' && v.length <= 240 && /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(v);
}
async function emutize(pathname, options = {}) {
  const response = await fetch(`${EMUTIZE_BASE_URL}${pathname}`, {
    ...options,
    headers: { Authorization: `Bearer ${EMUTIZE_API_KEY}`, ...(options.headers || {}) },
    signal: AbortSignal.timeout(120000)
  });
  if (!response.ok) {
    let detail = '';
    try { const j = await response.json(); detail = j.detail || j.error || j.message || JSON.stringify(j); }
    catch { detail = (await response.text()).slice(0, 500); }
    const err = new Error(`云端 Android 服务返回 ${response.status}${detail ? `：${detail}` : ''}`);
    err.status = response.status >= 500 ? 502 : response.status;
    throw err;
  }
  if (response.status === 204) return null;
  return response.json();
}

// Emutize's documented session-creation call. The API key remains server-side;
// the browser receives only the short-lived embed URL needed to display the device.
async function createEmutizeSession(app) {
  if (!(typeof app === 'string' || Number.isInteger(app)) || String(app).trim() === '') {
    throw new Error('创建云端会话时必须提供应用库名称或数字 ID。');
  }
  return emutize('/api/v1/sessions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app })
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}.apk`)
});
const upload = multer({ storage, limits: { fileSize: MAX_APK_MB * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => {
  if (!file.originalname.toLowerCase().endsWith('.apk')) return cb(new Error('只接受 .apk 文件。'));
  cb(null, true);
} });

app.get('/api/health', (_req, res) => res.json({ ok: true, runtime: 'Emutize cloud Android', configured: Boolean(EMUTIZE_API_KEY && APP_ACCESS_PASSWORD), maxApkMb: MAX_APK_MB }));

app.post('/api/runtime/start', requireAccess, requireRuntime, upload.single('apk'), async (req, res) => {
  let uploadedPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: '请先选择 APK 文件。' });
    const packageId = String(req.body.packageId || '').trim();
    if (!validPackageId(packageId)) return res.status(400).json({ error: 'Android 包名格式不正确，例如 com.example.app。' });
    const fd = new FormData();
    fd.append('file', new Blob([await fs.readFile(req.file.path)], { type: 'application/vnd.android.package-archive' }), path.basename(req.file.originalname));
    const appName = `nangai-${crypto.randomUUID().slice(0, 12)}`;
    fd.append('name', appName);
    fd.append('package_id', packageId);
    await emutize('/api/v1/apps/', { method: 'POST', body: fd });
    // APK is now in the Emutize app library; create a fresh cloud Android device.
    const session = await createEmutizeSession(appName);
    if (!session?.session_id || !session?.embed_url) throw new Error('云端服务没有返回有效的设备会话或嵌入地址。');
    const embed = new URL(session.embed_url);
    if (embed.protocol !== 'https:' || !['app.emutize.com'].includes(embed.hostname)) throw new Error('云端服务返回了不受允许的嵌入地址，已拒绝加载。');
    const publicSessionId = crypto.randomUUID();
    sessions.set(publicSessionId, { upstreamId: session.session_id, createdAt: Date.now(), appName });
    return res.status(201).json({ sessionId: publicSessionId, embedUrl: session.embed_url, appName, warning: session.warning || null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || '启动云端 Android 会话失败。' });
  } finally {
    if (uploadedPath) fs.unlink(uploadedPath).catch(() => {});
  }
});

app.post('/api/runtime/:id/stop', requireAccess, requireRuntime, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: '会话不存在、已结束或服务器已重启。' });
  try {
    await emutize(`/api/v1/sessions/${encodeURIComponent(session.upstreamId)}/`, { method: 'DELETE' });
    sessions.delete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message || '结束云端会话失败。' });
  }
});

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: `APK 超过 ${MAX_APK_MB} MB 上传限制。` });
  const status = err.status || 400;
  res.status(status).json({ error: err.message || '请求失败。' });
});

const server = app.listen(PORT, () => console.log(`NangaiOS cloud runtime API listening on ${PORT}`));
function shutdown() { server.close(() => process.exit(0)); }
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
