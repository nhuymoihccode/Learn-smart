import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Container, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactPlayer from "react-player";

const StudyMethodDetail = () => {
  const { id } = useParams();
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMethod = async () => {
      try {
        const methodDoc = await getDoc(doc(db, "methods", id));
        if (methodDoc.exists()) {
          setMethod({ id: methodDoc.id, ...methodDoc.data() });
        } else {
          setError("Phương pháp không tồn tại.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchMethod();
  }, [id]);

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-center mt-4 text-danger">{error}</div>;
  if (!method) return <div className="text-center mt-4">Không tìm thấy phương pháp.</div>;

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Chi tiết Phương pháp: {method.title}</h1>
      <Card>
        <Card.Body>
          <Card.Title>{method.title}</Card.Title>
          <Card.Text>
            {method.description?.split("||").map((seg, index) => (
              <div key={index}>
                <p>{seg.trim()}</p>
                {method.videoSegments &&
                  method.videoSegments
                    .filter((v) => v.position === index)
                    .map((video, vIndex) => (
                      <div key={vIndex} className="mt-2">
                        <ReactPlayer url={video.url} controls width="100%" />
                      </div>
                    ))}
              </div>
            ))}
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StudyMethodDetail;