import React from 'react';
import { Link } from 'react-router';

const AlbumList = ({ albums, onAddToAlreadyListened, onAddToWishlist }) => {
    // if (!albums || albums.length === 0) {
    //     return <div>Nessun album trovato</div>;
    // }

    return (
        <div>
            {albums.map((album) => (
                <div key={album.id} className="albumCard w-50 m-2">
                    <Link
                        to={`/album/${album.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        {album.images && album.images.length > 0 && (
                            <img
                                src={album.images[0].url}
                                alt={`Copertina di ${album.name}`}
                                loading="lazy"
                                className="albumCover"
                            />
                        )}
                        <div className="ps-2">
                            <h5>{album.name}</h5>
                            <div>{album.artists.map((artist) => artist.name).join(', ')}</div>
                            <div>{album.release_date}</div>
                        </div>
                    </Link>
                    {/* <div>
                        <button onClick={() => onAddToAlreadyListened(album)}>Già ascoltato</button>
                        <button onClick={() => onAddToWishlist(album)}>Da ascoltare</button>
                    </div> */}
                </div>
            ))}
        </div>
    );
};

export default AlbumList;