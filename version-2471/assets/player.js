(function () {
  window.initMoviePlayer = function (source) {
    const video = document.querySelector(".js-player-video");
    const startButton = document.querySelector(".js-player-start");
    let hls = null;
    let attached = false;
    let waitingForManifest = false;

    if (!video || !source) {
      return;
    }

    function attachSource(playAfterAttach) {
      if (attached) {
        if (playAfterAttach) {
          video.play().catch(function () {});
        }
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (playAfterAttach) {
          waitingForManifest = true;
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (waitingForManifest) {
              video.play().catch(function () {});
              waitingForManifest = false;
            }
          });
        }
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        if (playAfterAttach) {
          video.play().catch(function () {});
        }
      } else {
        video.src = source;
        if (playAfterAttach) {
          video.play().catch(function () {});
        }
      }
    }

    function startPlayback() {
      attachSource(true);
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    }

    if (startButton) {
      startButton.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function () {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    attachSource(false);
  };
})();
