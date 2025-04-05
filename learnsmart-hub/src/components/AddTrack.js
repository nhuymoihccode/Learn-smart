import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { db } from "../firebase";
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Navigate, Link } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/Admin.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AddTrack = () => {
  const { currentUser } = useContext(AuthContext);
  const [trackName, setTrackName] = useState("");
  const [trackUrl, setTrackUrl] = useState("");

  const handleAddTrack = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "customer") return;

    if (trackName.trim() === "" || trackUrl.trim() === "") {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const newTrack = { name: trackName, url: trackUrl };
      const q = query(collection(db, "userVideos"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, "userVideos"), {
          userId: currentUser.uid,
          videos: [newTrack],
        });
      } else {
        const userDoc = querySnapshot.docs[0];
        const existingVideos = userDoc.data().videos || [];
        if (existingVideos.length >= 2) {
          toast.error("Bạn chỉ có thể thêm tối đa 2 video!");
          return;
        }
        await updateDoc(doc(db, "userVideos", userDoc.id), {
          videos: [...existingVideos, newTrack],
        });
      }
      setTrackName("");
      setTrackUrl("");
      toast.success("Thêm track nhạc thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm track:", error);
      toast.error("Lỗi khi thêm track!");
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
                  <h4 className="card-title">Thêm Kho nhạc</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAddTrack}>
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
                      Thêm video
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer footer-black footer-white">
          <div className="container-fluid">
            <div className="row">
              <nav className="footer-nav">
                <ul>
                  <li>
                    <Link to="https://www.creative-tim.com" target="_blank" rel="noopener noreferrer">
                      Creative Tim
                    </Link>
                  </li>
                  <li>
                    <Link to="https://www.creative-tim.com/blog" target="_blank" rel="noopener noreferrer">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="https://www.creative-tim.com/license" target="_blank" rel="noopener noreferrer">
                      Licenses
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="credits ml-auto">
                <span className="copyright">
                  © {new Date().getFullYear()}, made with <i className="fa fa-heart heart"></i> by Creative Tim
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AddTrack;