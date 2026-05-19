import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from './api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';

function Protected({ children }) {
  const token = localStorage.getItem('ttm_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getCurrentUser();
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Team Task Manager</div>
        {user ? (
          <div className="header-actions">
            <span>{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : null}
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<Signup onSignup={setUser} />} />
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard user={user} />
              </Protected>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <Protected>
                <ProjectPage user={user} />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
