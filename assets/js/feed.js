(() => 
    {
        let page = 1;
        const limit = 2;
        let isLoading = false;
        let hasMoreData = true;
        
        function handleScroll(feedSection) 
        {
            if (window.innerHeight + document.body.scrollTop >= document.body.scrollHeight - 500) 
            {
                fetchLists(feedSection);
            }
        }
        
        async function fetchLists(feedSection) 
        {
            if (isLoading || !hasMoreData) return;
            isLoading = true;
        
            try 
            {
                const data = await getListsAPI(page, limit);
                
                if (data.lists && data.lists.length > 0) 
                {
                    data.lists.forEach(list => 
                    {
                        const listElement = generateListElement(list);
                        feedSection.appendChild(listElement);
                    });
    
                    // Ensure tooltips are added after lists load
                    addTooltips();
    
                    page++;
                } 
                else 
                {
                    hasMoreData = false;
                    const endMessage = document.createElement("p");
                    endMessage.textContent = "You've reached the end!";
                    endMessage.classList.add("end-message");
                    feedSection.appendChild(endMessage);
                }
            } 
            catch (error) 
            {
                console.error("Error fetching lists:", error);
            } 
            finally 
            {
                isLoading = false;
            }
        }
        
        const feedSection = document.getElementById("feed-section");
        
        if (feedSection) 
        {
            document.body.addEventListener("scroll", () => handleScroll(feedSection));
            fetchLists(feedSection);
        }
    
        function addTooltips() 
        {
            document.querySelectorAll(".shared-icon-list-container").forEach(container => 
            {
                if (!container.querySelector(".shared-icon-tooltip")) 
                {
                    const tooltip = document.createElement("span");
                    tooltip.classList.add("shared-icon-tooltip");
                    tooltip.textContent = "Share";
                    container.appendChild(tooltip);
                }
            });
        }
    
    })();
    