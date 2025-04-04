import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { fetchAlbumDetails, addAlbumToAlreadyListened, addAlbumToWishlist, deleteAlbumReview, supabase } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const AlbumDetail = () => {
    const { collectionId } = useParams();
    console.log("AlbumDetail - collectionId:", collectionId);
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
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshReviews, setRefreshReviews] = useState(false);
    const navigate = useNavigate();

    // carico i dettagli dell'album quando il componente viene montato o quando cambio collectionId nell'url
    useEffect(() => {
        const getAlbumDetails = async () => {
            try {
                // chiamo fetchAlbumDetails che recupera i dati dell'album dall'api
                const albumData = await fetchAlbumDetails(collectionId);
                if (albumData) {
                    // aggiorno lo stato Album coi dati 
                    setAlbum(albumData);
                } else {
                    console.error(`Album con collectionId ${collectionId} non trovato.`);
                }
            } catch (error) {
                console.error('Errore nel recupero dettagli album:', error);
            } finally {
                setLoading(false);
            }
        };

        getAlbumDetails();
    }, [collectionId]);

    // controllo se l'album è già stato aggiunto a una delle due liste e aggiorno lo stato di conseguenza
    useEffect(() => {
        const checkAlbumLists = async () => {
            if (!user || !album) return;
            try {
                // recupero i dati di already_listened da supabase
                const { data: alreadyListenedData, error: alreadyListenedError } = await supabase
                    .from('already_listened')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('album_id', album.collectionId);
                
                    // se non ci sono errori
                if (!alreadyListenedError) {
                    // imposto lo stato alreadyListened su true se c'è almeno un risultato (quindi l'album è presente)
                    setAlreadyListened(alreadyListenedData?.length > 0);
                    // imposto lo stato alreadyListenedBadge su true per mostrare il badge
                    setShowAlreadyListenedBadge(alreadyListenedData?.length > 0);
                }

                // stessa cosa per la wishlist
                const { data: wishlistData, error: wishlistError } = await supabase
                    .from('wishlist')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('album_id', album.collectionId);

                if (!wishlistError) {
                    setInWishlist(wishlistData?.length > 0);
                    setShowWishlistBadge(wishlistData?.length > 0);
                }
            } catch (error) {
                console.error('Errore durante il controllo delle liste:', error);
            }
        };

        checkAlbumLists();
        // questo useEffect viene eseguito ogni volta che cambia l'utente o viene caricato un album
    }, [album, user]);


    const removeFromWishlist = async () => {
        if (!user || !album) return;
        try {
            const { error } = await supabase
                .from('wishlist')
                .delete()
                .eq('user_id', user.id)
                .eq('album_id', album.collectionId);
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

    const removeFromAlreadyListened = async () => {
        if (!user || !album) return;
        try {
            const { error } = await supabase
                .from('already_listened')
                .delete()
                .eq('user_id', user.id)
                .eq('album_id', album.collectionId);
            if (error) {
                console.error('Errore durante la rimozione dell\'album da già ascoltati:', error);
            } else {
                setAlreadyListened(false);
                setShowAlreadyListenedBadge(false);
            }
        } catch (error) {
            console.error('Errore durante la rimozione dell\'album da già ascoltati:', error);
        }
    };


    // quando clicco su add to listened 
    const handleAddToAlreadyListened = () => {
        // se non sono loggato mi manda al login
        if (!user) {
            navigate('/login');
            return;
        }
        // altrimenti cambia lo stato di showRatingInput che mi mostra il range per dare il voto
        setShowRatingInput(true);
    };

    const handleRatingSubmit = async () => {
        if (!user || !album) return;
        try {
            // converto il valore del voto in number
            const ratingValue = parseInt(rating);
            // chiamo la funzione per aggiungere l'album passando utente album e voto
            await addAlbumToAlreadyListened(user.id, album, ratingValue);
            // chiudo il range
            setShowRatingInput(false);
            // aggiorno gli stati su true per indicare che l'album è stato votato e aggiunto e per mostrare il badge
            setRatingSubmitted(true);
            setAlreadyListened(true);
            setShowAlreadyListenedBadge(true);
            toast.success(`you listened to ${album.collectionName} by ${album.artistName} and rated it ${ratingValue} out of 10!`);
            // se l'album era in wishlist lo rimuovo dalla stessa
            if (inWishlist) {
                await removeFromWishlist();
            }
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "già ascoltati":', error);
            toast.error('An error occurred while adding the album to "already listened". Please try again.');
        }
    };

    // aggiungo a wishlist
    const handleAddToWishlist = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            // chiamo la funzione
            await addAlbumToWishlist(user.id, album);
            // imposto gli stati su tre
            setInWishlist(true);
            setShowWishlistBadge(true);
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "da ascoltare":', error);
        }
    };
    
    const handleOpenModal = async () => {
        if (!user || !album) return;

        try {
            // recupero i dati da supabase destrutturandoli
            const { data: alreadyListenedData, error: alreadyListenedError } = await supabase
                .from('already_listened')
                .select('*')
                .eq('user_id', user.id)
                .eq('album_id', album.collectionId);

            if (alreadyListenedError) {
                console.error('Errore durante la verifica di "already_listened":', alreadyListenedError);
                toast.error('There was an error verifying "already listened". Please try again.');
                return;
            }
            // se l'album non c'è in already_listened c'è un toast che avvisa di aggiungerlo prima di poterlo recensire
            if (alreadyListenedData.length === 0) {
                toast.info('add the album to "already listened" first.');
                return;
            }
            // apro il modale
            setIsModalOpen(true);
        } catch (error) {
            console.error('Errore durante la verifica di "already_listened":', error);
            toast.error('there was an error verifying "already listened". Please try again.');
        }
    };

    const handleReviewSubmit = async () => {
        if (!user || !album) return;
        try {
            // inserisco la review su supabase, destrutturando il risultato in error
            const { error } = await supabase.from('reviews').insert([{
                album_id: String(album.collectionId),
                user_id: user.id,
                // passo a supabase il testo della recensione, ottenuto dallo stato newReview (cioè il value della textarea)
                review_text: newReview,
            }]);
            // se non ci sono errori
            if (!error) {
                // svuoto la textarea
                setNewReview('');
                // imposto refreshReviews su true per forzare il refresh
                setRefreshReviews(true);
                // chiudo il modale
                handleCloseModal();
            } else {
                console.error('Errore durante l\'aggiunta della recensione:', error);
            }
        } catch (error) {
            console.error('Errore durante l\'aggiunta della recensione:', error);
        }
    };

    // fetcho le recensioni dell'album
    useEffect(() => {
        const fetchReviews = async () => {
            if (!album) {
                console.log("Album unavailable");
                return;
            }
            try {
                // recupero le recensioni da supabase
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*, users(username)')
                    // filtro i risultati per album specifico
                    .eq('album_id', String(album.collectionId));
                if (!error) {
                    setReviews(data || []);
                } else {
                    console.error('Errore nel recupero delle recensioni:', error);
                    setReviews([]);
                }
            } catch (error) {
                console.error('Errore nella chiamata a supabase:', error);
                setReviews([]);
            }
            // imposto lo stato refreshReviews a false dopo il recupero in modo tale che non si creino loop
            setRefreshReviews(false);
        };
        fetchReviews();
    }, [album, refreshReviews]);


    useEffect(() => {
        console.log("Stato reviews aggiornato:", reviews);
    }, [reviews]);


    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // elimino la review
    const handleDeleteReview = async (reviewId) => {
        const confirmDelete = window.confirm('are you sure you want to delete this review?');
        if (confirmDelete) {
            try {
                // chiamo deleteAlbumReview passandogli l'id della recensione
                await deleteAlbumReview(reviewId);
                // creo un array con tutte le review tranne quella che sto cancellando
                const updatedReviews = reviews.filter(review => review.id !== reviewId);
                // aggiorno lo stato di reviews col nuovo array
                setReviews(updatedReviews);
                toast.success('Review deleted successfully!');
            } catch (error) {
                toast.error('An error occurred while deleting the review. Please try again.');
            }
        }
    };

    if (loading) {
        return <div class="d-flex justify-content-center mt-1">
            <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden ">Loading...</span>
            </div>
        </div>;
    }

    if (!album) {
        return <div>Album non trovato</div>;
    }

    return (
        <>
            <div className='container d-flex align-items-center justify-content-center overflow-hidden'>
                <div className='row w-100'>

                    <div className='col-md-6 d-flex flex-column align-items-center p-2 p-md-4'>
                        {album && album.artworkUrl100 && (

                            <img
                                src={album.artworkUrl100.replace('100x100', '600x600')}
                                alt={`Copertina di ${album.collectionName}`}
                                loading="lazy"
                                className={'albumCoverLarge'} />
                        )}
                        <div>
                            {user && (
                                <div className='mt-3'>
                                    <button className='btnListened' onClick={handleOpenModal}>Add Review</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='col-md-6 d-flex flex-column justify-content-between p-md-4 p-2'>
                        <div className='border-bottom'>
                            <h1>{album.collectionName}</h1>
                            <h3 className=''>
                                <Link to={`/artist/${album.artistId}`} >
                                    <div className='orange'>
                                        {album.artistName}

                                    </div>
                                </Link>
                            </h3>
                            <div className='d-flex justify-content-between gap-2'>
                                <p>released in {album.releaseDate && new Date(album.releaseDate).getFullYear()}</p>
                                <p>{album.primaryGenreName}</p>
                            </div>
                        </div>

                        <div>
                            <div className='d-flex justify-content-between align-items-end mb-2'>
                                <div className='d-flex flex-column gap-1'>

                                    {!alreadyListened && !showRatingInput && <button className='btnListened' onClick={handleAddToAlreadyListened}>add to listened</button>}
                                    {showRatingInput && (
                                        <div className='d-flex flex-column'>
                                            <button className='btnListened' onClick={handleRatingSubmit}>rate this record</button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                value={rating}
                                                onChange={(e) => setRating(parseInt(e.target.value))}
                                                className='slider mt-2'
                                            />
                                            <span>{rating}</span>
                                        </div>
                                    )}

                                    {showAlreadyListenedBadge && <span className='listened'>added to listened!</span>}
                                    {showWishlistBadge && <span className='wishlisted'>added to wishlist</span>}
                                    {!alreadyListened && !inWishlist && <button className='btnWishlist' onClick={handleAddToWishlist}>add to wishlist</button>}
                                </div>
                                <div>
                                    {alreadyListened && <div className='btnDelete' onClick={removeFromAlreadyListened}>remove from listened</div>}
                                    {inWishlist && <div className='btnDelete' onClick={removeFromWishlist}>remove from wishlist</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`modal ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }}>
                    <div className='modal-dialog'>
                        <div className='modal-content '>
                            <div className='modal-header'>
                                <h5 className='modal-title'>review this album</h5>
                                <button type='button' className='btn-close' onClick={handleCloseModal}></button>
                            </div>
                            <div className='modal-body'>
                                <textarea
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    placeholder='Write a review...'
                                    className='form-control'
                                    rows='14'

                                />
                            </div>
                            <div className='modal-footer'>

                                <button type='button' className='btnListened' onClick={handleReviewSubmit}>Add Review</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='container pb-5'>
                <div className='row'>
                    <div className='container d-flex flex-column align-items-center'>
                        {reviews && reviews.length > 0 && (
                            <h3 className='text-center pb-2'>Reviews</h3>
                        )}
                        <div className='row review' key={album.collectionId}>
                            {reviews && reviews.map(review => (
                                <div key={review.id} className=' p-2 review '>
                                    <strong>
                                        <Link to={`/user/${review.user_id}/reviews`} className='orange'>
                                            {review.users?.username || 'Utente sconosciuto'}
                                        </Link>
                                    </strong>
                                    <div className='dirtText small'>{new Date(review.created_at).toISOString().split('T')[0]} {new Date(review.created_at).toISOString().split('T')[1].split('.')[0]} </div>
                                    <div>{review.review_text}</div>
                                    {user && user.id === review.user_id && (
                                        <div className='btnDelete text-end' onClick={() => handleDeleteReview(review.id)}>delete</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </>
    );
};

export default AlbumDetail;