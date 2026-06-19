(function () {
  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  if (header) {
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (menuToggle && header) {
    menuToggle.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
  }

  var carousel = document.querySelector(".hero-carousel");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    showSlide(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupFiltering(scope) {
    var input = scope.querySelector("[data-card-search-input]");
    var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-category]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = scope.querySelector("[data-empty-state]");
    var activeCategory = "all";

    if (!cards.length) {
      return;
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var category = card.getAttribute("data-category") || "";
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = activeCategory === "all" || category === activeCategory;
        var show = matchText && matchCategory;
        card.classList.toggle("hidden-card", !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        input.value = initial;
      }
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-filter-category") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(setupFiltering);

  Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-cover");
    var startButton = player.querySelector(".player-start");
    var source = video ? video.querySelector("source") : null;
    var stream = source ? source.src : "";
    var initialized = false;
    var hlsInstance = null;

    function beginPlayback() {
      if (!video || !stream) {
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (!initialized) {
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener("click", beginPlayback);
    }

    if (overlay) {
      overlay.addEventListener("click", beginPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!initialized) {
          beginPlayback();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
