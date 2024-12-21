// Check if we're on the login page
if (window.location.href.includes('prihlaseni.aspx')) {
    // Get stored credentials
    const username = localStorage.getItem('ms_username');
    const password = localStorage.getItem('ms_password');

    if (username && password) {
        // Find and fill the input fields
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (usernameInput && passwordInput) {
            usernameInput.value = username;
            passwordInput.value = password;

            // Clear stored credentials
            localStorage.removeItem('ms_username');
            localStorage.removeItem('ms_password');

            // Optional: Auto-submit the form
            const form = usernameInput.closest('form');
            if (form) {
                form.submit();
            }
        }
    }
}