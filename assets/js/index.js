(() => {
    const accountDropdown = document.querySelector('.account-dropdown-menu');
    const sharedButton = document.querySelector('.shared-icon img');
    const sharedDropdown = document.querySelector('.shared-dropdown-menu');
    const notificationsButton = document.querySelector('.notification-icon img');
    const notificationsDropdown = document.querySelector('.notifications-dropdown-menu');
    const displayButton = document.querySelector('.display-button');
    const displayDropdown = document.querySelector('.display-dropdown-menu');
    
    const loginRedirect = (id) => 
    {
        setCookieWithMonthExpiration("userID", id);
        const authLinks = document.querySelector('.auth-links');
        const userActions = document.querySelector('.user-actions');
        const centerIcons = document.querySelectorAll('.icon-link[data-requires-login]');
        authLinks.style.display = 'none';
        userActions.style.display = 'flex';
    
        centerIcons.forEach(icon => 
        {
            icon.classList.remove('disabled');
            icon.style.visibility = 'visible';
        });
    
        if (typeof loadPage === 'function') 
        {
            getNotifications();
            loadPage('/feed');
        } 
        else 
        {
            console.error(`Route '/feed' is not defined.`);
        }
    };

    const createAccount = () => 
        {
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
        
            if (username && email && password) 
            {
                createAccountAPI(username, email, password).then((response) => 
                {
                    if (response.message === "Account created successfully") 
                    {
                        loginRedirect(response.user._id);
                    } 
                    else 
                    {
                        alert(response.message);
                    }
                });
            } 
            else 
            {
                alert('Please fill in all fields');
            }
        };
    
    const login = () => 
    {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
    
        if (email && password) 
        {
            loginAPI(email, password).then((response) => 
            {
                if (response.message === "success") 
                {
                    loginRedirect(response.user._id);
                } 
                else 
                {
                    alert(response.message);
                }
            });
        } 
        else 
        {
            alert('Please fill in all fields');
        }
    };
    
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const toggleLink = document.getElementById('toggle-link');
    const toggleText = document.getElementById('toggle-text');
    const formTitle = document.getElementById('form-title');
    const signupButton = document.getElementById('signup-button');
    const loginButton = document.getElementById('login-button');
    
    // Ensure forms are in their initial states
    loginForm.classList.add('hidden');
    let isLogin = false; // Tracks the current state
    
    // Toggle between Sign Up and Log In forms
    toggleLink.addEventListener('click', (event) => 
    {
        event.preventDefault();
    
        if (isLogin) 
        {
            // Switch to Sign Up form
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            toggleText.textContent = "Already a member?";
            toggleLink.textContent = "Log In";
            formTitle.textContent = "Sign Up";
            isLogin = false;
        } 
        else 
        {
            // Switch to Log In form
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            toggleText.textContent = "New here?";
            toggleLink.textContent = "Sign Up";
            formTitle.textContent = "Log In";
            isLogin = true;
        }
    });
    
    // Handle form submission
    signupButton.addEventListener('click', (event) => 
    {
        event.preventDefault();
    
        // Submit Sign Up form
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
    
        if (username && email && password) 
        {
            createAccount(); // Call createAccount function
        } 
        else 
        {
            alert('Please fill in all fields');
        }
    });
    
    loginButton.addEventListener('click', (event) => {
    
        event.preventDefault();
    
        // Submit Log In form
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
    
        if (email && password) 
        {
            login(); // Call login function
        } 
        else 
        {
            alert('Please fill in all fields');
        }
    });
})();

