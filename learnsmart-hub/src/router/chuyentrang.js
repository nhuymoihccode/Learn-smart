import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import Admin from '../components/Admin';
import Login from '../components/Login';
import StudyMethods from '../components/StudyMethods';
import Timer from '../components/Timer';
import MusicPlayer from '../components/MusicPlayer';
import PageLayout from '../components/PageLayout';
import Home from '../pages/Home';
import AddMethod from '../components/AddMethod';
import AddTrack from '../components/AddTrack';
import StudyMethodDetail from '../components/StudyMethodDetail';
import UserPostHistory from "../components/UserPostHistory";
import { CircularProgress, Box } from '@mui/material';

const Chuyentrang = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Chuyentrang: currentUser", currentUser);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Route dành cho tất cả người dùng (bao gồm customer, user, admin)
  const customerRoutes = (
    <>
      <Route path="/" element={<Home />} />
      <Route
        path="/study-methods"
        element={<PageLayout title="Phương pháp học"><StudyMethods /></PageLayout>}
      />
      <Route
        path="/study-methods/:id"
        element={<PageLayout title="Chi tiết Phương pháp"><StudyMethodDetail /></PageLayout>}
      />
      <Route
        path="/timer"
        element={<PageLayout title="Bộ đếm ngược"><Timer /></PageLayout>}
      />
      <Route
        path="/music-player"
        element={<PageLayout title="Kho nhạc"><MusicPlayer /></PageLayout>}
      />
      <Route
        path="/add-track"
        element={<PageLayout title="Thêm nhạc"><AddTrack /></PageLayout>}
      />
    </>
  );

  // Route dành cho user và admin
  const adminUserRoutes = (
    <>
      {/* Route cho admin */}
      <Route
        path="/admin"
        element={
          currentUser && currentUser.role === 'admin' ? (
            <Admin />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin/add-method"
        element={
          currentUser && currentUser.role === 'admin' ? (
            <AddMethod />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin/add-track"
        element={
          currentUser && currentUser.role === 'admin' ? (
            <AddTrack />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Route cho user */}
      <Route
        path="/add-method"
        element={
          currentUser && currentUser.role === 'user' ? (
            <PageLayout title="Thêm phương pháp học" key="add-method"><AddMethod /></PageLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/user/post-history"
        element={
          currentUser && currentUser.role === 'user' ? (
            <PageLayout title="Lịch sử bài đăng" key="user-post-history"><UserPostHistory /></PageLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </>
  );

  return (
    <Routes>
      {/* Route chung: Trang login */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <PageLayout title=""><Login /></PageLayout>
          )
        }
      />

      {/* Hiển thị tất cả route */}
      {customerRoutes}
      {adminUserRoutes}

      {/* Route mặc định */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Chuyentrang;