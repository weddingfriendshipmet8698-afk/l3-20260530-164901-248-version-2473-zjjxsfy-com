(function () {
    var video = document.getElementById('moviePlayer');
    var cover = document.querySelector('[data-play-cover]');
    var message = document.querySelector('[data-player-message]');
    var source = window.__VIDEO_SOURCE__;
    var poster = window.__VIDEO_POSTER__;
    var hlsInstance = null;
    var isReady = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function initPlayer() {
        if (!video || !source || isReady) {
            return Promise.resolve();
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                isReady = true;
                setMessage('');
            });

            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    setMessage('网络加载异常，正在重新尝试。');
                    hlsInstance.startLoad();
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    setMessage('媒体解码异常，正在尝试恢复。');
                    hlsInstance.recoverMediaError();
                    return;
                }

                setMessage('当前浏览器暂时无法播放该视频源。');
                hlsInstance.destroy();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            isReady = true;
        } else {
            video.src = source;
            setMessage('浏览器未检测到 HLS 支持，已尝试直接加载播放源。');
        }

        return Promise.resolve();
    }

    function playVideo() {
        initPlayer().then(function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        });
    }

    if (cover && video) {
        cover.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}());
