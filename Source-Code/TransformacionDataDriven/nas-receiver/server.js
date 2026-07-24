/* ============================================================
 * Receptor de respuestas · UTP Data-Driven RetailMax
 * Para NASync DX2800 (UGOS Pro · Docker) o cualquier host con Node 18+.
 *
 * - Recibe los envíos del PWA (POST webhook o PUT WebDAV) y los guarda
 *   como archivos JSON en DATA_DIR (volumen del NAS).
 * - Sirve un TABLERO DEL DOCENTE en "/" que consolida a todos los equipos.
 * - Sin dependencias externas: sólo módulos nativos de Node.
 *
 * Variables de entorno:
 *   PORT          Puerto HTTP (default 8080)
 *   DATA_DIR      Carpeta de datos (default ./data). En Docker, monta un
 *                 volumen del NAS aquí para persistir los envíos.
 *   INGEST_TOKEN  (opcional) Token compartido. Si se define, el PWA debe
 *                 enviarlo como ?token=... o cabecera X-Token.
 * ============================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = parseInt(process.env.PORT || '8080', 10);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const TOKEN = process.env.INGEST_TOKEN || '';
const MAX_BODY = 5 * 1024 * 1024; // 5 MB

fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- utilidades ---------- */
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Token');
  res.setHeader('Access-Control-Max-Age', '86400');
}
function sendJson(res, code, obj) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function sendText(res, code, text, type) {
  cors(res);
  res.writeHead(code, { 'Content-Type': (type || 'text/plain') + '; charset=utf-8' });
  res.end(text);
}
function safe(s) { return String(s || '').replace(/[^a-z0-9_-]/gi, '_').slice(0, 40); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function tokenOK(req, u) {
  if (!TOKEN) return true;
  const q = u.searchParams.get('token');
  return q === TOKEN || req.headers['x-token'] === TOKEN;
}

/* ---------- persistencia ---------- */
function saveSubmission(bodyStr, suggestedName) {
  let payload;
  try { payload = JSON.parse(bodyStr); } catch (e) { throw new Error('JSON inválido'); }
  const team = safe((payload.equipo && payload.equipo.name) || 'sin-nombre');
  const rand = crypto.randomBytes(3).toString('hex');
  let fname = suggestedName && /\.json$/i.test(suggestedName)
    ? safe(suggestedName.replace(/\.json$/i, '')) + '.json'
    : `${team}_${Date.now()}_${rand}.json`;
  const file = path.join(DATA_DIR, fname);
  const record = { _received: new Date().toISOString(), _file: fname, payload };
  fs.writeFileSync(file, JSON.stringify(record, null, 2));
  return { file: fname, team };
}
function listRecords() {
  const out = [];
  for (const f of fs.readdirSync(DATA_DIR)) {
    if (!f.endsWith('.json')) continue;
    try {
      const r = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      out.push(r);
    } catch (e) { /* ignora archivos corruptos */ }
  }
  return out;
}

/* ---------- agregación por equipo (último envío gana) ---------- */
function aggregate() {
  const records = listRecords();
  const byTeam = {};
  for (const r of records) {
    const p = r.payload || {};
    const name = (p.equipo && p.equipo.name) || 'Sin nombre';
    const ts = p.ts || r._received || '';
    if (!byTeam[name] || ts > byTeam[name]._ts) {
      byTeam[name] = { _ts: ts, _count: 0, payload: p };
    }
  }
  // contar envíos por equipo
  for (const r of records) {
    const p = r.payload || {};
    const name = (p.equipo && p.equipo.name) || 'Sin nombre';
    if (byTeam[name]) byTeam[name]._count++;
  }
  const teams = Object.keys(byTeam).map(name => {
    const p = byTeam[name].payload;
    const badges = p.insignias || {};
    const badgesCount = Object.keys(badges).filter(k => badges[k]).length;
    const comm = p.estrategia_comunicacion || {};
    return {
      name,
      mode: (p.equipo && p.equipo.mode) || '',
      members: (p.equipo && Array.isArray(p.equipo.members)) ? p.equipo.members.length : 0,
      membersList: (p.equipo && Array.isArray(p.equipo.members)) ? p.equipo.members : [],
      course: (p.equipo && p.equipo.course) || '',
      maturity: typeof p.madurez_bi === 'number' ? p.madurez_bi : null,
      badges, badgesCount,
      cltvAvg: p.cltv ? p.cltv.avg : null,
      romi: p.romi ? p.romi.romi : null,
      npv: p.romi ? p.romi.npv : null,
      payback: p.romi ? p.romi.payback : null,
      excelClientes: p.dashboard_excel ? p.dashboard_excel.clientes : null,
      excelSegmentos: p.dashboard_excel ? p.dashboard_excel.segmentos : null,
      commDone: !!(comm.msg && String(comm.msg).trim()),
      commMsg: comm.msg || '', kpi: comm.kpi || '', plan: comm.plan || '',
      autoeval: p.autoevaluacion || [],
      lastTs: byTeam[name]._ts, count: byTeam[name]._count
    };
  }).sort((a, b) => (b.lastTs || '').localeCompare(a.lastTs || ''));

  const nums = arr => arr.filter(x => typeof x === 'number');
  const avg = arr => nums(arr).length ? nums(arr).reduce((a, b) => a + b, 0) / nums(arr).length : null;
  const summary = {
    teams: teams.length,
    submissions: records.length,
    avgMaturity: avg(teams.map(t => t.maturity)),
    avgCltv: avg(teams.map(t => t.cltvAvg)),
    avgRomi: avg(teams.map(t => t.romi)),
    fullyBadged: teams.filter(t => t.badgesCount === 5).length
  };
  return { summary, teams };
}

/* ---------- exportación CSV ---------- */
function toCsv() {
  const { teams } = aggregate();
  const cols = ['equipo', 'modalidad', 'integrantes', 'madurez_bi', 'insignias_5', 'cltv_prom', 'romi', 'npv', 'payback_meses', 'excel_clientes', 'excel_segmentos', 'estrategia_com', 'kpi', 'ultimo_envio', 'num_envios'];
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  let csv = '﻿' + cols.join(',') + '\n';
  for (const t of teams) {
    csv += [
      q(t.name), q(t.mode), q(t.membersList.join(' | ')),
      q(t.maturity != null ? Math.round(t.maturity * 100) + '%' : ''),
      q(t.badgesCount + '/5'),
      q(t.cltvAvg != null ? Math.round(t.cltvAvg) : ''),
      q(t.romi != null ? (t.romi * 100).toFixed(0) + '%' : ''),
      q(t.npv != null ? Math.round(t.npv) : ''),
      q(t.payback == null ? '' : t.payback),
      q(t.excelClientes != null ? t.excelClientes : ''),
      q(t.excelSegmentos != null ? t.excelSegmentos : ''),
      q(t.commDone ? 'sí' : 'no'), q(t.kpi),
      q(t.lastTs), q(t.count)
    ].join(',') + '\n';
  }
  return csv;
}

/* ---------- tablero del docente (HTML + JS de refresco) ---------- */
function dashboardHtml() {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tablero docente · UTP Data-Driven</title>
<style>
  :root{--blue:#2f6fa8;--pblue:#dcebf8;--peach:#b9772f;--green:#4a9b63;--pgreen:#e6f4e9;--pink:#c05a86;--ink:#3b4363;--paper:#f4f7fb;--line:#cdd6e6;}
  *{box-sizing:border-box}body{margin:0;font-family:'Space Mono',ui-monospace,Consolas,monospace;background:var(--paper);color:var(--ink)}
  header{background:var(--pblue);border-bottom:2px solid #c3d6ea;padding:.8rem 1rem;display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:space-between}
  header h1{font-size:1.1rem;margin:0;color:var(--blue)}
  .wrap{max-width:1200px;margin:0 auto;padding:1rem}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.7rem;margin-bottom:1rem}
  .card{background:#fff;border:2px solid var(--line);border-radius:12px;padding:.7rem}
  .card .v{font-size:1.6rem;font-weight:700;color:var(--blue)}.card .l{font-size:.72rem;text-transform:uppercase;color:#6b7280}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:.82rem}
  th,td{border:1px solid #e0e6f1;padding:.45rem;text-align:left;vertical-align:top}
  th{background:var(--pgreen);color:var(--green);position:sticky;top:0}
  tr:nth-child(even){background:#eef3fa}
  .b{display:inline-block;width:15px;height:15px;border-radius:4px;margin-right:1px;background:#e3e8f2;text-align:center;font-size:.6rem;line-height:15px}
  .b.on{background:#ffd9a8}
  .btn{border:2px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:.4rem .7rem;cursor:pointer;font-family:inherit;font-weight:700;text-decoration:none;font-size:.8rem}
  .btn.blue{background:var(--pblue);color:var(--blue)}
  .muted{color:#8a90a0}.ok{color:var(--green);font-weight:700}.no{color:#b06}
  .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#8fd0a0;margin-right:.3rem;animation:p 2s infinite}
  @keyframes p{50%{opacity:.3}}
  .scroll{overflow-x:auto}
</style></head><body>
<header>
  <h1>🛰️ Tablero docente · UTP Data-Driven · RetailMax</h1>
  <div>
    <span class="muted" id="live"><span class="dot"></span>en vivo</span>
    <a class="btn" href="/export.csv">⬇ CSV</a>
    <a class="btn blue" href="/api/raw" target="_blank">⬇ JSON</a>
    <button class="btn" onclick="load()">🔄 Refrescar</button>
  </div>
</header>
<div class="wrap">
  <div class="cards" id="cards"></div>
  <div class="scroll"><table id="tbl"><thead><tr>
    <th>Equipo</th><th>Integr.</th><th>Madurez</th><th>Insignias</th><th>CLTV prom.</th>
    <th>ROMI</th><th>NPV</th><th>Payback</th><th>Excel</th><th>Estrategia</th><th>KPI</th><th>Últ. envío</th><th>#</th>
  </tr></thead><tbody></tbody></table></div>
  <p class="muted" style="font-size:.72rem;margin-top:1rem">UTP · Mg. Mario Quiroz Martínez — Semana 1 · Curso de DATA+IA · Universidad Tecnológica del Perú · Receptor NASync DX2800</p>
</div>
<script>
function money(n){return n==null?'—':'$'+Math.round(n).toLocaleString('es-MX')}
function pct(n){return n==null?'—':Math.round(n*100)+'%'}
function badges(b){var k=['diag','arch','seg','lex','fin'],e={diag:'🔍',arch:'🏗️',seg:'💎',lex:'🔤',fin:'💰'};return k.map(function(x){return '<span class="b '+(b&&b[x]?'on':'')+'" title="'+x+'">'+(b&&b[x]?e[x]:'')+'</span>'}).join('')}
async function load(){
  try{
    var r=await fetch('/api/submissions',{cache:'no-store'});var d=await r.json();
    var s=d.summary;
    document.getElementById('cards').innerHTML=
      card(s.teams,'Equipos')+card(s.submissions,'Envíos')+card(s.avgMaturity==null?'—':pct(s.avgMaturity),'Madurez prom.')+
      card(money(s.avgCltv),'CLTV prom.')+card(s.avgRomi==null?'—':(s.avgRomi*100).toFixed(0)+'%','ROMI prom.')+card(s.fullyBadged+'/'+s.teams,'Completos');
    var tb=document.querySelector('#tbl tbody');
    tb.innerHTML=d.teams.map(function(t){return '<tr>'+
      '<td><b>'+escape(t.name)+'</b><br><span class="muted" style="font-size:.68rem">'+escape(t.membersList.join(', '))+'</span></td>'+
      '<td>'+t.members+'</td>'+
      '<td>'+(t.maturity==null?'—':pct(t.maturity))+'</td>'+
      '<td>'+badges(t.badges)+' '+t.badgesCount+'/5</td>'+
      '<td>'+money(t.cltvAvg)+'</td>'+
      '<td>'+(t.romi==null?'—':(t.romi*100).toFixed(0)+'%')+'</td>'+
      '<td>'+money(t.npv)+'</td>'+
      '<td>'+(t.payback==null?'—':t.payback+' m')+'</td>'+
      '<td>'+(t.excelClientes==null?'—':t.excelClientes+' cli / '+t.excelSegmentos+' seg')+'</td>'+
      '<td>'+(t.commDone?'<span class=ok>sí</span>':'<span class=no>no</span>')+'</td>'+
      '<td style="max-width:180px">'+escape(t.kpi||'—')+'</td>'+
      '<td class="muted" style="font-size:.68rem">'+escape((t.lastTs||'').replace('T',' ').slice(0,19))+'</td>'+
      '<td>'+t.count+'</td></tr>';}).join('')||'<tr><td colspan="13" class="muted">Aún no hay envíos. Configura el endpoint del NAS en el PWA y pulsa "Sincronizar".</td></tr>';
    document.getElementById('live').innerHTML='<span class="dot"></span>actualizado '+new Date().toLocaleTimeString('es-MX');
  }catch(e){ document.getElementById('live').textContent='sin conexión'; }
}
function card(v,l){return '<div class="card"><div class="v">'+v+'</div><div class="l">'+l+'</div></div>'}
function escape(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
load(); setInterval(load, 12000);
</script></body></html>`;
}

/* ---------- servidor ---------- */
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }
  if (method === 'HEAD') { cors(res); res.writeHead(200); return res.end(); } // ping del PWA

  if (method === 'GET') {
    if (u.pathname === '/' ) return sendText(res, 200, dashboardHtml(), 'text/html');
    if (u.pathname === '/health') return sendJson(res, 200, { ok: true, dataDir: DATA_DIR });
    if (u.pathname === '/api/submissions') return sendJson(res, 200, aggregate());
    if (u.pathname === '/api/raw') return sendJson(res, 200, listRecords());
    if (u.pathname === '/export.csv') return sendText(res, 200, toCsv(), 'text/csv');
    return sendJson(res, 404, { error: 'not found' });
  }

  if (method === 'POST' || method === 'PUT') {
    if (!tokenOK(req, u)) return sendJson(res, 401, { error: 'token requerido' });
    let body = '', tooBig = false;
    req.on('data', c => { body += c; if (body.length > MAX_BODY) { tooBig = true; req.destroy(); } });
    req.on('end', () => {
      if (tooBig) return sendJson(res, 413, { error: 'payload demasiado grande' });
      try {
        const suggested = method === 'PUT' ? path.basename(u.pathname) : null;
        const saved = saveSubmission(body, suggested);
        return sendJson(res, 201, { ok: true, saved: saved.file, team: saved.team });
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }
    });
    return;
  }

  return sendJson(res, 405, { error: 'método no permitido' });
});

server.listen(PORT, () => {
  console.log(`[receptor] escuchando en http://0.0.0.0:${PORT}`);
  console.log(`[receptor] datos en ${DATA_DIR}`);
  console.log(`[receptor] token ${TOKEN ? 'ACTIVADO' : 'desactivado (LAN abierta)'}`);
});
