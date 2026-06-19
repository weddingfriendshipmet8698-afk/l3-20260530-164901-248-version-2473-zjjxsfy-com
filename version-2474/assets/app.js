(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNav() {
        var button = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                move(1);
                restart();
            });
        }
        restart();
    }

    function setupSearch() {
        var input = document.querySelector('[data-search-input]');
        var clear = document.querySelector('[data-search-clear]');
        var chips = selectAll('[data-filter-value]');
        var cards = selectAll('[data-movie-card]');
        if (!input || !cards.length) {
            return;
        }
        var filterValue = '';

        function apply() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var source = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
                var matchedText = !query || source.indexOf(query) !== -1;
                var matchedFilter = !filterValue || source.indexOf(filterValue.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchedText && matchedFilter));
            });
        }

        input.addEventListener('input', apply);
        if (clear) {
            clear.addEventListener('click', function () {
                input.value = '';
                input.focus();
                apply();
            });
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                filterValue = chip.getAttribute('data-filter-value') || '';
                apply();
            });
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var trigger = document.getElementById('play-trigger');
        var overlay = document.querySelector('.player-overlay');
        if (!video || !streamUrl) {
            return;
        }
        var started = false;
        var hls = null;

        function start() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            if (overlay) {
                overlay.style.display = 'none';
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 60,
                    enableWorker: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            video.controls = true;
            video.play().catch(function () {
                video.controls = true;
            });
        }

        if (trigger) {
            trigger.addEventListener('click', start);
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupSearch();
    });
})();
