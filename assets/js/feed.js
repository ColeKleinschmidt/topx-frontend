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
    alert("scrolling");
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
                listContainer.style.width = "30vw";
                listContainer.style.borderRadius = "20px";
                listContainer.style.border = "1px solid white";
                
                const title = document.createElement("h2");
                title.textContent = list.title;
                listContainer.appendChild(title);
                
                const itemsContainer = document.createElement("div");
                itemsContainer.classList.add("items-container");
                
                list.items.forEach(item => {
                    const itemRow = document.createElement("div");
                    itemRow.classList.add("item-row");
                    itemRow.style.width = "100%";
                    itemRow.style.display = "flex";
                    itemRow.style.flexDirection = "row";
                    itemRow.style.justifyContent = "space-evenly";
                    itemRow.style.alignItems = "center";
                    
                    const itemName = document.createElement("span");
                    itemName.textContent = item.title;
                    
                    const itemImage = document.createElement("img");
                    itemImage.src = item.image;
                    itemImage.alt = item.title;
                    itemImage.style.width = "55px";
                    itemImage.style.height = "55px";
                    itemImage.style.borderRadius = "50%";
                    itemImage.style.objectFit = "cover";
                    itemImage.classList.add("item-image");
                    
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

document.addEventListener("DOMContentLoaded", () => 
    {
        const observer = new MutationObserver(() => 
        {
            let searchTimeout;
            const searchInput = document.getElementById("item-query");
            const feedSection = document.getElementById("feed-section");
            const content = document.getElementById("content");
    
            if (searchInput) 
            {
                observer.disconnect(); // Stop observing once elements are found
    
                searchInput.addEventListener("input", async (event) => 
                {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => fetchResults(event.target.value), 500);
                });
            }
            if (feedSection && content) {
                observer.disconnect();

                content.addEventListener("scroll", handleScroll(feedSection));

                fetchLists(feedSection);
            }
        });
    
        observer.observe(document.body, { childList: true, subtree: true });
    });


