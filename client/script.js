document.addEventListener('DOMContentLoaded', () => {
    // Hide hamburger menu on index page
    if (window.location.pathname.endsWith('index.html')) {
        document.body.classList.add('index');
    } else {
        document.body.classList.remove('index');
    }

    // Get elements only if they exist
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const closeMenu = document.getElementById('closeMenu');
    const overlay = document.getElementById('overlay');

    // Open hamburger menu
    if (hamburgerIcon && hamburgerMenu) {
        hamburgerIcon.addEventListener('click', () => {
            hamburgerMenu.classList.add('show-menu');
            if (overlay) {
                overlay.style.display = 'block';
            }
        });
    }

    // Close hamburger menu
    function closeHamburgerMenu() {
        if (hamburgerMenu) {
            hamburgerMenu.classList.remove('show-menu');
        }
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', closeHamburgerMenu);
    }

    // Close menu when clicking outside of it
    if (overlay) {
        overlay.addEventListener('click', closeHamburgerMenu);
    }

    // Close menu when clicking anywhere outside the hamburger menu
    document.addEventListener('click', (event) => {
        if (hamburgerMenu && !hamburgerMenu.contains(event.target) && !hamburgerIcon.contains(event.target)) {
            closeHamburgerMenu();
        }
    });

    // Retrieve team name from session storage
    let teamName = sessionStorage.getItem('teamName');

    // Update team name in the header
    function updateTeamName() {
        const teamNameElement = document.getElementById('teamName');
        if (teamNameElement) {
            if (teamName) {
                teamNameElement.textContent = `${teamName}`;
            } else {
                teamNameElement.textContent = 'INVITÉ';
            }
        }
    }

    // Call updateTeamName when the page loads
    updateTeamName();
});




        