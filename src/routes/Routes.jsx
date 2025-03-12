import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import Layout from '../components/Layout';
import Profile from '../pages/Profile';
import AlbumSearch from '../components/AlbumSearch';
import Callback from '../pages/Callback';
import AlbumDetail from '../pages/AlbumDetail'; // Importa AlbumDetail
import { useAuth } from '../hooks/useAuth';

function ProtectedRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/signup',
                element: <Signup />,
            },
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/search',
                element: <AlbumSearch />,
            },
            {
                path: '/callback',
                element: <Callback />,
            },
            {
                path: '/album/:id', // Aggiungi la rotta per AlbumDetail
                element: <AlbumDetail />,
            },
            {
                element: <ProtectedRoutes />,
                children: [
                    {
                        path: '/profile',
                        element: <Profile />,
                    },
                ],
            },
        ],
    },
]);

export default router;