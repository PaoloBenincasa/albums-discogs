import React, { useState } from 'react';
import AlbumSearch from '../components/AlbumSearch';
import AlbumList from '../components/AlbumList';

const Home = () => {
    const [albums, setAlbums] = useState([]);

    const handleAlbumsFetched = (albums) => {
        setAlbums(albums);
    };

    return (
        <>
            <AlbumSearch onAlbumsFetched={handleAlbumsFetched} />
            <AlbumList albums={albums} />
        </>
    );
};

export default Home;