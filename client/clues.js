const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com';

document.addEventListener('DOMContentLoaded', displaySavedClues);

document.querySelector('#first-scan').addEventListener('click', handleUserInteraction);
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
                
                switch (clue.mediaType) {
                    case 'video':
                        li.innerHTML = `
                            <video src="${clue.imagePath}" controls></video>
                            ${clue.additionalText ? `<p>${clue.additionalText}</p>` : ''}
                        `;
                        break;
                    case 'gif':
                        li.innerHTML = `
                            <img src="${clue.imagePath}" alt="GIF Clue ${index + 1}">
                            ${clue.additionalText ? `<p>${clue.additionalText}</p>` : ''}
                        `;
                        break;
                    default: // image
                        li.innerHTML = `
                            <img src="${clue.imagePath}" alt="Clue ${index + 1}">
                            ${clue.additionalText ? `<p>${clue.additionalText}</p>` : ''}
                        `;
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