import Navbar from './Navbar';
import { Outlet } from 'react-router';
import AlbumSearch from './AlbumSearch';

const Layout = ({ children }) => {

  const handleAlbumsFetched = (albums) => {
    setAlbums(albums);
  };

  return (
    <>
      <Navbar />
      <AlbumSearch onAlbumsFetched={handleAlbumsFetched} />
      <Outlet classname='container h-100 vw-100' />
    </>
  );
};

export default Layout;