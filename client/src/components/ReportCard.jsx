function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}

export default function ReportCard({ report, onEdit }) {
  const typeLabel = report.type === 'lost' ? 'Lost item' : 'Found item';

  return (
    <article className={`report-card ${report.type}`}>
      <div className="card-topline">
        <span className={`type-badge ${report.type}`}>{typeLabel}</span>
        <span className={`status-badge ${report.status}`}>{report.status}</span>
      </div>
      <h3>{report.title}</h3>
      <p className="report-description">{report.description}</p>
      <dl className="report-meta">
        <div>
          <dt>Category</dt>
          <dd>{report.category}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{report.location}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDate(report.date)}</dd>
        </div>
      </dl>
      <button className="card-action" type="button" onClick={() => onEdit(report.id)}>
        Edit report
      </button>
    </article>
  );
}
