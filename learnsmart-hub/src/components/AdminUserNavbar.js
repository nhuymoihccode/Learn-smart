import React, { useContext, useCallback } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { auth } from '../firebase';

const AdminUserNavbar = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      setCurrentUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  const handlePostHistoryClick = useCallback((e) => {
    e.preventDefault();
    console.log("Đã nhấn vào Lịch sử bài đăng, currentUser:", currentUser);
    navigate('/user/post-history', { replace: false });
  }, [navigate, currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">LearnSmart</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin">Admin Dashboard</Nav.Link>
              </>
            )}
            {currentUser?.role === 'user' && (
              <>
                <Nav.Link as={Link} to="/add-method">Thêm phương pháp học</Nav.Link>
                <Nav.Link onClick={handlePostHistoryClick}>
                  Lịch sử bài đăng
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            <Button variant="outline-light" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminUserNavbar;