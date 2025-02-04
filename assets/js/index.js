const accountDropdown = document.querySelector('.account-dropdown-menu');
const sharedButton = document.querySelector('.shared-icon img');
const sharedDropdown = document.querySelector('.shared-dropdown-menu');
const notificationsButton = document.querySelector('.notification-icon img');
const notificationsDropdown = document.querySelector('.notifications-dropdown-menu');
const displayButton = document.querySelector('.display-button');
const displayDropdown = document.querySelector('.display-dropdown-menu');

const createAccount = () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (username && email && password) {
        createAccountAPI(username, email, password).then((response) => {
            if (response.message === "Account created successfully") {
                alert('Account created successfully');
                loadPage('/feed');
            }else {
                alert(response.message);
            }
        });
    }else {
        alert('Please fill in all fields');
    }
}

const loginRedirect = () => {
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
        loadPage('/feed');
    } 
    else 
    {
        console.error(`Route '/feed' is not defined.`);
    }
}

const login = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        loginAPI(email, password).then((response) => {
            if (response.message === "success") {
                loginRedirect();
            }else {
                alert(response.message);
            }
        });
    }else {
        alert('Please fill in all fields');
    }
}