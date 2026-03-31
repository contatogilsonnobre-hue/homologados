let PORTAL_DATA = null;
let clickCount = 0;
let clickTimer = null;

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxBsty6Fh4Rl9mYjeGirep8FtbaxHc5oAtwxvqLBEmYCzbUy1R0hp9ZExhR0VH8fUMZsQ/exec'
};

const ADMIN_PASSWORD = 'admin123';

function initializeLoginScreen() {
  document.body.classList.add('login-locked');
  const overlay = document.getElementById('loginOverlay');
  if (overlay) overlay.style.display = 'flex';
  const userInput = document.getElementById('loginUser');
  if (userInput) setTimeout(() => userInput.focus(), 250);
}

function showLoginError(message) {
  const error = document.getElementById('loginError');
  if (!error) return;
  error.textContent = message || '';
  error.classList.add('show');
}

function clearLoginError() {
  const error = document.getElementById('loginError');
  if (!error) return;
  error.textContent = '';
  error.classList.remove('show');
}

function setLoginLoading(isLoading) {
  const button = document.getElementById('loginButton');
  const text = document.getElementById('loginButtonText');
  const user = document.getElementById('loginUser');
  const pass = document.getElementById('loginPassword');
  if (!button || !text) return;

  if (isLoading) {
    button.classList.add('loading');
    text.textContent = 'Validando acesso';
    if (user) user.disabled = true;
    if (pass) pass.disabled = true;
  } else {
    button.classList.remove('loading');
    text.textContent = 'Login';
    if (user) user.disabled = false;
    if (pass) pass.disabled = false;
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById('loginPassword');
  const button = document.getElementById('togglePasswordBtn');
  if (!input || !button) return;
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁';
  }
}

function validateLogin() {
  const username = (document.getElementById('loginUser')?.value || '').trim();
  const password = document.getElementById('loginPassword')?.value || '';

  clearLoginError();

  if (!username || !password) {
    showLoginError('Preencha usuário e senha.');
    return;
  }

  if (!PORTAL_DATA) {
    showLoginError('Os dados do portal ainda não foram carregados.');
    return;
  }

  setLoginLoading(true);

  setTimeout(() => {
    if (username === PORTAL_DATA.loginUsername && password === PORTAL_DATA.loginPassword) {
      document.getElementById('loginOverlay').style.display = 'none';
      document.body.classList.remove('login-locked');
      document.getElementById('appShell').classList.remove('hidden');
      setLoginLoading(false);
      showToast('Bem-vindo(a) ao portal executivo.');
    } else {
      setLoginLoading(false);
      showLoginError('Usuário ou senha inválidos.');
    }
  }, 450);
}

function renderPortal(data) {
  PORTAL_DATA = data;

  document.getElementById('reportName').textContent = data.report?.name || 'Relatório Geral';
  document.getElementById('updateDate').textContent = data.lastUpdate?.date || '--/--/----';
  document.getElementById('updateTime').textContent = data.lastUpdate?.time || '--:--';
  document.getElementById('headerUpdate').textContent = `${data.lastUpdate?.date || '--/--/----'} • ${data.lastUpdate?.time || '--:--'}`;
  document.getElementById('pageSubtitle').textContent = data.appSubtitle || 'Consulta externa segura e visualização estratégica do relatório.';

  renderProducts(data.recentProducts || []);
  updateReportButtons();
}

function renderProducts(list) {
  const el = document.getElementById('recentProductsList');
  if (!el) return;

  if (!Array.isArray(list) || !list.length) {
    el.innerHTML = '<div class="product-item"><div class="product-main"><strong>Nenhum produto recente</strong><span>Não há itens cadastrados para exibir no momento.</span></div></div>';
    return;
  }

  el.innerHTML = list.map(p => `
    <div class="product-item">
      <div class="product-main">
        <strong>${escapeHtml(p.modelo || '-')}</strong>
        <span>${escapeHtml(p.categoria || '-')}</span>
      </div>
      <div class="product-date">${escapeHtml(p.data || '-')}</div>
    </div>
  `).join('');
}

function updateReportButtons() {
  const hint = document.getElementById('reportHint');
  const viewBtn = document.getElementById('viewReportBtn');
  const downloadBtn = document.getElementById('downloadReportBtn');
  const hasUrl = !!(PORTAL_DATA?.report?.url && String(PORTAL_DATA.report.url).trim());

  if (hasUrl) {
    hint.textContent = 'Relatório disponível para visualização e download.';
    viewBtn.classList.remove('btn-disabled');
    downloadBtn.classList.remove('btn-disabled');
  } else {
    hint.textContent = 'Nenhum link de relatório configurado no momento.';
    viewBtn.classList.add('btn-disabled');
    downloadBtn.classList.add('btn-disabled');
  }
}

function openReport() {
  if (!PORTAL_DATA?.report?.url) {
    showToast('Nenhum PDF configurado.');
    return;
  }
  window.open(PORTAL_DATA.report.url, '_blank');
}

function downloadReport() {
  if (!PORTAL_DATA?.report?.url) {
    showToast('Nenhum PDF configurado.');
    return;
  }
  window.open(PORTAL_DATA.report.url, '_blank');
}

