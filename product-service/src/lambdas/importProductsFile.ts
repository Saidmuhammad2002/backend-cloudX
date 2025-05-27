import { Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { buildResponse } from '../utils/responseBuillder';

export const handler:Handler = async (event) => {
    const fileName = event.queryStringParameters?.name;
    if (!fileName) return { statusCode: 400, body: 'Missing file name' };
    
    const s3 = new S3({ region: process.env.AWS_REGION });
    
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `uploaded/${fileName}`,
    Expires: 60, // 1 minute
    ContentType: 'text/csv',
  };

  const signedUrl = s3.getSignedUrl('putObject', params);

  return buildResponse(200, {
    url: signedUrl,
  });   
};
