import jwt from 'jsonwebtoken';

export function createAuthenticateToken({
  jwtSecret = process.env.JWT_SECRET,
  blacklistModel,
  isTokenBlacklisted = async () => false
} = {}) {
  const checkBlacklist = blacklistModel
    ? async (token) => {
        const record = await blacklistModel.findOne({ token }).lean();
        return Boolean(record && new Date(record.expiresAt) > new Date());
      }
    : isTokenBlacklisted;

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
      const payload = jwt.verify(token, jwtSecret);
      if (!payload.sub) {
        return response.status(401).json({ message: 'Token does not identify a user.' });
      }

      if (await checkBlacklist(token)) {
        return response.status(401).json({ message: 'Token is no longer valid.' });
      }

      request.userId = String(payload.sub);
      request.authToken = token;
      request.authTokenExpiresAt = new Date(payload.exp * 1000);
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ message: 'Token has expired.' });
      }
      return response.status(401).json({ message: 'Token is invalid.' });
    }
  };
}