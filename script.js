// script.js (FINALIZED Frontend Script for Dextube)

// IMPORTANT: Update this to match your backend port
const backendURL = 'http://localhost:3000';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'; 


// =====================================================================
// 1. UPLOAD FUNCTION 
// =====================================================================
async function uploadVideo() {
    // Ensure you have these IDs in your HTML
    const fileInput = document.getElementById('video-upload-input');
    const status = document.getElementById('status');
    const cidOutput = document.getElementById('cidOutput');

    const file = fileInput.files[0];
    if (!file) {
        status.textContent = 'Status: Please select a video file.';
        return;
    }

    status.textContent = 'Status: Uploading to backend, generating thumbnail, and saving to DB...';
    status.classList.remove('error', 'success');
    status.classList.add('loading');

    // Prepare the Form Data for the multipart/form-data request
    const formData = new FormData();
    // CRITICAL: 'video' key MUST match req.files.video in your server.js
    formData.append('video', file);

    try {
        // Send the POST Request to your Express backend
        const response = await fetch(`${backendURL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Server response: ${errorText}`);
        }

        const data = await response.json();

        if (data.success) {
            status.textContent = 'Status: Upload successful! Metadata saved to DB.';
            status.classList.remove('loading');
            status.classList.add('success');
            
            // Output all returned CIDs and the new database ID
            cidOutput.innerHTML = `
                New DB ID: <strong>${data.id}</strong>
                <br>
                Video CID: <strong>${data.video_cid}</strong>
                <br>
                Thumbnail CID: <strong>${data.thumbnail_cid}</strong>
                <br>
                <a href="${IPFS_GATEWAY}${data.video_cid}" target="_blank">View Raw IPFS Content</a>
            `;
            
            // Reload the video list to show the new video immediately
            loadVideos(); 

        } else {
            status.textContent = `Status: Upload failed. Server returned: ${data.message || 'Unknown error.'}`;
            status.classList.remove('loading');
            status.classList.add('error');
        }

    } catch (error) {
        console.error('Upload failed:', error);
        // This is where a CORS error or server not running error will land
        status.textContent = `Status: CRITICAL NETWORK ERROR. Is the backend running? (Error: ${error.message})`;
        status.classList.remove('loading');
        status.classList.add('error');
    }
}


// =====================================================================
// 2. FETCH AND DISPLAY VIDEOS FUNCTION 
// =====================================================================
async function loadVideos() {
    const videoListContainer = document.getElementById('video-list'); // This ID is now in index.html
    videoListContainer.innerHTML = '<h2 style="color:#4CAF50;">Loading Decentralized Projects...</h2>';

    try {
        // Fetch metadata from your new backend API
        const response = await fetch(`${backendURL}/videos`); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success && data.videos.length > 0) {
            videoListContainer.innerHTML = ''; // Clear loading message

            data.videos.forEach(video => {
                // Construct viewable URLs using the IPFS gateway and the CIDs from the DB
                const thumbnailUrl = IPFS_GATEWAY + video.thumbnail_cid;

                // Create the HTML element for the video card
                const videoCard = document.createElement('div');
                videoCard.className = 'video-card'; 

                videoCard.innerHTML = `
                    <div class="video-thumbnail-container">
                        <a href="player.html?cid=${video.video_cid}"> 
                            <img src="${thumbnailUrl}" alt="Thumbnail for ${video.title}" class="video-thumbnail">
                        </a>
                    </div>
                    <div class="video-info">
                        <h3><a href="player.html?cid=${video.video_cid}">${video.title}</a></h3>
                        <p class="description">${video.description}</p>
                        <p class="cid-info">CID: ${video.video_cid.substring(0, 20)}...</p>
                        <p class="upload-date">Uploaded: ${new Date(video.upload_date).toLocaleDateString()}</p>
                    </div>
                `;
                videoListContainer.appendChild(videoCard);
            });
        } else {
            videoListContainer.innerHTML = '<h2>No videos uploaded yet. Use the upload icon to start.</h2>';
        }

    } catch (error) {
        console.error('Error loading videos:', error);
        videoListContainer.innerHTML = `<h2>Error loading videos. Is the backend running at ${backendURL}?</h2>`;
        videoListContainer.style.color = '#FF5733';
    }
}


// =====================================================================
// 3. INITIALIZATION
// =====================================================================
// Run this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // If you are on the main page (where videos are listed), load them
    if (document.getElementById('video-list')) {
        loadVideos();
    }
    // Upload button listener is attached in the HTML: onclick="uploadVideo()"
});