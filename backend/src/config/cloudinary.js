const cloudinary = require('cloudinary').v2;

const initializeCloudinary = () => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️  Cloudinary credentials not found. File upload features will be limited.');
      return false;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log('✅ Cloudinary initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Cloudinary:', error.message);
    return false;
  }
};

module.exports = {
  initializeCloudinary,
  cloudinary
};
