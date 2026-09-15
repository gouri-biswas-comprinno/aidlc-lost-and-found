export default function Navigation({ reportCount, user, onCreate, onLogin, onSignup, onLogout }) {
  return (
    <header className="site-header">
      <a className="brand" href="#reports" aria-label="Found and Filed reports">
        <span className="brand-mark" aria-hidden="true">FF</span>
        <span>
          <strong>Found &amp; Filed</strong>
          <small>Community item desk</small>
        </span>
      </a>
      <nav aria-label="Main navigation">
        <a className="nav-link active" href="#reports">Reports</a>
        <button className="nav-create" type="button" onClick={() => onCreate('lost')}>Add report</button>
        {user ? (
          <>
            <span className="user-greeting">{user.name}</span>
            <button className="nav-auth" type="button" onClick={onLogout}>Log out</button>
          </>
        ) : (
          <>
            <button className="nav-auth" type="button" onClick={onLogin}>Log in</button>
            <button className="nav-auth nav-auth-accent" type="button" onClick={onSignup}>Sign up</button>
          </>
        )}
        <span className="report-count">{reportCount} shown</span>
      </nav>
    </header>
  );
}
