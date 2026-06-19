(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var query = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-keywords') || card.textContent);
      var category = card.getAttribute('data-category') || '';
      var queryMatch = !query || text.indexOf(query) !== -1;
      var filterMatch = activeFilter === 'all' || category === activeFilter;
      var show = queryMatch && filterMatch;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-chip') || 'all';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      filterCards();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-video-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var attached = false;
    var hls = null;

    function attachStream() {
      if (!video || attached) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          player.classList.add('is-playing');
        }).catch(function () {
          player.classList.remove('is-playing');
        });
      } else {
        player.classList.add('is-playing');
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
