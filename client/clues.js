const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com';

// Mapping between clue texts and image paths
const clueImageMap = new Map([
    ['clue1', 'images/clue1.png'],
    ['clue2', 'images/clue2.png'],
    ['clue3', 'images/clue3.png'],
    // Add more mappings as needed
]);

document.addEventListener('DOMContentLoaded', displaySavedClues);

const audio = new Audio('330046__paulmorek__beep-03-positive.wav');

let userInteractionOccurred = false;

document.querySelector('.scan-qr-btn').addEventListener('click', handleUserInteraction);
document.querySelector('#find-clues-btn').addEventListener('click', handleUserInteraction);

function handleUserInteraction() {
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
                <p>Tu n'as pas encore trouvé d'indices!</p>
                <div>
                    <a href="scanner.html" class="btn">Scannez un QR</a>
                </div>
            `;
            document.getElementById('find-clues-btn').style.display = 'none';
        } else {
            cluesList.innerHTML = '';
            clues.forEach((clue, index) => {
                const li = document.createElement('li');
                li.classList.add('clue-item');
                
                const img = document.createElement('img');
                img.src = clueImageMap.get(clue.text) || '/api/placeholder/400/300';
                img.alt = `Clue ${index + 1}`;
                img.classList.add('clue-image');
                img.onerror = () => {
                    img.src = '/api/placeholder/400/300';
                };
                li.appendChild(img);
                cluesList.appendChild(li);
            });
        }
        
    } catch (error) {
        console.error('Error fetching clues:', error);
        cluesList.innerHTML = '<p>Erreur de chargement des indices. Veuillez réessayer plus tard.</p>';
    }
}