function secretClick() {
  clickCount += 1;
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => clickCount = 0, 2000);
  if (clickCount >= 5) {
    clickCount = 0;
    openAdminAuth();
  }
}

function showAdminAuthError(message) {
  const error = document.getElementById('adminAuthError');
  if (!error) return;
  error.textContent = message || '';
  error.classList.add('show');
}

function clearAdminAuthError() {
  const error = document.getElementById('adminAuthError');
  if (!error) return;
  error.textContent = '';
  error.classList.remove('show');
}

function openAdminAuth() {
  clearAdminAuthError();
  document.getElementById('adminPasswordInput').value = '';
  document.getElementById('adminPasswordInput').type = 'password';
  document.getElementById('adminPasswordToggle').textContent = '👁';
  document.getElementById('adminAuthModal').style.display = 'flex';
  setTimeout(() => document.getElementById('adminPasswordInput').focus(), 120);
}

function closeAdminAuth() {
  document.getElementById('adminAuthModal').style.display = 'none';
}

function toggleAdminPasswordVisibility() {
  const input = document.getElementById('adminPasswordInput');
  const button = document.getElementById('adminPasswordToggle');
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁';
  }
}

function submitAdminAuth() {
  const password = document.getElementById('adminPasswordInput').value || '';
  clearAdminAuthError();

  if (!password) {
    showAdminAuthError('Digite a senha administrativa.');
    return;
  }

  if (password !== ADMIN_PASSWORD) {
    showAdminAuthError('Senha administrativa inválida.');
    return;
  }

  closeAdminAuth();
  openAdmin();
}

function productsToTextarea(items) {
  if (!Array.isArray(items) || !items.length) return '';
  return items.map(item => `${item.modelo || ''} | ${item.categoria || ''} | ${item.data || ''}`).join('\n');
}

function textareaToProducts(text) {
  return String(text || '').split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split('|').map(part => part.trim());
    return { modelo: parts[0] || '', categoria: parts[1] || '', data: parts[2] || '' };
  });
}

function openAdmin() {
  if (!PORTAL_DATA) {
    showToast('Os dados do portal ainda não foram carregados.');
    return;
  }

  document.getElementById('adminPdf').value = PORTAL_DATA.report?.url || '';
  document.getElementById('adminDate').value = PORTAL_DATA.lastUpdate?.date || '';
  document.getElementById('adminTime').value = PORTAL_DATA.lastUpdate?.time || '';
  document.getElementById('adminProducts').value = productsToTextarea(PORTAL_DATA.recentProducts || []);
  document.getElementById('adminModal').style.display = 'flex';
}

function saveAdmin() {
  if (!PORTAL_DATA) return;

  PORTAL_DATA.report = PORTAL_DATA.report || {};
  PORTAL_DATA.lastUpdate = PORTAL_DATA.lastUpdate || {};
  PORTAL_DATA.report.url = document.getElementById('adminPdf').value.trim() || '';
  PORTAL_DATA.lastUpdate.date = document.getElementById('adminDate').value.trim() || '';
  PORTAL_DATA.lastUpdate.time = document.getElementById('adminTime').value.trim() || '';
  PORTAL_DATA.recentProducts = textareaToProducts(document.getElementById('adminProducts').value || '');

  localStorage.setItem('portalData', JSON.stringify(PORTAL_DATA));
  renderPortal(PORTAL_DATA);
  closeAdmin();
  showToast('Alterações salvas com sucesso.');
}

function closeAdmin() {
  document.getElementById('adminModal').style.display = 'none';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadPortal() {
  const saved = localStorage.getItem('portalData');
  if (saved) {
    try {
      renderPortal(JSON.parse(saved));
      return;
    } catch {
      localStorage.removeItem('portalData');
    }
  }

  fetch(CONFIG.API_URL)
    .then(res => res.text())
    .then(text => renderPortal(JSON.parse(text)))
    .catch(err => {
      console.error(err);
      showToast('Erro ao carregar a API.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeLoginScreen();
  loadPortal();

  document.getElementById('loginButton')?.addEventListener('click', validateLogin);
  document.getElementById('togglePasswordBtn')?.addEventListener('click', togglePasswordVisibility);
  document.getElementById('motorolaTitle')?.addEventListener('click', secretClick);
  document.getElementById('viewReportBtn')?.addEventListener('click', openReport);
  document.getElementById('downloadReportBtn')?.addEventListener('click', downloadReport);
  document.getElementById('adminAuthCancelBtn')?.addEventListener('click', closeAdminAuth);
  document.getElementById('adminAuthConfirmBtn')?.addEventListener('click', submitAdminAuth);
  document.getElementById('adminPasswordToggle')?.addEventListener('click', toggleAdminPasswordVisibility);

  document.getElementById('loginUser')?.addEventListener('input', clearLoginError);
  document.getElementById('loginPassword')?.addEventListener('input', clearLoginError);
  document.getElementById('loginUser')?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('loginPassword')?.focus(); });
  document.getElementById('loginPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') validateLogin(); });

  document.getElementById('adminPasswordInput')?.addEventListener('input', clearAdminAuthError);
  document.getElementById('adminPasswordInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') submitAdminAuth(); });
});
