(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  if (prev) prev.addEventListener('click', function () { showSlide(current - 1); });
  if (next) next.addEventListener('click', function () { showSlide(current + 1); });
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () { showSlide(index); });
  });
  if (slides.length > 1) {
    window.setInterval(function () { showSlide(current + 1); }, 5600);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters(scope) {
    var area = scope.querySelector('.filter-area') || document;
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card, .compact-card'));
    var queryInput = scope.querySelector('.movie-search');
    var typeSelect = scope.querySelector('.filter-type');
    var yearSelect = scope.querySelector('.filter-year');
    var categorySelect = scope.querySelector('.filter-category');
    var query = normalize(queryInput && queryInput.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var category = normalize(categorySelect && categorySelect.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category,
        card.dataset.tags,
        card.textContent
      ].join(' '));
      var ok = true;
      if (query && haystack.indexOf(query) === -1) ok = false;
      if (type && normalize(card.dataset.type).indexOf(type) === -1) ok = false;
      if (year && normalize(card.dataset.year) !== year) ok = false;
      if (category && normalize(card.dataset.category) !== category) ok = false;
      card.classList.toggle('is-filtered-out', !ok);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.section-block')).forEach(function (scope) {
    var controls = scope.querySelectorAll('.movie-search, .filter-type, .filter-year, .filter-category');
    if (!controls.length) return;
    Array.prototype.slice.call(controls).forEach(function (control) {
      control.addEventListener('input', function () { applyFilters(scope); });
      control.addEventListener('change', function () { applyFilters(scope); });
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  var globalSearch = document.getElementById('global-search');
  if (q && globalSearch) {
    globalSearch.value = q;
    var block = globalSearch.closest('.section-block');
    if (block) applyFilters(block);
  }
})();
