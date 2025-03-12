import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { fetchAlbumDetails, addAlbumToAlreadyListened, addAlbumToWishlist, supabase } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const AlbumDetail = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRatingInput, setShowRatingInput] = useState(false);
    const [rating, setRating] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    const [alreadyListened, setAlreadyListened] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);
    const [showAlreadyListenedBadge, setShowAlreadyListenedBadge] = useState(false);
    const [showWishlistBadge, setShowWishlistBadge] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const getAlbumDetails = async () => {
            try {
                const albumData = await fetchAlbumDetails(id);
                setAlbum(albumData);
                setLoading(false);
            } catch (error) {
                console.error('Errore durante il recupero dei dettagli dell\'album:', error);
                setLoading(false);
            }
        };

        const checkAlbumLists = async () => {
            if (user && album) {
                const { data: alreadyListenedData } = await supabase
                    .from('already_listened')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('album_id', album.id);
                const { data: wishlistData } = await supabase
                    .from('wishlist')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('album_id', album.id);
                setAlreadyListened(alreadyListenedData && alreadyListenedData.length > 0);
                setInWishlist(wishlistData && wishlistData.length > 0);
                setShowAlreadyListenedBadge(alreadyListenedData && alreadyListenedData.length > 0);
                setShowWishlistBadge(wishlistData && wishlistData.length > 0);
            }
        };

        getAlbumDetails();
        checkAlbumLists();
    }, [id, user, album]);

    const removeFromWishlist = async () => {
        if (!user || !album) return;
        try {
            const { error } = await supabase
                .from('wishlist')
                .delete()
                .eq('user_id', user.id)
                .eq('album_id', album.id);
            if (error) {
                console.error('Errore durante la rimozione dell\'album dalla wishlist:', error);
            } else {
                setInWishlist(false);
                setShowWishlistBadge(false);
            }
        } catch (error) {
            console.error('Errore durante la rimozione dell\'album dalla wishlist:', error);
        }
    };

    const handleAddToAlreadyListened = () => {
        setShowRatingInput(true);
    };

    const handleRatingSubmit = async () => {
        if (!user || !album) return;
        try {
            const ratingValue = parseInt(rating);
            await addAlbumToAlreadyListened(user.id, album, ratingValue);
            console.log(`Album "${album.name}" aggiunto a "già ascoltati" con rating ${ratingValue}`);
            setShowRatingInput(false);
            setRatingSubmitted(true);
            setAlreadyListened(true);
            setShowAlreadyListenedBadge(true);
            if (inWishlist) {
                await removeFromWishlist();
            }
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "già ascoltati":', error);
        }
    };

    const handleAddToWishlist = async () => {
        if (!user || !album) return;
        try {
            await addAlbumToWishlist(user.id, album);
            console.log(`Album "${album.name}" aggiunto a "da ascoltare"`);
            setInWishlist(true);
            setShowWishlistBadge(true);
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "da ascoltare":', error);
        }
    };

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (!album) {
        return <div>Album non trovato</div>;
    }

    return (
        <div>
            <h1>{album.name}</h1>
            {album.images && album.images.length > 0 && (
                <img src={album.images[0].url} alt={`Copertina di ${album.name}`} />
            )}
            <p>Artisti: {album.artists.map(artist => artist.name).join(', ')}</p>
            <p>Data di rilascio: {album.release_date}</p>
            <p>Numero di tracce: {album.total_tracks}</p>
            <div>
                {!alreadyListened && !showRatingInput && <button onClick={handleAddToAlreadyListened}>Già ascoltato</button>}
                {showRatingInput && (
                    <div>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <label key={value}>
                                <input
                                    type="radio"
                                    value={value}
                                    checked={rating === value}
                                    onChange={() => setRating(value)}
                                />
                                {value}
                            </label>
                        ))}
                        <button onClick={handleRatingSubmit}>Invia Rating</button>
                    </div>
                )}
                {ratingSubmitted && <div>Album aggiunto a "già ascoltati" con rating {rating}</div>}
                {showAlreadyListenedBadge && <span style={{ backgroundColor: 'lightgreen', padding: '5px', borderRadius: '5px', marginLeft: '5px' }}>Ascoltato!</span>}
                {showWishlistBadge && <span style={{ backgroundColor: 'lightblue', padding: '5px', borderRadius: '5px', marginLeft: '5px' }}>Aggiunto agli album da ascoltare</span>}
                {!alreadyListened && !inWishlist && <button onClick={handleAddToWishlist}>Da ascoltare</button>}
            </div>
            <h2>Tracklist</h2>
            <ul>
                {album.tracks.items.map(track => (
                    <li key={track.id}>{track.track_number}. {track.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default AlbumDetail;