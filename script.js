// ===== TYPED ROLE =====
(function () {
  const roles = [
    'Creative Developer',
    'UI / UX Designer',
    'Front-End Engineer',
    'Digital Artist',
  ];
  const el = document.getElementById('typedRole');
  let ri = 0, ci = 0, deleting = false;

  function type() {
    const word = roles[ri];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(type, deleting ? 60 : 100);
  }
  type();
})();

// ===== HAMBURGER MENU =====
(function () {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

// ===== NAVBAR ACTIVE ON SCROLL =====
(function () {
  const tabs = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    tabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('href') === '#' + current);
    });
  });
})();

// ===== SKILL BAR INTERSECTION OBSERVER =====
(function () {
  const fills = document.querySelectorAll('.skill-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.style.animationPlayState = 'running';
    });
  }, { threshold: 0.3 });
  fills.forEach(f => {
    f.style.animationPlayState = 'paused';
    obs.observe(f);
  });
})();

// ===== CONTACT FORM =====
(function () {
  const form   = document.getElementById('contactForm');
  const btn    = document.getElementById('contactSubmit');
  const status = document.getElementById('formStatus');
  if (!form) return;

  document.getElementById('formRedirect').value = window.location.href;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = '';
    status.className = 'form-status';

    const payload = {
      accessKey: 'sf_9052ce3189767b862cdffd0c',
      name:      form.name.value.trim(),
      email:     form.email.value.trim(),
      message:   form.message.value.trim(),
    };

    try {
      const res  = await fetch('https://api.staticforms.dev/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        status.textContent = "Message sent! I'll get back to you soon.";
        status.classList.add('success');
        form.reset();
      } else {
        status.textContent = data.message || 'Something went wrong. Try again.';
        status.classList.add('error');
      }
    } catch {
      status.textContent = 'Network error. Please try again.';
      status.classList.add('error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message \u2197';
    }
  });
})();

// ===== PROJECTS — load from API, replace static cards only if DB has entries =====
(function () {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  fetch('/api/projects')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(projects => {
      if (!projects.length) return;
      const colors = ['--red', '--yellow', '--violet'];
      grid.innerHTML = projects.map((p, i) => `
        <div class="neo-card project-card">
          <div class="thumb-placeholder thumb-placeholder${colors[i % 3]}"><span>${p.emoji || '\uD83C\uDF10'}</span></div>
          <div class="project-body">
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-tags">${(p.tags || []).map(t => `<span class="ptag">${t}</span>`).join('')}</div>
            <div class="project-links">
              ${p.live_url ? `<a href="${p.live_url}" target="_blank" rel="noopener noreferrer" class="btn-primary small">Live \u2197</a>` : ''}
              ${p.code_url ? `<a href="${p.code_url}" target="_blank" rel="noopener noreferrer" class="btn-outline small">Code</a>` : ''}
            </div>
          </div>
        </div>`).join('');
    })
    .catch(() => {});
})();

// ===== SUPPORT — UPI COPY =====
(function () {
  const copyBtn = document.getElementById('copyUpi');
  const upiEl   = document.getElementById('upiId');
  if (!copyBtn || !upiEl) return;
  const upiId = upiEl.textContent.trim();

  copyBtn.addEventListener('click', () => {
    const fallback = () => {
      const el = document.createElement('textarea');
      el.value = upiId;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    };
    (navigator.clipboard ? navigator.clipboard.writeText(upiId) : Promise.reject())
      .catch(fallback)
      .finally(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 2000);
      });
  });
})();

