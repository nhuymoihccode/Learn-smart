import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../AuthContext";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styles/StudyMethods.css";

const StudyMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "methods"));
        const methodsList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(method => method.status === "approved" && method.title && method.title.trim() !== "");
        setMethods(methodsList);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
        setError("Không thể tải danh sách phương pháp học. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-center mt-4 text-danger">{error}</div>;

  return (
    <Container className="mt-4">
      {currentUser?.role === "user" && (
        <div className="text-center mb-4">
          <Button as={Link} to="/add-method" variant="primary">
            Thêm phương pháp học mới
          </Button>
        </div>
      )}
      {methods.length === 0 ? (
        <div className="text-center mt-4">Không có phương pháp học nào.</div>
      ) : (
        <div className="study-methods-container">
          <Row>
            {methods.map((method) => (
              <Col md={4} key={method.id} className="mb-4">
                <Card
                  as={Link}
                  to={`/study-methods/${method.id}`}
                  className="method-card"
                >
                  <div
                    className="card-image"
                    style={{
                      backgroundImage: method.coverImageUrl
                        ? `url(${method.coverImageUrl})`
                        : `url(/images/default-avatar.jpg)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <Card.Body className="text-center">
                    <Card.Title className="method-title">
                      {method.title && method.title.trim() !== "Phương pháp học"
                        ? method.title
                        : "Phương pháp không có tiêu đề"}
                    </Card.Title>
                    <Card.Text className="method-description">
                      {method.description?.split("||")[0]?.trim() || "Chưa có mô tả"}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default StudyMethods;