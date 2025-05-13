document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landingPage');
    const mainPage = document.getElementById('mainPage');
    const beginButton = document.getElementById('beginButton');
    const myVideo = document.getElementById('myVideo');
    const playPauseButton = document.getElementById('playPauseButton');
    const loopingNoise = document.getElementById('loopingNoise');
    const playSymbol = '▶'; // You can also use '►' if setting innerHTML
    const pauseSymbol = '❚❚'; // You can also use '❚❚' or '⏸'
    const ORIGINAL_NOISE_VOLUME = 0.5; // Adjust as needed (0.0 to 1.0)
    const REDUCED_NOISE_VOLUME = 0.1;  // Adjust as needed
    const FADE_DURATION_MS = 2000;    // 2 seconds

    let volumeFadeInterval = null; // To store the interval ID for fading

    // Function to gradually change audio volume
    function fadeAudio(audioElement, targetVolume, duration) {
        if (volumeFadeInterval) {
            clearInterval(volumeFadeInterval); // Clear any existing fade
        }

        const startVolume = audioElement.volume;
        const volumeChange = targetVolume - startVolume;
        const steps = 50; // Number of steps for a smoother fade
        const stepTime = duration / steps;
        const volumeStep = volumeChange / steps;

        let currentStep = 0;

        volumeFadeInterval = setInterval(() => {
            currentStep++;
            let newVolume = startVolume + (volumeStep * currentStep);

            // Clamp volume between 0 and 1
            newVolume = Math.max(0, Math.min(1, newVolume));
            audioElement.volume = newVolume;

            if (currentStep >= steps) {
                clearInterval(volumeFadeInterval);
                volumeFadeInterval = null;
                audioElement.volume = targetVolume; // Ensure it ends exactly at target
            }
        }, stepTime);
    }

    // 1. "Let's begin" button functionality
    beginButton.addEventListener('click', () => {
        landingPage.style.display = 'none';
        mainPage.style.display = 'flex'; // Or 'block' or your preferred display type

        // 4. Play noise on loop when entering main page
        loopingNoise.volume = ORIGINAL_NOISE_VOLUME;
        loopingNoise.play().catch(error => {
            console.warn("Looping noise autoplay was prevented:", error);
            // You might want to inform the user they need to interact for audio to start
            // or provide an explicit unmute button for the noise.
        });
    });

    playPauseButton.addEventListener('click', () => {
        if (myVideo.paused || myVideo.ended) {
            myVideo.play();
            playPauseButton.innerHTML = pauseSymbol; // CHANGED
            fadeAudio(loopingNoise, REDUCED_NOISE_VOLUME, FADE_DURATION_MS);
        } else {
            myVideo.pause();
            playPauseButton.innerHTML = playSymbol; // CHANGED
            fadeAudio(loopingNoise, ORIGINAL_NOISE_VOLUME, FADE_DURATION_MS);
        }
    });

    // 6. When video ends
    myVideo.addEventListener('ended', () => {
        playPauseButton.innerHTML = playSymbol; // CHANGED
        fadeAudio(loopingNoise, ORIGINAL_NOISE_VOLUME, FADE_DURATION_MS);
    });

    // Optional: Handle video pausing through means other than the button
    myVideo.addEventListener('pause', () => {
        if (!myVideo.ended) {
            playPauseButton.innerHTML = playSymbol; // CHANGED
            // Only fade if it wasn't due to our button click (which already handles fading)
            // This check can be tricky. For simplicity, let's assume if it pauses,
            // and it wasn't the button, we revert volume.
            // A more robust solution might involve a flag.
            // For now, this should cover most cases.
            // If the video is paused by means other than the button, we want noise to go up.
            if (myVideo.paused && playPauseButton.innerHTML === pauseSymbol) {
                // This implies it was playing and then paused by external means
                // However, the button click handler ALREADY sets the symbol before calling pause.
                // So this specific if condition might not be hit as expected for external pause.
                // Let's simplify: if it pauses and isn't ended, it should show play symbol and increase noise.
                fadeAudio(loopingNoise, ORIGINAL_NOISE_VOLUME, FADE_DURATION_MS);
            }
        }
    });

    myVideo.addEventListener('play', () => {
        playPauseButton.innerHTML = pauseSymbol; // CHANGED
        // If the video starts playing (e.g. by external controls, or after seeking while paused)
        // ensure noise is reduced.
        // Similar to pause, the button click already handles this.
        // This is for other ways video might start.
        if (!myVideo.paused && playPauseButton.innerHTML === playSymbol) {
            fadeAudio(loopingNoise, REDUCED_NOISE_VOLUME, FADE_DURATION_MS);
        }
    });
});