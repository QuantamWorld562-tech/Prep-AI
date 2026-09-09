const errorHandler = (err, req, res, next) => {
  //check If a status code isn't set,set default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show the detailed error stack trace in development, NOT production for safety
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
