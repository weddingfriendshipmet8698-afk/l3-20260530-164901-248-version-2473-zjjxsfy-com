(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('.nav-links');

    if (toggle && links) {
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showHero(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === index);
        });

        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === index);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }

        timer = window.setInterval(function () {
            showHero(index + 1);
        }, 5000);
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
        }

        startHero();
    }

    if (slides.length) {
        showHero(0);
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showHero(index - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showHero(index + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showHero(parseInt(dot.getAttribute('data-hero-dot'), 10));
            restartHero();
        });
    });

    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var grid = document.querySelector('[data-filter-grid]');
    var count = document.querySelector('[data-filter-count]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
        if (!grid) {
            return;
        }

        var keyword = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var cards = Array.prototype.slice.call(grid.children);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesType = !type || cardType.indexOf(type) !== -1;
            var matchesRegion = !region || cardRegion === region;
            var isVisible = matchesKeyword && matchesType && matchesRegion;

            card.style.display = isVisible ? '' : 'none';

            if (isVisible) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = visible + ' 部';
        }
    }

    function applySort() {
        if (!grid || !sortSelect) {
            return;
        }

        var value = sortSelect.value;
        var cards = Array.prototype.slice.call(grid.children);

        cards.sort(function (a, b) {
            var ay = parseInt(a.getAttribute('data-year') || '0', 10);
            var by = parseInt(b.getAttribute('data-year') || '0', 10);
            var at = a.getAttribute('data-title') || '';
            var bt = b.getAttribute('data-title') || '';

            if (value === 'year-asc') {
                return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
            }

            if (value === 'title-asc') {
                return at.localeCompare(bt, 'zh-Hans-CN');
            }

            return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
        });

        cards.forEach(function (card) {
            grid.appendChild(card);
        });

        applyFilter();
    }

    [input, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }

    applyFilter();
}());
