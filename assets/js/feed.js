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
                    const listContainer = document.createElement("div");
                    listContainer.classList.add("list-container");
                    listContainer.style.backgroundColor = list.backgroundColor;

                    const profilePic = document.createElement("img");
                    profilePic.src = list.user.profilePicture;
                    profilePic.alt = list.user.username;
                    profilePic.style.width = "100px";
                    profilePic.style.height = "100px";
                    profilePic.style.borderRadius = "50%";
                    profilePic.style.objectFit = "cover";
                    profilePic.classList.add("list-profile-pic");
                    profilePic.marginBottom = "20px";
                    
                    const title = document.createElement("h2");
                    title.textContent = list.title;

                    listContainer.appendChild(profilePic);
                    listContainer.appendChild(title);
                    
                    const itemsContainer = document.createElement("div");
                    itemsContainer.classList.add("items-container");
                    
                    list.items.forEach((item,i) => {
                        const itemRow = document.createElement("div");
                        itemRow.classList.add("item-row");

                        const itemNum = document.createElement("span");
                        itemNum.classList.add("item-num")
                        itemNum.textContent = `${i+1 == 10 ? "x" : i+1}`;
                        
                        const itemName = document.createElement("span");
                        itemName.textContent = item.title;
                        itemName.classList.add('item-name');
                        
                        const itemImage = document.createElement("img");
                        itemImage.src = item.image;
                        itemImage.alt = item.title;
                        itemImage.classList.add("item-image");
                        
                        itemRow.appendChild(itemNum);
                        itemRow.appendChild(itemName);
                        itemRow.appendChild(itemImage);
                        itemsContainer.appendChild(itemRow);
                    });
                    
                    listContainer.appendChild(itemsContainer);
                    feedSection.appendChild(listContainer);
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


