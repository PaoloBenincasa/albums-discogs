import React, { useState, useRef, useEffect } from 'react';
import { searchAlbums } from '../services/api';
import { Link } from 'react-router';

const AlbumSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resultsVisible, setResultsVisible] = useState(false);
    const searchResultsRef = useRef(null);
    const debounceTimeout = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        // aggiorno searchTerm col valore dell'input
        setSearchTerm(value);

        // cancello il debounce se è presente un timeout precedente
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        //  imposto il debounce per chiamare handleSearch con un timeout di mezzosecondo
        if (value.trim()) {
            debounceTimeout.current = setTimeout(() => {
                handleSearch(value);
            }, 500);
        } else {
            setResultsVisible(false);
            setAlbums([]);
        }
    };

    const handleSearch = async (searchValue) => {
        try {
            setLoading(true);
            // chiamo searchAlbums (in api.js) per effettuare la ricerca
            const results = await searchAlbums(searchValue);
            // aggiorno lo stato albums coi risultati
            setAlbums(results);
            setLoading(false);
            setResultsVisible(true);
        } catch (error) {
            console.error('Errore durante la ricerca degli album:', error);
            setLoading(false);
        }
    };



    // annullo il timeout allo smontaggio del componente
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    // chiudo risultati e cancello termine di ricerca quando clicco su un risultato
    const handleResultClick = () => {
        setResultsVisible(false);
        setSearchTerm('');
    };
    
    // chiudo i risultati della ricerca se clicco fuori dai risultati
    const handleClickOutside = (event) => {
        if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
            setResultsVisible(false);
        }
    };
    
    // listener per handleClickOutside
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    return (

        <div className="album-search-container w-100 border-bottom" style={{ position: 'relative' }}>
            <div className='d-flex align-items-center justify-content-center search-input-container'>
                <input
                    type="text"
                    placeholder="search..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className='mt-3 mb-3 search-input'
                />
            </div>
            {loading &&
                <div class="d-flex justify-content-center">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden ">Loading...</span>
                    </div>
                </div>
            }
            {resultsVisible && (
                <div className='d-flex justify-content-center'>
                    <ul
                        ref={searchResultsRef}
                        className='profileList container-fluid'
                    >
                        {albums.map((album) => (
                            <li key={album.collectionId} className='row border-top '>
                                <Link
                                    to={`/album/${album.collectionId}`}
                                    className='searchLi'
                                    onClick={handleResultClick}
                                >
                                    <div className='col-md-1'>
                                        {album.artworkUrl100 ? (
                                            <img
                                                src={album.artworkUrl100.replace('100x100', '600x600')}
                                                alt={`Copertina di ${album.collectionName}`}
                                                loading="lazy"
                                                className="albumCoverSmall"
                                            />
                                        ) : album.artworkUrl60 ? (
                                            <img
                                                src={album.artworkUrl60}
                                                alt={`Copertina di ${album.collectionName}`}
                                                loading="lazy"
                                                className="albumCoverSmall"
                                            />
                                        ) : null}
                                    </div>

                                    <div className='d-flex flex-column col-10  h-100 p-md-2 ps-4 pt-2 '>
                                        <div className='text-decoration-none'>
                                            {album.collectionName}
                                        </div>
                                        <span>
                                            <Link to={`/artist/${album.artistId}`} className='artistLink'>{album.artistName}</Link>
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AlbumSearch;