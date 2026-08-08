export default (err, req, res, next) => {
  const statuscode = err.statuscode || 500;
  const message = err.isOperational ? err.message : "something went wrong";
  console.log(err);

  res.status(statuscode).json({
    success: false,
    message,
  });
};
