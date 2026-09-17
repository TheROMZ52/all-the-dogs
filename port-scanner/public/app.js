const form = document.getElementById('scanForm');
const hostInput = document.getElementById('host');
const portsInput = document.getElementById('ports');
const timeoutInput = document.getElementById('timeout');
const concurrencyInput = document.getElementById('concurrency');
const scanButton = document.getElementById('scanButton');
const engineBadge = document.getElementById('engineBadge');
const progressShell = document.getElementById('progressShell');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const targetSummary = document.getElementById('targetSummary');
const resolvedHost = document.getElementById('resolvedHost');
const resolvedFamily = document.getElementById('resolvedFamily');
const resultsBody = document.getElementById('resultsBody');
const openCount = document.getElementById('openCount');
const closedCount = document.getElementById('closedCount');
const timeoutCount = document.getElementById('timeoutCount');
const scannedCount = document.getElementById('scannedCount');
const openOnlyButton = document.getElementById('openOnly');
const clearResultsButton = document.getElementById('clearResults');

let rows = [];
let openOnly = false;

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const fmt = value => Number(value).toLocaleString();

function setRunning(running) {
  scanButton.disabled = running;
  scanButton.querySelector('span:first-child').textContent = running ? 'SCANNING' : 'START SCAN';
  engineBadge.textContent = running ? 'LIVE' : 'IDLE';
  engineBadge.classList.toggle('live', running);
}

function resetStats() {
  openCount.textContent = '0';
  closedCount.textContent = '0';
  timeoutCount.textContent = '0';
  scannedCount.textContent = '0';
}

function renderRows() {
  const visible = openOnly ? rows.filter(item => item.status === 'open') : rows;
  if (!visible.length) {
    resultsBody.innerHTML = `<tr class="empty-row"><td colspan="4">${rows.length ? 'No open ports in this result set.' : 'Run a scan to populate results.'}</td></tr>`;
    return;
  }
  resultsBody.innerHTML = visible.map(item => `<tr>
    <td class="port-cell">${fmt(item.port)}</td>
    <td>${escapeHtml(item.service)}</td>
    <td><span class="state ${item.status}">${item.status.toUpperCase()}</span></td>
    <td>${fmt(item.latency)} ms</td>
  </tr>`).join('');
}

function addResult(result, completed, total) {
  rows.push(result);
  scannedCount.textContent = fmt(completed);
  if (result.status === 'open') openCount.textContent = fmt(Number(openCount.textContent) + 1);
  if (result.status === 'closed') closedCount.textContent = fmt(Number(closedCount.textContent) + 1);
  if (result.status === 'timeout') timeoutCount.textContent = fmt(Number(timeoutCount.textContent) + 1);
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${fmt(completed)} / ${fmt(total)}`;
  progressPercent.textContent = `${percent}%`;
  renderRows();
}

async function consumeScan(payload) {
  const response = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok || !response.body) throw new Error(`Scanner returned HTTP ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === 'start') {
        resolvedHost.textContent = event.address;
        resolvedFamily.textContent = `${event.family} · ${event.total.toLocaleString()} ports`;
        targetSummary.textContent = `${event.target} → ${event.address}`;
        progressShell.hidden = false;
        progressBar.style.width = '0%';
        progressText.textContent = `0 / ${fmt(event.total)}`;
        progressPercent.textContent = '0%';
      } else if (event.type === 'result') {
        addResult(event.result, event.completed, event.total);
      } else if (event.type === 'done') {
        const s = event.summary;
        targetSummary.textContent = `${s.target} → ${s.address} · finished in ${s.elapsedMs.toLocaleString()} ms`;
        resolvedHost.textContent = s.address;
        resolvedFamily.textContent = `${s.family} · ${s.total.toLocaleString()} ports`;
        progressBar.style.width = '100%';
        progressText.textContent = `${fmt(s.total)} / ${fmt(s.total)}`;
        progressPercent.textContent = '100%';
      } else if (event.type === 'error') {
        throw new Error(event.error);
      }
    }
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  rows = [];
  resetStats();
  renderRows();
  setRunning(true);
  targetSummary.textContent = 'Resolving target…';
  progressShell.hidden = false;
  resolvedHost.textContent = 'Resolving…';
  resolvedFamily.textContent = '—';
  try {
    await consumeScan({
      host: hostInput.value.trim(),
      ports: portsInput.value.trim(),
      timeout: Number(timeoutInput.value),
      concurrency: Number(concurrencyInput.value)
    });
  } catch (error) {
    targetSummary.textContent = error.message || 'Scan failed.';
    resolvedHost.textContent = '—';
    resolvedFamily.textContent = '—';
  } finally {
    setRunning(false);
  }
});

document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  portsInput.value = button.dataset.preset;
  portsInput.focus();
}));

openOnlyButton.addEventListener('click', () => {
  openOnly = !openOnly;
  openOnlyButton.classList.toggle('active', openOnly);
  renderRows();
});

clearResultsButton.addEventListener('click', () => {
  rows = [];
  resetStats();
  progressShell.hidden = true;
  progressBar.style.width = '0%';
  progressText.textContent = '0 / 0';
  progressPercent.textContent = '0%';
  targetSummary.textContent = 'No scan running';
  resolvedHost.textContent = '—';
  resolvedFamily.textContent = '—';
  renderRows();
});
