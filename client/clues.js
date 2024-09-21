const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com';

// Updated mapping to include video and GIF
const clueMediaMap = new Map([
    ['clue1', { type: 'image', path: 'images/clue1.png' }],
    ['clue2', { type: 'image', path: 'images/clue2.png' }],
    ['clue3', { type: 'image', path: 'images/clue3.png' }],
    ['clue4', { type: 'image', path: 'images/clue4.png' }],
    ['clue5', { type: 'image', path: 'images/clue5.png' }],
    ['clue6', { type: 'image', path: 'images/clue6.png' }],
    ['clue7', { type: 'image', path: 'images/clue7.png' }],
    ['clue8', { type: 'image', path: 'images/clue8.png' }],
    ['clue9', { type: 'image', path: 'images/clue9.png' }],
    ['clue10', { type: 'image', path: 'images/clue10.png' }],
    ['clue11', { type: 'image', path: 'images/clue11.png' }],
    ['clue12', { type: 'image', path: 'images/clue12.png' }],
    ['video_clue', { type: 'video', path: 'videos/video_clue.mp4' }],
    ['gif_clue', { type: 'gif', path: 'images/gif_clue.gif' }],
]);

document.addEventListener('DOMContentLoaded', displaySavedClues);

let userInteractionOccurred = false;

document.querySelector('.scan-qr-btn').addEventListener('click', handleUserInteraction);
document.querySelector('#find-clues-btn').addEventListener('click', handleUserInteraction);

function handleUserInteraction() {
    const audio = new Audio('330046__paulmorek__beep-03-positive.mp3');
    audio.muted = true;
    audio.play().then(() => {
        userInteractionOccurred = true;
        audio.pause();
        audio.muted = false;
        console.log('User interaction registered. Ready to play sound on QR detection.');
    }).catch((error) => {
        console.error('Error during user interaction:', error);
    });
}

async function displaySavedClues() {
    const cluesList = document.getElementById('clues-list');
    const teamName = sessionStorage.getItem('teamName');

    try {
        const response = await fetch(`${backendURL}/clues/${teamName}`);
        const clues = await response.json();

        if (clues.length === 0) {
            cluesList.innerHTML = `
                <p style="text-align: center;">Tu n'as pas encore trouvé d'indices!</p>
                <div style="text-align: center;">
                    <a href="scanner.html" class="btn">Scannez un QR</a>
                </div>
            `;
            document.getElementById('find-clues-btn').style.display = 'none';
        } else {
            cluesList.innerHTML = '';
            clues.forEach((clue, index) => {
                const li = document.createElement('li');
                li.classList.add('clue-item');
                
                const mediaInfo = clueMediaMap.get(clue.text) || { type: 'image', path: '/api/placeholder/400/300' };
                
                switch (mediaInfo.type) {
                    case 'video':
                        li.innerHTML = `<video src="${clue.imagePath || mediaInfo.path}" controls></video>`;
                        break;
                    case 'gif':
                        li.innerHTML = `
                            <img src="${clue.imagePath || mediaInfo.path}" alt="GIF Clue ${index + 1}">
                            ${clue.additionalText ? `<p>${clue.additionalText}</p>` : ''}
                        `;
                        break;
                    default: // image
                        li.innerHTML = `<img src="${clue.imagePath || mediaInfo.path}" alt="Clue ${index + 1}">`;
                }
                
                cluesList.appendChild(li);
            });
        }
        
    } catch (error) {
        console.error('Error fetching clues:', error);
        cluesList.innerHTML = '<p>Erreur de chargement des indices. Veuillez réessayer plus tard.</p>';
    }
}

function updateTeamName() {
    const teamName = sessionStorage.getItem('teamName');
    const teamNameElement = document.getElementById('teamName');
    if (teamNameElement) {
        teamNameElement.textContent = teamName ? `Équipe: ${teamName}` : 'Équipe: Inconnue';
    }
}

// Call updateTeamName when the page loads
document.addEventListener('DOMContentLoaded', updateTeamName);