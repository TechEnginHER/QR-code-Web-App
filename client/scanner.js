const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com'; //Render backend URL

const html5QrCode = new Html5Qrcode("reader");
let scanning = true;

const audio = new Audio('client/330046__paulmorek__beep-03-positive.wav'); //  path to your sound file

// Flag to check if user interaction has occurred
let userInteractionOccurred = false;

// Allow audio playback on user interaction
document.querySelector('.scan-qr-btn').addEventListener('click', () => {
    // Try playing the sound in a muted way
    audio.muted = true;
    audio.play().then(() => {
        // If playback succeeds, mark user interaction
        userInteractionOccurred = true;
        audio.pause();
        audio.muted = false;
        console.log('User interaction registered. Ready to play sound on QR detection.');
    }).catch((error) => {
        console.error('Error during user interaction:', error);
    });
});

const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    if (scanning) {
        scanning = false;
        html5QrCode.pause();
        if (userInteractionOccurred) {
            audio.play().catch((error) => {
                console.error('Error playing sound:', error);
            });
        }
        showPopup(decodedText);
    }
};
const width = Math.min(window.innerWidth, window.innerHeight) * 0.7;
const height = width; // square for better compatibility

const config = { 
    fps: 10,
    qrbox: { width: width, height: height },
    aspectRatio: 1.0, // Use a square aspect ratio
    rememberLastUsedCamera: true
};

html5QrCode.start(
    { facingMode: "environment" }, 
    config, 
    qrCodeSuccessCallback
).catch((err) => {
    console.error("Error starting QR scanner:", err);
    // Fallback to a more permissive configuration
    const fallbackConfig = { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
    };
    return html5QrCode.start({ facingMode: "environment" }, fallbackConfig, qrCodeSuccessCallback);
});

function showPopup(qrContent) {
    const popup = document.getElementById('qr-popup');
    const qrInfo = document.getElementById('qr-info');
    const saveButton = document.getElementById('save-clue-btn');

    qrInfo.textContent = qrContent;
    popup.style.display = 'flex';

    saveButton.onclick = async () => {
        const saved = await saveClue(qrContent);
        if (saved) {
            closePopup();
            showSavedMessage();
        } else {
            closePopup();
            showAlreadySavedMessage();
        }
    };
}

function closePopup() {
    const popup = document.getElementById('qr-popup');
    popup.style.display = 'none';
    resumeScanning();
}

function resumeScanning() {
    scanning = true;
    html5QrCode.resume();
}

async function saveClue(clue) {
    const teamName = sessionStorage.getItem('teamName');

    try {
        const response = await fetch(`${backendURL}/clues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: clue, teamName })
        });

        if (response.status === 201) {
            return true; // Clue successfully saved
        } else if (response.status === 400) {
            return false; // Clue already saved
        } else {
            console.error('Failed to save clue:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error saving clue:', error);
        return false;
    }
}

function showSavedMessage() {
    showMessage('Clue saved successfully!');
}

function showAlreadySavedMessage() {
    showMessage('Clue already saved');
}

function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        z-index: 1000;
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 2000);
}

// Update team name in the header
function updateTeamName() {
    const teamName = sessionStorage.getItem('teamName');
    const teamNameElement = document.getElementById('teamName');
    if (teamNameElement) {
        if (teamName) {
            teamNameElement.textContent = `Team: ${teamName}`;
        } else {
            teamNameElement.textContent = 'Team: Unknown';
        }
    }
}

// Call these functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateTeamName();
});