import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Navigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/Admin.css";
import "bootstrap/dist/css/bootstrap.min.css";

const TrackList = () => {
  const { currentUser } = useContext(AuthContext);
  const [tracks, setTracks] = useState([]);
  const [editingTrack, setEditingTrack] = useState(null);
  const [trackName, setTrackName] = useState("");
  const [trackUrl, setTrackUrl] = useState("");

  useEffect(() => {
    const fetchTracks = async () => {
      const q = query(
        collection(db, "userVideos"),
        where("userId", "==", currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setTracks(userDoc.data().videos || []);
      } else {
        setTracks([]);
      }
    };
    if (currentUser) fetchTracks();
  }, [currentUser]);

  const handleDeleteTrack = async (index) => {
    try {
      const updatedTracks = tracks.filter((_, i) => i !== index);
      const q = query(
        collection(db, "userVideos"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "userVideos", userDoc.id), {
          videos: updatedTracks,
        });
      }
      setTracks(updatedTracks);
      toast.success("Xóa track nhạc thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa track:", error);
      toast.error("Lỗi khi xóa track!");
    }
  };

  const handleEditTrack = (track, index) => {
    setEditingTrack({ track, index });
    setTrackName(track.name);
    setTrackUrl(track.url);
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "customer") return;

    try {
      const updatedTrack = { name: trackName, url: trackUrl };
      const updatedTracks = [...tracks];
      updatedTracks[editingTrack.index] = updatedTrack;

      const q = query(
        collection(db, "userVideos"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "userVideos", userDoc.id), {
          videos: updatedTracks,
        });
      }
      setTracks(updatedTracks);
      setEditingTrack(null);
      setTrackName("");
      setTrackUrl("");
      toast.success("Cập nhật track nhạc thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật track:", error);
      toast.error("Lỗi khi cập nhật track!");
    }
  };

  if (!currentUser || currentUser.role !== "customer") {
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
                  <h4 className="card-title">Danh sách Kho nhạc ({tracks.length}/2 video)</h4>
                </div>
                <div className="card-body">
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tên video</TableCell>
                          <TableCell>URL</TableCell>
                          <TableCell>Hành động</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tracks.map((track, index) => (
                          <TableRow key={index}>
                            <TableCell>{track.name}</TableCell>
                            <TableCell>{track.url}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => handleEditTrack(track, index)}>
                                <EditIcon style={{ color: "#2196f3" }} />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteTrack(index)}>
                                <DeleteIcon style={{ color: "#e91e63" }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {editingTrack && (
                    <form onSubmit={handleSaveTrack} style={{ marginTop: "20px" }}>
                      <div className="card card-plain">
                        <div className="card-header">
                          <h4 className="card-title">Chỉnh sửa Track nhạc</h4>
                        </div>
                        <div className="card-body">
                          <TextField
                            label="Tên video"
                            value={trackName}
                            onChange={(e) => setTrackName(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ style: { color: "#666" } }}
                            InputProps={{ style: { fontSize: "16px" } }}
                          />
                          <TextField
                            label="URL YouTube"
                            value={trackUrl}
                            onChange={(e) => setTrackUrl(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                            helperText="Dán URL YouTube để thêm video"
                            InputLabelProps={{ style: { color: "#666" } }}
                            InputProps={{ style: { fontSize: "16px" } }}
                          />
                          <Button type="submit" className="btn btn-success btn-fill">
                            Lưu
                          </Button>
                          <Button
                            className="btn btn-secondary btn-fill ml-2"
                            onClick={() => setEditingTrack(null)}
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

export default TrackList;