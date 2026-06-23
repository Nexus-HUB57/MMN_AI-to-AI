/* Academ'IA — UX Enhancer
 * Adicionado em todas as páginas via <script src="enhance.js"></script>
 * Funcionalidades:
 *  - Barra de progresso de leitura
 *  - Botão "voltar ao topo"
 *  - Toggle dark/light theme (com persistência em localStorage)
 *  - Breadcrumb automático
 *  - Scroll spy no TOC (highlight do item ativo)
 */

(function() {
  'use strict';

  // === 1. BARRA DE PROGRESSO DE LEITURA ===
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }
  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // === 2. BOTÕES FLUTUANTES ===
  const actions = document.createElement('div');
  actions.className = 'floating-actions';
  actions.innerHTML = `
    <button class="fab fab-tooltip" data-tip="Voltar ao topo" id="fab-top" aria-label="Topo">⬆️</button>
    <button class="fab fab-tooltip" data-tip="Mapa" id="fab-map" aria-label="Mapa">🗺️</button>
    <button class="fab fab-tooltip" data-tip="Glossário" id="fab-glossary" aria-label="Glossário">📖</button>
    <button class="fab fab-tooltip" data-tip="Alternar tema" id="fab-theme" aria-label="Tema">🌓</button>
  `;
  document.body.appendChild(actions);

  document.getElementById('fab-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('fab-map').addEventListener('click', () => {
    window.location.href = 'mapa-academia.html';
  });
  document.getElementById('fab-glossary').addEventListener('click', () => {
    window.location.href = 'glossario.html';
  });

  // === 3. TOGGLE DARK/LIGHT THEME ===
  const themeBtn = document.getElementById('fab-theme');
  
  // Carregar tema salvo
  const savedTheme = localStorage.getItem('academia-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeBtn.textContent = '🌑';
  }
  
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeBtn.textContent = isLight ? '🌑' : '☀️';
    localStorage.setItem('academia-theme', isLight ? 'light' : 'dark');
  });

  // === 4. BREADCRUMB AUTOMÁTICO ===
  // Detecta localização dentro do repo pela URL
  const path = window.location.pathname;
  const breadcrumbs = [];
  
  if (path.includes('/cursos/')) {
    const trilha = path.match(/\/cursos\/([^\/]+)/);
    const curso = path.match(/\/cursos\/[^\/]+\/([^\/]+)\.html/);
    breadcrumbs.push({ name: '🏠 Início', href: '../../index.html' });
    if (trilha) {
      breadcrumbs.push({ name: '📚 Cursos', href: '../../mapa-academia.html' });
      const trilhaNome = trilha[1].charAt(0).toUpperCase() + trilha[1].slice(1);
      breadcrumbs.push({ name: `Trilha ${trilhaNome}`, href: `../${trilha[1]}/` });
    }
    if (curso) {
      breadcrumbs.push({ name: 'Atual', href: null });
    }
  } else if (path.includes('/apostilas/')) {
    breadcrumbs.push({ name: '🏠 Início', href: '../index.html' });
    breadcrumbs.push({ name: '📚 Apostilas', href: '../mapa-academia.html' });
    const apostila = path.match(/\/apostilas\/([^\/]+)\.html/);
    if (apostila) {
      breadcrumbs.push({ name: 'Atual', href: null });
    }
  } else if (path.includes('/webinars/')) {
    breadcrumbs.push({ name: '🏠 Início', href: '../index.html' });
    breadcrumbs.push({ name: '🎥 Webinars', href: '../mapa-academia.html' });
    breadcrumbs.push({ name: 'Atual', href: null });
  } else if (path.includes('mapa-academia.html')) {
    breadcrumbs.push({ name: '🏠 Início', href: 'index.html' });
    breadcrumbs.push({ name: '🗺️ Mapa', href: null });
  } else if (path.includes('glossario.html')) {
    breadcrumbs.push({ name: '🏠 Início', href: 'index.html' });
    breadcrumbs.push({ name: '📖 Glossário', href: null });
  }
  
  if (breadcrumbs.length > 1) {
    const breadcrumbEl = document.createElement('div');
    breadcrumbEl.className = 'breadcrumb';
    breadcrumbEl.innerHTML = breadcrumbs.map((b, i) => {
      if (b.href) {
        return `<a href="${b.href}">${b.name}</a><span class="breadcrumb-sep">›</span>`;
      } else {
        return `<strong>${b.name}</strong>`;
      }
    }).join('');
    
    // Inserir antes do primeiro h1
    const firstH1 = document.querySelector('h1');
    if (firstH1) {
      firstH1.parentNode.insertBefore(breadcrumbEl, firstH1);
    } else {
      document.body.insertBefore(breadcrumbEl, document.body.firstChild);
    }
  }

  // === 5. SCROLL SPY (highlight TOC ativo) ===
  const tocLinks = document.querySelectorAll('#TOC a[href^="#"]');
  if (tocLinks.length > 0) {
    const headings = Array.from(tocLinks).map(link => {
      const id = link.getAttribute('href').slice(1);
      return document.getElementById(id);
    }).filter(Boolean);
    
    function updateTOCActive() {
      const scrollPos = window.scrollY + 100;
      let activeIdx = -1;
      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i] && headings[i].offsetTop <= scrollPos) {
          activeIdx = i;
          break;
        }
      }
      tocLinks.forEach((link, i) => {
        if (i === activeIdx) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
    window.addEventListener('scroll', updateTOCActive);
    updateTOCActive();
  }

  // === 6. EASTER EGG: Ctrl+K abre busca rápida ===
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const query = prompt('🔍 Buscar em todos os cursos/apostilas:');
      if (query) {
        window.location.href = `busca.html?q=${encodeURIComponent(query)}`;
      }
    }
  });

  console.log('✨ Academ\'IA Enhancer carregado. Pressione Ctrl+K para buscar.');
})();