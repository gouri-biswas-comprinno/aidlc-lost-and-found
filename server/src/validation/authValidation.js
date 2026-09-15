const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;

export function validateSignupInput(input = {}) {
  const errors = {};
  const value = {
    name: typeof input.name === 'string' ? input.name.trim() : input.name,
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : input.email,
    password: input.password
  };

  if (!value.name) errors.name = 'Name is required.';
  if (!value.email) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(value.email)) {
    errors.email = 'Email must be valid.';
  }
  if (!value.password) {
    errors.password = 'Password is required.';
  } else if (typeof value.password !== 'string' || value.password.length < minimumPasswordLength) {
    errors.password = `Password must be at least ${minimumPasswordLength} characters.`;
  }

  return { value, errors };
}

export function validateLoginInput(input = {}) {
  const errors = {};
  const value = {
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : input.email,
    password: input.password
  };

  if (!value.email) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(value.email)) {
    errors.email = 'Email must be valid.';
  }
  if (!value.password) errors.password = 'Password is required.';

  return { value, errors };
}