document.addEventListener("DOMContentLoaded", () => 
    {
        const profilePicInput = document.getElementById("profile-pic-input");
        const changeIconButton = document.getElementById("change-user-icon-button");
        const profilePicPreview = document.getElementById("profile-pic-preview");
    
        if (changeIconButton && profilePicInput) 
        {
            // Clicking the button opens the file explorer
            changeIconButton.addEventListener("click", () => 
            {
                console.log("Change User Icon button clicked. Opening file explorer...");
                profilePicInput.click();
            });
    
            // Handle file selection and upload
            profilePicInput.addEventListener("change", async (event) => 
            {
                const file = event.target.files[0];
                if (file) 
                {
                    console.log("File selected:", file.name);
                    await uploadProfilePicture(file);
                }
            });
        }
    
        async function uploadProfilePicture(file) 
        {
            const formData = new FormData();
            formData.append("image", file);
    
            try 
            {
                const response = await fetch("http://localhost:8080/uploadProfilePicture", 
                {
                    method: "POST",
                    credentials: "include", // Include session cookie for authentication
                    body: formData,
                });
    
                const data = await response.json();
    
                if (response.ok) 
                {
                    console.log("Upload successful! Image URL:", data.imageUrl);
    
                    // Update the profile picture preview in settings
                    profilePicPreview.src = data.imageUrl;
    
                    // Notify top-icon-bar.js to update user icon
                    window.dispatchEvent(new CustomEvent("profilePictureUpdated", { detail: { imageUrl: data.imageUrl } }));
                } 
                else 
                {
                    console.error("Upload failed:", data.message);
                    alert(`Upload failed: ${data.message}`);
                }
            } 
            catch (error) 
            {
                console.error("Error uploading file:", error);
                alert("An error occurred while uploading the file. Please try again.");
            }
        }
    });
    