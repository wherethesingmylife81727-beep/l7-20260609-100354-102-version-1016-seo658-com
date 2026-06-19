(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-hidden');
            }, { once: true });
        });

        initHero();
        initFilters();
    });

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains('is-active');
        }));
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === active);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                play();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(active);
        play();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilters() {
        var input = document.querySelector('[data-search-input]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var scope = document.querySelector('[data-filter-scope]');
        if (!scope || (!input && !yearFilter)) {
            return;
        }

        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var year = yearFilter ? yearFilter.value : '';
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !year || card.getAttribute('data-year') === year;
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', apply);
        }
        apply();
    }

    window.setupMoviePlayer = function (streamUrl) {
        var video = document.getElementById('moviePlayer');
        var cover = document.getElementById('playerCover');
        var playerReady = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (playerReady) {
                return Promise.resolve();
            }
            playerReady = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1500);
                });
            }

            video.src = streamUrl;
            return Promise.resolve();
        }

        function start() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            prepare().then(function () {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        video.controls = true;
                    });
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
