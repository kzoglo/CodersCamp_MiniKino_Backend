const Client = require('minio').Client;
const fs = require('fs');
const path = require('path');
const config = require('config');
const logger = require('../assistive_functions/logger');

async function setBucketPublicReadPolicy(minioClient, bucketName) {
  try {
    // This policy allows public read access to all objects in the bucket
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    logger(`Successfully set public read policy for bucket ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`Error setting bucket policy for ${bucketName}:`, error);
    throw error;
  }
}

const initializeMinIO = async (bucket = 'movies') => {
  const { endpoint, port } = config.get('minio');

  const minioClient = new Client({
    endPoint: endpoint,
    port,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'password',
  });

  // Check if the bucket exists, if it doesn't, create it
  const exists = await minioClient.bucketExists(bucket);
  if (exists) {
    logger('Bucket ' + bucket + ' exists.');
  } else {
    await minioClient.makeBucket(bucket);
    logger('Bucket ' + bucket + ' created.');
  }

  await setBucketPublicReadPolicy(minioClient, bucket);

  const data = [];
  const stream = minioClient.listObjects(bucket, '', true);
  stream.on('data', (obj) => {
    data.push(obj);
  });
  stream.on('end', async () => {
    await uploadMovieImages(minioClient, bucket);
    // }
  });
  stream.on('error', (err) => {
    console.error(err);
  });
};

// Function to upload movie images from local directory
const uploadMovieImages = async (minioClient, bucket) => {
  const imagesDir = path.join(__dirname, '..', 'images', 'movies');

  try {
    const files = fs.readdirSync(imagesDir);
    const uploadPromises = [];

    for (const file of files) {
      if (
        path.extname(file).toLowerCase() === '.jpg' ||
        path.extname(file).toLowerCase() === '.jpeg' ||
        path.extname(file).toLowerCase() === '.png'
      ) {
        const filePath = path.join(imagesDir, file);
        const uploadPromise = uploadFile(minioClient, filePath, file, bucket);
        uploadPromises.push(uploadPromise);
      }
    }

    const results = await Promise.all(uploadPromises);
    logger(`Uploaded files: ${results}`);
  } catch (error) {
    console.error('Error uploading movie images:', error);
  }
};

async function objectExists(minioClient, bucketName, fileName) {
  try {
    await minioClient.statObject(bucketName, fileName);
    return true;
  } catch (error) {
    // Check for various error codes that indicate object doesn't exist
    if (
      error.code === 'NoSuchKey' ||
      error.code === 'NotFound' ||
      error.code === 'NoSuchObject' ||
      error.message.includes('not found') ||
      error.message.includes('does not exist')
    ) {
      return false;
    }
    throw error;
  }
}

async function uploadFile(minioClient, filePath, fileName, bucketName) {
  try {
    // Check if object already exists first
    const exists = await objectExists(minioClient, bucketName, fileName);

    if (!exists) {
      const fileStream = fs.createReadStream(filePath);
      await minioClient.putObject(bucketName, fileName, fileStream);
      logger(`Successfully uploaded ${fileName} to ${bucketName} bucket`);
    } else {
      logger(
        `File ${fileName} already exists in ${bucketName} bucket, skipping upload`
      );
    }

    return fileName;
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error);
    throw error;
  }
}

module.exports.initializeMinIO = initializeMinIO;
