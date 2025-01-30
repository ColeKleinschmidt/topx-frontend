function loadTopIconBar(containerId, url) 
{
    document.addEventListener('DOMContentLoaded', () => 
    {
        const container = document.getElementById(containerId);

        if (!container) 
        {
            console.error(`Container with ID '${containerId}' not found.`);
            return;
        }

        console.log(`Attempting to fetch: ${url}`);

        fetch(url)
            .then(response => 
            {
                if (!response.ok) 
                {
                    throw new Error(`Failed to fetch top icon bar: ${response.status}`);
                }
                return response.text();
            })
            .then(html => 
            {
                container.innerHTML = html;

                const loginLink = document.getElementById('login');
                const authLinks = document.querySelector('.auth-links');
                const userActions = document.querySelector('.user-actions');

                if (loginLink && authLinks && userActions) 
                {
                    loginLink.addEventListener('click', (event) => 
                    {
                        event.preventDefault();

                        // Hide "Sign Up | Log In" and show user account actions
                        authLinks.style.display = 'none';
                        userActions.style.display = 'flex';
                    });
                }
            })
            .catch(error => 
            {
                console.error('Fetch error:', error.message);
            });
    });
}