import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const spotifyClientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let spotifyAccessToken = null;

const getSpotifyAccessToken = async () => {
    if (spotifyAccessToken) {
        return spotifyAccessToken;
    }

    const basicAuth = btoa(`${spotifyClientId}:${spotifyClientSecret}`);
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        throw new Error(`Errore durante l'ottenimento del token di accesso Spotify: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    spotifyAccessToken = data.access_token;
    return spotifyAccessToken;
};

export const fetchAlbums = async (query) => {
    try {
        if (query) {
            const accessToken = await getSpotifyAccessToken();
            const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Errore durante la ricerca degli album: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.albums.items || [];
        } else {
            return [];
        }
    } catch (error) {
        console.error('Errore durante il recupero degli album:', error);
        return [];
    }
};

// export const addAlbumToAlreadyListened = async (userId, album) => {
//     try {
//         const { error } = await supabase
//             .from('already_listened')
//             .insert([{
//                 user_id: userId,
//                 album_id: album.id,
//                 title: album.name,
//                 artist: album.artists.map(artist => artist.name).join(', '),
//             }]);
//         if (error) throw error;
//     } catch (error) {
//         console.error('Errore durante l\'aggiunta dell\'album a "già ascoltati":', error);
//         throw error;
//     }
// };
export const addAlbumToAlreadyListened = async (userId, album, rating) => {
    try {
        console.log('Rating inviato a Supabase:', rating, typeof rating);
        const { error } = await supabase
            .from('already_listened')
            .insert([{
                user_id: userId,
                album_id: album.id,
                title: album.name,
                artist: album.artists.map(artist => artist.name).join(', '),
                rating: parseInt(rating), // Assicurati che sia un numero intero
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

export const addAlbumToWishlist = async (userId, album) => {
    try {
        const { error } = await supabase
            .from('wishlist')
            .insert([{
                user_id: userId,
                album_id: album.id,
                title: album.name,
                artist: album.artists.map(artist => artist.name).join(', '),
            }]);
        if (error) throw error;
    } catch (error) {
        console.error('Errore durante l\'aggiunta dell\'album a "da ascoltare":', error);
        throw error;
    }
};

export const fetchAlbumDetails = async (albumId) => {
    try {
        const accessToken = await getSpotifyAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Errore durante il recupero dei dettagli dell'album: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Errore durante il recupero dei dettagli dell\'album:', error);
        return null;
    }
};