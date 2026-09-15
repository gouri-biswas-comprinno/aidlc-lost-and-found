import { useEffect, useState } from 'react';
import AuthPanel from './components/AuthPanel.jsx';
import Navigation from './components/Navigation.jsx';
import ReportDetails from './components/ReportDetails.jsx';
import ReportForm from './components/ReportForm.jsx';
import ReportFilters from './components/ReportFilters.jsx';
import ReportList from './components/ReportList.jsx';
import { clearStoredAuth, getStoredAuth, logout } from './services/authService.js';
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
  const [view, setView] = useState('list');
  const [formType, setFormType] = useState('lost');
  const [editingReportId, setEditingReportId] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [auth, setAuth] = useState(getStoredAuth);
  const [authMode, setAuthMode] = useState('login');

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
  }, [filters, refreshKey]);

  function openCreateForm(type) {
    setFormType(type);
    setEditingReportId('');
    setNotice('');
    setView('form');
  }

  function openEditForm(id) {
    setEditingReportId(id);
    setNotice('');
    setView('form');
  }

  function openDetails(id) {
    setSelectedReportId(id);
    setNotice('');
    setView('details');
  }

  function handleDetailsBack() {
    setView('list');
    setRefreshKey((current) => current + 1);
  }

  function handleDetailsChanged() {
    setRefreshKey((current) => current + 1);
  }

  function handleReportDeleted(message) {
    setNotice(message);
    setView('list');
    setRefreshKey((current) => current + 1);
  }

  function handleFormSuccess(_report, message) {
    setNotice(message);
    setView('list');
    setRefreshKey((current) => current + 1);
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setNotice('');
    setView('auth');
  }

  function handleAuthenticated(authResponse) {
    setAuth(authResponse);
    setNotice('You are now signed in.');
    setView('list');
  }

  async function handleLogout() {
    try {
      await logout();
      clearStoredAuth();
      setAuth(null);
      setNotice('You have been logged out.');
      setView('list');
    } catch (requestError) {
      setNotice(requestError.message);
    }
  }

  return (
    <div className="app-shell" id="reports">
      <Navigation
        reportCount={reports.length}
        user={auth?.user}
        onCreate={openCreateForm}
        onLogin={() => openAuth('login')}
        onSignup={() => openAuth('signup')}
        onLogout={handleLogout}
      />
      <main>
        {view === 'auth' && <AuthPanel mode={authMode} onModeChange={(nextMode) => nextMode === 'list' ? setView('list') : setAuthMode(nextMode)} onAuthenticated={handleAuthenticated} />}
        {view === 'list' && <section className="intro-section">
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
        </section>}
        {view === 'list' && <div className="create-actions" aria-label="Create a report">
          <button className="primary-button" type="button" onClick={() => openCreateForm('lost')}>Create lost report</button>
          <button className="secondary-button" type="button" onClick={() => openCreateForm('found')}>Create found report</button>
        </div>}
        {notice && view === 'list' && <p className="success-message" role="status">{notice}</p>}
        {view === 'details' && (
          <ReportDetails
            reportId={selectedReportId}
            onBack={handleDetailsBack}
            onEdit={openEditForm}
            onChanged={handleDetailsChanged}
            onDeleted={handleReportDeleted}
          />
        )}
        {view === 'form' && (
          <ReportForm
            reportId={editingReportId}
            initialType={formType}
            onCancel={() => setView('list')}
            onSuccess={handleFormSuccess}
          />
        )}
        {view === 'list' && <ReportFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(initialFilters)}
        />}
        {view === 'list' && <div className="results-heading">
          <div>
            <p className="eyebrow">Live directory</p>
            <h2>Recent reports</h2>
          </div>
          {!loading && !error && <span>{reports.length} {reports.length === 1 ? 'report' : 'reports'}</span>}
        </div>}
        {view === 'list' && <ReportList reports={reports} loading={loading} error={error} onEdit={openEditForm} onView={openDetails} />}
      </main>
      <footer>Found &amp; Filed <span>•</span> Reports stay visible until marked resolved.</footer>
    </div>
  );
}
