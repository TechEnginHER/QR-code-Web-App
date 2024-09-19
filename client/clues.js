const backendURL = 'https://qr-code-web-app-wu0o.onrender.com'; //Render backend URL


document.addEventListener('DOMContentLoaded', displaySavedClues);

async function displaySavedClues() {
    const cluesList = document.getElementById('clues-list');
    const teamName = sessionStorage.getItem('teamName');

    try {
        // Make a GET request to fetch clues for the team
        const response = await fetch(`${backendURL}/clues/${teamName}`);
        const clues = await response.json();

        if (clues.length === 0) {
            cluesList.innerHTML = `
                <p>You haven't found any clues yet!</p>
                <div>
                    <a href="scanner.html" class="btn">Scan a QR</a>
                </div>
            `;
            document.getElementById('find-clues-btn').style.display = 'none';
        } else {
            cluesList.innerHTML = '';
            clues.forEach((clue, index) => {
                const li = document.createElement('li');
                li.classList.add('clue-item'); // Add a class for the clue item
                li.innerHTML = `
                    Clue ${index + 1}: ${clue.text}
                    <button class="delete-btn" data-id="${clue._id}">Delete Clue</button>
                `;
                cluesList.appendChild(li);
            });

            // Add click event listeners for each delete button
            document.querySelectorAll('.clue-item').forEach((item) => {
                const deleteButton = item.querySelector('.delete-btn');
                if (deleteButton) {
                    deleteButton.addEventListener('click', async (event) => {
                        event.stopPropagation(); // Prevent the parent click event from firing
                        const clueId = deleteButton.dataset.id; // Get the clue ID from data-id
                        await deleteClue(clueId); // Use the correct clue ID for deletion
                    });
                }

                // Toggle delete button visibility on click
                item.addEventListener('click', () => {
                    item.classList.toggle('show-delete');
                });
            });
        }
        
        // Add event listener to the document to hide delete buttons when clicking outside
        document.addEventListener('click', (event) => {
            const isClickInside = event.target.closest('.clue-item') || event.target.classList.contains('delete-btn');

            if (!isClickInside) {
                document.querySelectorAll('.clue-item').forEach((item) => {
                    item.classList.remove('show-delete');
                });
            }
        });
    } catch (error) {
        console.error('Error fetching clues:', error);
        cluesList.innerHTML = '<p>Error loading clues. Please try again later.</p>';
    }
}

async function deleteClue(clueId) {
    try {
        // Make a DELETE request to remove the clue from the server
        const response = await fetch(`${backendURL}/clues/${clueId}`, {
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
