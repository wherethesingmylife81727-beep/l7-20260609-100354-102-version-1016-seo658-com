(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    const showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }
  }

  const localFilter = document.querySelector('[data-local-filter]');
  if (localFilter) {
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-empty-state]');
    localFilter.addEventListener('input', function () {
      const keyword = localFilter.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-text') || '').toLowerCase();
        const matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  const searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.SEARCH_MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim().toLowerCase();
    const input = document.querySelector('[data-search-input]');
    if (input) {
      input.value = params.get('q') || '';
    }
    if (query) {
      const matched = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.text.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 120);
      searchResults.innerHTML = matched.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="./' + movie.file + '">' +
          '<img src="./' + movie.image + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
          '<span class="score-badge">★ ' + movie.rating + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.description) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
      const empty = document.querySelector('[data-empty-state]');
      if (empty) {
        empty.classList.toggle('is-visible', matched.length === 0);
      }
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
