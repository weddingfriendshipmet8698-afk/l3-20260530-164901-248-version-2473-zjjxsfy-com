(function () {
  const navButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-card-list]').forEach(function (list) {
    const root = list.closest('main') || document;
    const input = root.querySelector('[data-search-input]');
    const year = root.querySelector('[data-year-filter]');
    const cards = Array.from(root.querySelectorAll('[data-card]'));

    function apply() {
      const keyword = normalize(input ? input.value : '');
      const selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        const text = normalize(card.getAttribute('data-text'));
        const cardYear = card.getAttribute('data-year') || '';
        const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchedYear = !selectedYear || cardYear === selectedYear;
        card.hidden = !(matchedKeyword && matchedYear);
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  });

  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    const video = wrap.querySelector('video');
    const button = wrap.querySelector('[data-play-button]');
    const src = wrap.getAttribute('data-stream');
    let hls = null;
    let attached = false;

    function load() {
      if (!video || !src || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      load();
      if (button) {
        button.hidden = true;
      }
      const promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (button) {
            button.hidden = false;
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.hidden = true;
        }
      });
    }
  });
})();
