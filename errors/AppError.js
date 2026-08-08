class AppError extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statuscode = statuscode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
