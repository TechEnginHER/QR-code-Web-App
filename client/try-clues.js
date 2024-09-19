async function displaySavedClues() {
    const cluesList = document.getElementById('clues-list');
    const teamName = sessionStorage.getItem('teamName');

    try {
        // Make a GET request to fetch clues for the team
        const response = await fetch(`http://localhost:3000/clues/${teamName}`);
        const clues = await response.json();

        if (clues.length === 0) {
            cluesList.innerHTML = `
                <p>You haven't found any clues yet!</p>
                <div>
                    <a href="scanner.html" class="btn">Scan a QR</a>
                </div>
            `;
        } else {
            cluesList.innerHTML = '';
            clues.forEach((clue, index) => {
                const li = document.createElement('li');
                li.classList.add('clue-item');
                li.innerHTML = `
                    Clue ${index + 1}: ${clue.text}
                    <button class="delete-btn" data-id="${clue._id}">Delete Clue</button>
                `;
                cluesList.appendChild(li);
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const clueId = event.target.getAttribute('data-id');
                    await deleteClue(clueId);
                });
            });
        }
    } catch (error) {
        console.error('Error fetching clues:', error);
        cluesList.innerHTML = '<p>Error loading clues. Please try again later.</p>';
    }
}

async function deleteClue(clueId) {
    try {
        const response = await fetch(`http://localhost:3000/clues/${clueId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            displaySavedClues(); // Refresh the list after deletion
        } else {
            console.error('Failed to delete clue:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting clue:', error);
    }
}
