(() => {
    let newList = {};
    let newListItems = [];
    let createListButtonDisabled = true;
    const title = document.getElementById("title-input");
    const dropdown = document.getElementById("dropdown-menu");

    function hideDropdown() {
        dropdown.style.display = "none";
    }

    async function createNewList() {
        newList.title = title.value;
        newList.listItems = newListItems;
        const newListCall = await createListAPI(newList);
        if (newListCall.message == "success") {
            alert('new list created');
            location.reload();
        }else {
            alert(newListCall.message);
        }
    }

    function removeItem(item) {
        item.remove();

    }

    function enableButton() {
        const createListButton = document.getElementById("create-list-button");
        createListButton.classList.remove("create-list-button-disabled");
        createListButton.classList.add("create-list-button-enabled");
        createListButtonDisabled = false;
    }

    function disableButton() {
        const createListButton = document.getElementById("create-list-button");
        createListButton.classList.remove("create-list-button-enabled");
        createListButton.classList.add("create-list-button-disabled");
        createListButtonDisabled = true;
    }

    function renderList(item) {
        const newListItem = document.getElementById("new-list");
        const itemRow = document.createElement("div");
        itemRow.classList.add("item-row");
        itemRow.addEventListener("hover", () => {
            const removeButton = document.createElement("div");
            removeButton.addEventListener("click", () => {
                removeItem(itemRow);
            })
            removeButton.classList.add("remove-button");

            itemRow.appendChild(removeButton);
        });

        itemRow.addEventListener("blur", () => {
            const removeButton = document.querySelector(".remove-button");
            removeButton.remove();
        });
        itemRow.style.width = "100%";
        itemRow.style.display = "flex";
        itemRow.style.flexDirection = "row";
        itemRow.style.justifyContent = "space-between";
        itemRow.style.alignItems = "center";
        itemRow.style.position = "relative";

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
        itemNum.textContent = `${newListItems.length == 10 ? "x" : newListItems.length}`;
        
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
        newListItem.appendChild(itemRow);

        if (newListItems.length == 10 && title.value !== "") {
            enableButton()
        }
    }
    function populateDropdown(items) {
        dropdown.innerHTML = "";
        if (items.length === 0) {
            hideDropdown()
            return;
        }
        
        items.forEach(item => {
            const option = document.createElement("div");
            option.addEventListener("click", (event) => {
                event.stopPropagation();
                if (newListItems.length < 10) {
                    newListItems.push(item);
                    renderList(item);
                }
                hideDropdown();
            });
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
    const searchInput = document.getElementById("search-for-item");
    const createListButton = document.getElementById("create-list-button");
    
    if (searchInput) 
    {
        searchInput.addEventListener("input", async (event) => 
        {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => fetchResults(event.target.value), 500);
        });

        searchInput.addEventListener("blur", async (event) => 
            {
                setTimeout(() => {
                    hideDropdown();
                },100);
                
            });
    }

    if (createListButton) {
        createListButton.addEventListener("click", () => {
           if (!createListButtonDisabled) {
                createNewList();
           }
        })
    }

    if (title) {
        title.addEventListener("input", () => {
            if (newListItems.length == 10) {
                enableButton();
            }
        })
    }
})();
