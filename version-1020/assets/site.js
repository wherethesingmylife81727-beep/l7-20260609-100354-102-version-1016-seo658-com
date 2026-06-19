(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.hidden = isOpen;
      toggle.textContent = isOpen ? '☰' : '×';
    });
  }

  function setupCategoryFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var container = scope.closest('.filter-wrap') || document;
      var searchInput = scope.querySelector('[data-card-search]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var clearButton = scope.querySelector('[data-clear-filters]');
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
      var counter = container.querySelector('[data-filter-count]');

      function applyFilters() {
        var keyword = normalize(searchInput && searchInput.value);
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
          var content = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.keywords
          ].join(' '));
          var matchKeyword = !keyword || content.indexOf(keyword) !== -1;
          var matchYear = !year || card.dataset.year === year;
          var matchType = !type || card.dataset.type === type;
          var visible = matchKeyword && matchYear && matchType;
          card.hidden = !visible;
          if (visible) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = '当前显示 ' + visibleCount + ' 部影片';
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', applyFilters);
      }
      if (clearButton) {
        clearButton.addEventListener('click', function () {
          if (searchInput) {
            searchInput.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          applyFilters();
        });
      }
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeAttribute(movie.url) + '" aria-label="观看 ' + escapeAttribute(movie.title) + '">',
      '    <img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">',
      '    <span class="poster-gradient"></span>',
      '    <span class="poster-badge">' + escapeHtml(movie.year || '') + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="' + escapeAttribute(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-info-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '    <div class="tag-list">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var resultsNode = document.querySelector('[data-search-results]');
    if (!resultsNode || !window.MOVIE_INDEX) {
      return;
    }

    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function runSearch(value) {
      var keyword = normalize(value);
      var movies = window.MOVIE_INDEX;
      var matched = keyword ? movies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.summary
        ].join(' '));
        return haystack.indexOf(keyword) !== -1;
      }) : movies.slice(0, 120);

      if (title) {
        title.textContent = keyword ? '“' + value + '”的搜索结果（' + matched.length + '）' : '默认展示最新影片';
      }

      resultsNode.innerHTML = matched.slice(0, 240).map(createSearchCard).join('');
      if (!matched.length) {
        resultsNode.innerHTML = '<p class="empty-result">没有找到匹配影片，可换一个关键词继续搜索。</p>';
      }
    }

    runSearch(query);

    if (input) {
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function loadHlsLibrary(callback, onError) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      existing.addEventListener('error', onError, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.dataset.hlsLoader = 'true';
    script.addEventListener('load', callback, { once: true });
    script.addEventListener('error', onError, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var playerShells = document.querySelectorAll('.player-shell[data-video-src]');
    playerShells.forEach(function (shell) {
      var button = shell.querySelector('.player-overlay');
      var video = shell.querySelector('video');
      var status = shell.parentElement ? shell.parentElement.querySelector('.player-status') : null;
      var source = shell.dataset.videoSrc;
      var title = shell.dataset.videoTitle || '影片';

      if (!button || !video || !source) {
        return;
      }

      function updateStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        button.disabled = true;
        button.classList.add('is-loading');
        updateStatus('正在加载播放源：' + title);

        function startNativePlayback() {
          video.src = source;
          video.play().catch(function () {
            updateStatus('播放源已加载，请点击播放器中的播放按钮。');
          });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          startNativePlayback();
          shell.classList.add('is-playing');
          updateStatus('播放源已加载。');
          return;
        }

        loadHlsLibrary(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              shell.classList.add('is-playing');
              video.play().catch(function () {
                updateStatus('播放源已加载，请点击播放器中的播放按钮。');
              });
              updateStatus('播放源已加载。');
            });
            hls.on(window.Hls.Events.ERROR, function () {
              updateStatus('播放源加载遇到网络或浏览器限制，请稍后重试。');
            });
          } else {
            startNativePlayback();
            shell.classList.add('is-playing');
          }
        }, function () {
          startNativePlayback();
          shell.classList.add('is-playing');
          updateStatus('HLS 兼容库加载失败，已尝试使用浏览器原生播放。');
        });
      }

      button.addEventListener('click', playVideo);
    });
  }

  ready(function () {
    setupMobileMenu();
    setupCategoryFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
