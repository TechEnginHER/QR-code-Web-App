const backendURL = 'https://qrcodescavengerhuntwebapp.onrender.com'; // Render backend URL

// Show popups
const createTeam = document.getElementById('createTeam');
if (createTeam) {
    createTeam.addEventListener('click', function() {
        const createTeamPopup = document.getElementById('createTeamPopup');
        if (createTeamPopup) {
            createTeamPopup.style.display = 'flex';
        }
    });
}

const loginTeamBtn = document.getElementById('loginTeam');
if (loginTeamBtn) {
    loginTeamBtn.addEventListener('click', function() {
        const loginPopup = document.getElementById('loginPopup');
        if (loginPopup) {
            loginPopup.style.display = 'flex';
        }
    });
}

// Close popups and clear error messages
const closeCreate = document.getElementById('closeCreate');
if (closeCreate) {
    closeCreate.addEventListener('click', function() {
        const createTeamPopup = document.getElementById('createTeamPopup');
        if (createTeamPopup) {
            createTeamPopup.style.display = 'none';
            // Hide the error message when the form is closed
            const errorMessage = document.getElementById('invalid-team-creation');
            errorMessage.style.visibility = 'hidden';
        }
    });
}

const closeLogin = document.getElementById('closeLogin');
if (closeLogin) {
    closeLogin.addEventListener('click', function() {
        const loginPopup = document.getElementById('loginPopup');
        if (loginPopup) {
            loginPopup.style.display = 'none';
            // Hide the error message when the form is closed
            const errorMessage = document.getElementById('invalid-team-login');
            errorMessage.style.visibility = 'hidden';
        }
    });
}

// Add this function to handle team creation
async function createNewTeam(teamName, passcode) {
    try {
        const response = await fetch(`$/teams`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: teamName,
                passcode: passcode
            })
        });

        if (response.ok) {
            // Team created successfully
            const team = await response.json();
            console.log('Team created:', team);
            // Save the team name in session storage for reference
            sessionStorage.setItem('teamName', teamName);
            // Redirect to the team's dashboard or profile page
            window.location.href = 'clues.html';
        } else {
            // Handle errors like duplicate team names
            const errorData = await response.json();
            const errorMessage = document.getElementById('invalid-team-creation');
            errorMessage.textContent = 'Team already exists. Please choose a different name or log in to existing team';
            errorMessage.style.visibility = 'visible'; // Show the error message
        }
    } catch (error) {
        console.error('Error creating team:', error);
        const errorMessage = document.getElementById('invalid-team-creation');
        errorMessage.textContent = 'An error occurred while creating the team. Please try again later.';
        errorMessage.style.visibility = 'visible'; // Show the error message
    }
}

// Add this function to handle team login
async function loginTeam(teamName, passcode) {
    try {
        const response = await fetch(`${backendURL}/teams/login`, { // Use template literals correctly
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: teamName,
                passcode: passcode
            })
        });

        if (response.ok) {
            // Login successful
            const team = await response.json();
            console.log('Team logged in:', team);
            // Save the team name in session storage for reference
            sessionStorage.setItem('teamName', teamName);
            // Redirect to the team's dashboard or profile page
            window.location.href = 'clues.html';
        } else {
            // Handle login errors
            const errorData = await response.json();
            const errorMessage = document.getElementById('invalid-team-login');
            errorMessage.textContent = 'Wrong team details.';
            errorMessage.style.visibility = 'visible'; // Show the error message
        }
    } catch (error) {
        console.error('Error logging in:', error);
        const errorMessage = document.getElementById('invalid-team-login');
        errorMessage.textContent = 'Incorrect team name or passcode. Please try again.';
        errorMessage.style.visibility = 'visible'; // Show the error message
    }
}

// Clear the error message on input
document.querySelectorAll('#createTeamForm input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('invalid-team-creation').style.visibility = 'hidden';
    });
});

document.querySelectorAll('#loginForm input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('invalid-team-login').style.visibility = 'hidden';
    });
});

// Handle form submissions for creating a new team
const createTeamForm = document.getElementById('createTeamForm');
if (createTeamForm) {
    createTeamForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const teamName = document.getElementById('newTeamName').value;
        const passcode = document.getElementById('newTeamPasscode').value;
        
        createNewTeam(teamName, passcode);
    });
}

// Handle form submissions for logging in an existing team
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const teamName = document.getElementById('loginTeamName').value;
        const passcode = document.getElementById('loginTeamPasscode').value;
        
        loginTeam(teamName, passcode);
    });
}
