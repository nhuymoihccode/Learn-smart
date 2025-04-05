# LearnSmartHub

**LearnSmartHub** là một ứng dụng web hỗ trợ học tập thông minh, giúp người dùng khám phá và áp dụng các phương pháp học tập hiệu quả. Dự án được xây dựng bằng **React** và tích hợp **Firebase** để quản lý dữ liệu.

## Mục tiêu dự án
- Cung cấp các phương pháp học tập được cộng đồng chia sẻ.
- Hỗ trợ quản lý thời gian học và theo dõi tiến độ.
- Tạo môi trường học tập trực quan, thân thiện.

## Công nghệ sử dụng
- **React**: Xây dựng giao diện người dùng.
- **Firebase**: Lưu trữ và quản lý dữ liệu.
- **Material-UI**: Thư viện giao diện.
- **SCSS**: Tùy chỉnh style.
- **React Router**: Quản lý định tuyến.
- **Toastify**: Hiển thị thông báo.

## Tính năng chính
- **Khám phá phương pháp học**: Xem danh sách các phương pháp học tập.
- **Chi tiết phương pháp**: Xem mô tả, hình ảnh, và video minh họa.
- **Quản lý tiến độ**: Theo dõi tiến độ học của bạn.
- **Thêm phương pháp**: Người dùng "user" hoặc "admin" có thể thêm phương pháp mới.
- **Đăng nhập/Đăng xuất**: Hỗ trợ đăng nhập qua email và mật khẩu.

## Yêu cầu
- **Node.js**: Phiên bản 14 trở lên.
- **npm**: Đi kèm với Node.js.
- **Firebase**: Tài khoản Firebase để cấu hình cơ sở dữ liệu.
- **Trình duyệt**: Chrome, Firefox, hoặc bất kỳ trình duyệt hiện đại.

## Hướng dẫn cài đặt và chạy

### 1. Tải dự án
**Clone dự án từ GitHub**:

git clone https://github.com/nhuymoichcode/LearnSmartHub.git.

**Hoặc tải ZIP**:

Truy cập https://github.com/nhuymoichcode/LearnSmartHub.

Nhấn Code → Download ZIP.

Giải nén file ZIP.
### 2. Cài đặt thư viện
**Vào thư mục dự án**:
cd LearnSmartHub/learnsmart-hub
**Cài đặt**:
npm install
### 3. Cấu hình Firebase
**Tạo dự án trên Firebase Console**.
**Thêm ứng dụng web, sao chép cấu hình**:

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

**Tạo file src/firebase-config.js**:

import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";


const firebaseConfig = {
  // Dán cấu hình của bạn ở đây
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
Cấu hình Firestore Security Rules:
Trong Firebase Console, vào Firestore Database → Rules.
**Dán quy tắc**:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /methods/{methodId} {
      allow read: if true;
      allow write: if request.auth != null && (request.auth.token.role == "admin" || request.auth.token.role == "user");
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}

**Nhấn Publish**.
### 4. Chạy dự án
Vào thư mục:
cd LearnSmartHub/learnsmart-hub
Chạy:
npm start
Mở trình duyệt, truy cập http://localhost:3000.
Sử dụng ứng dụng
Đăng nhập: Truy cập /login để đăng nhập (tạo tài khoản trên Firebase nếu chưa có).
Khám phá: Vào /study-methods để xem danh sách phương pháp học.
Thêm phương pháp: Truy cập /add-method (yêu cầu vai trò "user" hoặc "admin").
Xem chi tiết: Nhấn vào một phương pháp để xem chi tiết.
Lưu ý
Đảm bảo cấu hình Firebase chính xác.
Một số tính năng yêu cầu đăng nhập.
File firebase-config.js không được đẩy lên GitHub (đã có trong .gitignore).
### Tài khoản đăng nhập
-**Admin**: email:
ha@gmail.com 
mk:
123456
-**User**: email:
haha@gmail.com
mk:
123457
-**Customer**: tk:
ha1@gmail.com
mk:
123456
