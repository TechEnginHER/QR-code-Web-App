const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com';

// Mapping between clue texts and image paths
const clueImageMap = new Map([
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
]);

document.addEventListener('DOMContentLoaded', displaySavedClues);



let userInteractionOccurred = false;

document.querySelectorAll('.scan-qr-btn').addEventListener('click', handleUserInteraction);
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