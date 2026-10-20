# Hệ Thống Đặt Hàng Nhóm & Phân Chia Thanh Toán Tự Động Theo Thời Gian Thực (Client - Server)

**Đồ án Cơ sở 4 (1TC) - Học kỳ 1, Năm học 2026-2027**  
**Khoa Khoa học Máy tính - Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)**  
**Sinh viên thực hiện:** Phạm Thái Bảo - MSSV: 24IT023 - Lớp: 24IT  

---

## 🌟 Kiến trúc kỹ thuật (Technical Architecture)

Hệ thống được thiết kế theo đúng chuẩn mô hình **Client – Server** tương tác thời gian thực:

```
[Máy khách A (Host)]      [Máy khách B (Member)]     [Máy khách C (Member)]
   (Trình duyệt)             (Trình duyệt)              (Trình duyệt)
         │                         │                          │
         └─────────────┬───────────┴──────────────────────────┘
                       │ WebSocket (Full-Duplex / Real-time Events)
                       ▼
            ┌─────────────────────────────────────────┐
            │       NODE.JS + SOCKET.IO SERVER        │
            │  - Quản lý phiên phòng (Room State)      │
            │  - Broadcast sự kiện thêm/xóa món        │
            │  - Thuật toán Fair Split chiết khấu     │
            │  - Engine sinh mã VietQR Napas247       │
            └─────────────────────────────────────────┘
```

---

## 🚀 Hướng dẫn khởi chạy nhanh

### Cách 1: Khởi động 1-click (Tiện lợi nhất)
Chỉ cần nhấp đúp chuột vào file:
👉 **`start-all.bat`**  
Hệ thống sẽ tự khởi động cả Server (Port 4000) và Client (Port 3000) rồi tự mở trình duyệt.

### Cách 2: Khởi động thủ công bằng dòng lệnh
1. **Khởi động Backend Server:**
   ```bash
   cd server
   npm run dev
   # Server lắng nghe tại: http://localhost:4000
   ```
2. **Khởi động Frontend Client:**
   ```bash
   cd client
   npm run dev
   # Client mở tại: http://localhost:3000
   ```

---

## 📱 Kịch bản Test 5 bước chuẩn ĐACS 4

1. **Bước 1 (Tạo phòng):** Mở tab 1 `http://localhost:3000`, nhập tên *"Thái Bảo"*, chọn quán *"Trà sữa Mixue"*, nhập số tài khoản ngân hàng nhận tiền $\rightarrow$ Bấm **Tạo phòng**. Nhận mã phòng (Ví dụ: `VKU888`).
2. **Bước 2 (Vào phòng):** Mở thêm 1 tab ẩn danh (Incognito) hoặc lấy điện thoại truy cập cùng mạng Wi-Fi, nhập tên *"Hoàng Nam"*, nhập mã phòng `VKU888` $\rightarrow$ Bấm **Vào phòng**.
3. **Bước 3 (Chọn món Real-time):** Ở tab Hoàng Nam bấm chọn *"Trà sữa trân châu đường đen"* $\rightarrow$ Quan sát tab Thái Bảo: Món lập tức nhảy vào giỏ hàng chung không có độ trễ!
4. **Bước 4 (Chốt đơn & Nhập phí):** Ở tab Thái Bảo (Chủ phòng), bấm **"Chốt đơn & Chia tiền"** $\rightarrow$ Nhập giảm giá `20000`, phí ship `10000` $\rightarrow$ Bấm xác nhận.
5. **Bước 5 (Chia tiền VietQR):** Màn hình Hoàng Nam lập tức hiện số tiền thực tế cần thanh toán kèm **Mã VietQR động**. Mở app ngân hàng quét là nhận diện đúng số tài khoản và số tiền!
