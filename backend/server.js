const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
}));
app.use(express.json());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "public/images");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Thư mục ${uploadPath} đã được tạo.`);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload failed: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
  next();
};

app.post("/upload", upload.single("image"), handleUploadError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filename = req.file.filename;
  const url = `/images/${filename}`;
  res.json({ url, filename });
});

app.get("/download-template", (req, res) => {
  // Sửa đường dẫn để trỏ đến thư mục learnsmart-hub
  const filePath = path.join(__dirname, "..", "learnsmart-hub", "public", "templates", "template.docx.zip");
  console.log("Đường dẫn __dirname:", __dirname);
  console.log("Đường dẫn file:", filePath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File không tồn tại hoặc không thể truy cập:", err);
      return res.status(404).send("File không tồn tại!");
    }
    res.download(filePath, "template.docx", (err) => {
      if (err) {
        console.error("Lỗi khi tải file:", err);
        res.status(500).send("Không thể tải file!");
      }
    });
  });
});

app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.jpg') || path.endsWith('.png')) {
      res.set('Content-Type', path.endsWith('.js') ? 'application/javascript' : 
        path.endsWith('.css') ? 'text/css' : 'image/jpeg');
    }
  }
}));
app.get("/api/methods", async (req, res) => {
  try {
    console.log("Đang truy vấn collection 'methods'...");
    const methodsRef = db.collection("methods");
    const snapshot = await methodsRef.get();
    console.log("Snapshot:", snapshot);
    console.log("Docs:", snapshot.docs);
    if (snapshot.empty) {
      console.log("Không tìm thấy dữ liệu trong collection 'methods'");
      return res.status(404).json({ message: "Không tìm thấy phương pháp học nào." });
    }
    const methods = snapshot.docs.map(doc => doc.data());
    res.status(200).json(methods);
  } catch (error) {
    console.error("Lỗi khi truy vấn Firestore:", error.message);
    res.status(500).json({ message: "Đã có lỗi xảy ra khi lấy dữ liệu." });
  }
});
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server LearnSmart Hub đang chạy!" });
});
app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ error: "Resource not found" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});