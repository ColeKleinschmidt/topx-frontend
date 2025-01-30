function loadTopIconBar(containerId, url) {
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Container with ID '${containerId}' not found.`);
            return;
        }

        console.log(`Attempting to fetch: ${url}`);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch top icon bar: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
            })
            .catch(error => {
                console.error('Fetch error:', error.message);
            });
    });
}