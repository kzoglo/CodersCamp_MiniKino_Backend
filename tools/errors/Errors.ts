export class ServerError extends Error {
  name: string;
  status: number;
  message: string;

  constructor(status: number | undefined, message: string | undefined) {
    super();
    this.name = 'ServerError';
    this.status = status ? status : 500;
    this.message = message ? message : 'Server Error';
  }
}

export class ValidationError extends Error {
  name: string;
  status: number;
  message: string;

  constructor(reqData: string, dataType: string) {
    super();
    this.name = 'ValidationError';
    this.status = 422;
    const message = dataType === 'length' ? `${reqData[0].toUpperCase()}${reqData.slice(1)} has wrong ${dataType}` : `${reqData[0].toUpperCase()}${reqData.slice(1)} is not of type ${dataType}`;
    this.message = message;
  }
}
