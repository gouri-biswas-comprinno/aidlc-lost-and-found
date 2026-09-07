import { useEffect, useState } from 'react';
import { deleteReport, getReportById, resolveReport } from '../services/reportService.js';

function formatDate(date, includeTime = false) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {})
  }).format(new Date(date));
}

export default function ReportDetails({ reportId, onBack, onEdit, onChanged, onDeleted }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let ignoreResponse = false;

    async function loadReport() {
      setLoading(true);
      setError('');
      try {
        const nextReport = await getReportById(reportId);
        if (!ignoreResponse) setReport(nextReport);
      } catch (requestError) {
        if (!ignoreResponse) setError(requestError.message);
      } finally {
        if (!ignoreResponse) setLoading(false);
      }
    }

    loadReport();
    return () => { ignoreResponse = true; };
  }, [reportId]);

  async function handleResolve() {
    setActionLoading(true);
    setActionError('');
    setActionMessage('');
    try {
      const updatedReport = await resolveReport(reportId);
      setReport(updatedReport);
      setActionMessage('Report marked as resolved.');
      onChanged();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Are you sure you want to delete this report?');
    if (!confirmed) return;

    setActionLoading(true);
    setActionError('');
    try {
      await deleteReport(reportId);
      onDeleted('Report deleted successfully.');
    } catch (requestError) {
      setActionError(requestError.message);
      setActionLoading(false);
    }
  }

  if (loading) return <div className="feedback-panel" role="status">Loading report details...</div>;

  if (error) {
    return (
      <div className="form-error-panel" role="alert">
        <p>{error}</p>
        <button className="secondary-button" type="button" onClick={onBack}>Back to reports</button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <section className="details-panel" aria-labelledby="details-heading">
      <div className="details-heading-row">
        <button className="text-button" type="button" onClick={onBack}>← Back to reports</button>
        <span className={`status-badge ${report.status}`}>{report.status}</span>
      </div>
      <div className="details-title-row">
        <div>
          <p className={`type-badge ${report.type}`}>{report.type === 'lost' ? 'Lost item' : 'Found item'}</p>
          <h2 id="details-heading">{report.title}</h2>
        </div>
        <span className="details-category">{report.category}</span>
      </div>
      {actionMessage && <p className="success-message" role="status">{actionMessage}</p>}
      {actionError && <p className="inline-error" role="alert">{actionError}</p>}
      <p className="details-description">{report.description}</p>
      <dl className="details-grid">
        <div><dt>Location</dt><dd>{report.location}</dd></div>
        <div><dt>Date</dt><dd>{formatDate(report.date)}</dd></div>
        <div><dt>Contact name</dt><dd>{report.contactName}</dd></div>
        <div><dt>Contact email</dt><dd>{report.contactEmail}</dd></div>
        {report.createdAt && <div><dt>Created</dt><dd>{formatDate(report.createdAt, true)}</dd></div>}
        {report.updatedAt && <div><dt>Last updated</dt><dd>{formatDate(report.updatedAt, true)}</dd></div>}
      </dl>
      <div className="details-actions">
        <button className="secondary-button" type="button" onClick={() => onEdit(report.id)} disabled={actionLoading}>Edit report</button>
        {report.status === 'active' && (
          <button className="primary-button" type="button" onClick={handleResolve} disabled={actionLoading}>
            {actionLoading ? 'Working...' : 'Mark as resolved'}
          </button>
        )}
        <button className="danger-button" type="button" onClick={handleDelete} disabled={actionLoading}>Delete report</button>
      </div>
    </section>
  );
}