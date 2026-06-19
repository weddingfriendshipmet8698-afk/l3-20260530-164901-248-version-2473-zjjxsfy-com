(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    document.querySelectorAll("[data-menu-button]").forEach(function (button) {
      var target = document.querySelector(button.getAttribute("data-menu-button"));

      button.addEventListener("click", function () {
        if (!target) {
          return;
        }

        target.classList.toggle("is-open");
      });
    });

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      if (!slides.length) {
        return;
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var scope = document.querySelector(input.getAttribute("data-filter-input"));
      var result = document.querySelector(input.getAttribute("data-filter-result") || "");

      if (!scope) {
        return;
      }

      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));

      input.addEventListener("input", function () {
        var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        var visible = 0;

        items.forEach(function (item) {
          var text = (item.getAttribute("data-search-item") || "").toLowerCase();
          var ok = words.every(function (word) {
            return text.indexOf(word) !== -1;
          });

          item.style.display = ok ? "" : "none";

          if (ok) {
            visible += 1;
          }
        });

        if (result) {
          result.style.display = visible ? "none" : "block";
        }
      });
    });
  });

  window.SitePlayer = {
    attach: function (id, streamUrl) {
      var box = document.getElementById(id);

      if (!box) {
        return;
      }

      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var loaded = false;
      var hls = null;
      var wanted = false;

      if (!video) {
        return;
      }

      function tryPlay() {
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function load() {
        if (loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (wanted) {
              tryPlay();
            }
          });
          return;
        }

        video.src = streamUrl;
      }

      function begin() {
        wanted = true;
        load();

        if (cover) {
          cover.classList.add("is-hidden");
        }

        tryPlay();
      }

      if (cover) {
        cover.addEventListener("click", begin);
      }

      video.addEventListener("click", function () {
        if (!loaded) {
          begin();
        }
      });

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };
})();
