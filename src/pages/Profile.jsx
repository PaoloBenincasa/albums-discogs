import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/api';
import { Link, useParams } from 'react-router';
import SortControls from '../components/SortControls';

const Profile = () => {
    const { user } = useAuth();
    const [alreadyListenedAlbums, setAlreadyListenedAlbums] = useState([]);
    const [wishlistAlbums, setWishlistAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userId } = useParams();
    const [profileUser, setProfileUser] = useState();

    const [sortConfig, setSortConfig] = useState({
        listened: { key: 'artist', direction: 'asc' },
        wishlist: { key: 'artist', direction: 'asc' }
    });

    const sortAlbums = (albums, { key, direction }) => {
        return [...albums].sort((a, b) => {
            let valueA, valueB;

            switch (key) {
                case 'artist':
                    valueA = a.artist.toLowerCase();
                    valueB = b.artist.toLowerCase();
                    break;
                case 'year':
                    valueA = a.release_year;
                    valueB = b.release_year;
                    break;
                case 'rating':
                    valueA = a.rating;
                    valueB = b.rating;
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (listType, key) => {
        setSortConfig(prev => ({
            ...prev,
            [listType]: {
                key,
                direction:
                    prev[listType].key === key
                        ? prev[listType].direction === 'asc' ? 'desc' : 'asc'
                        : 'asc'
            }
        }));
    };

    const sortedListenedAlbums = sortAlbums(alreadyListenedAlbums, sortConfig.listened);
    const sortedWishlistAlbums = sortAlbums(wishlistAlbums, sortConfig.wishlist);



    useEffect(() => {
        const fetchUserAlbums = async () => {
            const currentUserId = userId || user?.id;
            if (!currentUserId) return;

            try {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, username')
                    .eq('id', currentUserId)
                    .single();

                if (userError) {
                    console.error('Errore durante il recupero del profilo utente:', userError);
                    return;
                }
                setProfileUser(userData);
                // recupero already listened
                const { data: listenedData, error: listenedError } = await supabase
                    .from('already_listened')
                    .select('album_id, title, artist, artist_id, artwork_url, release_year, primary_genre_name, rating')
                    .eq('user_id', currentUserId);

                if (listenedError) {
                    console.error('Errore durante il recupero degli album già ascoltati:', listenedError);
                } else {
                    setAlreadyListenedAlbums(listenedData);
                }

                // recupero la wishlist
                const { data: wishlistData, error: wishlistError } = await supabase
                    .from('wishlist')
                    .select('album_id, title, artist, artist_id, artwork_url, release_year, primary_genre_name')
                    .eq('user_id', currentUserId);

                if (wishlistError) {
                    console.error('Errore durante il recupero della wishlist:', wishlistError);
                } else {
                    setWishlistAlbums(wishlistData);
                }
            } catch (error) {
                console.error('Errore generale nel recupero degli album:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAlbums();
    }, [userId, user]);

    if (loading) {
        return <div class="d-flex justify-content-center mt-1">
        <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden ">Loading...</span>
        </div>
    </div>;
    }

    console.log();



    return (
        <div className="p-4 container-fluid">
            <div className='row justify-content-center'>
                <h1 className='text-center pb-5'>{profileUser.username}'s albums</h1>
                <div className='col-md-5'>

                    <h2 className="profileHeading">listened</h2>
                    <SortControls
                        listType="listened"
                        hasRating
                        sortConfig={sortConfig}
                        handleSort={handleSort}

                    />
                    {alreadyListenedAlbums.length > 0 ? (
                        <ul className="mb-5 list-unstyled">
                            {sortedListenedAlbums.map((album) => (
                                console.log(album),
                                <li key={album.album_id} >
                                    <Link to={`/album/${album.album_id}`} className='d-flex  mb-1 container pe-0 ms-1'>
                                        <div className='d-flex w-100 listLi  '>
                                            <div className='profileCoverContainer'>
                                                <img src={album.artwork_url} alt={album.album_name} className='profileCover' />

                                            </div>
                                            <div className='noStyleLink d-flex flex-column '>
                                                <div className='ps-md-3 profileTitle'>
                                                    {album.title}
                                                </div>
                                                <div className='ps-md-3 profileArtist'>
                                                    <Link to={`/artist/${album.artist_id}`}>
                                                        <span className='artistLink'>
                                                            {album.artist}
                                                        </span>
                                                    </Link>
                                                    <p className='mb-0 '>{album.release_year}</p>
                                                    <p className='mb-0'>{album.rating}</p>
                                                </div>
                                            </div>




                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>no albums listened yet</p>
                    )}
                </div>
                <div className='col-md-5'>

                    <h2 className="profileHeading">wishlist</h2>
                    <SortControls
                        listType="wishlist"
                        hasRating={false}
                        sortConfig={sortConfig}
                        handleSort={handleSort}
                    />
                    {wishlistAlbums.length > 0 ? (
                        <ul className='mb-5 list-unstyled'>

                            {sortedWishlistAlbums.map((album) => (
                                <li key={album.album_id}>
                                    <Link to={`/album/${album.album_id}`} className='d-flex mb-1 container' >
                                        <div className='d-flex w-100 listLi overflow-hidden'>
                                            <div className='profileCoverContainer '>
                                                <img src={album.artwork_url} alt={album.album_name} className=' profileCover' />

                                            </div>
                                            <div className='noStyleLink d-flex flex-column '>
                                                <div className='ps-md-3 profileTitle'>
                                                    {album.title}
                                                </div>
                                                <div className='ps-md-3 profileArtist '>
                                                    <Link to={`/artist/${album.artist_id}`}>
                                                        <span className='artistLink'>
                                                            {album.artist}
                                                        </span>
                                                    </Link>
                                                    <p className='mb-0'> {album.release_year}</p>
                                                </div>
                                            </div>

                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>no album in the wishlist yet</p>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Profile;


