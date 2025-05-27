const AWSMock = require('aws-sdk-mock');
import * as AWS from 'aws-sdk';
import { handler } from '../src/lambdas/importProductsFile';

AWSMock.setSDKInstance(AWS);

describe('importProductsFile Lambda', () => {
  beforeAll(() => {
    process.env.BUCKET_NAME = 'test-bucket';

    AWSMock.mock('S3', 'getSignedUrl', (operation: string, params: any, callback: Function) => {
     return callback(null, 'https://mock-signed-url');
    });
  });

  afterAll(() => {
    AWSMock.restore('S3');
  });

  it('returns 400 if no filename is provided', async () => {
    const event = { queryStringParameters: {} };
    const result = await handler(event, {} as any, () => {});
    expect(result.statusCode).toBe(400);
    expect(result.body).toBe('Missing file name');
  });

  it('returns signed url when filename is provided', async () => {
    const event = { queryStringParameters: { name: 'test.csv' } };
    const result = await handler(event, {} as any, () => {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.url).toBe('https://mock-signed-url');
  });
});