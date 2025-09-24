// app.js (Rename your file to app.js for consistency, or keep script.js)

const backendURL = 'http://localhost:3000';

// This function will be called when the user clicks the upload button.
async function uploadVideo() {
    const fileInput = document.getElementById('video-upload-input'); // Use correct ID from HTML
    const status = document.getElementById('status');
    const cidOutput = document.getElementById('cidOutput');

    // 1. Get the file selected by the user
    const file = fileInput.files[0];
    if (!file) {
        status.textContent = 'Status: Please select a video file.';
        return;
    }

    status.textContent = 'Status: Uploading to backend...';

    // 2. Prepare the Form Data for the multipart/form-data request
    const formData = new FormData();
    // CRITICAL: 'video' key MUST match req.files.video in your server.js
    formData.append('video', file);

    try {
        // 3. Send the POST Request to your Express backend
        const response = await fetch(`${backendURL}/upload`, {
            method: 'POST',
            body: formData,
        });

        // Check if the server responded with an error status (e.g., 400, 500)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.cid) {
            status.textContent = 'Status: Upload successful! File added to IPFS via backend.';
            cidOutput.innerHTML = `
                Video CID: <strong>${data.cid}</strong>
                <br>
                <a href="${backendURL}/video/${data.cid}" target="_blank">View Video on Dextube Backend</a>
            `;
        } else {
            status.textContent = `Status: Upload failed. Server returned: ${JSON.stringify(data)}`;
        }

    } catch (error) {
        console.error('Upload failed:', error);
        status.textContent = `Status: Error during upload. Check server console for details.`;
    }
}