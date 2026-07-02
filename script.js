(() => {
  "use strict";

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('hg-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  if (stored) {
    root.setAttribute('data-theme', stored);
  } else if (prefersLight) {
    root.setAttribute('data-theme', 'light');
  }
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('hg-theme', next);
  });

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Typed role text ---------- */
  const roles = [
    'Software Engineer',
    'Full-Stack Developer',
    'REST API Builder',
    'DSA Problem Solver'
  ];
  const typedEl = document.getElementById('typedRole');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    typedEl.textContent = roles[0];
  } else {
    let roleIndex = 0, charIndex = 0, deleting = false;

    const tick = () => {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    };
    tick();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i % 6 * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window) {
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.style.color = '');
          link.style.color = 'var(--text-primary)';
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => navIo.observe(s));
  }

  /* ---------- Contact form (mailto handoff) ---------- */
  /* ---------- Contact form (Web3Forms — sends directly, no email client needed) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = form.querySelector('.form-submit');
  const submitLabel = submitBtn.querySelector('.btn-label');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    status.classList.remove('error');

    if (!name || !email || !message) {
      status.textContent = 'Please fill in every field before sending.';
      status.classList.add('error');
      return;
    }
    if (!emailPattern.test(email)) {
      status.textContent = 'That email address doesn\'t look right.';
      status.classList.add('error');
      return;
    }

    const accessKey = form.access_key.value;
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE') {
      status.textContent = 'Form isn\'t connected yet — add a Web3Forms access key in index.html.';
      status.classList.add('error');
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';
    status.textContent = '';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Portfolio inquiry from ${name}`,
          name,
          email,
          message,
          botcheck: form.botcheck.checked
        })
      });
      const data = await res.json();

      if (data.success) {
        status.textContent = 'Message sent — thanks for reaching out, I\'ll reply soon.';
        form.reset();
      } else {
        status.textContent = 'Something went wrong. Please try again or email me directly.';
        status.classList.add('error');
      }
    } catch (err) {
      status.textContent = 'Network error — please try again or email me directly.';
      status.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = 'Send Message';
    }
  });

})();
