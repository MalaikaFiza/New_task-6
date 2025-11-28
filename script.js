/* =========================
   Task 6 front-end script
   - dynamic loading
   - API fetch
   - nav behaviour + scrollspy
   - smooth scroll
   - contact form validation
   - reveal on scroll
   ========================= */

/* Mobile menu toggle */
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('main-nav');
menuToggle?.addEventListener('click', () => {
  nav.classList.toggle('active');
});

/* Scrollspy / active nav highlight */
function setActiveNavOnScroll(){
  const links = document.querySelectorAll('.nav-link');
  const sections = [...document.querySelectorAll('main section[id]')];
  const fromTop = window.scrollY + 80;

  let currentId = '';
  sections.forEach(sec => {
    if (sec.offsetTop <= fromTop) currentId = sec.id;
  });

  links.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    // compare hash or anchor to currentId
    if (href.includes('#') && href.split('#')[1] === currentId) {
      a.classList.add('active');
    } else if (!href.includes('#') && currentId === '' && href.includes('index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}
window.addEventListener('scroll', setActiveNavOnScroll);
window.addEventListener('load', setActiveNavOnScroll);

/* Smooth scroll for same-page anchors */
document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(link => {
  link.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if (href.includes('contact.html') || href.includes('about.html')) return;
    const id = href.split('#')[1];
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // close mobile nav
      nav.classList.remove('active');
    }
  });
});

/* Reveal on scroll (simple) */
const revealEls = document.querySelectorAll('.service-card, .project-card, .hero-text');
revealEls.forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(12px)';
  el.style.transition = 'transform .7s ease, opacity .7s ease';
});
function revealOnScroll(){
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

/* -------------------------
   Dynamic content loading
   - loads services and portfolio from data.json
   ------------------------- */
async function loadDynamicContent() {
  try {
    const res = await fetch('data.json');
    const data = await res.json();

    // About
    const about = document.getElementById('about-content');
    const aboutPage = document.getElementById('about-content-page');
    if (about) about.innerHTML = `<h2>About Me</h2><p>${escapeHtml(data.about.preview)}</p><a class="btn ghost" href="about.html">Read more</a>`;
    if (aboutPage) aboutPage.innerHTML = `<h2>About Me</h2><p>${escapeHtml(data.about.full)}</p>`;

    // Services
    const servicesContainer = document.getElementById('services-container');
    if (servicesContainer) {
      servicesContainer.innerHTML = data.services.map(s => `
        <article class="service-card">
          <img src="${s.icon}" alt="${escapeHtml(s.title)}" style="width:48px;height:48px;margin-bottom:10px;">
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.desc)}</p>
        </article>
      `).join('');
      // trigger reveal
      setTimeout(()=> document.querySelectorAll('.service-card').forEach(el=>el.classList.add('visible')), 80);
    }

    // Portfolio
    const portfolioContainer = document.getElementById('portfolio-container');
    if (portfolioContainer) {
      portfolioContainer.innerHTML = data.portfolio.map(p => `
        <div class="project-card">
          <img src="${p.img}" alt="${escapeHtml(p.title)}">
          <div class="project-info">
            <h4>${escapeHtml(p.title)}</h4>
            <p>${escapeHtml(p.desc)}</p>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load data.json', err);
  }
}
loadDynamicContent();

/* -------------------------
   External API integration (quotes)
   - uses public quotes API
   ------------------------- */
const quotesContainer = document.getElementById('quotes-container');
if (quotesContainer) {
  fetch('https://type.fit/api/quotes')
    .then(r => r.json())
    .then(list => {
      const small = list.slice(0,3);
      quotesContainer.innerHTML = small.map(q => `<blockquote>"${escapeHtml(q.text)}" — ${escapeHtml(q.author || 'Unknown')}</blockquote>`).join('');
    })
    .catch(() => {
      quotesContainer.textContent = 'Unable to load quotes at the moment.';
    });
}

/* -------------------------
   Contact form - real-time validation & submit simulation
   ------------------------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const status = document.getElementById('form-status');
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const msgEl = document.getElementById('message');

  function validate() {
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const msg = msgEl.value.trim();
    if (!name || !email || !msg) {
      status.textContent = 'Please fill all required fields.';
      status.style.color = '#b91c1c';
      return false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.style.color = '#b91c1c';
      return false;
    }
    status.textContent = '';
    return true;
  }

  nameEl?.addEventListener('input', validate);
  emailEl?.addEventListener('input', validate);
  msgEl?.addEventListener('input', validate);

  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    if (!validate()) return;
    // simulated submit (front-end only)
    status.textContent = 'Message sent successfully — thank you!';
    status.style.color = '#065f46';
    contactForm.reset();
  });
}

/* -------------------------
   Helpers
   ------------------------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
}
