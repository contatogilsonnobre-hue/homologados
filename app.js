let PORTAL_DATA = null;

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbyJQmzNu7OGYgXiZLVpAPi3lxoDOQvsVIoSGyfsTZalC14xR36V4p4w_eO1rLfwRTdobA/exec'
};

function initializeLoginScreen() {
  document.body.classList.add('login-locked');

  const overlay = document.getElementById('loginOverlay');
  if (overlay) overlay.style.display = 'flex';

  const userInput = document.getElementById('loginUser');
  if (userInput) {
    setTimeout(() => userInput.focus(), 250);
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

function showLoginError(message) {
  const error = document.getElementById('loginError');
  if (!error) return;

  error.textContent = message;
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
    if (
      username === PORTAL_DATA.loginUsername &&
      password === PORTAL_DATA.loginPassword
    ) {
      document.getElementById('loginOverlay').style.display = 'none';
      document.body.classList.remove('login-locked');
      document.getElementById('appShell').classList.remove('hidden');
      setLoginLoading(false);
      showToast('Bem-vindo(a) ao portal executivo.');
    } else {
      setLoginLoading(false);
      showLoginError('Usuário ou senha incorretos.');
    }
  }, 700);
}

function renderPortal(data) {
  PORTAL_DATA = data;

  document.getElementById('pageTitle').textContent =
    data.appTitle || 'Portal Executivo | Relatório Geral';

  document.getElementById('pageSubtitle').textContent =
    data.appSubtitle || 'Consulta externa segura e visualização estratégica do relatório.';

  document.getElementById('reportName').textContent =
    data.report?.name || 'Relatório Geral';

  document.getElementById('updateDate').textContent =
    data.lastUpdate?.date || '--/--/----';

  document.getElementById('updateTime').textContent =
    data.lastUpdate?.time || '--:--';

  document.getElementById('headerUpdate').textContent =
    `${data.lastUpdate?.date || '--/--/----'} • ${data.lastUpdate?.time || '--:--'}`;

  configureReportButtons(data.report || {});
  renderRecentProducts(data.recentProducts || []);
}

function configureReportButtons(report) {
  const viewBtn = document.getElementById('viewReportBtn');
  const downloadBtn = document.getElementById('downloadReportBtn');
  const hint = document.getElementById('reportHint');

  const hasUrl = !!(report && report.url && String(report.url).trim());

  if (!hasUrl) {
    viewBtn.classList.add('btn-disabled');
    downloadBtn.classList.add('btn-disabled');
    hint.textContent = 'Nenhum link de relatório configurado no momento.';
    return;
  }

  viewBtn.classList.remove('btn-disabled');
  downloadBtn.classList.remove('btn-disabled');
  hint.textContent = 'Relatório disponível para visualização e download.';
}

function renderRecentProducts(items) {
  const list = document.getElementById('recentProductsList');
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `
      <div class="product-item">
        <div class="product-main">
          <strong>Nenhum novo produto informado</strong>
          <span>Não há itens recentes para exibir no momento.</span>
        </div>
      </div>
    `;
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="product-item">
      <div class="product-main">
        <strong>${escapeHtml(item.modelo || '-')}</strong>
        <span>${escapeHtml(item.categoria || '-')}</span>
      </div>
      <div class="product-date">${escapeHtml(item.data || '-')}</div>
    </div>
  `).join('');
}

function openReport() {
  const url = PORTAL_DATA?.report?.url;

  if (!url) {
    showToast('Nenhum link de relatório configurado.');
    return;
  }

  window.open(url, '_blank');
}

function downloadReport() {
  const url = PORTAL_DATA?.report?.url;

  if (!url) {
    showToast('Nenhum link de relatório configurado.');
    return;
  }

  window.open(url, '_blank');
}

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

function loadPortal() {
  fetch(CONFIG.API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Resposta recebida:', text);
        throw new Error('A API não retornou JSON válido.');
      }
      renderPortal(data);
    })
    .catch(err => {
      console.error(err);
      showToast('Erro ao conectar com API.');
    });
}

document.addEventListener('DOMContentLoaded', function () {
  initializeLoginScreen();
  document.getElementById('appShell').classList.add('hidden');
  loadPortal();

  const loginButton = document.getElementById('loginButton');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const loginUser = document.getElementById('loginUser');
  const loginPassword = document.getElementById('loginPassword');

  if (loginButton) loginButton.addEventListener('click', validateLogin);
  if (togglePasswordBtn) togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

  if (loginUser) {
    loginUser.addEventListener('input', clearLoginError);
    loginUser.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        loginPassword?.focus();
      }
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener('input', clearLoginError);
    loginPassword.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        validateLogin();
      }
    });
  }
});
