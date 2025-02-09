(() => {
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
    
    let searchTimeout;
    const searchInput = document.getElementById("item-query");
    
    if (searchInput) 
    {
        searchInput.addEventListener("input", async (event) => 
        {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => fetchResults(event.target.value), 500);
        });
    }
})();
