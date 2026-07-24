function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "A kért végpont nem található.",
    path: req.originalUrl,
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details || null,
    });
  }

  if (error.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "A megadott egyedi adat már használatban van.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Hiba történt a szerveren.",
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};