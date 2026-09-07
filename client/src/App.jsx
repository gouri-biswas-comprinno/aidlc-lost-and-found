import { useEffect, useState } from 'react';
import Navigation from './components/Navigation.jsx';
import ReportFilters from './components/ReportFilters.jsx';
import ReportList from './components/ReportList.jsx';
import { getReports } from './services/reportService.js';

const initialFilters = {
  search: '',
  type: '',
  category: '',
  status: ''
};

export default function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignoreResponse = false;

    async function loadReports() {
      setLoading(true);
      setError('');

      try {
        const nextReports = await getReports(filters);
        if (!ignoreResponse) setReports(nextReports);
      } catch (requestError) {
        if (!ignoreResponse) setError(requestError.message);
      } finally {
        if (!ignoreResponse) setLoading(false);
      }
    }

    loadReports();

    return () => {
      ignoreResponse = true;
    };
  }, [filters]);

  return (
    <div className="app-shell" id="reports">
      <Navigation reportCount={reports.length} />
      <main>
        <section className="intro-section">
          <div>
            <p className="eyebrow">A shared record for misplaced things</p>
            <h1>Keep an eye out.</h1>
            <p className="intro-copy">
              Browse the latest lost and found reports from around the community.
            </p>
          </div>
          <div className="intro-stamp" aria-hidden="true">
            <span>Browse</span>
            <strong>01</strong>
          </div>
        </section>
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(initialFilters)}
        />
        <div className="results-heading">
          <div>
            <p className="eyebrow">Live directory</p>
            <h2>Recent reports</h2>
          </div>
          {!loading && !error && <span>{reports.length} {reports.length === 1 ? 'report' : 'reports'}</span>}
        </div>
        <ReportList reports={reports} loading={loading} error={error} />
      </main>
      <footer>Found &amp; Filed <span>•</span> Reports stay visible until marked resolved.</footer>
    </div>
  );
}
