import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import Loader from './Loader.jsx';
import { useDarkMode } from '../../context/DarkModeContext.jsx';

/**
 * ProtectedRoute — wraps authenticated pages with dark mode support.
 */
export default function ProtectedRoute({ requireAdmin = false }) {
  const { user, token, initializing } = useSelector((state) => state.auth);
  const { dark } = useDarkMode();

  if (initializing) return <Loader message="Loading your account..." />;
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user && !user.isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: dark ? '#0f172a' : '#f1f5f9',
      transition: 'background 0.3s ease',
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Navbar />
        <main style={{
          flex: 1, overflowY: 'auto', padding: '24px',
          animation: 'fadeIn 0.3s ease-in-out',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
    </div>
  );
}
