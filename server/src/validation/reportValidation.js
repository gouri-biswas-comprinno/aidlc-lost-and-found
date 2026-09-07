const allowedTypes = new Set(['lost', 'found']);
const allowedStatuses = new Set(['active', 'resolved']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requiredFields = [
  'title',
  'description',
  'type',
  'category',
  'location',
  'date',
  'contactName',
  'contactEmail'
];

export function validateReportInput(input, { allowStatus = true } = {}) {
  const errors = {};
  const value = { ...input };

  for (const field of requiredFields) {
    if (value[field] === undefined || String(value[field]).trim() === '') {
      errors[field] = 'This field is required.';
    }
  }

  for (const field of ['title', 'description', 'category', 'location', 'contactName', 'contactEmail']) {
    if (typeof value[field] === 'string') {
      value[field] = value[field].trim();
    }
  }

  if (value.type !== undefined && !allowedTypes.has(value.type)) {
    errors.type = 'Type must be lost or found.';
  }

  if (value.date !== undefined && Number.isNaN(Date.parse(value.date))) {
    errors.date = 'Date must be valid.';
  }

  if (value.contactEmail !== undefined && !emailPattern.test(value.contactEmail.trim())) {
    errors.contactEmail = 'Contact email must be valid.';
  }

  if (allowStatus && value.status !== undefined && !allowedStatuses.has(value.status)) {
    errors.status = 'Status must be active or resolved.';
  }

  if (!allowStatus) {
    delete value.status;
  }

  return { value, errors };
}

export function validateReportFilters(query) {
  const errors = {};
  if (query.type && !allowedTypes.has(query.type)) {
    errors.type = 'Type must be lost or found.';
  }
  if (query.status && !allowedStatuses.has(query.status)) {
    errors.status = 'Status must be active or resolved.';
  }
  return errors;
}
