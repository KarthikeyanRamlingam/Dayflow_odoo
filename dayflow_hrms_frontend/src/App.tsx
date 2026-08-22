import { useEffect, useState } from 'react';
import './App.css';
import { AuthPage } from './pages/AuthPage';
import { EmployeesPage } from './pages/EmployeesPage';

const stats = [
  { label: 'Employees', value: '248' },
  { label: 'Present Today', value: '210' },
  { label: 'Pending Leaves', value: '18' },
  { label: 'Payroll Runs', value: '12' },
];

const modules = [
  'Authentication & role access',
  'Employee profile management',
  'Attendance tracking',
  'Leave approvals',
  'Payroll visibility',
  'Salary slips & reports',
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState<'overview' | 'employees'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('dayflow_token');
    setIsAuthenticated(Boolean(token));
  }, []);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Dayflow HRMS</div>
        <nav>
          <a className={`nav-item ${page === 'overview' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('overview'); }}>Overview</a>
          <a className={`nav-item ${page === 'employees' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('employees'); }}>Employees</a>
          <a className="nav-item" href="#">Attendance</a>
          <a className="nav-item" href="#">Leave</a>
          <a className="nav-item" href="#">Payroll</a>
          <a className="nav-item" href="#">Reports</a>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>Human Resource Management System</h1>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              localStorage.clear();
              setIsAuthenticated(false);
            }}
          >
            Logout
          </button>
        </header>

        {page === 'overview' && (
          <>
            <section className="stats-grid">
              {stats.map((item) => (
                <article key={item.label} className="stat-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </section>

            <section className="content-grid">
              <div className="panel">
                <h2>Project stack</h2>
                <ul className="stack-list">
                  <li>React + TypeScript frontend</li>
                  <li>Java Spring Boot backend</li>
                  <li>PostgreSQL database</li>
                  <li>Spring Security + JWT auth</li>
                  <li>JasperReports + Apache POI reporting</li>
                </ul>
              </div>

              <div className="panel">
                <h2>Core HR modules</h2>
                <ul className="module-list">
                  {modules.map((module) => (
                    <li key={module}>{module}</li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        {page === 'employees' && (
          <section className="content-grid">
            <div className="panel full-width">
              <EmployeesPage />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

