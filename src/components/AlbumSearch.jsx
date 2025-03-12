import React, { useState } from 'react';
import { fetchAlbums, addAlbumToAlreadyListened, addAlbumToWishlist } from '../services/api';
import AlbumList from './AlbumList';
import { useAuth } from '../hooks/useAuth'; // Importa il tuo useAuth hook

const AlbumSearch = () => {
    const [query, setQuery] = useState('');
    const [albums, setAlbums] = useState([]);
    const { user, loading } = useAuth(); // Ottieni user e loading dal tuo hook

    const handleSearch = async () => {
        try {
            const fetchedAlbums = await fetchAlbums(query);
            if (fetchedAlbums) {
                setAlbums(fetchedAlbums);
            } else {
                setAlbums([]);
            }
        } catch (error) {
            console.error('Errore durante la ricerca degli album:', error);
            setAlbums([]);
        }
    };

    const handleAddToAlreadyListened = async (album) => {
        if (!user) {
            console.error('Utente non autenticato');
            return;
        }
        try {
            await addAlbumToAlreadyListened(user.id, album);
            console.log(`Album "${album.title}" aggiunto a "già ascoltati"`);
            // Aggiorna lo stato delle liste se necessario
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "già ascoltati":', error);
        }
    };

    const handleAddToWishlist = async (album) => {
        if (!user) {
            console.error('Utente non autenticato');
            return;
        }
        try {
            await addAlbumToWishlist(user.id, album);
            console.log(`Album "${album.title}" aggiunto a "da ascoltare"`);
            // Aggiorna lo stato delle liste se necessario
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "da ascoltare":', error);
        }
    };

    if (loading) {
        return <div>Caricamento...</div>; // Mostra un indicatore di caricamento mentre l'utente viene recuperato
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Cerca album"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Cerca</button>
            <AlbumList
                albums={albums}
                // onAddToAlreadyListened={handleAddToAlreadyListened}
                // onAddToWishlist={handleAddToWishlist}
            />
        </div>
    );
};

export default AlbumSearch;