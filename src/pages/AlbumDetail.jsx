import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { fetchAlbumDetails, addAlbumToAlreadyListened, addAlbumToWishlist, deleteAlbumReview, supabase } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const AlbumDetail = () => {
    const { collectionId } = useParams();
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

    // carico i dettagli degli album
    useEffect(() => {
        const getAlbumDetails = async () => {
            try {
                const albumData = await fetchAlbumDetails(collectionId);
                if (albumData) {
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

    // controllo le liste solo quando user e album sono disponibili
    useEffect(() => {
        const checkAlbumLists = async () => {
            if (!user || !album) return;
            try {
                const { data: alreadyListenedData, error: alreadyListenedError } = await supabase
                    .from('already_listened')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('album_id', album.collectionId);

                if (!alreadyListenedError) {
                    setAlreadyListened(alreadyListenedData?.length > 0);
                    setShowAlreadyListenedBadge(alreadyListenedData?.length > 0);
                }

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

    const handleAddToAlreadyListened = () => {
        if (!user) {
            navigate('/signup');
            return;
        }
        setShowRatingInput(true);
    };

    const handleRatingSubmit = async () => {
        if (!user || !album) return;
        try {
            const ratingValue = parseInt(rating);
            await addAlbumToAlreadyListened(user.id, album, ratingValue);
            console.log(`Album "${album.collectionName}" aggiunto a "già ascoltati" con rating ${ratingValue}`);
            setShowRatingInput(false);
            setRatingSubmitted(true);
            setAlreadyListened(true);
            setShowAlreadyListenedBadge(true);
            toast.success(`you listened to ${album.collectionName} by ${album.artistName} and rated it ${ratingValue} out of 10!`);
            if (inWishlist) {
                await removeFromWishlist();
            }
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "già ascoltati":', error);
            toast.error('An error occurred while adding the album to "already listened". Please try again.');
        }
    };

    const handleAddToWishlist = async () => {
        if (!user) {
            navigate('/signup');
            return;
        }
        try {
            await addAlbumToWishlist(user.id, album);
            console.log(`Album "${album.collectionName}" aggiunto a "da ascoltare"`);
            setInWishlist(true);
            setShowWishlistBadge(true);
        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'album a "da ascoltare":', error);
        }
    };

    useEffect(() => {
        const fetchReviews = async () => {
            if (!album) {
                console.log("Album unavailable");
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*, users(username)')
                    .eq('album_id', String(album.collectionId));
                if (!error) {
                    console.log('Dati recensioni recuperati:', data);
                    setReviews(data || []);
                } else {
                    console.error('Errore nel recupero delle recensioni:', error);
                    setReviews([]);
                }
            } catch (error) {
                console.error('Errore nella chiamata a supabase:', error);
                setReviews([]);
            }
            setRefreshReviews(false);
        };
        fetchReviews();
    }, [album, refreshReviews]); 


    useEffect(() => {
        console.log("Stato reviews aggiornato:", reviews);
    }, [reviews]);

    const handleReviewSubmit = async () => {
        if (!user || !album) return;
        try {
            const { error } = await supabase.from('reviews').insert([{
                album_id: String(album.collectionId),
                user_id: user.id,
                review_text: newReview,
            }]);
            if (!error) {
                setNewReview('');
                setRefreshReviews(true); 
                handleCloseModal();
            } else {
                console.error('Errore durante l\'aggiunta della recensione:', error);
            }
        } catch (error) {
            console.error('Errore durante l\'aggiunta della recensione:', error);
        }
    };



    const handleOpenModal = async () => {
        if (!user || !album) return;

        try {
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

            if (alreadyListenedData.length === 0) {
                toast.info('add the album to "already listened" first.');
                return;
            }

            setIsModalOpen(true);
        } catch (error) {
            console.error('Errore durante la verifica di "already_listened":', error);
            toast.error('there was an error verifying "already listened". Please try again.');
        }
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleDeleteReview = async (reviewId) => {
        const confirmDelete = window.confirm('are you sure you want to delete this review?');
        if (confirmDelete) {
            try {
                await deleteAlbumReview(reviewId);
                const updatedReviews = reviews.filter(review => review.id !== reviewId);
                setReviews(updatedReviews);
                toast.success('Review deleted successfully!');
            } catch (error) {
                toast.error('An error occurred while deleting the review. Please try again.');
            }
        }
    };

    if (loading) {
        return <div>Caricamento...</div>;
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
                                <div key={review.id} className='border-bottom p-2  '>
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