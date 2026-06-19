(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!opened));
      panel.hidden = opened;
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards(scope, query) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var normalized = normalize(query);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search") || card.textContent);
      var matched = !normalized || text.indexOf(normalized) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector(".empty-state");
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function setupLocalFilters() {
    var input = document.querySelector(".local-filter-input");
    var scope = document.querySelector(".filter-scope");
    if (!input || !scope) {
      return;
    }
    input.addEventListener("input", function () {
      filterCards(scope, input.value);
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector(".global-search-input");
    var scope = document.querySelector(".global-search-scope");
    if (!input || !scope) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;
    filterCards(scope, keyword);
    input.addEventListener("input", function () {
      filterCards(scope, input.value);
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-hls]");
      var button = player.querySelector(".play-trigger");
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute("data-hls");
      var hls = null;
      var attached = false;

      function markReady() {
        button.classList.add("is-hidden");
      }

      function attemptPlay() {
        markReady();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
            button.querySelector("strong").textContent = "点击播放";
          });
        }
      }

      function startVideo() {
        if (!src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = src;
          }
          attemptPlay();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!attached) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
            hls.on(window.Hls.Events.ERROR, function (_event, data) {
              if (data && data.fatal) {
                button.classList.remove("is-hidden");
                button.querySelector("strong").textContent = "点击重试";
              }
            });
            attached = true;
          } else {
            attemptPlay();
          }
          return;
        }
        if (!video.src) {
          video.src = src;
        }
        attemptPlay();
      }

      button.addEventListener("click", startVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupGlobalSearch();
    setupPlayers();
  });
})();
