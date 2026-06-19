(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            nav.classList.toggle("open", !expanded);
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll(".filter-area"));
        areas.forEach(function (area) {
            var search = area.querySelector(".js-search");
            var year = area.querySelector(".js-select-year");
            var genre = area.querySelector(".js-select-genre");
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
            function apply() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var genreValue = genre ? genre.value : "";
                cards.forEach(function (card) {
                    var searchText = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardGenre = card.getAttribute("data-genre") || "";
                    var matched = true;
                    if (query && searchText.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (genreValue && cardGenre.indexOf(genreValue) === -1) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                });
            }
            [search, year, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            if (!video || !cover) {
                return;
            }
            var url = video.getAttribute("data-url");
            var prepared = false;
            var hls = null;
            function prepare() {
                if (prepared || !url) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            function start() {
                prepare();
                cover.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var playback = video.play();
                if (playback && typeof playback.catch === "function") {
                    playback.catch(function () {});
                }
            }
            cover.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!prepared) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
})();
