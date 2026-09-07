export function notFoundHandler(request, response) {
  response.status(404).json({ message: 'Route not found.' });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: 'Report data is invalid.' });
  }

  if (error.name === 'CastError') {
    return response.status(400).json({ message: 'Report id is invalid.' });
  }

  console.error(error);
  return response.status(500).json({ message: 'An unexpected server error occurred.' });
}
