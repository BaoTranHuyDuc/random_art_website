document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landingPage');
    const mainPage = document.getElementById('mainPage');
    const beginButton = document.getElementById('beginButton');
    const myVideo = document.getElementById('myVideo');
    const playPauseButton = document.getElementById('playPauseButton');
    const loopingNoise = document.getElementById('loopingNoise');
    const videoOverlay = document.getElementById('videoOverlay'); // NEW

    const playSymbol = '▶';
    const pauseSymbol = '❚❚';
    const ORIGINAL_NOISE_VOLUME = 0.1;
    const REDUCED_NOISE_VOLUME = 0.02;
    const FADE_DURATION_MS = 2000;

    let volumeFadeInterval = null;

    function fadeAudio(audioElement, targetVolume, duration) {
        if (volumeFadeInterval) {
            clearInterval(volumeFadeInterval);
        }

        const startVolume = audioElement.volume;
        const volumeChange = targetVolume - startVolume;
        const steps = 50;
        const stepTime = duration / steps;
        const volumeStep = volumeChange / steps;

        let currentStep = 0;

        volumeFadeInterval = setInterval(() => {
            currentStep++;
            let newVolume = startVolume + (volumeStep * currentStep);
            newVolume = Math.max(0, Math.min(1, newVolume));
            audioElement.volume = newVolume;

            if (currentStep >= steps) {
                clearInterval(volumeFadeInterval);
                volumeFadeInterval = null;
                audioElement.volume = targetVolume;
            }
        }, stepTime);
    }

    beginButton.addEventListener('click', () => {
        landingPage.style.display = 'none';
        mainPage.style.display = 'flex';

        loopingNoise.volume = ORIGINAL_NOISE_VOLUME;
        loopingNoise.play().catch(error => {
            console.warn("Looping noise autoplay was prevented:", error);
        });

        // ✅ Show thumbnail overlay when video first appears
        videoOverlay.style.display = 'block';
    });

    playPauseButton.addEventListener('click', () => {
        if (myVideo.paused || myVideo.ended) {
            myVideo.play();
            playPauseButton.innerHTML = pauseSymbol;
            fadeAudio(loopingNoise, REDUCED_NOISE_VOLUME, FADE_DURATION_MS);
            videoOverlay.style.display = 'none'; // HIDE OVERLAY
        } else {
            myVideo.pause();
            playPauseButton.innerHTML = playSymbol;
            fadeAudio(loopingNoise, ORIGINAL_NOISE_VOLUME, FADE_DURATION_MS);
            videoOverlay.style.display = 'block'; // SHOW OVERLAY
        }
    });

    myVideo.addEventListener('ended', () => {
        playPauseButton.innerHTML = playSymbol;
        fadeAudio(loopingNoise, ORIGINAL_NOISE_VOLUME, FADE_DURATION_MS);
        videoOverlay.style.display = 'block'; // SHOW OVERLAY
    });

    myVideo.addEventListener('pause', () => {
        if (!myVideo.ended) {
            playPauseButton.innerHTML = playSymbol;
            fadeAudio(loopingNoise, ORIGINAL_NOISE_VOLUME, FADE_DURATION_MS);
            videoOverlay.style.display = 'block'; // SHOW OVERLAY
        }
    });

    myVideo.addEventListener('play', () => {
        playPauseButton.innerHTML = pauseSymbol;
        fadeAudio(loopingNoise, REDUCED_NOISE_VOLUME, FADE_DURATION_MS);
        videoOverlay.style.display = 'none'; // HIDE OVERLAY
    });

    const videoProgressBar = document.getElementById('videoProgressBar');

    // Update progress bar while video is playing
    myVideo.addEventListener('timeupdate', () => {
        const percent = (myVideo.currentTime / myVideo.duration) * 100;
        videoProgressBar.style.width = `${percent}%`;
    });

    const videoProgressContainer = document.getElementById('videoProgressContainer');

    videoProgressContainer.addEventListener('click', (e) => {
        const rect = videoProgressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        myVideo.currentTime = percent * myVideo.duration;
    });
});
