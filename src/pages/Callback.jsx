// import React, { useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router';

// function Callback() {
//     const location = useLocation();
//     const navigate = useNavigate();

//     useEffect(() => {
//         // Estrai il codice di autorizzazione dai parametri della query
//         const searchParams = new URLSearchParams(location.search);
//         const code = searchParams.get('code');

//         if (code) {
//             // Chiama la tua funzione per ottenere il token di accesso con il codice
//             handleSpotifyCallback(code);
//         } else {
//             // Gestisci il caso in cui il codice è mancante
//             console.error('Codice di autorizzazione mancante');
//             navigate('/'); // Reindirizza alla home o a una pagina di errore
//         }
//     }, [location, navigate]);

//     const handleSpotifyCallback = async (code) => {
//         try {
//             // Chiama la tua API per ottenere il token di accesso
//             const response = await fetch('/api/spotify/callback', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ code }),
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 // Memorizza il token di accesso e reindirizza
//                 localStorage.setItem('spotifyAccessToken', data.access_token);
//                 navigate('/profile'); // Reindirizza al profilo o a una pagina appropriata
//             } else {
//                 // Gestisci l'errore
//                 console.error('Errore durante l\'ottenimento del token di accesso');
//                 navigate('/'); // Reindirizza alla home o a una pagina di errore
//             }
//         } catch (error) {
//             console.error('Errore durante la chiamata API:', error);
//             navigate('/'); // Reindirizza alla home o a una pagina di errore
//         }
//     };

//     return <div>Elaborazione dell'autenticazione...</div>;
// }

// export default Callback;