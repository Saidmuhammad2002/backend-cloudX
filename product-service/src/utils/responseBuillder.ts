const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const buildResponse = (
  statusCode: number,
  body: any,
  customHeaders = {}
) => {
  return {
    statusCode,
    headers: { ...defaultHeaders, ...customHeaders },
    body: JSON.stringify(body),
  };
};
