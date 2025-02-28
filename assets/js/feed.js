(() => {
    let page = 1;
    const limit = 5;
    let isLoading = false;
    let hasMoreData = true;
    
    // Function to check if user scrolled to bottom
    function handleScroll(feedSection) {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) {
            fetchLists(feedSection);
        }
    }
    
    // Function to fetch lists
    async function fetchLists(feedSection) {
        if (isLoading || !hasMoreData) return;
        isLoading = true;
    
        try {
            const data = await getListsAPI(page, limit);
            
            if (data.lists && data.lists.length > 0) {
                data.lists.forEach(list => {
                    const listElement = generateListElement(list);
                    feedSection.appendChild(listElement);
                });
                page++; // Increment page for next request
            } else {
                hasMoreData = false;
                const endMessage = document.createElement("p");
                endMessage.textContent = "You've reached the end!";
                endMessage.classList.add("end-message");
                feedSection.appendChild(endMessage);
            }
        } catch (error) {
            console.error("Error fetching lists:", error);
        } finally {
            isLoading = false;
        }
    }
    
    const feedSection = document.getElementById("feed-section");
    
    if (feedSection) {
        document.addEventListener("scroll", () => handleScroll(feedSection));
    
        fetchLists(feedSection);
    }
})();


