(() => {
    let page = 1;
    const limit = 5;
    let isLoading = false;
    let hasMoreData = true;
    
    function populateDropdown(items) {
        const dropdown = document.getElementById("dropdown-menu");
        dropdown.innerHTML = "";
        if (items.length === 0) {
            dropdown.style.display = "none";
            return;
        }
        
        items.forEach(item => {
            const option = document.createElement("div");
            option.classList.add("dropdown-item");
            option.style.display = "flex";
            option.style.alignItems = "center";
            option.style.justifyContent = "space-between";
            option.style.padding = "8px";
            option.style.borderBottom = "1px solid #ccc";
    
            const title = document.createElement("span");
            title.textContent = item.title;
            
            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.title;
            image.style.width = "80px";
            image.style.height = "80px";
            image.style.borderRadius = "50%";
            image.style.objectFit = "cover";
    
            option.appendChild(title);
            option.appendChild(image);
            dropdown.appendChild(option);
        });
        
        dropdown.style.display = "block";
    }
    
    async function fetchResults(query) {
        if (query === "") {
            populateDropdown([]);
            return;
        }
    
        try {
            const data = await findItemsAPI(query);
            populateDropdown(data.items);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    }
    
    // Function to check if user scrolled to bottom
    function handleScroll(feedSection) {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
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
                    listContainer.style.width = "20vw";
                    listContainer.style.borderRadius = "50px";
                    listContainer.style.backgroundColor = list.backgroundColor;
                    listContainer.style.padding = "25px";

                    const profilePic = document.createElement("img");
                    profilePic.src = list.user.profilePicture;
                    profilePic.alt = list.user.username;
                    profilePic.style.width = "100px";
                    profilePic.style.height = "100px";
                    profilePic.style.borderRadius = "50%";
                    profilePic.style.objectFit = "cover";
                    profilePic.classList.add("item-image");
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
                        itemRow.style.width = "100%";
                        itemRow.style.display = "flex";
                        itemRow.style.flexDirection = "row";
                        itemRow.style.justifyContent = "space-between";
                        itemRow.style.alignItems = "center";

                        const itemNum = document.createElement("span");
                        itemNum.style.borderRadius = "50%";
                        itemNum.style.width = "40px";
                        itemNum.style.height = "40px";
                        itemNum.style.backgroundColor = "black";
                        itemNum.style.display = "flex";
                        itemNum.style.justifyContent = "center";
                        itemNum.style.alignItems = "center";
                        itemNum.style.color = "white";
                        itemNum.style.fontSize = "15px";
                        itemNum.style.fontWeight = "bold";
                        itemNum.textContent = `${i+1 == 10 ? "x" : i+1}`;
                        
                        const itemName = document.createElement("span");
                        itemName.textContent = item.title;
                        itemName.style.display = "flex";
                        itemName.style.alignText = "flex-start";
                        
                        const itemImage = document.createElement("img");
                        itemImage.src = item.image;
                        itemImage.alt = item.title;
                        itemImage.style.width = "55px";
                        itemImage.style.height = "55px";
                        itemImage.style.borderRadius = "50%";
                        itemImage.style.objectFit = "cover";
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
    const content = document.getElementById("content");
    
    if (feedSection && content) {
        content.addEventListener("scroll", handleScroll(feedSection));
    
        fetchLists(feedSection);
    }
})();


