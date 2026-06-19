(function () {
    const video = document.getElementById("movie-player");
    const overlay = document.getElementById("play-overlay");

    if (!video || !overlay || typeof playerSource !== "string") {
        return;
    }

    let attached = false;
    let hls = null;

    const attachSource = function () {
        if (attached) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playerSource;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(playerSource);
            hls.attachMedia(video);
        } else {
            video.src = playerSource;
        }

        attached = true;
    };

    const startPlayback = function () {
        attachSource();
        const playResult = video.play();

        if (playResult && typeof playResult.then === "function") {
            playResult.then(function () {
                overlay.classList.add("is-hidden");
            }).catch(function () {
                overlay.classList.remove("is-hidden");
            });
        } else {
            overlay.classList.add("is-hidden");
        }
    };

    overlay.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
        overlay.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
