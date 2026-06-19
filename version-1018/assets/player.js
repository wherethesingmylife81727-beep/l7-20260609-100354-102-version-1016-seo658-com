(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-video');
        var layer = document.querySelector('.play-layer');
        var frame = document.querySelector('.player-frame');
        var hls = null;
        var started = false;

        if (!video || !layer || !frame || !streamUrl) {
            return;
        }

        function attachStream() {
            if (started) {
                return;
            }

            started = true;
            layer.classList.add('is-hidden');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        layer.addEventListener('click', attachStream);

        video.addEventListener('click', function () {
            if (!started) {
                attachStream();
            }
        });

        frame.addEventListener('click', function (event) {
            if (event.target === frame) {
                attachStream();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
