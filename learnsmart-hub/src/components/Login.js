import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // Trạng thái để hiển thị thông báo sau khi gửi email
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userInfo = { uid: user.uid, role: userData.role };
        localStorage.setItem("user", JSON.stringify(userInfo));
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.role === "user") {
          navigate("/add-method");
        } else {
          navigate("/");
        }
      } else {
        setError("Không tìm thấy thông tin người dùng. Vui lòng đăng ký.");
      }
    } catch (err) {
      setError("Đăng nhập thất bại: " + err.message);
      console.error("Lỗi đăng nhập:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        role: "customer",
        createdAt: new Date().toISOString(),
      });
      const userInfo = { uid: user.uid, role: "customer" };
      localStorage.setItem("user", JSON.stringify(userInfo));
      navigate("/");
    } catch (err) {
      setError("Đăng ký thất bại: " + err.message);
      console.error("Lỗi đăng ký:", err);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Vui lòng nhập email để đặt lại mật khẩu.");
      return;
    }

    try {
      // Gửi email chứa liên kết đặt lại mật khẩu
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/login", // URL mà người dùng sẽ được chuyển hướng sau khi đặt lại mật khẩu
      });

      setEmailSent(true); // Hiển thị thông báo email đã được gửi
      setError("");
    } catch (err) {
      setError("Gửi liên kết đặt lại mật khẩu thất bại: " + err.message);
      console.error("Lỗi gửi liên kết đặt lại mật khẩu:", err);
    }
  };

  // Hàm để quay lại form đăng nhập/đăng ký
  const handleBackToLogin = () => {
    setForgotPassword(false);
    setEmailSent(false);
    setError("");
    setEmail("");
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      {/* Tiêu đề chính */}
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          color: "#5e72e4",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {forgotPassword ? "Quên mật khẩu" : isRegistering ? "Đăng ký" : "Đăng nhập"}
      </Typography>

      <Box
        sx={{
          bgcolor: "#fff",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Mô tả phụ */}
        <Typography variant="body2" sx={{ mb: 3, color: "#6c757d", textAlign: "center" }}>
          {forgotPassword
            ? emailSent
              ? "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm thư mục spam)."
              : "Nhập email để nhận liên kết đặt lại mật khẩu"
            : isRegistering
            ? "Đăng ký với thông tin của bạn"
            : "Đăng nhập với thông tin của bạn"}
        </Typography>

        {!forgotPassword ? (
          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ width: "100%" }}>
            {isRegistering && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <IconButton disabled sx={{ mr: 1 }}>
                  <PersonIcon sx={{ color: "#adb5bd" }} />
                </IconButton>
                <TextField
                  label="Tên người dùng *"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#f0f4ff",
                      "& fieldset": { borderColor: "#e9ecef" },
                      "&:hover fieldset": { borderColor: "#5e72e4" },
                      "&.Mui-focused fieldset": { borderColor: "#5e72e4" },
                    },
                    "& .MuiInputLabel-root": { color: "#6c757d" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#5e72e4" },
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <IconButton disabled sx={{ mr: 1 }}>
                <EmailIcon sx={{ color: "#adb5bd" }} />
              </IconButton>
              <TextField
                label="Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f0f4ff",
                    "& fieldset": { borderColor: "#e9ecef" },
                    "&:hover fieldset": { borderColor: "#5e72e4" },
                    "&.Mui-focused fieldset": { borderColor: "#5e72e4" },
                  },
                  "& .MuiInputLabel-root": { color: "#6c757d" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#5e72e4" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <IconButton disabled sx={{ mr: 1 }}>
                <LockIcon sx={{ color: "#adb5bd" }} />
              </IconButton>
              <TextField
                label="Mật khẩu *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f0f4ff",
                    "& fieldset": { borderColor: "#e9ecef" },
                    "&:hover fieldset": { borderColor: "#5e72e4" },
                    "&.Mui-focused fieldset": { borderColor: "#5e72e4" },
                  },
                  "& .MuiInputLabel-root": { color: "#6c757d" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#5e72e4" },
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#5e72e4",
                color: "#fff",
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "16px",
                "&:hover": { bgcolor: "#324cdd" },
              }}
            >
              {isRegistering ? "Đăng ký" : "Đăng nhập"}
            </Button>
          </form>
        ) : (
          <Box sx={{ width: "100%" }}>
            {!emailSent ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <IconButton disabled sx={{ mr: 1 }}>
                    <EmailIcon sx={{ color: "#adb5bd" }} />
                  </IconButton>
                  <TextField
                    label="Email *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#f0f4ff",
                        "& fieldset": { borderColor: "#e9ecef" },
                        "&:hover fieldset": { borderColor: "#5e72e4" },
                        "&.Mui-focused fieldset": { borderColor: "#5e72e4" },
                      },
                      "& .MuiInputLabel-root": { color: "#6c757d" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#5e72e4" },
                    }}
                  />
                </Box>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
                    {error}
                  </Alert>
                )}
                <Button
                  onClick={handleForgotPassword}
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#5e72e4",
                    color: "#fff",
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "16px",
                    "&:hover": { bgcolor: "#324cdd" },
                  }}
                >
                  Gửi liên kết đặt lại mật khẩu
                </Button>
              </>
            ) : null}

            {/* Nút Quay lại */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                onClick={handleBackToLogin}
                startIcon={<ArrowBackIcon />}
                sx={{ color: "#6c757d", textTransform: "none", fontSize: "14px" }}
              >
                Quay lại
              </Button>
            </Box>
          </Box>
        )}

        {!forgotPassword && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            <Button
              onClick={() => setForgotPassword(true)}
              sx={{ color: "#6c757d", textTransform: "none", fontSize: "14px" }}
            >
              Quên mật khẩu?
            </Button>
            <Button
              onClick={() => setIsRegistering(!isRegistering)}
              sx={{ color: "#5e72e4", textTransform: "none", fontSize: "14px" }}
            >
              {isRegistering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;