// ===== RETRO MUSIC PLAYER =====
(function () {
  const player     = document.getElementById('retroPlayer');
  const pill       = document.getElementById('retroPill');
  const vibeBtn    = document.getElementById('vibeBtn');
  const closeBtn   = document.getElementById('playerClose');
  const minBtn     = document.getElementById('playerMinimise');
  const audio      = document.getElementById('retroAudio');
  const playBtn    = document.getElementById('retroPlay');
  const prevBtn    = document.getElementById('retroPrev');
  const nextBtn    = document.getElementById('retroNext');
  const shuffleBtn = document.getElementById('retroShuffle');
  const repeatBtn  = document.getElementById('retroRepeat');
  const progress   = document.getElementById('retroProgress');
  const volSlider  = document.getElementById('retroVolume');
  const trackTitle = document.getElementById('retroTrackTitle');
  const curTime    = document.getElementById('retroCurrent');
  const durTime    = document.getElementById('retroDuration');
  const tracklist  = document.getElementById('retroTracklist');
  if (!player || !vibeBtn || !audio) return;

  const tracks = [
    { name: 'Akatsuki',      file: 'Sm.music/Akatsuki(256k).mp3' },
    { name: 'Champions',     file: 'Sm.music/Champions(256k).mp3' },
    { name: 'Khatta Flow',   file: 'Sm.music/Khatta_Flow_-_Seedhe_Maut_ft_KR$NA(256k).mp3' },
    { name: 'KODAK (King)',  file: 'Sm.music/KODAK___King___@SeedheMaut___MM___Official_Music_Video(256k).mp3' },
    { name: 'Hola Amigo',    file: 'Sm.music/KR$NA_ft._Seedhe_Maut_-_Hola_Amigo___Official_Music_Video(256k).mp3' },
    { name: 'Luka Chippi',   file: 'Sm.music/Luka_Chippi(256k).mp3' },
    { name: 'Naksha',        file: 'Sm.music/Naksha(256k).mp3' },
    { name: 'Nanchaku',      file: 'Sm.music/Nanchaku(256k).mp3' },
    { name: '11K',           file: 'Sm.music/Seedhe_Maut_-_11K(256k).mp3' },
    { name: 'Raat ki Rani',  file: 'Sm.music/Seedhe_Maut_-_Raat_ki_Rani____Shakti____dl91(256k).mp3' },
    { name: 'TT / Shutdown', file: 'Sm.music/Seedhe_Maut_-_TT___Shutdown(256k).mp3' },
    { name: 'SHUTDOWN',      file: 'Sm.music/SHUTDOWN(256k).mp3' },
  ];

  let current  = 0;
  let shuffled = false;
  let repeated = false;

  function fmt(s) {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    return m + ':' + sec;
  }

  function buildTracklist() {
    tracklist.innerHTML = tracks.map((t, i) =>
      '<div class="retro-track' + (i === current ? ' active' : '') + '" data-index="' + i + '">' +
        '<span class="retro-track-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="retro-track-name">' + t.name + '</span>' +
      '</div>'
    ).join('');
    tracklist.querySelectorAll('.retro-track').forEach(el => {
      el.addEventListener('click', () => loadTrack(+el.dataset.index, true));
    });
  }

  function updateTracklistActive() {
    tracklist.querySelectorAll('.retro-track').forEach((el, i) => {
      el.classList.toggle('active', i === current);
    });
    const activeEl = tracklist.querySelector('.retro-track.active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  function loadTrack(index, autoplay) {
    current = index;
    audio.src = tracks[index].file;
    audio.volume = +volSlider.value;
    trackTitle.textContent = tracks[index].name.toUpperCase();
    progress.value = 0;
    curTime.textContent = '0:00';
    durTime.textContent = '0:00';
    updateTracklistActive();
    if (autoplay) { audio.play(); setPlaying(true); }
  }

  function setPlaying(playing) {
    playBtn.textContent = playing ? '\u23F8' : '\u25B6';
    player.classList.toggle('paused', !playing);
  }

  function playNext() {
    const next = shuffled
      ? Math.floor(Math.random() * tracks.length)
      : (current + 1) % tracks.length;
    loadTrack(next, true);
  }

  function playPrev() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    loadTrack((current - 1 + tracks.length) % tracks.length, true);
  }

  buildTracklist();
  loadTrack(0, false);

  playBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play(); setPlaying(true); }
    else              { audio.pause(); setPlaying(false); }
  });
  nextBtn.addEventListener('click', playNext);
  prevBtn.addEventListener('click', playPrev);
  shuffleBtn.addEventListener('click', () => {
    shuffled = !shuffled;
    shuffleBtn.classList.toggle('active', shuffled);
  });
  repeatBtn.addEventListener('click', () => {
    repeated = !repeated;
    audio.loop = repeated;
    repeatBtn.classList.toggle('active', repeated);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
    curTime.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', () => {
    durTime.textContent = fmt(audio.duration);
  });
  audio.addEventListener('ended', () => { if (!repeated) playNext(); });

  progress.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
  });
  volSlider.addEventListener('input', () => { audio.volume = +volSlider.value; });

  vibeBtn.addEventListener('click',  () => { player.hidden = false; pill.hidden = true; });
  pill.addEventListener('click',     () => { player.hidden = false; pill.hidden = true; });
  minBtn.addEventListener('click',   () => { player.hidden = true;  pill.hidden = false; });
  closeBtn.addEventListener('click', () => {
    audio.pause();
    setPlaying(false);
    player.hidden = true;
    pill.hidden   = true;
  });
})();
