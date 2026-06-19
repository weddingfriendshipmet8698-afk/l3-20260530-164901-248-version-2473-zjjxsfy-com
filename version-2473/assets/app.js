(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.textContent
        ].join(" ").toLowerCase();
    }

    function updateScope(scope) {
        var input = scope.querySelector("[data-search]");
        var list = scope.querySelector("[data-card-list]") || document;
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        var activeButton = scope.querySelector("[data-filter-group] .active");
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var filter = activeButton ? activeButton.getAttribute("data-filter-value") : "all";
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = textOf(card);
            var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
            var filterOk = filter === "all" || haystack.indexOf(filter.toLowerCase()) !== -1;
            var visible = keywordOk && filterOk;
            card.classList.toggle("is-hidden", !visible);
            if (visible) {
                shown += 1;
            }
        });

        var count = scope.querySelector("[data-result-count]");
        if (count) {
            count.textContent = "当前显示 " + shown + " 部";
        }
    }

    function setupSearch() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search]");
            if (input) {
                input.addEventListener("input", function () {
                    updateScope(scope);
                });
            }

            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-group] button"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    button.classList.add("active");
                    updateScope(scope);
                });
            });

            if (scope.querySelector("[data-result-count]")) {
                updateScope(scope);
            }
        });
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    window.initMoviePlayer = function (url) {
        var video = document.querySelector("[data-player]");
        var button = document.querySelector("[data-play-button]");
        var shell = document.querySelector(".player-shell");
        var attached = false;

        if (!video || !button) {
            return;
        }

        function attach() {
            if (!attached) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
                attached = true;
            }

            if (shell) {
                shell.classList.add("is-playing");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        button.addEventListener("click", attach);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                attach();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
}());
