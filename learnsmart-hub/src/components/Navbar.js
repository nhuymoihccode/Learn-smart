import React, { useContext } from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { auth } from "../firebase";

const CustomNavbar = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      setCurrentUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    }
  };

  const handleAddTrackClick = () => {
    console.log("Đã nhấn vào Thêm nhạc");
  };

  return (
    <Navbar
      expand="lg"
      style={{ backgroundColor: "#42A5F5", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: "#FFFFFF", fontWeight: "bold" }}>
          LearnSmart Hub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" style={{ color: "#FFFFFF", fontSize: "16px" }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/study-methods" style={{ color: "#FFFFFF", fontSize: "16px" }}>
              Phương pháp học
            </Nav.Link>
            <Nav.Link as={Link} to="/timer" style={{ color: "#FFFFFF", fontSize: "16px" }}>
              Bộ đếm ngược
            </Nav.Link>
            <Nav.Link as={Link} to="/music-player" style={{ color: "#FFFFFF", fontSize: "16px" }}>
              Kho nhạc
            </Nav.Link>
            {/* Thêm liên kết "Danh sách nhạc" và "Thêm nhạc" cho tất cả người dùng đã đăng nhập */}
            {currentUser && (
              <>
                <Nav.Link
                  as={Link}
                  to="/add-track"
                  style={{ color: "#FFFFFF", fontSize: "16px" }}
                  onClick={handleAddTrackClick}
                >
                  Thêm nhạc
                </Nav.Link>
              </>
            )}
            {currentUser?.role === "user" && (
              <Nav.Link as={Link} to="/add-method" style={{ color: "#FFFFFF", fontSize: "16px" }}>
                Thêm phương pháp học
              </Nav.Link>
            )}
            {currentUser?.role === "admin" && (
              <Nav.Link as={Link} to="/admin" style={{ color: "#FFFFFF", fontSize: "16px" }}>
                Trang Admin
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <Button
                variant="outline-light"
                onClick={handleLogout}
                style={{ fontSize: "16px", borderRadius: "5px" }}
              >
                Đăng xuất
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login" style={{ color: "#FFFFFF", fontSize: "16px" }}>
                Đăng nhập
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;