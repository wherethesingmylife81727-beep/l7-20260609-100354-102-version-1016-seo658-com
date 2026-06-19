import { H as Hls } from './hls.js';

export function setupPlayer(videoId, sourceUrl) {
  const video = document.getElementById(videoId);
  if (!video || !sourceUrl) {
    return;
  }

  const shell = video.closest('.video-shell');
  const overlay = shell ? shell.querySelector('.play-overlay') : null;

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
  } else if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(sourceUrl);
    hls.attachMedia(video);
  } else {
    video.src = sourceUrl;
  }

  const startPlayback = function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  document.querySelectorAll('[data-start-player]').forEach(function (button) {
    button.addEventListener('click', startPlayback);
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });
}
