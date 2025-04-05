import React, { useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MusicProvider } from './MusicContext';
import { AuthContext } from './AuthContext';
import Chuyentrang from './router/chuyentrang';
import CustomNavbar from './components/Navbar';
import AdminUserNavbar from './components/AdminUserNavbar';
import { Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <MusicProvider>
        <div className="app" style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
          {/* Hiển thị Navbar dựa trên vai trò người dùng */}
          {currentUser && (currentUser.role === 'user' || currentUser.role === 'admin') ? (
            <AdminUserNavbar />
          ) : (
            <CustomNavbar />
          )}
          <Container className="py-4">
            <ToastContainer />
            <Chuyentrang />
          </Container>
        </div>
      </MusicProvider>
    </BrowserRouter>
  );
};

export default App;