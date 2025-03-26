import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { fetchAlbumsByArtistId } from '../services/api';
import {toast} from 'react-toastify';

const ArtistDetail = () => {
    const { artistId } = useParams();
    const [albums, setAlbums] = useState([]);
    const [artistName, setArtistName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                const { artistName, albums } = await fetchAlbumsByArtistId(artistId);
                setArtistName(artistName);
                setAlbums(albums);
            } catch (error) {
                console.error('Errore nel recupero dei dati:', error);
                toast.error('Failed to fetch artist data. Please try again later.');
                setArtistName('');
                setAlbums([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArtistData();
    }, [artistId]);

    if (loading) {
        return <div className="container mt-4">Caricamento...</div>;
    }

    if (!artistName) {
        return <div className="container mt-4">Artista non trovato</div>;
    }

    return (
        <div className="container mt-4 pb-3">
            <h1 className="mb-4 text-center">{artistName}'s discography</h1>
            <div className="row row-cols-1 row-cols-md-3 g-4">
                {albums.map((album) => (
                    <div className="col" key={album.collectionId}>
                        <Link to={`/album/${album.collectionId}`} >
                            <div className="artistAlbumCard h-100">
                                <img
                                    src={album.artworkUrl100.replace('100x100', '300x300')}
                                    className="card-img-top"
                                    alt={album.collectionName}
                                    loading='lazy'
                                />
                                <div className="card-body p-2">
                                    <h5 className="noStyleLink">
                                        {album.collectionName}
                                    </h5>
                                    <div className="noStyleLink">
                                        {new Date(album.releaseDate).getFullYear()}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {albums.length === 0 && (
                <div className="alert alert-info mt-4">
                    no album found for this artist
                </div>
            )}
        </div>
    );
};

export default ArtistDetail;