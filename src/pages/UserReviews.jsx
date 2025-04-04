import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { supabase } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const UserReviews = () => {
    const { userId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*, already_listened(title, artwork_url, artist, artist_id), users(username, bio)')
                    .eq('user_id', userId);

                if (error) {
                    console.error('Errore nel recupero delle recensioni:', error);
                    toast.error('Failed to fetch reviews. Please try again later.');
                    setReviews([]);
                } else {
                    setReviews(data || []);
                }
            } catch (error) {
                console.error('Errore durante il recupero delle recensioni:', error);
                toast.error('An unexpected error occurred. Please try again later.');
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserReviews();
    }, [userId]);

    if (loading) {
        return <div class="d-flex justify-content-center mt-1">
            <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden ">Loading...</span>
            </div>
        </div>;
    }

    if (reviews.length === 0) {
        return (
            <div className='container pb-5'>
                <h1 className='text-center'>No reviews found</h1>
                <div className='text-center'>
                    {user && userId === user.id ? (
                        <p>You haven't written any reviews yet.</p>
                    ) : (
                        <p>This user hasn't written any reviews yet.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className='container pb-5 d-flex flex-column align-items-center'>
            <h1 className='text-center'>{reviews[0]?.users?.username}'s reviews</h1>
            <p className='text-center'>{reviews[0]?.users?.bio}</p>
            <div className='text-center mb-5'>
                <Link to={`/user/${userId}/profile`} className="orange">
                    view {user && userId === user.id ? 'your' : `${reviews[0]?.users?.username}'s`} albums
                </Link>
            </div>



            {reviews.length > 0 ? (
                reviews.map(review => (
                    <div key={review.id} className=' p-2 review'>
                        <div className='d-flex flex-column'>
                            <img
                                src={review.already_listened.artwork_url.replace('100x100', '150x150')}
                                alt={review.already_listened.title}
                                className='me-2 albumCoverSmall'
                            />
                            <Link to={`/album/${review.album_id}`} >
                                <span className='orange '>
                                    {review.already_listened.title}
                                </span>
                            </Link>
                            <Link to={`/artist/${review.already_listened.artist_id}`} >
                                <span className='blackToOrange'>
                                    {review.already_listened.artist}
                                </span>
                            </Link>
                        </div>
                        <div className='dirtText small'>{new Date(review.created_at).toISOString().split('T')[0]} {new Date(review.created_at).toISOString().split('T')[1].split('.')[0]}</div>
                        <div>{review.review_text}</div>
                    </div>
                ))
            ) : (
                <p>no reviews found</p>
            )}
        </div>
    );
};

export default UserReviews;