import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAlertStore } from './store/useAlertStore';
import { useAuthStore } from './store/useAuthStore';
import AlertsMap from './components/AlertsMap';
import Navbar from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = useAuthStore((state) => state.token);
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const Home = () => {
    const { alerts, fetchAlerts, deleteAlert } = useAlertStore();
    const [search, setSearch] = useState('');
    const [filterArena, setFilterArena] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(() => {
            fetchAlerts();
        }, 2000);
        return () => clearInterval(interval);
    }, [fetchAlerts]);
    
    const [attackWarning, setAttackWarning] = useState(false);

    useEffect(() => {
        const now = new Date().getTime();
        const recentCriticals = alerts.filter(a => 
            a.priority === 'Critical' && 
            a.status === 'Active' && 
            a.createdAt &&
            (now - new Date(a.createdAt).getTime() <= 15000)
        );

        const arenas = new Set(recentCriticals.map(a => a.arena));
        
        if (arenas.has('North') && arenas.has('Center') && arenas.has('South')) {
            setAttackWarning(true);
        } else {
            setAttackWarning(false);
        }
    }, [alerts]);

    const filteredAlerts = alerts.filter(alert => {
        const matchName = alert.displayName.toLowerCase().includes(search.toLowerCase());
        const matchArena = filterArena ? alert.arena === filterArena : true;
        const matchPriority = filterPriority ? alert.priority === filterPriority : true;
        return matchName && matchArena && matchPriority;
    });

    const mapAlerts = filteredAlerts.map(a => ({
        id: a._id,
        displayName: a.displayName,
        priority: a.priority,
        lon: a.lon,
        lat: a.lat
    }));

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <Link to="/add">
                    <button>הוסף התראה</button>
                </Link>
                <div style={{ margin: '10px 0' }}>
                    <input 
                        placeholder="חפש לפי שם..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                    <select value={filterArena} onChange={(e) => setFilterArena(e.target.value)}>
                        <option value="">כל האיזורים</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="Center">Center</option>
                    </select>
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                        <option value="">כל הדחיפויות</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
                <ul>
                    {filteredAlerts.map(alert => (
                        <li key={alert._id}>
                            <Link to={`/alert/${alert._id}`}>{alert.displayName}</Link>
                            <span> - {alert.arena} - {alert.priority}</span>
                            <button onClick={() => deleteAlert(alert._id)}>מחק</button>
                            <Link to={`/edit/${alert._id}`}>ערוך</Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ flex: 1, height: '100vh' }}>
                <AlertsMap alerts={mapAlerts} />
            </div>
        </div>
    );
};

const AlertForm = ({ isEdit }: { isEdit?: boolean }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchAlertById, addAlert, updateAlert } = useAlertStore();
    
    const [form, setForm] = useState({
        displayName: '', description: '', priority: 'Low', status: 'Active', arena: 'North', lon: 34.78, lat: 32.08
    });

    useEffect(() => {
    if (isEdit && id) {
        fetchAlertById(id)
            .then(({ _id, ...rest }) => setForm(rest as any))
            .catch(() => alert('ההתראה לא נמצאה'));
    }
    }, [isEdit, id, fetchAlertById]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.displayName.trim() || !form.description.trim()) {
            return alert('שם ותיאור הם שדות חובה');
        }
        if (Number.isNaN(form.lon) || Number.isNaN(form.lat)) {
            return alert('יש להזין קו אורך וקו רוחב תקינים');
        }

        try {
            if (isEdit && id) {
                await updateAlert(id, form);
            } else {
                await addAlert(form);
            }
            navigate('/');
        } catch (error: any) {
            alert(error.response?.data?.message || 'שגיאה בשמירה');
        }
    };

    return (
        <div>
            <h2>{isEdit ? 'ערוך התראה' : 'הוסף התראה'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                <input placeholder="שם" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} required />
                <input placeholder="תיאור" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Handled">Handled</option>
                </select>
                <select value={form.arena} onChange={e => setForm({...form, arena: e.target.value})}>
                    <option value="North">North</option>
                    <option value="Center">Center</option>
                    <option value="South">South</option>
                </select>
                <input type="number" step="0.0001" placeholder="Lon" value={form.lon} onChange={e => setForm({...form, lon: parseFloat(e.target.value)})} required />
                <input type="number" step="0.0001" placeholder="Lat" value={form.lat} onChange={e => setForm({...form, lat: parseFloat(e.target.value)})} required />
                <button type="submit">שמור</button>
            </form>
            <Link to="/">חזור</Link>
        </div>
    );
};

const AlertDetails = () => {
    const { id } = useParams();
    const { fetchAlertById } = useAlertStore();
    const [alert, setAlert] = useState<any>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAlertById(id)
                .then(setAlert)
                .catch(() => setNotFound(true));
        }
    }, [id, fetchAlertById]);

    if (notFound) return <div>לא נמצא</div>;
    if (!alert) return <div>טוען...</div>;

    const mapAlert = {
        id: alert._id,
        displayName: alert.displayName,
        priority: alert.priority,
        lon: alert.lon,
        lat: alert.lat
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <h2>{alert.displayName}</h2>
                <p>{alert.description}</p>
                <p>עדיפות: {alert.priority}</p>
                <p>סטטוס: {alert.status}</p>
                <p>זירה: {alert.arena}</p>
                <Link to="/">חזור</Link>
            </div>
            <div style={{ flex: 1, height: '400px' }}>
                <AlertsMap alerts={[mapAlert]} />
            </div>
        </div>
    );
};


function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/add" element={<ProtectedRoute><AlertForm /></ProtectedRoute>} />
                <Route path="/edit/:id" element={<ProtectedRoute><AlertForm isEdit /></ProtectedRoute>} />
                <Route path="/alert/:id" element={<ProtectedRoute><AlertDetails /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;