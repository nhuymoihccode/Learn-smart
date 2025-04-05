import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Khôi phục currentUser từ localStorage
    const initializeUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.uid && parsedUser.role) {
            setCurrentUser(parsedUser);
          } else {
            localStorage.removeItem("user");
          }
        }
      } catch (err) {
        console.error("Lỗi khi khôi phục user từ localStorage:", err);
        localStorage.removeItem("user");
      }
    };

    initializeUserFromStorage();

    // Theo dõi trạng thái đăng nhập với onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Người dùng đã đăng nhập
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userInfo = {
              uid: user.uid,
              role: userData.role,
              email: userData.email,
              username: userData.username,
            };
            localStorage.setItem("user", JSON.stringify(userInfo));
            setCurrentUser(userInfo);
          } else {
            // Nếu không tìm thấy tài liệu trong Firestore, đặt role mặc định là "user"
            console.warn(`Không tìm thấy tài liệu user ${user.uid} trong Firestore, đặt role mặc định là "user"`);
            const userInfo = {
              uid: user.uid,
              role: "user", // Role mặc định
              email: user.email,
              username: user.displayName || user.email.split('@')[0],
            };
            localStorage.setItem("user", JSON.stringify(userInfo));
            setCurrentUser(userInfo);
          }
        } else {
          // Người dùng chưa đăng nhập hoặc đã đăng xuất
          localStorage.removeItem("user");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", err);
        setError("Đã xảy ra lỗi khi kiểm tra trạng thái đăng nhập. Vui lòng thử lại.");
        localStorage.removeItem("user");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#F5F5F5",
        }}
      >
        <div style={{ fontSize: "18px", color: "#5e72e4" }}>Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#F5F5F5",
        }}
      >
        <div style={{ fontSize: "18px", color: "#d32f2f" }}>{error}</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};