window.onload = function () {
    var videoStreamElement = document.getElementById('videoStream');
    var loadingIndicator = document.getElementById('loadingIndicator');

    videoStreamElement.onload = function () {
        apiStatus.style.display = 'none';
        loadingIndicator.style.display = 'none';
        videoStreamElement.style.display = '';
    };

    videoStreamElement.src = 'http://localhost:5099/video';
};


function showCustomConfirm() {
    var modal = document.getElementById('customConfirm');
    var confirmBtn = document.getElementById('confirmBtn');
    var cancelBtn = document.getElementById('cancelBtn');

    modal.style.display = 'block';

    confirmBtn.onclick = function () {
        modal.style.display = 'none';
        window.location.reload();
    };

    cancelBtn.onclick = function () {
        modal.style.display = 'none';
    };
}

function getData() {
    var fps = document.getElementById('fps');
    var chord = document.getElementById('chord');
    getApiStatus();

    fetch('http://localhost:5099/getdata')
        .then(response => response.json())
        .then(data => {
            fps.innerText = data.fps;
            if (data.chord in { 'A': 1, 'B': 1, 'C': 1, 'D': 1, 'E': 1, 'F': 1, 'G': 1 }) {
                chord.innerText = data.chord;
                checkedChordMatch();
                var autoplay = document.querySelector('.toggleautoplay input[type="checkbox"]').checked;
                if (autoplay) {
                    data.pattern = '1010';
                    data.bpm = document.getElementById('bpmSelect').value || 60;

                    strumChord(data.chord, data.pattern, data.bpm, 200);
                }
            } else {
                chord.innerText = 'None';

            }
            document.getElementById('playArea').classList.add('playchord' + data.chord);

            setPlayChordImage();

        }).catch(error => {
            var apiStatus = document.getElementById('apiStatusText');
            apiStatus.innerText = 'API is not running, Wating for API to start...';
            console.error('Error fetching data:', error);
        });;
}

function setPlayChordImage() {
    var chord = document.getElementById('chord').innerText || 'None';
    var chordImage = document.getElementById('chordImage' + chord);
    var allShownChordImages = document.querySelectorAll('.playImg');
    allShownChordImages.forEach(function (img) {
        img.style.display = 'none';
    });
    chordImage.style.display = 'block';
}


function refreshpage() {
    showCustomConfirm();
}


function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const throttledGetData = throttle(getData, 1000); // Adjust the 1000ms to your needs
setInterval(throttledGetData, 100);

document.getElementById('chordSelect').addEventListener('change', function () {
    var selectedChord = this.value;
    var chordImageSelect = document.getElementById('chordImageSelect' + selectedChord);
    var allShownChordImages = document.querySelectorAll('.showimg');
    allShownChordImages.forEach(function (img) {
        img.style.display = 'none';
        document.getElementById('selectArea').classList.add('playchordNone');

    });
    chordImageSelect.style.display = 'block';
    document.getElementById('selectArea').classList.add('playchord' + selectedChord);

    checkedChordMatch();

});


function playSelectedSound() {
    var selectedChord = document.getElementById('chordSelect').value;
    playChordSound(selectedChord);
}

function checkedChordMatch() {
    var playArea = document.getElementById('playArea');
    var selectArea = document.getElementById('selectArea');

    if (playArea.classList.contains('playchord' + chord.innerText) && selectArea.classList.contains('playchord' + chord.innerText)) {
        playArea.style.border = selectArea.style.border = '5px double #00FF00';
    } else {
        playArea.style.border = selectArea.style.border = '5px double #FF0000';
    }
}

function getApiStatus() {
    var apiStatus = document.getElementById('apiStatusText');

    fetch('http://localhost:5099/')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            apiStatus.innerText = data.message;
        }).catch(function (error) {
            apiStatus.innerText = 'API is not running';
        });
}


function strumChord(chord, pattern, bpm, strumDelay) {
    const strumInterval = 60000 / bpm / pattern.length;
    let patternIndex = 0;

    const strum = () => {
        if (pattern[patternIndex] === '1') {
            playChordSound(chord);
            setTimeout(() => {
                proceedToNextStrum();
            }, strumDelay);
        } else {
            proceedToNextStrum();
        }
    };

    const proceedToNextStrum = () => {
        patternIndex++;
        if (patternIndex < pattern.length) {
            setTimeout(strum, strumInterval);
        }
    };

    strum(); // Start the first strum
}

function playChordSound(chord) {
    const soundId = 'sound' + chord;
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    }
}
