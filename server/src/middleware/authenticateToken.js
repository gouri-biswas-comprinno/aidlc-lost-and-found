import jwt from 'jsonwebtoken';

export function createAuthenticateToken({
  jwtSecret = process.env.JWT_SECRET,
  isTokenBlacklisted = async () => false
} = {}) {
  return async (request, response, next) => {
    const authorization = request.get('authorization');
    if (!authorization) {
      return response.status(401).json({ message: 'Authorization header is required.' });
    }

    const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);
    if (scheme !== 'Bearer' || !token || extraParts.length > 0) {
      return response.status(401).json({ message: 'Authorization header must use Bearer token format.' });
    }

    if (!jwtSecret) {
      return response.status(401).json({ message: 'JWT authentication is not configured.' });
    }

    try {
      if (await isTokenBlacklisted(token)) {
        return response.status(401).json({ message: 'Token is no longer valid.' });
      }

      const payload = jwt.verify(token, jwtSecret);
      if (!payload.sub) {
        return response.status(401).json({ message: 'Token does not identify a user.' });
      }

      request.userId = String(payload.sub);
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ message: 'Token has expired.' });
      }
      return response.status(401).json({ message: 'Token is invalid.' });
    }
  };
}