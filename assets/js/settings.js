(() => {
    function initializeSettingsPage() 
    {
        const profilePicInput = document.getElementById("profile-pic-input");
        const changeIconButton = document.getElementById("change-user-icon-button");
        const profilePicPreview = document.getElementById("profile-pic-preview");
        const uploadStatus = document.getElementById("upload-status");
    
        if (changeIconButton && profilePicInput) 
        {
    
            // Clicking the button opens the file explorer
            changeIconButton.addEventListener("click", () => 
            {
                profilePicInput.click();
            });
    
            // Handle file selection and upload
            profilePicInput.addEventListener("change", async (event) => 
            {
                const file = event.target.files[0];
                if (file) 
                {
                    const validTypes = ["image/jpeg", "image/png", "image/gif"];
                    if (!validTypes.includes(file.type)) 
                    {
                        alert("Please upload a valid image file (JPEG, PNG, or GIF).");
                        return;
                    }
    
                    const maxSize = 5 * 1024 * 1024; // 5 MB
                    if (file.size > maxSize) 
                    {
                        alert("The file size exceeds the 5 MB limit. Please upload a smaller file.");
                        return;
                    }
    
                    const response = await uploadProfilePictureAPI(file);
                    
                    if (response && response.imageUrl) 
                    {
    
                        // Reset file input
                        profilePicInput.value = "";
    
                        // Update the profile picture preview in settings
                        profilePicPreview.src = response.imageUrl;
    
                        // Notify top-icon-bar.js to update user icon
                        window.dispatchEvent(new CustomEvent("profilePictureUpdated", { detail: { imageUrl: response.imageUrl } }));
    
                        alert("Profile picture updated successfully!");
                    } 
                    else 
                    {
                        alert(`Upload failed: ${response.message}`);
                    }
                } 
            });
        } 
    
        // Load the current user profile picture on initialization
        async function loadUserProfilePicture() 
        {
            const data = await authStatusAPI();
            if (data.authenticated && data.user.profilePicture) 
            {
                profilePicPreview.src = data.user.profilePicture;
            } 
            else 
            {
            }
        }
    
        loadUserProfilePicture();
    }
    
    // Wait for the DOM content of settings.html to load before initializing
    if (document.readyState === "loading") 
    {
        document.addEventListener("DOMContentLoaded", initializeSettingsPage);
    } 
    else 
    {
        initializeSettingsPage();
    }
})();

