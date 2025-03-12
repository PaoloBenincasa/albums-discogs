import React, { useState, useEffect } from 'react';
import { supabase, fetchAlbumDetails } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router'; // Importa Link

const Profile = () => {
    const { user, loading } = useAuth();
    const [alreadyListenedAlbums, setAlreadyListenedAlbums] = useState([]);
    const [wishlistAlbums, setWishlistAlbums] = useState([]);
    const [alreadyListenedAlbumDetails, setAlreadyListenedAlbumDetails] = useState([]);
    const [wishlistAlbumDetails, setWishlistAlbumDetails] = useState([]);

    useEffect(() => {
        const getUserData = async () => {
            if (user) {
                const { data: alreadyListenedData } = await supabase
                    .from('already_listened')
                    .select('*')
                    .eq('user_id', user.id);
                const { data: wishlistData } = await supabase
                    .from('wishlist')
                    .select('*')
                    .eq('user_id', user.id);
                setAlreadyListenedAlbums(alreadyListenedData || []);
                setWishlistAlbums(wishlistData || []);
            }
        };

        getUserData();
    }, [user]);

    useEffect(() => {
        const fetchAlreadyListenedAlbumDetails = async () => {
            if (alreadyListenedAlbums) {
                const details = [];
                for (const album of alreadyListenedAlbums) {
                    try {
                        const data = await fetchAlbumDetails(album.album_id);
                        if (data) {
                            details.push({ ...data, rating: album.rating });
                        }
                    } catch (error) {
                        console.error(`Error fetching details for already listened album ${album.album_id}:`, error);
                    }
                }
                setAlreadyListenedAlbumDetails(details);
            }
        };

        fetchAlreadyListenedAlbumDetails();
    }, [alreadyListenedAlbums]);

    useEffect(() => {
        const fetchWishlistAlbumDetails = async () => {
            if (wishlistAlbums) {
                const details = [];
                for (const album of wishlistAlbums) {
                    try {
                        const data = await fetchAlbumDetails(album.album_id);
                        if (data) {
                            details.push(data);
                        }
                    } catch (error) {
                        console.error(`Error fetching details for wishlist album ${album.album_id}:`, error);
                    }
                }
                setWishlistAlbumDetails(details);
            }
        };

        fetchWishlistAlbumDetails();
    }, [wishlistAlbums]);

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (!user) {
        return <div>Utente non autenticato</div>;
    }

    return (
        <div>
            <h2>Ciao {user.user_metadata?.display_name}</h2>
            <div>
                <h3>Album Già Ascoltati</h3>
                <ul className='profileList'>
                    {alreadyListenedAlbumDetails &&
                        alreadyListenedAlbumDetails.map((album) => (
                            <li key={album.id}>
                                <Link to={`/album/${album.id}`}>
                                    {album.images && album.images.length > 0 && (
                                        <img
                                            src={album.images[0].url}
                                            alt={album.name}
                                            className='albumCoverSmall me-2'
                                        />
                                    )}
                                    <strong>{album.name}</strong> di {album.artists.map((artist) => artist.name).join(', ')}
                                    {album.rating !== null && ` (Voto: ${album.rating})`}
                                </Link>
                            </li>
                        ))}
                </ul>
            </div>
            <div>
                <h3>Wishlist</h3>
                <ul className='profileList'>
                    {wishlistAlbumDetails &&
                        wishlistAlbumDetails.map((album) => (
                            <li key={album.id}>
                                <Link to={`/album/${album.id}`} >
                                    {album.images && album.images.length > 0 && (
                                        <img
                                            src={album.images[0].url}
                                            alt={album.name}
                                            className='albumCoverSmall me-2'
                                        />
                                    )}
                                    <strong>{album.name}</strong> di {album.artists.map((artist) => artist.name).join(', ')}
                                </Link>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default Profile;