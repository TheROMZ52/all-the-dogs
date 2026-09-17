import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8787);
const DEFAULT_TIMEOUT = 1200;

const commonServices = new Map([
  [20, 'FTP-Data'], [21, 'FTP'], [22, 'SSH'], [23, 'Telnet'], [25, 'SMTP'],
  [53, 'DNS'], [67, 'DHCP'], [68, 'DHCP'], [69, 'TFTP'], [80, 'HTTP'],
  [88, 'Kerberos'], [110, 'POP3'], [111, 'RPCBind'], [119, 'NNTP'], [123, 'NTP'],
  [135, 'MS-RPC'], [137, 'NetBIOS'], [138, 'NetBIOS'], [139, 'NetBIOS'],
  [143, 'IMAP'], [161, 'SNMP'], [389, 'LDAP'], [443, 'HTTPS'], [445, 'SMB'],
  [465, 'SMTPS'], [500, 'IKE'], [587, 'Submission'], [636, 'LDAPS'], [873, 'Rsync'],
  [993, 'IMAPS'], [995, 'POP3S'], [1080, 'SOCKS'], [1433, 'MSSQL'], [1521, 'Oracle'],
  [1723, 'PPTP'], [2049, 'NFS'], [2375, 'Docker'], [3000, 'HTTP-Alt'], [3306, 'MySQL'],
  [3389, 'RDP'], [5432, 'PostgreSQL'], [5900, 'VNC'], [6379, 'Redis'], [6443, 'Kubernetes'],
  [8000, 'HTTP-Alt'], [8080, 'HTTP-Proxy'], [8443, 'HTTPS-Alt'], [8888, 'HTTP-Alt'],
  [25565, 'Minecraft'], [27015, 'Source'], [27017, 'MongoDB']
]);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 32 * 1024) {
        reject(new Error('Request too large'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function ipv4ToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) throw new Error(`Invalid IPv4 address: ${ip}`);
  return (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0;
}

function intToIpv4(value) {
  return [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

function parseIpv4Range(expression) {
  const range = expression.match(/^(.+?)\s*-\s*(.+)$/);
  if (!range) return null;
  if (net.isIP(range[1].trim()) !== 4 || net.isIP(range[2].trim()) !== 4) throw new Error(`Invalid IPv4 range: ${expression}`);
  let start = ipv4ToInt(range[1].trim());
  let end = ipv4ToInt(range[2].trim());
  if (start > end) [start, end] = [end, start];
  const count = end - start + 1;
  return Array.from({ length: count }, (_, index) => intToIpv4(start + index));
}

function parseCidr(expression) {
  const match = expression.match(/^([^/]+)\/(\d{1,2})$/);
  if (!match || net.isIP(match[1]) !== 4) return null;
  const prefix = Number(match[2]);
  if (prefix < 0 || prefix > 32) throw new Error(`Invalid CIDR prefix: ${expression}`);
  const ip = ipv4ToInt(match[1]);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const count = 2 ** (32 - prefix);
  return Array.from({ length: count }, (_, index) => intToIpv4((network + index) >>> 0));
}

function parseTargets(input) {
  const raw = String(input ?? '').trim();
  if (!raw) throw new Error('Enter a host, IP, IP range, or CIDR range.');
  const values = new Set();

  for (const part of raw.split(',')) {
    const item = part.trim();
    if (!item) continue;
    const cidr = parseCidr(item);
    const range = cidr || parseIpv4Range(item);
    if (range) {
      for (const address of range) values.add(address);
    } else {
      if (item.includes('/')) throw new Error(`Invalid CIDR target: ${item}`);
      if (item.includes('-')) throw new Error(`Invalid IP range: ${item}`);
      values.add(item.replace(/^\[|\]$/g, ''));
    }
  }

  return [...values];
}

function parsePorts(input) {
  const raw = String(input ?? '').trim();
  if (!raw) throw new Error('Enter at least one port.');
  const values = new Set();

  for (const part of raw.split(',')) {
    const item = part.trim();
    if (!item) continue;
    const range = item.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      let start = Number(range[1]);
      let end = Number(range[2]);
      if (start > end) [start, end] = [end, start];
      if (start < 1 || end > 65535) throw new Error('Ports must be between 1 and 65535.');
      for (let p = start; p <= end; p++) values.add(p);
    } else if (/^\d+$/.test(item)) {
      const p = Number(item);
      if (p < 1 || p > 65535) throw new Error('Ports must be between 1 and 65535.');
      values.add(p);
    } else {
      throw new Error(`Invalid port expression: ${item}`);
    }
  }

  return [...values].sort((a, b) => a - b);
}

function normalizeHost(input) {
  const value = String(input ?? '').trim();
  if (!value) throw new Error('Enter a host or IP address.');
  if (value.length > 253) throw new Error('Host name is too long.');
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) throw new Error('Enter only a host or IP, without http:// or https://');
  return value.replace(/^\[|\]$/g, '');
}

async function resolveHost(target) {
  const literal = net.isIP(target);
  if (literal) return { input: target, address: target, family: literal === 6 ? 'IPv6' : 'IPv4' };
  const result = await dns.lookup(target, { all: true });
  if (!result.length) throw new Error('Host could not be resolved.');
  const ipv4 = result.find(item => item.family === 4) || result[0];
  return { input: target, address: ipv4.address, family: ipv4.family === 6 ? 'IPv6' : 'IPv4' };
}

function probe(address, port, timeout, family) {
  return new Promise(resolve => {
    const started = performance.now();
    let settled = false;
    const socket = new net.Socket();
    const finish = status => {
      if (settled) return;
      settled = true;
      const latency = Math.round(performance.now() - started);
      socket.destroy();
      resolve({ address, port, status, latency, service: commonServices.get(port) || 'Unknown' });
    };
    socket.setTimeout(timeout);
    socket.once('connect', () => finish('open'));
    socket.once('timeout', () => finish('timeout'));
    socket.once('error', error => finish(error?.code === 'ECONNREFUSED' ? 'closed' : 'unreachable'));
    socket.connect({ host: address, port, family: family === 6 ? 6 : 4 });
  });
}

async function runScan(body, write) {
  const targets = parseTargets(body.host);
  const ports = parsePorts(body.ports);
  const probes = targets.length * ports.length;
  const timeout = Math.min(Math.max(Number(body.timeout) || DEFAULT_TIMEOUT, 250), 5000);
  const concurrency = Math.max(Number(body.concurrency) || 64, 1);
  const startedAt = new Date().toISOString();
  let completed = 0;
  const results = [];
  let cursor = 0;
  const resolvedTargets = [];

  for (const target of targets) {
    resolvedTargets.push(await resolveHost(target));
  }

  write({ type: 'start', targets, resolvedTargets, total: probes, hosts: targets.length, ports: ports.length, timeout, concurrency, startedAt });

  const jobs = resolvedTargets.flatMap(resolved => ports.map(port => ({ resolved, port })));
  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= jobs.length) return;
      const job = jobs[index];
      const result = await probe(job.resolved.address, job.port, timeout, job.resolved.family === 'IPv6' ? 6 : 4);
      results.push(result);
      completed++;
      write({ type: 'result', result, completed, total: jobs.length });
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  results.sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true }) || a.port - b.port);
  const elapsedMs = Math.round(performance.now());
  write({
    type: 'done',
    summary: {
      targets: targets.length,
      ports: ports.length,
      total: results.length,
      open: results.filter(r => r.status === 'open').length,
      closed: results.filter(r => r.status === 'closed').length,
      timeout: results.filter(r => r.status === 'timeout').length,
      unreachable: results.filter(r => r.status === 'unreachable').length,
      elapsedMs,
      finishedAt: new Date().toISOString()
    }
  });
}

async function serveStatic(req, res) {
  let requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  if (requestPath === '/') requestPath = '/index.html';
  const filePath = path.normalize(path.join(publicDir, requestPath));
  if (!filePath.startsWith(publicDir)) return sendJson(res, 403, { error: 'Forbidden' });
  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'content-type': mime[ext] || 'application/octet-stream',
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'x-content-type-options': 'nosniff'
    });
    res.end(file);
  } catch {
    sendJson(res, 404, { error: 'Not found' });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/api/health') return sendJson(res, 200, { ok: true, service: 'port-scanner' });
    if (req.method === 'POST' && url.pathname === '/api/scan') {
      const body = await parseBody(req);
      res.writeHead(200, {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-content-type-options': 'nosniff'
      });
      const write = payload => res.write(`${JSON.stringify(payload)}\n`);
      try {
        await runScan(body, write);
      } catch (error) {
        write({ type: 'error', error: error.message || 'Scan failed' });
      } finally {
        res.end();
      }
      return;
    }
    if (req.method === 'GET') return serveStatic(req, res);
    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Bad request' });
  }
});

server.listen(port, host, () => console.log(`Port Scanner running at http://${host}:${port}`));
