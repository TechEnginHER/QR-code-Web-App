const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com';

document.addEventListener('DOMContentLoaded', displaySavedClues);
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
                    <a href="scanner.html" class="btn" id="first-scan">Scannez un QR</a>
                </div>
            `;
            document.getElementById('find-clues-btn').style.display = 'none';
        } else {
            cluesList.innerHTML = '';
            clues.forEach((clue, index) => {
                const li = document.createElement('li');
                li.classList.add('clue-item');
                
                if (clue.imagePath.endsWith('.jpg')) {
                    li.innerHTML = `
                        <img src="${clue.imagePath}" alt="Clue ${index + 1}">
                        ${clue.additionalText ? `<p>${clue.additionalText}</p>` : ''}
                    `;
                } else if (clue.imagePath.endsWith('.gif')) {
                    // For GIF files
                    li.innerHTML = `
                        ${clue.additionalText ? `<p>${clue.additionalText}</p>` : ''}
                        <img src="${clue.imagePath}" alt="GIF Clue ${index + 1}">
                    `;
                } else if (clue.imagePath.endsWith('.mp4')) {
                    // For video files
                    li.innerHTML = `
                        ${clue.additionalText ? `<p>${clue.additionalText}</p>` : ''}
                        <video src="${clue.imagePath}" controls></video>
                    `;
                    li.innerHTML += `
                        <p>Défi d’équipe 3: en marchant vers le prochain indice, chacun indique aux 
                        autres quel sport il a déjà fait avec (ou contre) Claire, et si elle a été
                        mauvaise joueuse en cas de défaite</p>
                    `;
                    console.log("this is a video");
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
document.addEventListener('DOMContentLoaded', handleUserInteraction);
function handleUserInteraction() {
    let userInteractionOccurred = false;
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

// Call updateTeamName when the page loads
document.addEventListener('DOMContentLoaded', updateTeamName);