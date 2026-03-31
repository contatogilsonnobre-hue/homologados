let PORTAL_DATA = null;
let clickCount = 0;
let clickTimer = null;

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzURBsi3CRDfAxBgxwgWWVWrKxcyvHCHzn5QtzpSvBZS7SbJGQFbBh66iMVc3GErB6xNQ/exec'
};

const ADMIN_PASSWORD = 'admin123';

function initializeLoginScreen() {
  document.body.classList.add('login-locked');

  const overlay = document.getElementById('loginOverlay');
  if (overlay) overlay.style.display = 'flex';

  const userInput = document.getElementById('loginUser');
  if (userInput) {
    setTimeout(() => userInput.focus(), 250);
  }
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
  const userInput = document.getElementById('loginUser');
  const passInput = document.getElementById('loginPassword');

  const username = (userInput?.value || '').trim();
  const password = passInput?.value || '';

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
    if (
      username === PORTAL_DATA.loginUsername &&
      password === PORTAL_DATA.loginPassword
    ) {
      const overlay = document.getElementById('loginOverlay');
      const appShell = document.getElementById('appShell');

      if (overlay) overlay.style.display = 'none';
      document.body.classList.remove('login-locked');
      if (appShell) appShell.classList.remove('hidden');

      setLoginLoading(false);
      showToast('Bem-vindo(a) ao portal executivo.');
    } else {
      setLoginLoading(false);
      showLoginError('Usuário ou senha inválidos.');
    }
  }, 500);
}

function renderPortal(data) {
  PORTAL_DATA = data;

  const reportName = document.getElementById('reportName');
  const updateDate = document.getElementById('updateDate');
  const updateTime = document.getElementById('updateTime');
  const headerUpdate = document.getElementById('headerUpdate');
  const subtitle = document.getElementById('pageSubtitle');

  if (reportName) reportName.textContent = data.report?.name || 'Relatório Geral';
  if (updateDate) updateDate.textContent = data.lastUpdate?.date || '--/--/----';
  if (updateTime) updateTime.textContent = data.lastUpdate?.time || '--:--';
  if (headerUpdate) {
    headerUpdate.textContent = `${data.lastUpdate?.date || '--/--/----'} • ${data.lastUpdate?.time || '--:--'}`;
  }
  if (subtitle) {
    subtitle.textContent = data.appSubtitle || 'Consulta externa segura e visualização estratégica do relatório.';
  }

  renderProducts(data.recentProducts || []);
  updateReportButtons();
}

function renderProducts(list) {
  const el = document.getElementById('recentProductsList');
  if (!el) return;

  if (!Array.isArray(list) || !list.length) {
    el.innerHTML = `
      <div class="product-item">
        <div class="product-main">
          <strong>Nenhum produto recente</strong>
          <span>Não há itens cadastrados para exibir no momento.</span>
        </div>
      </div>
    `;
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
    if (hint) hint.textContent = 'Relatório disponível para visualização e download.';
    viewBtn?.classList.remove('btn-disabled');
    downloadBtn?.classList.remove('btn-disabled');
  } else {
    if (hint) hint.textContent = 'Nenhum link de relatório configurado no momento.';
    viewBtn?.classList.add('btn-disabled');
    downloadBtn?.classList.add('btn-disabled');
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

/* ================= ADMIN ================= */

function secretClick() {
  clickCount += 1;

  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 2000);

  if (clickCount >= 5) {
    clickCount = 0;
    openAdmin();
  }
}

function productsToTextarea(items) {
  if (!Array.isArray(items) || !items.length) return '';
  return items
    .map(item => `${item.modelo || ''} | ${item.categoria || ''} | ${item.data || ''}`)
    .join('\n');
}

function textareaToProducts(text) {
  return String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        modelo: parts[0] || '',
        categoria: parts[1] || '',
        data: parts[2] || ''
      };
    });
}

function openAdmin() {
  if (!PORTAL_DATA) {
    showToast('Os dados do portal ainda não foram carregados.');
    return;
  }

  const pass = prompt('Senha admin:');
  if (pass !== ADMIN_PASSWORD) {
    showToast('Senha administrativa inválida.');
    return;
  }

  const modal = document.getElementById('adminModal');
  const pdf = document.getElementById('adminPdf');
  const date = document.getElementById('adminDate');
  const time = document.getElementById('adminTime');
  const products = document.getElementById('adminProducts');

  if (pdf) pdf.value = PORTAL_DATA.report?.url || '';
  if (date) date.value = PORTAL_DATA.lastUpdate?.date || '';
  if (time) time.value = PORTAL_DATA.lastUpdate?.time || '';
  if (products) products.value = productsToTextarea(PORTAL_DATA.recentProducts || []);

  if (modal) modal.style.display = 'flex';
}

function saveAdmin() {
  if (!PORTAL_DATA) return;

  const pdf = document.getElementById('adminPdf')?.value?.trim() || '';
  const date = document.getElementById('adminDate')?.value?.trim() || '';
  const time = document.getElementById('adminTime')?.value?.trim() || '';
  const productsText = document.getElementById('adminProducts')?.value || '';

  PORTAL_DATA.report = PORTAL_DATA.report || {};
  PORTAL_DATA.lastUpdate = PORTAL_DATA.lastUpdate || {};

  PORTAL_DATA.report.url = pdf;
  PORTAL_DATA.lastUpdate.date = date;
  PORTAL_DATA.lastUpdate.time = time;
  PORTAL_DATA.recentProducts = textareaToProducts(productsText);

  localStorage.setItem('portalData', JSON.stringify(PORTAL_DATA));

  renderPortal(PORTAL_DATA);
  closeAdmin();
  showToast('Alterações salvas com sucesso.');
}

function closeAdmin() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'none';
}

/* ================= UTILS ================= */

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ================= API ================= */

function loadPortal() {
  const saved = localStorage.getItem('portalData');

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      renderPortal(parsed);
      return;
    } catch (e) {
      localStorage.removeItem('portalData');
    }
  }

  fetch(CONFIG.API_URL)
    .then(res => res.text())
    .then(text => {
      const data = JSON.parse(text);
      renderPortal(data);
    })
    .catch(err => {
      console.error(err);
      showToast('Erro ao carregar a API.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeLoginScreen();
  loadPortal();

  const loginButton = document.getElementById('loginButton');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const loginUser = document.getElementById('loginUser');
  const loginPassword = document.getElementById('loginPassword');
  const motorolaTitle = document.getElementById('motorolaTitle');
  const viewReportBtn = document.getElementById('viewReportBtn');
  const downloadReportBtn = document.getElementById('downloadReportBtn');

  loginButton?.addEventListener('click', validateLogin);
  togglePasswordBtn?.addEventListener('click', togglePasswordVisibility);
  motorolaTitle?.addEventListener('click', secretClick);
  viewReportBtn?.addEventListener('click', openReport);
  downloadReportBtn?.addEventListener('click', downloadReport);

  loginUser?.addEventListener('input', clearLoginError);
  loginPassword?.addEventListener('input', clearLoginError);

  loginUser?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      loginPassword?.focus();
    }
  });

  loginPassword?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      validateLogin();
    }
  });
});
