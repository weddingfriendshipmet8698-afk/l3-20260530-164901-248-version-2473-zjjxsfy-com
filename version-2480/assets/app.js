
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('[data-site-nav]');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  const search = document.querySelector('[data-search]');
  const cards = Array.from(document.querySelectorAll('[data-title]'));
  const chips = Array.from(document.querySelectorAll('[data-chip]'));
  function matches(card, query, mode) {
    const hay = `${card.dataset.title || ''} ${card.dataset.tags || ''} ${card.dataset.year || ''} ${card.dataset.type || ''}`.toLowerCase();
    if (mode && mode !== 'all') {
      const type = (card.dataset.type || '').toLowerCase();
      if (!type.includes(mode.toLowerCase())) return false;
    }
    if (!query) return true;
    return hay.includes(query.toLowerCase());
  }
  let activeMode = 'all';
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeMode = chip.dataset-chip || chip.dataset.chip || 'all';
      runFilter();
    });
  });
  function runFilter() {
    const q = search ? search.value.trim() : '';
    cards.forEach(card => {
      const show = matches(card, q, activeMode);
      card.classList.toggle('hidden', !show);
    });
  }
  if (search) search.addEventListener('input', runFilter);

  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  if (slides.length > 1) {
    let idx = 0;
    slides.forEach((s, i) => s.classList.toggle('active', i === 0));
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 5200);
  }

  document.querySelectorAll('video[data-hls]').forEach(video => {
    const src = video.dataset.hls;
    const overlay = video.parentElement?.querySelector('.play-overlay');
    const activateOverlay = () => overlay && overlay.classList.add('hidden');
    const play = async () => {
      try {
        activateOverlay();
        await video.play();
      } catch (e) {
        console.warn(e);
      }
    };
    if (overlay) overlay.addEventListener('click', play);
    video.addEventListener('click', play);
    video.addEventListener('play', activateOverlay);
    if (window.Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {});
    } else {
      video.src = src;
    }
  });
});
