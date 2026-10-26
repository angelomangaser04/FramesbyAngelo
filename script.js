(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Starfields: sprinkle twinkling dots into every .stars layer
  document.querySelectorAll('.stars').forEach((layer) => {
    const count = Number(layer.dataset.count) || 30;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i');
      const big = Math.random() < 0.08;
      const size = big ? 5 + Math.random() * 5 : 1 + Math.random() * 2.2;
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty('--o', (0.35 + Math.random() * 0.6).toFixed(2));
      s.style.setProperty('--dur', `${3 + Math.random() * 5}s`);
      s.style.setProperty('--delay', `${-Math.random() * 6}s`);
      if (big) s.className = 'blur';
      frag.appendChild(s);
    }
    layer.appendChild(frag);
  });

  // Mobile nav
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });

  // Scroll reveal with a small stagger between siblings
  const items = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
  } else {
    items.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.setProperty('--rd', `${Math.min(siblings.indexOf(el), 6) * 0.07}s`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  // Hero timeline: sweep the playhead across the tracks, updating the timecode and label
  const timeline = document.querySelector('.timeline');
  const playhead = timeline && timeline.querySelector('.playhead');
  if (playhead) {
    const tc = playhead.querySelector('.tc');
    const kpiTc = document.querySelector('.kpi-tc');
    const label = tc.nextSibling;
    const beats = [[0, ' · Hook lands'], [0.22, ' · AI B-roll drops in'], [0.5, ' · Voiceover kicks in'], [0.78, ' · Captions pop']];
    const LENGTH = 25; // seconds shown on the ruler
    const CYCLE = 12000; // ms per sweep
    const render = (p) => {
      const lane = timeline.querySelector('.clips');
      const start = lane.parentElement.parentElement.offsetLeft + lane.offsetLeft; // .tracks + label column
      const span = lane.offsetWidth;
      playhead.style.transform = `translateX(${start - 52 + p * span}px)`;
      const secs = Math.floor(p * LENGTH);
      tc.textContent = `00:${String(secs).padStart(2, '0')}`;
      if (kpiTc) kpiTc.textContent = tc.textContent;
      label.textContent = beats.filter(([at]) => p >= at).pop()[1];
      playhead.classList.toggle('flip', p > 0.62);
    };
    if (reduceMotion) {
      render(0.12);
    } else {
      let visible = false, t0 = performance.now(), raf = 0;
      const tick = (now) => {
        render(((now - t0) % CYCLE) / CYCLE);
        raf = visible ? requestAnimationFrame(tick) : 0;
      };
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      }).observe(timeline);
      render(0);
    }
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
