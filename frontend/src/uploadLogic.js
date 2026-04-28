// frontend/src/uploadLogic.js
import imageCompression from 'browser-image-compression';

// TODO: Replace these two strings with your actual Cloudinary details!
const CLOUD_NAME = "dyulw7nfz"; 
const UPLOAD_PRESET = "findit_uploads"; 

export const compressAndUploadImage = async (imageFile) => {
  if (!imageFile) return null;

  try {
    console.log(`Original file size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);

    // 1. COMPRESS THE IMAGE
    const options = {
      maxSizeMB: 0.5,          // Max size 500KB
      maxWidthOrHeight: 1024,  // Resize width
      useWebWorker: true,
    };
    
    const compressedFile = await imageCompression(imageFile, options);
    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

    // 2. PREPARE DATA FOR CLOUDINARY
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", UPLOAD_PRESET); 

    // 3. SEND TO CLOUDINARY API
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error.message);
    }

    // 4. RETURN THE MAGIC URL
    console.log("Uploaded successfully to Cloudinary!");
    return data.secure_url; // This is the safe 'https' link we send to MySQL

  } catch (error) {
    console.error("Error during compression or upload:", error);
    throw error;
  }
};