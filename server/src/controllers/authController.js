import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateLoginInput, validateSignupInput } from '../validation/authValidation.js';

function serializeUser(user) {
  const plainUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  const { passwordHash, _id, ...safeUser } = plainUser;
  return { ...safeUser, id: String(_id) };
}

export function createAuthController(User, { jwtSecret = process.env.JWT_SECRET, jwtExpiresIn = process.env.JWT_EXPIRES_IN } = {}) {
  return {
    signup: async (request, response, next) => {
      try {
        const { value, errors } = validateSignupInput(request.body);
        if (Object.keys(errors).length > 0) {
          return response.status(400).json({ message: 'Signup data is invalid.', errors });
        }

        const existingUser = await User.findOne({ email: value.email }).lean();
        if (existingUser) {
          return response.status(409).json({ message: 'Email is already registered.' });
        }

        const passwordHash = await bcrypt.hash(value.password, 12);
        const user = await User.create({
          name: value.name,
          email: value.email,
          passwordHash
        });

        return response.status(201).json(serializeUser(user));
      } catch (error) {
        if (error.code === 11000) {
          return response.status(409).json({ message: 'Email is already registered.' });
        }
        return next(error);
      }
    },

    login: async (request, response, next) => {
      try {
        const { value, errors } = validateLoginInput(request.body);
        if (Object.keys(errors).length > 0) {
          return response.status(400).json({ message: 'Login data is invalid.', errors });
        }

        if (!jwtSecret || !jwtExpiresIn) {
          return next(new Error('JWT configuration is missing.'));
        }

        const userQuery = User.findOne({ email: value.email });
        if (typeof userQuery.select === 'function') userQuery.select('+passwordHash');
        const user = await userQuery.lean();
        if (!user || !(await bcrypt.compare(value.password, user.passwordHash))) {
          return response.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ sub: String(user._id) }, jwtSecret, { expiresIn: jwtExpiresIn });
        return response.json({ token, user: serializeUser(user) });
      } catch (error) {
        return next(error);
      }
    }
  };
}