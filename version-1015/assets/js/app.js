(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;

        const showSlide = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const chips = Array.from(document.querySelectorAll("[data-filter-term]"));

    if (filterInput && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");

        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        const normalize = function (value) {
            return String(value || "").trim().toLowerCase();
        };

        const applyFilter = function () {
            const query = normalize(filterInput.value);
            cards.forEach(function (card) {
                const haystack = normalize(card.getAttribute("data-search"));
                card.hidden = query && !haystack.includes(query);
            });
        };

        filterInput.addEventListener("input", applyFilter);

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                const value = chip.getAttribute("data-filter-term") || "";
                filterInput.value = value;
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                applyFilter();
            });
        });

        applyFilter();
    }
})();
