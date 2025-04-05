import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  Button,
  Pagination,
  Chip,
  IconButton,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { styled } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// Styled components để tùy chỉnh giao diện
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(3),
}));

const UserPostHistory = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5; // Số bài đăng mỗi trang

  useEffect(() => {
    console.log("UserPostHistory: currentUser", currentUser);
    if (currentUser && currentUser.role === "user") {
      setLoading(true);
      const fetchPosts = async () => {
        try {
          const q = query(
            collection(db, "methods"),
            where("createdBy", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const postsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sắp xếp bài đăng theo ngày tạo (mới nhất đến cũ nhất)
          postsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setPosts(postsList);
        } catch (err) {
          console.error("Lỗi khi fetch dữ liệu:", err);
          toast.error("Không thể tải lịch sử bài đăng. Vui lòng thử lại!");
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [currentUser]);

  if (!currentUser) {
    console.log("UserPostHistory: Chuyển hướng vì không có currentUser");
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "user") {
    console.log("UserPostHistory: Chuyển hướng vì không phải user, role:", currentUser?.role);
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Tính toán phân trang
  const totalPages = Math.ceil(posts.length / rowsPerPage);
  const paginatedPosts = posts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Hàm xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Hàm xử lý xem chi tiết bài đăng
  const handleViewDetails = (postId) => {
    navigate(`/study-methods/${postId}`, { state: { from: "/user/post-history" } });
  };

  // Hàm render trạng thái với màu sắc và icon
  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <Chip
            icon={<HourglassEmptyIcon />}
            label="Đã gửi"
            color="warning"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case "approved":
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Đã duyệt"
            color="success"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case "rejected":
        return (
          <Chip
            icon={<CancelIcon />}
            label="Từ chối"
            color="error"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      default:
        return <Chip label="Không xác định" size="small" />;
    }
  };

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <ToastContainer />
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/add-method")}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#2c3e50" }}>
          Lịch sử bài đăng
        </Typography>
      </Box>

      {posts.length > 0 ? (
        <StyledCard>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Tiêu đề
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Mô tả
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Trạng thái
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Ngày tạo
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Hành động
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <StyledTableRow key={post.id}>
                    <StyledTableCell>{post.title}</StyledTableCell>
                    <StyledTableCell>
                      {post.description?.split("||")[0] || "Chưa có mô tả"}
                    </StyledTableCell>
                    <StyledTableCell>{renderStatus(post.status)}</StyledTableCell>
                    <StyledTableCell>
                      {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </StyledTableCell>
                    <StyledTableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(post.id)}
                        title="Xem chi tiết"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>

            {/* Phân trang */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </CardContent>
        </StyledCard>
      ) : (
        <Typography variant="body1" color="textSecondary" textAlign="center">
          Bạn chưa có bài đăng nào.
        </Typography>
      )}
    </Box>
  );
};

export default UserPostHistory;