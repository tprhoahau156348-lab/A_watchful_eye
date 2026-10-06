import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav style={{ display: 'flex', gap: '20px', padding: '15px', backgroundColor: '#e5e4e7', marginBottom: '20px', borderRadius: '5px' }}>
            <strong>עין צופיה</strong>
            <span>{user.username} - {user.role}</span>
            <Link to="/">ראשי</Link>
            {user.role === 'admin' && <Link to="/admin">ניהול משתמשים</Link>}
            <button onClick={handleLogout}>התנתק</button>
        </nav>
    );
};

export default Navbar;
