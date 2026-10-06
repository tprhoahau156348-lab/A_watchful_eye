import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const AdminPage = () => {
    const { token, user } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [form, setForm] = useState({ username: '', password: '', email: '', role: 'arena_user', assignedArena: 'North' });

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/auth/users', { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/auth/register', form, { headers: { Authorization: `Bearer ${token}` } });
            fetchUsers();
        } catch (error) {
            alert('Failed to create user');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:3001/api/auth/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    if (user?.role !== 'admin') return <div>Access Denied</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin: Manage Users</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
                <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="arena_user">arena_user</option>
                    <option value="general_user">general_user</option>
                    <option value="admin">admin</option>
                </select>
                <select value={form.assignedArena} onChange={e => setForm({...form, assignedArena: e.target.value})}>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="Center">Center</option>
                    <option value="All">All</option>
                </select>
                <button type="submit">Create User</button>
            </form>

            <table border={1} cellPadding={5}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Arena</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id}>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.assignedArena}</td>
                            <td>
                                <button onClick={() => handleDelete(u._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

