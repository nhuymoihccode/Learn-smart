import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { Navigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Box, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Button, Typography } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/Admin.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Admin = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      setLoading(true);
      const fetchMethods = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "methods"));
          const methodsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMethods(methodsList);
        } catch (err) {
          console.error("Lỗi khi fetch dữ liệu:", err);
          toast.error("Lỗi khi tải dữ liệu bài đăng!");
        } finally {
          setLoading(false);
        }
      };
      fetchMethods();
    }

    // Khởi tạo PerfectScrollbar
    if (typeof window !== "undefined" && window.PerfectScrollbar) {
      const ps = new window.PerfectScrollbar(".sidebar-wrapper", {
        suppressScrollX: true,
      });
      return () => {
        if (ps) ps.destroy();
      };
    }
  }, [currentUser]);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, "methods", id), { status: "approved" });
      setMethods(methods.map((method) => (method.id === id ? { ...method, status: "approved" } : method)));
      toast.success("Đã duyệt bài đăng!");
    } catch (err) {
      console.error("Lỗi khi duyệt bài:", err);
      toast.error("Lỗi khi duyệt bài đăng!");
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, "methods", id), { status: "rejected" });
      setMethods(methods.map((method) => (method.id === id ? { ...method, status: "rejected" } : method)));
      toast.success("Đã từ chối bài đăng!");
    } catch (err) {
      console.error("Lỗi khi từ chối bài:", err);
      toast.error("Lỗi khi từ chối bài đăng!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "methods", id));
      setMethods(methods.filter((method) => method.id !== id));
      toast.success("Đã xóa bài đăng!");
    } catch (err) {
      console.error("Lỗi khi xóa bài:", err);
      toast.error("Lỗi khi xóa bài đăng!");
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="wrapper">
      <ToastContainer />

      {/* Main Panel */}
      <div className="main-panel">

        {/* Content */}
        <div className="content">
          <Typography variant="h4" gutterBottom>
            Quản lý bài đăng
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Người tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>{method.title}</TableCell>
                  <TableCell>{method.description?.split("||")[0] || "Chưa có mô tả"}</TableCell>
                  <TableCell>{method.createdBy}</TableCell>
                  <TableCell>
                    {method.status === "pending" && "Đang chờ duyệt"}
                    {method.status === "approved" && "Đã duyệt"}
                    {method.status === "rejected" && "Từ chối"}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleApprove(method.id)}
                      disabled={method.status === "approved"}
                      variant="contained"
                      color="success"
                      sx={{ mr: 1 }}
                    >
                      Duyệt
                    </Button>
                    <Button
                      onClick={() => handleReject(method.id)}
                      disabled={method.status === "rejected"}
                      variant="contained"
                      color="warning"
                      sx={{ mr: 1 }}
                    >
                      Không duyệt
                    </Button>
                    <Button
                      onClick={() => handleDelete(method.id)}
                      variant="contained"
                      color="error"
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default Admin;