// import-service/handlers/importFileParser.ts
import { Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
const csv = require('csv-parser');

const s3 = new S3();

export const handler:Handler = async (event) => {
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      // Use the original key as it appears in the event
      const originalKey = record.s3.object.key;
      const decodedKey = decodeURIComponent(originalKey);
      
      console.log(`Processing file from bucket: ${bucket}, original key: ${originalKey}, decoded key: ${decodedKey}`);

      try {
        // Use decodedKey for S3 operations
        const params = { Bucket: bucket, Key: decodedKey };
        const s3Stream = s3.getObject(params).createReadStream();

        await new Promise((resolve, reject) => {
          s3Stream
            .pipe(csv())
            .on('data', (data:any) => console.log('Parsed row:', data))
            .on('end', resolve)
            .on('error', reject);
        });

        // Create destination key for parsed folder
        const destKey = decodedKey.replace('uploaded/', 'parsed/');
        console.log(`Moving file from ${decodedKey} to ${destKey}`);
        
        // Use proper URL encoding for CopySource
        await s3.copyObject({
          Bucket: bucket,
          CopySource: encodeURIComponent(`${bucket}/${decodedKey}`),
          Key: destKey,
        }).promise();
        
        await s3.deleteObject({ Bucket: bucket, Key: decodedKey }).promise();
      } catch (fileError) {
        console.error(`Error processing file ${decodedKey}:`, fileError);
        throw fileError;
      }
    }
    return { statusCode: 200, body: 'Processing complete' };
  } catch (error) {
    console.error('Error in lambda handler:', error);
    return { statusCode: 500, body: 'Processing failed' };
  }
};