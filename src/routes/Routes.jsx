import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import Layout from '../components/Layout';
import Profile from '../pages/Profile';
import AlbumSearch from '../components/AlbumSearch';
// import Callback from '../pages/Callback';
import AlbumDetail from '../pages/AlbumDetail'; // Importa AlbumDetail
import { useAuth } from '../hooks/useAuth';
import ArtistDetail from '../pages/ArtistDetail';
import Account from '../pages/Account';
import UserReviews from '../pages/UserReviews';


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
            // {
            //     path: '/callback',
            //     element: <Callback />,
            // },
            {
                path: '/artist/:artistId',
                element: <ArtistDetail />,
            },
            {
                path: '/album/:collectionId', 
                element: <AlbumDetail />,
            },
            {
                path: '/profile', 
                element: <Profile />,
            },
            {
                path: '/user/:userId/profile',
                element: <Profile />,
            },
            {
                path: '/user/:userId/reviews',
                element: <UserReviews />,
            },
            {
                path: '/account',
                element: <ProtectedRoutes />,
                children: [
                    {
                        path: '', 
                        element: <Account />,
                    },
                ],
            },
        
        ],
    },
]);

export default router;