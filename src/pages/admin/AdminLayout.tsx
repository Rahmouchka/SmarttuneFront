// src/components/admin/AdminLayout.tsx → REMPLACE TOUT PAR ÇA
import AdminNavbar from './AdminNavbar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <>
            <AdminNavbar />
            <main className="pt-20 min-h-screen bg-gradient-bg">
                <Outlet />
            </main>
        </>
    );
}