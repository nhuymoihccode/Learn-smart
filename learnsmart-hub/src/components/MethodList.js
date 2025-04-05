import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Navigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/Admin.css";
import "bootstrap/dist/css/bootstrap.min.css";

const MethodList = () => {
  const { currentUser } = useContext(AuthContext);
  const [methods, setMethods] = useState([]);
  const [editingMethod, setEditingMethod] = useState(null);
  const [methodTitle, setMethodTitle] = useState("");
  const [methodDescription, setMethodDescription] = useState("");
  const [videoSegments, setVideoSegments] = useState([]);

  useEffect(() => {
    const fetchMethods = async () => {
      const querySnapshot = await getDocs(collection(db, "methods"));
      const methodsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMethods(methodsList);
    };
    fetchMethods();
  }, []);

  const handleDeleteMethod = async (methodId) => {
    try {
      await deleteDoc(doc(db, "methods", methodId));
      setMethods(methods.filter((method) => method.id !== methodId));
      toast.success("Xóa phương pháp học thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa phương pháp:", error);
      toast.error("Lỗi khi xóa phương pháp!");
    }
  };

  const handleEditMethod = (method) => {
    setEditingMethod(method);
    setMethodTitle(method.title);
    setMethodDescription(method.description);
    setVideoSegments(method.videoSegments || []);
  };

  const handleVideoChange = (index, field, value) => {
    const newSegments = [...videoSegments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setVideoSegments(newSegments);
  };

  const handleAddVideoSegment = () => {
    setVideoSegments([...videoSegments, { url: "", position: 0 }]);
  };

  const handleSaveMethod = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "admin") return;

    try {
      const updatedMethod = {
        title: methodTitle,
        description: methodDescription,
        videoSegments: videoSegments.filter((video) => video.url && video.position >= 0),
      };
      await updateDoc(doc(db, "methods", editingMethod.id), updatedMethod);
      setMethods(
        methods.map((method) =>
          method.id === editingMethod.id ? { id: method.id, ...updatedMethod } : method
        )
      );
      setEditingMethod(null);
      setMethodTitle("");
      setMethodDescription("");
      setVideoSegments([]);
      toast.success("Cập nhật phương pháp học thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật phương pháp:", error);
      toast.error("Lỗi khi cập nhật phương pháp!");
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="wrapper">
      <ToastContainer />

      {/* Main Panel */}
      <div className="main-panel">

        {/* Content */}
        <div className="content">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Danh sách Phương pháp học ({methods.length} mục)</h4>
                </div>
                <div className="card-body">
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tiêu đề</TableCell>
                          <TableCell>Mô tả</TableCell>
                          <TableCell>Video Segments</TableCell>
                          <TableCell>Hành động</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {methods.map((method) => (
                          <TableRow key={method.id}>
                            <TableCell>{method.title}</TableCell>
                            <TableCell>{method.description.split("||")[0]}...</TableCell>
                            <TableCell>
                              {method.videoSegments?.length > 0
                                ? `${method.videoSegments.length} video`
                                : "Không có video"}
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => handleEditMethod(method)}>
                                <EditIcon style={{ color: "#2196f3" }} />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteMethod(method.id)}>
                                <DeleteIcon style={{ color: "#e91e63" }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {editingMethod && (
                    <form onSubmit={handleSaveMethod} style={{ marginTop: "20px" }}>
                      <div className="card card-plain">
                        <div className="card-header">
                          <h4 className="card-title">Chỉnh sửa Phương pháp</h4>
                        </div>
                        <div className="card-body">
                          <TextField
                            label="Tiêu đề"
                            value={methodTitle}
                            onChange={(e) => setMethodTitle(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ style: { color: "#666" } }}
                            InputProps={{ style: { fontSize: "16px" } }}
                          />
                          <TextField
                            label="Mô tả (phân tách đoạn bằng ||)"
                            value={methodDescription}
                            onChange={(e) => setMethodDescription(e.target.value)}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            required
                            helperText="Phân tách các đoạn bằng ||, mỗi đoạn có thể có video."
                            InputLabelProps={{ style: { color: "#666" } }}
                            InputProps={{ style: { fontSize: "16px" } }}
                          />
                          {videoSegments.map((video, index) => (
                            <div key={index} className="row mb-3">
                              <div className="col-md-8">
                                <TextField
                                  label={`URL Video ${index + 1}`}
                                  value={video.url}
                                  onChange={(e) => handleVideoChange(index, "url", e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  InputLabelProps={{ style: { color: "#666" } }}
                                  InputProps={{ style: { fontSize: "16px" } }}
                                />
                              </div>
                              <div className="col-md-2">
                                <TextField
                                  label="Vị trí đoạn (0, 1, 2...)"
                                  type="number"
                                  value={video.position}
                                  onChange={(e) =>
                                    handleVideoChange(index, "position", parseInt(e.target.value))
                                  }
                                  fullWidth
                                  margin="normal"
                                  InputLabelProps={{ style: { color: "#666" } }}
                                  InputProps={{ style: { fontSize: "16px" } }}
                                />
                              </div>
                              {index > 0 && (
                                <div className="col-md-2">
                                  <IconButton
                                    onClick={() => {
                                      const newSegments = videoSegments.filter((_, i) => i !== index);
                                      setVideoSegments(newSegments);
                                    }}
                                  >
                                    <DeleteIcon style={{ color: "#e91e63" }} />
                                  </IconButton>
                                </div>
                              )}
                            </div>
                          ))}
                          <Button
                            className="btn btn-info btn-fill mr-2"
                            onClick={handleAddVideoSegment}
                          >
                            Thêm video
                          </Button>
                          <Button type="submit" className="btn btn-success btn-fill">
                            Lưu
                          </Button>
                          <Button
                            className="btn btn-secondary btn-fill ml-2"
                            onClick={() => setEditingMethod(null)}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
                <footer className="footer" style={{
                  backgroundColor: "#1a1a1a", // Màu nền tối
                  color: "#ffffff", // Màu chữ trắng
                  padding: "20px 0", // Khoảng cách trên dưới
                  marginTop: "40px", // Khoảng cách với nội dung phía trên
                  borderTop: "1px solid #333", // Đường viền trên
                  fontFamily: "'Roboto', sans-serif", // Font chữ hiện đại
                }}>
                  <div>
                    <div className="row" style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      padding: "0 15px",
                    }}>
                      {/* Phần liên kết */}
                      <nav className="footer-nav">
                        <ul style={{
                          display: "flex",
                          listStyle: "none",
                          margin: 0,
                          padding: 0,
                          gap: "20px", // Khoảng cách giữa các liên kết
                        }}>
                          <li>
                            <Link
                              to="https://www.creative-tim.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#00bcd4", // Màu liên kết
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 500,
                                transition: "color 0.3s ease", // Hiệu ứng chuyển màu
                              }}
                              onMouseEnter={(e) => (e.target.style.color = "#80deea")} // Hover sáng hơn
                              onMouseLeave={(e) => (e.target.style.color = "#00bcd4")} // Trở lại màu ban đầu
                            >
                              LearnSmart
                            </Link>
                          </li>
                          <li>
                            <Link
                              to=""
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#00bcd4",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 500,
                                transition: "color 0.3s ease",
                              }}
                              onMouseEnter={(e) => (e.target.style.color = "#80deea")}
                              onMouseLeave={(e) => (e.target.style.color = "#00bcd4")}
                            >
                              Blog
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="https://www.creative-tim.com/license"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#00bcd4",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 500,
                                transition: "color 0.3s ease",
                              }}
                              onMouseEnter={(e) => (e.target.style.color = "#80deea")}
                              onMouseLeave={(e) => (e.target.style.color = "#00bcd4")}
                            >
                              Licenses
                            </Link>
                          </li>
                        </ul>
                      </nav>
        
                      {/* Phần bản quyền */}
                      <div className="credits" style={{ display: "flex", alignItems: "center" }}>
                        <span className="copyright" style={{
                          fontSize: "14px",
                          color: "#b0b0b0", // Màu chữ nhạt hơn
                        }}>
                          © {new Date().getFullYear()}, made with{" "}
                          <i
                            className="fa fa-heart heart"
                            style={{
                              color: "#ff4d4f", // Màu trái tim đỏ
                              margin: "0 5px",
                              animation: "beat 1s infinite", // Hiệu ứng nhịp đập
                            }}
                          />{" "}
                          by Nhật Huy
                        </span>
                      </div>
                    </div>
                  </div>
        
                  {/* Thêm keyframes cho hiệu ứng nhịp đập của trái tim */}
                  <style>
                    {`
              @keyframes beat {
                0%, 100% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.2);
                }
              }
            `}
                  </style>
                </footer>
      </div>
    </div>
  );
};

export default MethodList;