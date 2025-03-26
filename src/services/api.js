import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const searchAlbums = async (searchTerm) => {
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&entity=album`);
        const data = await response.json();
        console.log("data searchAlbums", data);
        if (data.results) {
            return data.results;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Errore durante la ricerca degli album:', error);
        return [];
    }
};

export const fetchAlbumDetails = async (collectionId) => {
    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=album`);
        const data = await response.json();
        console.log("data fetchAlbumDetails", data);
        if (data.results) {
            return data.results[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Errore nel recupero dei dettagli dell\'album:', error);
        return null;
    }
};

// aggiungo album a already listened
export const addAlbumToAlreadyListened = async (userId, album, rating) => {
    try {
        

        const { error } = await supabase
            .from('already_listened')
            .insert([{
                user_id: userId,
                album_id: album.collectionId, 
                title: album.collectionName,
                artist: album.artistName,
                artist_id: album.artistId,
                artwork_url: album.artworkUrl100,
                release_year: new Date(album.releaseDate).getFullYear(),
                primary_genre_name: album.primaryGenreName,
                rating: parseInt(rating),
            }]);
        if (error) {
            console.error('Errore durante l\'inserimento in Supabase:', error);
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'aggiunta dell\'album a "già ascoltati":', error);
        throw error;
    }
};

// aggiungo alla wishlist
export const addAlbumToWishlist = async (userId, album) => {
    try {
        const { error } = await supabase
            .from('wishlist')
            .insert([{
                user_id: userId,
                album_id: album.collectionId, 
                title: album.collectionName,
                artist: album.artistName,
                artist_id: album.artistId,
                artwork_url: album.artworkUrl100,
                release_year: new Date(album.releaseDate).getFullYear(),
                primary_genre_name: album.primaryGenreName,
            }]);
        if (error) throw error;
    } catch (error) {
        console.error('Errore durante l\'aggiunta dell\'album a "da ascoltare":', error);
        throw error;
    }
};



export const fetchAlbumsByArtistId = async (artistId) => {
    try {
        let allAlbums = [];
        let offset = 0;
        const limit = 200;
        let hasMore = true;
        let artistName = '';

        while (hasMore) {
            const lookupResponse = await fetch(
                `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=${limit}&offset=${offset}`
            );
            const lookupData = await lookupResponse.json();

            if (lookupData.results?.length > 0) {
                // Prende il nome dell'artista dal primo risultato
                if (offset === 0) {
                    artistName = lookupData.results[0].artistName;
                }

                // Filtra solo gli album (salta il primo elemento che è l'artista)
                const albums = lookupData.results.slice(1);
                allAlbums = [...allAlbums, ...albums];

                // Controlla se ci sono altri risultati
                hasMore = albums.length === limit;
                offset += limit;
            } else {
                hasMore = false;
            }
        }

        return { artistName, albums: allAlbums };
    } catch (error) {
        console.error('Errore durante il recupero degli album:', error);
        return { artistName: '', albums: [] };
    }
};

export const getAlbumReviews = async (albumId) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, users(username)')
            .eq('album_id', albumId);
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Errore nel recupero delle recensioni:', error);
        throw error;
    }
};

export const addAlbumReview = async (albumId, userId, reviewText) => {
    try {
        const { error } = await supabase
            .from('reviews')
            .insert([{
                album_id: albumId,
                user_id: userId,
                review_text: reviewText,
            }]);
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Errore durante l\'aggiunta della recensione:', error);
        throw error;
    }
};

export const deleteAlbumReview = async (reviewId) => {
    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);
        if (error) {
            console.error('Errore durante l\'eliminazione della recensione:', error);
            throw error;
        }
        console.log('Recensione eliminata con successo!');
    } catch (error) {
        console.error('Errore durante l\'eliminazione della recensione:', error);
        throw error;
    }
};