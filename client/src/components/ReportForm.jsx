import { useEffect, useState } from 'react';
import { createReport, getReportById, updateReport } from '../services/reportService.js';

const categories = [
  'Electronics',
  'Documents',
  'Clothing',
  'Accessories',
  'Keys',
  'Bags',
  'Pets',
  'Other'
];

const emptyReport = {
  title: '',
  description: '',
  type: 'lost',
  category: '',
  location: '',
  date: '',
  contactName: '',
  contactEmail: '',
  status: 'active'
};

function toFormValues(report) {
  return {
    title: report.title || '',
    description: report.description || '',
    type: report.type || 'lost',
    category: report.category || '',
    location: report.location || '',
    date: report.date ? report.date.slice(0, 10) : '',
    contactName: report.contactName || '',
    contactEmail: report.contactEmail || '',
    status: report.status || 'active'
  };
}

function validate(values) {
  const errors = {};
  const requiredFields = [
    ['title', 'Title'],
    ['description', 'Description'],
    ['category', 'Category'],
    ['location', 'Location'],
    ['date', 'Date'],
    ['contactName', 'Contact name'],
    ['contactEmail', 'Contact email']
  ];

  for (const [field, label] of requiredFields) {
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  }

  if (values.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
    errors.contactEmail = 'Enter a valid email address.';
  }

  return errors;
}

export default function ReportForm({ reportId, initialType = 'lost', onCancel, onSuccess }) {
  const isEditMode = Boolean(reportId);
  const [values, setValues] = useState({ ...emptyReport, type: initialType });
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    if (!reportId) return undefined;

    let ignoreResponse = false;
    async function loadReport() {
      setLoading(true);
      setRequestError('');
      try {
        const report = await getReportById(reportId);
        if (!ignoreResponse) setValues(toFormValues(report));
      } catch (error) {
        if (!ignoreResponse) setRequestError(error.message);
      } finally {
        if (!ignoreResponse) setLoading(false);
      }
    }

    loadReport();
    return () => { ignoreResponse = true; };
  }, [reportId]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setRequestError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = { ...values };
      if (!isEditMode) delete payload.status;
      const savedReport = isEditMode
        ? await updateReport(reportId, payload)
        : await createReport(payload);
      onSuccess(savedReport, isEditMode ? 'Report updated successfully.' : 'Report created successfully.');
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="feedback-panel" role="status">Loading report...</div>;

  if (requestError && isEditMode && !values.title) {
    return (
      <div className="form-error-panel" role="alert">
        <p>{requestError}</p>
        <button className="secondary-button" type="button" onClick={onCancel}>Back to reports</button>
      </div>
    );
  }

  return (
    <section className="form-panel" aria-labelledby="form-heading">
      <div className="form-heading-row">
        <div>
          <p className="eyebrow">{isEditMode ? 'Update a record' : 'Add to the desk'}</p>
          <h2 id="form-heading">{isEditMode ? 'Edit report' : values.type === 'lost' ? 'Create lost report' : 'Create found report'}</h2>
        </div>
        <button className="text-button" type="button" onClick={onCancel}>Back to reports</button>
      </div>
      {requestError && <p className="inline-error" role="alert">{requestError}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <label>
            <span>Report type</span>
            <select name="type" value={values.type} onChange={updateField}>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </label>
          <label>
            <span>Category</span>
            <select name="category" value={values.category} onChange={updateField} aria-invalid={Boolean(errors.category)}>
              <option value="">Choose a category</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {errors.category && <small className="field-error">{errors.category}</small>}
          </label>
          <label className="wide-field">
            <span>Title</span>
            <input name="title" value={values.title} onChange={updateField} placeholder="Example: Blue backpack" aria-invalid={Boolean(errors.title)} />
            {errors.title && <small className="field-error">{errors.title}</small>}
          </label>
          <label className="wide-field">
            <span>Description</span>
            <textarea name="description" value={values.description} onChange={updateField} rows="4" placeholder="Add details that help identify the item" aria-invalid={Boolean(errors.description)} />
            {errors.description && <small className="field-error">{errors.description}</small>}
          </label>
          <label>
            <span>Location</span>
            <input name="location" value={values.location} onChange={updateField} placeholder="Where was it lost or found?" aria-invalid={Boolean(errors.location)} />
            {errors.location && <small className="field-error">{errors.location}</small>}
          </label>
          <label>
            <span>Date</span>
            <input type="date" name="date" value={values.date} onChange={updateField} aria-invalid={Boolean(errors.date)} />
            {errors.date && <small className="field-error">{errors.date}</small>}
          </label>
          <label>
            <span>Contact name</span>
            <input name="contactName" value={values.contactName} onChange={updateField} aria-invalid={Boolean(errors.contactName)} />
            {errors.contactName && <small className="field-error">{errors.contactName}</small>}
          </label>
          <label>
            <span>Contact email</span>
            <input type="email" name="contactEmail" value={values.contactEmail} onChange={updateField} placeholder="you@example.com" aria-invalid={Boolean(errors.contactEmail)} />
            {errors.contactEmail && <small className="field-error">{errors.contactEmail}</small>}
          </label>
          {isEditMode && (
            <label>
              <span>Status</span>
              <select name="status" value={values.status} onChange={updateField}>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
          )}
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create report'}
          </button>
          <button className="secondary-button" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
        </div>
      </form>
    </section>
  );
}