import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import {
  TextField,
  Button,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast, ToastContainer } from "react-toastify";
import mammoth from "mammoth";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AddMethod = () => {
  const { currentUser } = useContext(AuthContext);
  const [methodTitle, setMethodTitle] = useState("");
  const [methodDescription, setMethodDescription] = useState("");
  const [videoSegments, setVideoSegments] = useState([]); // Lưu danh sách video: [{ url, position }, ...]
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [methods, setMethods] = useState([]); // Lưu danh sách các phương pháp đã trích xuất
  const [tabValue, setTabValue] = useState(0); // Quản lý tab chính
  const [inputMode, setInputMode] = useState("upload"); // Quản lý chế độ nhập liệu: "upload" hoặc "manual"
  const [editingIndex, setEditingIndex] = useState(null); // Lưu index của phương pháp đang chỉnh sửa
  const [descriptionSegments, setDescriptionSegments] = useState(1); // Số đoạn trong mô tả
  const fileInputRef = useRef(null);
  const wordFileInputRef = useRef(null);

  // Cập nhật số đoạn khi methodDescription thay đổi
  useEffect(() => {
    const segments = methodDescription
      ? methodDescription.split("||").length
      : 1;
    setDescriptionSegments(segments);
  }, [methodDescription]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputModeChange = (event) => {
    setInputMode(event.target.value);
    // Reset các trường nhập liệu khi chuyển chế độ
    setMethodTitle("");
    setMethodDescription("");
    setVideoSegments([]);
    setSelectedImage(null);
    setPreviewImage("");
    setEditingIndex(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (wordFileInputRef.current) wordFileInputRef.current.value = "";
  };

  const handleVideoChange = (index, field, value) => {
    const newSegments = [...videoSegments];
    if (field === "position") {
      const position = parseInt(value);
      // Điều chỉnh position nếu vượt quá số đoạn
      if (position >= descriptionSegments) {
        newSegments[index] = { ...newSegments[index], position: descriptionSegments - 1 };
        toast.warn(`Vị trí video đã được điều chỉnh về ${descriptionSegments - 1} vì vượt quá số đoạn.`);
      } else {
        newSegments[index] = { ...newSegments[index], position };
      }

      // Kiểm tra trùng lặp position
      const otherPositions = newSegments
        .filter((_, i) => i !== index)
        .map((video) => video.position);
      if (otherPositions.includes(position)) {
        toast.warn(`Vị trí ${position} đã được sử dụng bởi video khác!`);
      }
    } else {
      newSegments[index] = { ...newSegments[index], [field]: value };
    }
    setVideoSegments(newSegments);
  };

  const handleAddVideoSegment = () => {
    // Tìm position chưa được sử dụng
    const usedPositions = videoSegments.map((video) => video.position);
    let newPosition = 0;
    while (usedPositions.includes(newPosition) && newPosition < descriptionSegments) {
      newPosition++;
    }

    // Nếu tất cả position từ 0 đến descriptionSegments-1 đã được sử dụng, chọn position nhỏ nhất chưa dùng
    if (newPosition >= descriptionSegments) {
      newPosition = usedPositions.length > 0 ? Math.max(...usedPositions) + 1 : 0;
    }

    setVideoSegments([...videoSegments, { url: "", position: newPosition }]);
  };

  const handleRemoveVideoSegment = (index) => {
    const newSegments = videoSegments.filter((_, i) => i !== index);
    setVideoSegments(newSegments);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWordFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      toast.error("Vui lòng tải lên file Word (.docx)!");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      const methodBlocks = text
        .split("---")
        .map((block) => block.trim())
        .filter((block) => block);

      if (methodBlocks.length > 100) {
        toast.warn(
          `File Word chứa ${methodBlocks.length} phương pháp, nhưng chỉ 100 phương pháp đầu tiên sẽ được xử lý. Vui lòng chia nhỏ file nếu cần thêm nhiều hơn.`
        );
        methodBlocks.splice(100);
      }

      const extractedMethods = [];

      for (const block of methodBlocks) {
        if (extractedMethods.length >= 100) {
          break;
        }

        const lines = block
          .replace(/\r\n/g, "\n")
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        const data = {
          title: "",
          description: "",
          imagePath: "",
          videos: [],
        };

        let currentField = "";
        let descriptionLines = [];

        for (const line of lines) {
          if (/^Tiêu\s*đề\s*:\s*/.test(line)) {
            data.title = line.replace(/^Tiêu\s*đề\s*:\s*/, "").trim();
            currentField = "title";
          } else if (/^Mô\s*tả\s*:\s*/.test(line)) {
            currentField = "description";
            descriptionLines = [];
            const descriptionPart = line.replace(/^Mô\s*tả\s*:\s*/, "").trim();
            if (descriptionPart) descriptionLines.push(descriptionPart);
          } else if (/^Hình\s*ảnh\s*:\s*/.test(line)) {
            data.imagePath = line.replace(/^Hình\s*ảnh\s*:\s*/, "").trim();
            currentField = "image";
          } else if (/^Video\s*:\s*/.test(line)) {
            currentField = "video";
            const [url, position] = line
              .replace(/^Video\s*:\s*/, "")
              .split("|")
              .map((item) => item.trim());
            if (url && position) {
              data.videos.push({ url, position: parseInt(position) });
            }
          } else if (currentField === "description") {
            descriptionLines.push(line);
          }
        }

        data.description = descriptionLines.join("||").trim();

        if (data.title && data.description) {
          extractedMethods.push(data);
        }
      }

      if (extractedMethods.length === 0) {
        toast.error("Không tìm thấy phương pháp nào hợp lệ trong file Word!");
        return;
      }

      setMethods(extractedMethods);

      if (extractedMethods.length > 0) {
        const firstMethod = extractedMethods[0];
        setMethodTitle(firstMethod.title);
        setMethodDescription(firstMethod.description);
        setVideoSegments(firstMethod.videos);
        setEditingIndex(0);

        if (firstMethod.imagePath) {
          const isUrl = /^https?:\/\//i.test(firstMethod.imagePath);
          if (isUrl) {
            setPreviewImage(firstMethod.imagePath);
            setSelectedImage(null);
            toast.info("Đã tải hình ảnh từ URL trong file Word.");
          } else {
            setSelectedImage(null);
            setPreviewImage("");
            toast.info("Vui lòng tải lên file ảnh bìa tương ứng với đường dẫn trong file Word.");
          }
        } else {
          setSelectedImage(null);
          setPreviewImage("");
        }
      }

      toast.success(`Đã trích xuất ${extractedMethods.length} phương pháp từ file Word!`);
      setTabValue(1); // Chuyển sang tab "Danh sách phương pháp"
    } catch (error) {
      console.error("Lỗi khi đọc file Word:", error);
      toast.error("Không thể đọc file Word. Vui lòng kiểm tra lại!");
    }
  };

  const handleSelectMethod = (index) => {
    const method = methods[index];
    setMethodTitle(method.title);
    setMethodDescription(method.description);
    setVideoSegments(method.videos);
    setEditingIndex(index);

    if (method.imagePath) {
      const isUrl = /^https?:\/\//i.test(method.imagePath);
      if (isUrl) {
        setPreviewImage(method.imagePath);
        setSelectedImage(null);
      } else {
        setPreviewImage("");
        setSelectedImage(null);
      }
    } else {
      setPreviewImage("");
      setSelectedImage(null);
    }
    setInputMode("manual");
    setTabValue(0);
  };

  const handleDeleteMethod = (index) => {
    const newMethods = methods.filter((_, i) => i !== index);
    setMethods(newMethods);
    if (editingIndex === index) {
      setMethodTitle("");
      setMethodDescription("");
      setVideoSegments([]);
      setPreviewImage("");
      setSelectedImage(null);
      setEditingIndex(null);
    }
    toast.success("Đã xóa phương pháp!");
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const updatedMethod = {
      title: methodTitle,
      description: methodDescription,
      videos: videoSegments,
      imagePath: previewImage || "",
    };

    const newMethods = [...methods];
    newMethods[editingIndex] = updatedMethod;
    setMethods(newMethods);
    toast.success(`Đã cập nhật phương pháp "${updatedMethod.title}"!`);
  };

  const handleAddMethod = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "user") return;

    try {
      if (inputMode === "upload" && methods.length > 0) {
        // Xử lý khi tải file Word
        for (const method of methods) {
          let coverImageUrl = "/images/default-avatar.jpg";
          if (method.imagePath && /^https?:\/\//i.test(method.imagePath)) {
            coverImageUrl = method.imagePath;
          }

          const newMethod = {
            title: method.title,
            description: method.description,
            videoSegments: method.videos.filter((video) => video.url && video.position >= 0),
            coverImageUrl: coverImageUrl,
            status: "pending",
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString(),
          };

          await addDoc(collection(db, "methods"), newMethod);
        }

        toast.success(`Đã thêm ${methods.length} phương pháp học thành công! Đang chờ admin duyệt.`);
      } else if (inputMode === "manual") {
        // Xử lý khi nhập trực tiếp
        if (!methodTitle || !methodDescription) {
          toast.error("Vui lòng nhập đầy đủ tiêu đề và mô tả!");
          return;
        }

        // Kiểm tra trùng lặp position
        const positions = videoSegments.map((video) => video.position);
        const hasDuplicatePosition = new Set(positions).size !== positions.length;
        if (hasDuplicatePosition) {
          toast.warn("Có video bị trùng vị trí! Mỗi video nên có vị trí duy nhất.");
        }

        // Kiểm tra position không hợp lệ
        const invalidVideos = videoSegments.filter(
          (video) => video.position >= descriptionSegments
        );
        if (invalidVideos.length > 0) {
          toast.warn(
            "Một số video có vị trí không hợp lệ (vị trí lớn hơn số đoạn trong mô tả). Những video này sẽ không được hiển thị."
          );
        }

        let coverImageUrl = "/images/default-avatar.jpg";
        if (previewImage && !selectedImage) {
          coverImageUrl = previewImage;
        } else if (selectedImage) {
          const formData = new FormData();
          formData.append("image", selectedImage);

          const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          if (data.url) {
            coverImageUrl = `http://localhost:5000${data.url}`;
          } else {
            throw new Error("No URL returned from backend");
          }
        }

        const newMethod = {
          title: methodTitle,
          description: methodDescription,
          videoSegments: videoSegments.filter((video) => video.url && video.position >= 0),
          coverImageUrl: coverImageUrl,
          status: "pending",
          createdBy: currentUser.uid,
          createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, "methods"), newMethod);
        toast.success("Thêm phương pháp học thành công! Đang chờ admin duyệt.");
      }

      // Reset form sau khi thêm
      setMethodTitle("");
      setMethodDescription("");
      setVideoSegments([]);
      setSelectedImage(null);
      setPreviewImage("");
      setMethods([]);
      setTabValue(0);
      setEditingIndex(null);
      setInputMode("upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (wordFileInputRef.current) wordFileInputRef.current.value = "";
    } catch (error) {
      console.error("Lỗi khi thêm phương pháp:", error);
      toast.error(`Lỗi: ${error.message || "Không thể thêm phương pháp!"}`);
    }
  };

  // Hàm lấy video ID từ URL YouTube
  const getYouTubeVideoId = (url) => {
    const regex = /(?:v=)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (!currentUser || currentUser.role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light">
              <h4 className="card-title mb-0">Thêm Phương pháp học</h4>
            </div>
            <div className="card-body">
              {/* Tabs chính */}
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="Phân chia các phần"
                variant="fullWidth"
                sx={{ mb: 3 }}
              >
                <Tab label="Nhập liệu" />
                <Tab label="Danh sách phương pháp" disabled={methods.length === 0} />
                <Tab label="Preview" disabled={!methodTitle && !methodDescription} />
              </Tabs>

              {/* Tab 1: Nhập liệu */}
              {tabValue === 0 && (
                <div>
                  {/* Bộ chọn chế độ nhập liệu */}
                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <RadioGroup
                      row
                      value={inputMode}
                      onChange={handleInputModeChange}
                      name="input-mode"
                    >
                      <FormControlLabel
                        value="upload"
                        control={<Radio />}
                        label="Tải file Word lên"
                      />
                      <FormControlLabel
                        value="manual"
                        control={<Radio />}
                        label="Nhập trực tiếp"
                      />
                    </RadioGroup>
                  </FormControl>

                  <form onSubmit={handleAddMethod}>
                    {/* Chế độ tải file Word */}
                    {inputMode === "upload" && (
                      <div>
                        <div className="mb-3">
                          <label htmlFor="wordFile" className="form-label">
                            Tải lên file Word (theo mẫu)
                          </label>
                          <input
                            type="file"
                            id="wordFile"
                            accept=".docx"
                            onChange={handleWordFileUpload}
                            ref={wordFileInputRef}
                            className="form-control"
                            style={{ marginBottom: "10px" }}
                          />
                          <small className="form-text text-muted">
                            Tải xuống{" "}
                            <a href="http://localhost:5000/download-template" download>
                              mẫu Word
                            </a>{" "}
                            và điền thông tin theo hướng dẫn.
                          </small>
                        </div>
                        {/* Xóa nút "Xác nhận thêm phương pháp" khỏi tab này */}
                      </div>
                    )}

                    {/* Chế độ nhập trực tiếp */}
                    {inputMode === "manual" && (
                      <div>
                        {editingIndex !== null && (
                          <div className="alert alert-info mt-3">
                            Đang chỉnh sửa phương pháp:{" "}
                            <strong>{methods[editingIndex]?.title}</strong>
                          </div>
                        )}
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
                          helperText={`Phân tách các đoạn bằng ||, mỗi đoạn có thể chèn video. Hiện tại có ${descriptionSegments} đoạn.`}
                          InputLabelProps={{ style: { color: "#666" } }}
                          InputProps={{ style: { fontSize: "16px" } }}
                        />
                        <div className="mb-3">
                          <label htmlFor="coverImage" className="form-label">
                            Chọn ảnh bìa
                          </label>
                          <input
                            type="file"
                            id="coverImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="form-control"
                            style={{ marginBottom: "10px" }}
                          />
                          {previewImage && (
                            <Box mt={2}>
                              <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                  borderRadius: "5px",
                                }}
                                onError={() => {
                                  toast.error(
                                    "Không thể tải hình ảnh từ URL. Vui lòng chọn file ảnh thủ công."
                                  );
                                  setPreviewImage("");
                                }}
                              />
                            </Box>
                          )}
                        </div>
                        {/* Phần nhập video */}
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                          Thêm video (tùy chọn)
                        </Typography>
                        {videoSegments.map((video, index) => (
                          <div key={index} className="row mb-3">
                            <div className="col-md-8">
                              <TextField
                                label={`URL Video ${index + 1}`}
                                value={video.url}
                                onChange={(e) =>
                                  handleVideoChange(index, "url", e.target.value)
                                }
                                fullWidth
                                margin="normal"
                                placeholder="Ví dụ: https://youtube.com/watch?v=abc"
                                InputLabelProps={{ style: { color: "#666" } }}
                                InputProps={{ style: { fontSize: "16px" } }}
                              />
                            </div>
                            <div className="col-md-2">
                              <TextField
                                label="Vị trí đoạn"
                                type="number"
                                value={video.position}
                                onChange={(e) =>
                                  handleVideoChange(index, "position", parseInt(e.target.value))
                                }
                                fullWidth
                                margin="normal"
                                helperText={`Từ 0 đến ${descriptionSegments - 1}`}
                                InputLabelProps={{ style: { color: "#666" } }}
                                InputProps={{ style: { fontSize: "16px" } }}
                              />
                            </div>
                            <div className="col-md-2">
                              <IconButton onClick={() => handleRemoveVideoSegment(index)}>
                                <DeleteIcon style={{ color: "#e91e63" }} />
                              </IconButton>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleAddVideoSegment}
                          sx={{ mr: 2, mb: 2 }}
                        >
                          Thêm video
                        </Button>
                        {editingIndex !== null && (
                          <Button
                            variant="contained"
                            color="warning"
                            onClick={handleSaveEdit}
                            sx={{ mr: 2, mb: 2 }}
                          >
                            Lưu chỉnh sửa
                          </Button>
                        )}
                        <Button
                          type="submit"
                          variant="contained"
                          color="success"
                          sx={{ mb: 2 }}
                        >
                          Xác nhận thêm phương pháp
                        </Button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Tab 2: Danh sách phương pháp đã trích xuất */}
              {tabValue === 1 && (
                <div>
                  {methods.length > 0 ? (
                    <>
                      <div className="row">
                        {methods.map((method, index) => (
                          <div key={index} className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm">
                              {method.imagePath ? (
                                <img
                                  src={method.imagePath}
                                  alt="Cover"
                                  className="card-img-top"
                                  style={{ height: "150px", objectFit: "cover" }}
                                  onError={() =>
                                    toast.error(`Không thể tải hình ảnh cho ${method.title}`)
                                  }
                                />
                              ) : (
                                <div
                                  className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                                  style={{ height: "150px", color: "#fff" }}
                                >
                                  Không có ảnh
                                </div>
                              )}
                              <div className="card-body">
                                <h6 className="card-title">{method.title}</h6>
                                <p className="card-text text-muted" style={{ fontSize: "0.9rem" }}>
                                  {method.description.split("||")[0].substring(0, 100)}...
                                </p>
                                {method.videos.length > 0 && (
                                  <div className="mb-2">
                                    <strong>Video:</strong>
                                    <ul className="list-unstyled mt-1">
                                      {method.videos.map((video, vidIndex) => (
                                        <li key={vidIndex} style={{ fontSize: "0.85rem" }}>
                                          <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            Video {vidIndex + 1} (Vị trí: {video.position})
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="card-footer d-flex justify-content-between">
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleSelectMethod(index)}
                                >
                                  Chọn để chỉnh sửa
                                </Button>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteMethod(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Thêm nút "Xác nhận thêm phương pháp" vào tab này */}
                      {inputMode === "upload" && (
                        <Box sx={{ mt: 3, textAlign: "center" }}>
                          <Button
                            onClick={handleAddMethod}
                            variant="contained"
                            sx={{ bgcolor: "#28a745", "&:hover": { bgcolor: "#218838" } }}
                          >
                            Xác nhận thêm phương pháp
                          </Button>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography color="textSecondary" align="center">
                      Chưa có phương pháp nào được trích xuất.
                    </Typography>
                  )}
                </div>
              )}

              {/* Tab 3: Preview */}
              {tabValue === 2 && (
                <div>
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h2 className="card-title mb-4">
                        {methodTitle || "Tiêu đề phương pháp"}
                      </h2>
                      {methodDescription ? (
                        methodDescription.split("||").map((paragraph, index) => (
                          <div key={index}>
                            <p
                              className="card-text"
                              style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}
                            >
                              {paragraph.trim()}
                            </p>
                            {videoSegments
                              .filter((video) => video.position === index)
                              .map((video, vidIndex) => {
                                const videoId = getYouTubeVideoId(video.url);
                                return videoId ? (
                                  <div key={vidIndex} className="mb-4">
                                    <iframe
                                      width="100%"
                                      height="315"
                                      src={`https://www.youtube.com/embed/${videoId}`}
                                      title={`Video ${vidIndex + 1}`}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                ) : (
                                  <p key={vidIndex} className="text-danger">
                                    Không thể nhúng video: {video.url}
                                  </p>
                                );
                              })}
                          </div>
                        ))
                      ) : (
                        <p className="card-text text-muted">Chưa có mô tả</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMethod;