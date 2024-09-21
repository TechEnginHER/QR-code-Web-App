const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com';
const audio = new Audio('330046__paulmorek__beep-03-positive.mp3');
let scanning = true;
let userInteractionOccurred = false;
let qrScanner = null;

// Updated clues array with video and GIF
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
    ['clueVideo', {type: 'video' , path:'images/clueVideo.mp4', text: 'Le 4ème et dernier personnage louche envoyait des signaux lumineux très bizarres pendant pratiquement 8 minutes. Je l’ai filmé à son insu.'}],
    ['clueGif', { type: 'gif', path: 'images/clueGif.gif', text: 'Nope!' }],
];

// Create a Map for faster lookups
const clueMap = new Map(clues);

// Preload images using lazy loading
function lazyLoadImages() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
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
        img.dataset.src = typeof clue[1] === 'string' ? clue[1] : clue[1].path;
        img.src = 'client/placeholder.png';
        document.body.appendChild(img);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeScanner();
    preloadImagePlaceholders();
    lazyLoadImages();
    updateTeamName();
});

document.querySelector('.scan-qr-btn').addEventListener('click', handleUserInteraction);
function handleUserInteraction() {
    audio.muted = true;
    audio.play().then(() => {
        userInteractionOccurred = true;
        audio.pause();
        audio.muted = false;
        console.log('User interaction registered. Ready to play sound on QR detection.');
    }).catch(error => console.error('Error during user interaction:', error));
}

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
        }else
            audio.play().catch(error => console.error('Error playing sound:', error));
        showPopup(result.data);
    }
}
function showPopup(qrContent) {
    const popup = document.getElementById('qr-popup');
    const qrInfo = document.getElementById('qr-info');
    const saveButton = document.getElementById('save-clue-btn');

    if (clueMap.has(qrContent)) {
        const clueData = clueMap.get(qrContent);       
            if (typeof clueData === 'string') 
                {   // Handle image
                    qrInfo.innerHTML += `<img src="${clueData}" alt="Clue" style="width: 90vw">`;
                }
            else if (typeof clueData === 'object' && clueData.type === 'gif') 
                {   // Handle GIF with additional text
                    qrInfo.innerHTML += `<p style="font-size: 2em; font-weight: 700">${clueData.text}</p>`
                    qrInfo.innerHTML += `<img src="${clueData.path}" alt="GIF Clue" id = "qr-info-img" style="width: 90vw>`;
                } 
            else 
                 {  // Handle video with additional text
                    qrInfo.innerHTML += `<h2>Indice No. 5</h2>`
                    qrInfo.innerHTML += `<p style="font-size: 1.2em; font-weight: 700; text-align: justify; line-height: 1.4;
                                            padding: 0 8px"> ${clueData.text}</p>`
                    qrInfo.innerHTML += `<video src="${clueData.path}" style="width: 90vw" controls id="video-clue"></video>`;
                    qrInfo.innerHTML += `<p style="font-size:1.4em; line-height: 1.4; padding: 0 8px; text-align: justify>
                                            Défi d’équipe 3: en marchant vers le prochain indice, chacun indique aux 
                                            autres quel sport il a déjà fait avec (ou contre) Claire, et si elle a été
                                            mauvaise joueuse en cas de défaite 
                                         </p>`     
                }  
        popup.style.display = 'flex';
        saveButton.onclick = () => saveClue(qrContent);    
    } else {
        showMessage('Indice inconnu');
        resumeScanning();
}};

function closePopup() {
    document.getElementById('qr-popup').style.display = 'none';
    let videoClue = document.getElementById('video-clue')
    if (videoClue){
        videoClue.style.display = 'none';
    resumeScanning();
    }
}
function resumeScanning() {
    scanning = true;
    qrScanner?.start().catch(err => console.error("Error resuming QR scanner:", err));
}

async function saveClue(clueId) {
    const teamName = sessionStorage.getItem('teamName');
    const clueData = clueMap.get(clueId);
    let imagePath, additionalText;

    if (typeof clueData === 'string') {
        imagePath = clueData;
    } else if (typeof clueData === 'object') {
        imagePath = clueData.path;
        additionalText = clueData.text;
    }

    try {
        const response = await fetch(`${backendURL}/clues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: clueId, 
                teamName, 
                imagePath, 
                additionalText 
            })
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
