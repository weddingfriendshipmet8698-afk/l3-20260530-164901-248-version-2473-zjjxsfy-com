(function () {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
      mobileToggle.textContent = isOpen ? "×" : "☰";
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.dataset.slide || 0));
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const scope = panel.parentElement || document;
    const search = panel.querySelector("[data-filter-search]");
    const year = panel.querySelector("[data-filter-year]");
    const type = panel.querySelector("[data-filter-type]");
    const count = panel.querySelector("[data-result-count]");
    const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-item"));

    function applyFilters() {
      const q = (search && search.value ? search.value : "").trim().toLowerCase();
      const y = year && year.value ? year.value : "";
      const t = type && type.value ? type.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.dataset.search || "").toLowerCase();
        const cardYear = card.dataset.year || "";
        const cardType = card.dataset.type || "";
        const ok = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType.indexOf(t) !== -1);
        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "显示 " + visible + " 个结果";
      }
    }

    [search, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });

  const siteSearch = document.querySelector("[data-site-search]");
  const results = document.querySelector("[data-search-results]");
  const status = document.querySelector("[data-search-status]");
  const tagButtons = Array.from(document.querySelectorAll("[data-search-tag]"));
  let activeTags = [];

  function cardTemplate(movie) {
    const safeTitle = escapeHtml(movie.title);
    const safeLine = escapeHtml(shorten(movie.oneLine, 86));
    const safeCategory = escapeHtml(movie.category);
    const safeRegion = escapeHtml(movie.region);
    const safeYear = escapeHtml(movie.year);
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '  <div class="poster">',
      '    <img src="' + movie.cover + '" alt="' + safeTitle + '" loading="lazy">',
      '    <span class="poster-badge">' + safeYear + '</span>',
      '  </div>',
      '  <div class="card-body">',
      '    <h3>' + safeTitle + '</h3>',
      '    <p>' + safeLine + '</p>',
      '    <div class="card-meta">',
      '      <span>' + safeCategory + '</span>',
      '      <span>' + safeRegion + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function shorten(value, maxLength) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > maxLength ? text.slice(0, maxLength).replace(/[，。；、\s]+$/, "") + "…" : text;
  }

  function updateSearch() {
    if (!siteSearch || !results || !window.SEARCH_MOVIES) {
      return;
    }
    const q = siteSearch.value.trim().toLowerCase();
    const filtered = window.SEARCH_MOVIES.filter(function (movie) {
      const text = [movie.title, movie.oneLine, movie.genre, movie.category, movie.region, movie.type, movie.year, (movie.tags || []).join(" ")].join(" ").toLowerCase();
      const tagOk = activeTags.length === 0 || activeTags.some(function (tag) {
        return (movie.tags || []).indexOf(tag) !== -1;
      });
      return (!q || text.indexOf(q) !== -1) && tagOk;
    }).slice(0, 96);
    results.innerHTML = filtered.map(cardTemplate).join("");
    if (status) {
      status.textContent = filtered.length ? "找到 " + filtered.length + " 个结果" : "没有找到匹配内容";
    }
  }

  if (siteSearch) {
    siteSearch.addEventListener("input", updateSearch);
  }

  tagButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const tag = button.dataset.searchTag || "";
      if (activeTags.indexOf(tag) === -1) {
        activeTags.push(tag);
      } else {
        activeTags = activeTags.filter(function (item) {
          return item !== tag;
        });
      }
      button.classList.toggle("active");
      updateSearch();
    });
  });
})();
