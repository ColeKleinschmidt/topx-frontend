document.addEventListener("DOMContentLoaded", () => 
    {
        const observer = new MutationObserver(() => 
        {
            const searchButton = document.getElementById("search-button");
            const searchQuery = document.getElementById("search-query");
            const imageResult = document.getElementById("image-result");
    
            if (searchButton && searchQuery && imageResult) 
            {
                observer.disconnect(); // Stop observing once elements are found
    
                searchButton.addEventListener("click", async () => 
                {
                    const query = searchQuery.value.trim();
                    if (!query) 
                    {
                        alert("Please enter a search term");
                        return;
                    }
    
                    imageResult.innerHTML = "<p>Loading...</p>";
    
                    try 
                    {
                        const response = await fetch(`http://127.0.0.1:8080/scrape-images?q=${encodeURIComponent(query)}`);
                        const data = await response.json();
    
                        if (data.image) 
                        {
                            imageResult.innerHTML = `<img src="${data.image}" alt="${query}" class="result-image" style="max-width: 100%; border-radius: 8px;">`;
                        } 
                        else 
                        {
                            imageResult.innerHTML = "<p>No image found.</p>";
                        }
                    } 
                    catch (error) 
                    {
                        console.error("Error fetching image:", error);
                        imageResult.innerHTML = "<p>Failed to load image.</p>";
                    }
                });
            }
        });
    
        observer.observe(document.body, { childList: true, subtree: true });
    });
    