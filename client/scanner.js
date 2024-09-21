const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com';
const audio = new Audio('330046__paulmorek__beep-03-positive.mp3');
let scanning = true;
let userInteractionOccurred = false;
let qrScanner = null;

// Efficient data structure for clues
const clues = [
    ['clue1', 'images/clue1.png'],
    ['clue2', 'images/clue2.png'],
    ['clue3', 'images/clue3.png'],
    ['clue4', 'images/clue4.png'],
    ['clue6', 'images/clue6.png'],
    ['clue7', 'images/clue7.png'],
    ['clue8', 'images/clue8.png'],
    ['clue9', 'images/clue9.png'],
    ['clue10', 'images/clue10.png'],
    ['clue11', 'images/clue11.png'],
    ['clueVideo', 'images/clueVideo.mp4'], // Video clue
    ['clueGif', 'images/clueGif.gif'], // GIF clue
    // Add more clues as needed
];

// Create a Map for faster lookups
const clueMap = new Map(clues.map(clue => [clue.id, clue.path]));

// Preload images using lazy loading
function lazyLoadImages() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src; // Load the image only when in view
                observer.unobserve(img); // Stop observing once the image is loaded
            }
        });
    });

    document.querySelectorAll('.lazy-load').forEach(image => {
        observer.observe(image);
    });
}

// Preload image placeholders to reserve space
function preloadImagePlaceholders() {
    clues.forEach(clue => {
        const img = document.createElement('img');
        img.classList.add('lazy-load');
        img.style.display = 'none';
        img.dataset.src = clue.path; // Set data-src for lazy loading
        img.src = 'client/placeholder.png'; // Placeholder image
        document.body.appendChild(img); // Add the placeholder to the DOM
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeScanner();
    preloadImagePlaceholders(); // Initialize placeholders first
    lazyLoadImages(); // Set up lazy loading
    updateTeamName();
});

document.querySelector('.scan-qr-btn').addEventListener('click', handleUserInteraction);

async function loadQrScanner() {
    try {
        return (await import('https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js')).default;
    } catch (error) {
        console.error('Failed to load QR Scanner:', error);
        throw error;
    }
}

async function initializeScanner() {
    try {
        const QrScanner = await loadQrScanner();
        const videoElem = document.getElementById('scanner-video');
        if (videoElem && 'disablePictureInPicture' in videoElem) {
            videoElem.disablePictureInPicture = true;
        }

        qrScanner = new QrScanner(videoElem, handleScan, { returnDetailedScanResult: true });
        await qrScanner.start();
    } catch (error) {
        console.error('Failed to initialize QR Scanner:', error);
    }
}

function handleScan(result) {
    if (scanning) {
        scanning = false;
        qrScanner.stop();
        if (userInteractionOccurred) {
            audio.play().catch(error => console.error('Error playing sound:', error));
        }
        showPopup(result.data);
    }
}

function showPopup(qrContent) {
    const popup = document.getElementById('qr-popup');
    const qrInfo = document.getElementById('qr-info'); // Image or video element
    const additionalText = document.getElementById('additional-text'); // Text for GIFs
    const saveButton = document.getElementById('save-clue-btn');
    
    // Reset the popup
    qrInfo.style.display = 'none';
    additionalText.style.display = 'none';
    
    if (clueMap.has(qrContent)) {
        const clue = clueMap.get(qrContent);
        
        // Check if it's a video
        if (clue.endsWith('.mp4')) {
            qrInfo.innerHTML = `<video controls>
                                    <source src="${clue}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>`;
        }
        // Check if it's a GIF (and add additional text)
        else if (clue.endsWith('.gif')) {
            qrInfo.src = clue; // Display the GIF
            qrInfo.style.display = 'block'; // Make sure it's visible
            additionalText.textContent = 'This is the additional text for the GIF';
            additionalText.style.display = 'block';
        }
        // For images (default case)
        else {
            qrInfo.src = clue;
            qrInfo.style.display = 'block';
        }
        
        popup.style.display = 'flex';
        saveButton.onclick = () => saveClue(qrContent);
    } else {
        showMessage('Indice inconnu');
        resumeScanning();
    }
}


function closePopup() {
    document.getElementById('qr-popup').style.display = 'none';
    resumeScanning();
}

function resumeScanning() {
    scanning = true;
    qrScanner?.start().catch(err => console.error("Error resuming QR scanner:", err));
}

async function saveClue(clueId) {
    const teamName = sessionStorage.getItem('teamName');
    const imagePath = clueMap.get(clueId); // Get the image path from the Map
    try {
        const response = await fetch(`${backendURL}/clues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: clueId, teamName, imagePath }) // Include imagePath in the request
        });
        
        if (response.status === 201) {
            closePopup();
            showMessage('Indice sauvegardé!');
            return true;
        } else if (response.status === 400) {
            closePopup();
            showMessage('Indice déjà sauvegardé');
            return false;
        } else {
            throw new Error(response.statusText);
        }
    } catch (error) {
        console.error('Error saving clue:', error);
        showMessage('Erreur lors de la sauvegarde de l\'indice');
        return false;
    }
}

function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7); color: white; padding: 10px 20px;
        border-radius: 5px; opacity: 0; transition: opacity 0.3s ease-in-out; z-index: 1000;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.style.opacity = '1', 10);
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => document.body.removeChild(messageDiv), 300);
    }, 2000);
}

function updateTeamName() {
    const teamName = sessionStorage.getItem('teamName');
    const teamNameElement = document.getElementById('teamName');
    if (teamNameElement) {
        teamNameElement.textContent = teamName ? `Équipe: ${teamName}` : 'Équipe: Inconnue';
    }
}

function handleUserInteraction() {
    audio.muted = true;
    audio.play().then(() => {
        userInteractionOccurred = true;
        audio.pause();
        audio.muted = false;
        console.log('User interaction registered. Ready to play sound on QR detection.');
    }).catch(error => console.error('Error during user interaction:', error));
}