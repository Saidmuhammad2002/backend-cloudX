const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
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
