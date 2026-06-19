(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            menuButton.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var next = hero.querySelector('.hero-next');
        var prev = hero.querySelector('.hero-prev');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });

            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });

        start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (form) {
        var input = form.querySelector('input[type="search"]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));

        function applyFilter() {
            var value = (input.value || '').trim().toLowerCase();

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        input.addEventListener('input', applyFilter);

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            input.value = query;
            applyFilter();
        }
    });
})();
