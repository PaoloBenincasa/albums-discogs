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

    const handleSearch = async (searchValue) => {
        try {
            setLoading(true);
            const results = await searchAlbums(searchValue);
            setAlbums(results);
            setLoading(false);
            setResultsVisible(true);
        } catch (error) {
            console.error('Errore durante la ricerca degli album:', error);
            setLoading(false);
        }
    };

    // Gestione input con debounce
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Cancella il timeout esistente
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Avvia nuovo timeout solo se c'è un valore
        if (value.trim()) {
            debounceTimeout.current = setTimeout(() => {
                handleSearch(value);
            }, 500); // 500ms di delay
        } else {
            setResultsVisible(false);
            setAlbums([]);
        }
    };

    // const handleManualSearch = () => {
    //     // Cancella il debounce esistente
    //     if (debounceTimeout.current) {
    //         clearTimeout(debounceTimeout.current);
    //     }
    //     if (searchTerm.trim()) {
    //         handleSearch(searchTerm);
    //     }
    // };

    // Cleanup del timeout allo smontaggio
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    const handleClickOutside = (event) => {
        if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
            setResultsVisible(false);
        }
    };

    const handleResultClick = () => {
        setResultsVisible(false); // Nascondi i risultati
        setSearchTerm(''); // Resetta la ricerca
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (

        <div className="album-search-container w-100 border-bottom" style={{ position: 'relative' }}>
            <div className='d-flex align-items-center justify-content-center search-input-container'>
                {/* <i className="bi bi-search me-2"></i> */}
                <input
                    type="text"
                    placeholder="search..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className='mt-3 mb-3 search-input'
                />
                {/* <button onClick={handleManualSearch} className='btnOrange ms-1'>search</button> */}
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
            {/* {resultsVisible && <div className="overlay"></div>} */}
        </div>
    );
};

export default AlbumSearch;