(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
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

    function initFiltering() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var activeFilter = "全部";

            function update() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var search = (card.getAttribute("data-search") || "").toLowerCase();
                    var filter = card.getAttribute("data-filter") || "";
                    var matchesQuery = !query || search.indexOf(query) !== -1;
                    var matchesFilter = activeFilter === "全部" || filter.indexOf(activeFilter) !== -1;
                    var shouldShow = matchesQuery && matchesFilter;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", update);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter-value") || "全部";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    update();
                });
            });
            update();
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        ready(function () {
            var shell = document.getElementById("moviePlayer");
            var video = document.getElementById("movieVideo");
            if (!shell || !video || !sourceUrl) {
                return;
            }
            var overlay = shell.querySelector("[data-player-toggle]");
            var loading = shell.querySelector("[data-player-loading]");
            var errorBox = shell.querySelector("[data-player-error]");
            var hls = null;
            var initialized = false;

            function setLoading(state) {
                if (loading) {
                    loading.classList.toggle("is-visible", state);
                }
            }

            function showError() {
                if (errorBox) {
                    errorBox.textContent = "视频加载失败，请稍后再试";
                    errorBox.classList.add("is-visible");
                }
                setLoading(false);
            }

            function hideOverlay() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.controls = true;
            }

            function playVideo() {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            function initialize() {
                if (initialized) {
                    playVideo();
                    return;
                }
                initialized = true;
                setLoading(true);
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setLoading(false);
                        hideOverlay();
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                    video.addEventListener("loadedmetadata", function () {
                        setLoading(false);
                        hideOverlay();
                        playVideo();
                    }, { once: true });
                    video.addEventListener("error", showError, { once: true });
                    video.load();
                } else {
                    showError();
                }
            }

            if (overlay) {
                overlay.addEventListener("click", initialize);
            }
            video.addEventListener("click", function () {
                if (!initialized) {
                    initialize();
                }
            });
            video.addEventListener("play", hideOverlay);
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        initMobileMenu();
        initHero();
        initFiltering();
    });
}());
