import ReportCard from './ReportCard.jsx';

export default function ReportList({ reports, loading, error }) {
  if (loading) {
    return <div className="feedback-panel" role="status">Loading reports...</div>;
  }

  if (error) {
    return <div className="feedback-panel error" role="alert">{error}</div>;
  }

  if (reports.length === 0) {
    return <div className="feedback-panel">No reports found.</div>;
  }

  return (
    <section className="report-list" aria-label="Lost-and-found reports">
      {reports.map((report) => <ReportCard key={report.id} report={report} />)}
    </section>
  );
}
