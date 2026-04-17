/* ============================================================
   NeuraTwin.in — Shared JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile Nav ─────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');

  hamburger?.addEventListener('click', () => mobileNav?.classList.add('open'));
  mobileClose?.addEventListener('click', () => mobileNav?.classList.remove('open'));
  mobileNav?.addEventListener('click', e => {
    if (e.target === mobileNav) mobileNav.classList.remove('open');
  });

  /* ── Back to Top ────────────────────────────────────── */
  const backTop = document.querySelector('.back-top');
  window.addEventListener('scroll', () => {
    if (backTop) {
      backTop.classList.toggle('visible', window.scrollY > 300);
    }
  });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Accordion ──────────────────────────────────────── */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item   = header.closest('.accordion-item');
      const body   = item.querySelector('.accordion-body');
      const isOpen = header.classList.contains('open');

      // Close all siblings
      item.closest('.accordion-group')?.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('open');
        h.nextElementSibling?.classList.remove('open');
      });

      if (!isOpen) {
        header.classList.add('open');
        body?.classList.add('open');
      }
    });
  });

  /* ── Tabs ───────────────────────────────────────────── */
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        const paneGroup = tabGroup.closest('.tab-wrapper') || document;

        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        paneGroup.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        paneGroup.querySelector(`#${target}`)?.classList.add('active');
      });
    });
  });

  /* ── Filter Tags ────────────────────────────────────── */
  document.querySelectorAll('.filter-tags').forEach(group => {
    group.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const multi = group.dataset.multi === 'true';
        if (!multi) group.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
        tag.classList.toggle('active');
        filterContent(group);
      });
    });
  });

  function filterContent(group) {
    const active = [...group.querySelectorAll('.tag.active')].map(t => t.dataset.filter);
    if (!active.length) return;

    const container = document.querySelector(group.dataset.target);
    if (!container) return;

    container.querySelectorAll('[data-categories]').forEach(item => {
      const cats = (item.dataset.categories || '').split(',');
      const match = active.includes('all') || active.some(a => cats.includes(a));
      item.style.display = match ? '' : 'none';
    });
  }

  /* ── Header search ──────────────────────────────────── */
  const headerSearchInput = document.querySelector('.header-search input');
  headerSearchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = headerSearchInput.value.trim();
      if (q) window.location.href = `policy-library.html?q=${encodeURIComponent(q)}`;
    }
  });

  /* ── Inline Search Filter ───────────────────────────── */
  document.querySelectorAll('[data-search-input]').forEach(input => {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      const target = document.querySelector(input.dataset.searchInput);
      if (!target) return;
      target.querySelectorAll('[data-search-text]').forEach(item => {
        const text = (item.dataset.searchText || item.textContent).toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  });

  /* ── Animate stats counters ─────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1400;
      const step = end / (dur / 16);
      let cur = 0;
      const timer = setInterval(() => {
        cur = Math.min(cur + step, end);
        el.textContent = Math.floor(cur).toLocaleString('en-IN') + (el.dataset.suffix || '');
        if (cur >= end) clearInterval(timer);
      }, 16);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => io.observe(c));

  /* ── Sticky header shadow ───────────────────────────── */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  });

  /* ── Active nav link ────────────────────────────────── */
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  /* ── TCO Calculator (tech-evaluator.html) ───────────── */
  const tcoForm = document.getElementById('tco-form');
  tcoForm?.addEventListener('input', calcTCO);
  function calcTCO() {
    const users    = parseInt(document.getElementById('tco-users')?.value || 0);
    const years    = parseInt(document.getElementById('tco-years')?.value || 3);
    const propSel  = document.querySelector('input[name="stack"]:checked')?.value || 'open';

    let costs = { licence:0, impl:0, training:0, support:0, infra:0 };
    if (propSel === 'proprietary') {
      costs = { licence: users*18000*years, impl:2500000, training:800000, support:users*3500*years, infra:1200000*years };
    } else {
      costs = { licence: 0, impl:1500000, training:600000, support:users*1800*years, infra:800000*years };
    }
    const total = Object.values(costs).reduce((a,b) => a+b, 0);
    const fmt = n => '₹' + n.toLocaleString('en-IN');

    document.getElementById('tco-licence')?.textContent && (document.getElementById('tco-licence').textContent = fmt(costs.licence));
    document.getElementById('tco-impl')?.textContent    && (document.getElementById('tco-impl').textContent    = fmt(costs.impl));
    document.getElementById('tco-training')?.textContent && (document.getElementById('tco-training').textContent = fmt(costs.training));
    document.getElementById('tco-support')?.textContent && (document.getElementById('tco-support').textContent   = fmt(costs.support));
    document.getElementById('tco-infra')?.textContent   && (document.getElementById('tco-infra').textContent    = fmt(costs.infra));
    document.getElementById('tco-total')?.textContent   && (document.getElementById('tco-total').textContent    = fmt(total));
  }

  /* ── Print page ─────────────────────────────────────── */
  document.querySelectorAll('[data-print]').forEach(btn => {
    btn.addEventListener('click', () => window.print());
  });

  /* ── Notification bar dismiss ───────────────────────── */
  document.querySelectorAll('.notice-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.notice-bar')?.remove());
  });

});

/* ── Shared nav HTML generator (call in each page) ─────── */
function renderNav(activeModule) {
  // Handled by inline HTML — this is a stub for future dynamic rendering
}
