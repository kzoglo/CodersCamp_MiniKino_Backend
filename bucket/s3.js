const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const config = require('config');
const logger = require('../assistive_functions/logger');

/**
 * AWS S3 integration for production environment
 * Uses IAM role credentials from ECS task automatically
 * 
 * Images are uploaded to S3 under /images/ folder and served via CloudFront at /images/*
 * Same CloudFront distribution serves both frontend and images
 */

const initializeS3 = async () => {
  // S3 client automatically uses IAM role credentials from ECS task
  const region = config.get('aws.region');
  const s3Client = new S3Client({ region });

  logger('Initializing S3 images upload...');

  await uploadMovieImages(s3Client);
};

// Function to upload movie images from local directory
const uploadMovieImages = async (s3Client) => {
  const imagesDir = path.join(__dirname, '..', 'images', 'movies');
  const bucketName = config.get('aws.s3.backendStorageBucket');

  try {
    const files = fs.readdirSync(imagesDir);
    const uploadPromises = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
        const filePath = path.join(imagesDir, file);
        const uploadPromise = uploadFile(s3Client, filePath, file, bucketName);
        uploadPromises.push(uploadPromise);
      }
    }

    const results = await Promise.all(uploadPromises);
    logger(`Uploaded files: ${results.filter(Boolean).join(', ')}`);
  } catch (error) {
    console.error('Error uploading movie images:', error);
  }
};

async function objectExists(s3Client, bucketName, key) {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    // Check for various error codes that indicate object doesn't exist
    if (
      error.name === 'NotFound' ||
      error.name === 'NoSuchKey' ||
      error.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }
    throw error;
  }
}

async function uploadFile(s3Client, filePath, fileName, bucketName) {
  // S3 key with images/ prefix to match CloudFront /images/* path behavior
  const s3Key = `images/${fileName}`;
  
  try {
    // Check if object already exists first
    const exists = await objectExists(s3Client, bucketName, s3Key);

    if (!exists) {
      const fileStream = fs.createReadStream(filePath);
      const contentType = getContentType(fileName);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: fileStream,
          ContentType: contentType,
        })
      );

      logger(`Successfully uploaded ${fileName} to ${bucketName}/${s3Key}`);
    } else {
      logger(`File ${s3Key} already exists in ${bucketName} bucket, skipping upload`);
    }

    // Return filename on successful upload
    return fileName;
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error);
    throw error;
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

module.exports.initializeS3 = initializeS3;
