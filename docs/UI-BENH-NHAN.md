# ĐẶC TẢ GIAO DIỆN & TÍCH HỢP API — VAI TRÒ BỆNH NHÂN (PATIENT)

Tài liệu này đặc tả chi tiết toàn bộ các màn hình, luồng nghiệp vụ và danh sách API tích hợp dành cho vai trò **Bệnh nhân (Patient)** và **Khách vãng lai (Guest)** trong ứng dụng `eClinic_fe`, cập nhật toàn diện theo các thay đổi mã nguồn và nghiệp vụ tính đến cuối tháng 10/2026.

---

## 1. Tổng quan & Luồng Nghiệp vụ Chính của Bệnh nhân

1. **Điều hướng Đầu vào & Xác thực Tài khoản**:
   - Trang chọn vai trò đầu vào (`/entry`): Giúp người dùng phân luồng truy cập (Bệnh nhân, Bác sĩ, Quản trị viên).
   - Đăng ký tài khoản (`/register`), Xác thực email kích hoạt qua token link (`/verify-email`), Đăng nhập (`/login`), Đăng nhập Google (`/api/auth/google`).
   - Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu qua email token (`/reset-password`).
   - Quản lý thông tin tài khoản (`/patient/account-info`): Đổi số điện thoại, đổi email có xác nhận token 2 bước (`/confirm-email-change`).
   - Quản lý phiên đăng nhập & thiết bị (`/patient/sessions`, `/account/sessions`): Xem danh sách thiết bị và đăng xuất từ xa.
2. **Đặt lịch khám trực tuyến (`/appointment`)**:
   - Người dùng (Khách vãng lai hoặc Bệnh nhân đã đăng nhập) chọn: Chuyên khoa → Bác sĩ (tùy chọn) → Ngày khám → Ca trực và khung giờ còn chỗ.
   - Nhập thông tin người khám (hoặc chọn Bản thân / Người thân từ hồ sơ đã lưu).
   - **Xác nhận tức thì (Instant Confirmation)**: Lịch hẹn tạo xong chuyển ngay sang trạng thái `DA_XAC_NHAN` mà không cần chờ bác sĩ duyệt thủ công. Phiếu khám điện tử và mã QR có hiệu lực ngay lập tức.
3. **Tra cứu & Quản lý Phiếu khám (`/phieu-kham/{maPhieuKham}`)**:
   - Hiển thị đầy đủ thông tin: Mã tra cứu, số thứ tự khám (STT), ngày giờ, bác sĩ phụ trách, phòng khám, tầng, lý do khám.
   - Tải ảnh mã QR phiếu khám điện tử về máy để check-in tại quầy tiếp đón.
   - **Hủy lịch khám**: Cho phép bệnh nhân hủy lịch trước giờ khám nếu đáp ứng điều kiện (`duocHuyDoi: true`).
   - **Đổi lịch khám**: Chọn khung giờ hoặc ca khám mới, hệ thống tự động hủy lịch cũ (`DA_HUY_DO_DOI_LICH`) và cấp mã phiếu mới.
4. **Tra cứu Sổ khám bệnh Điện tử Công khai (`/so-kham`, `/so-kham/{maSoKham}`)**:
   - Tra cứu kết quả và lịch sử khám bệnh qua mã sổ khám mà không bắt buộc đăng nhập tài khoản.
5. **Lịch hẹn của tôi & Lịch sử khám bệnh (`/patient/appointments`, `/patient/my-appointments`)**:
   - Quản lý danh sách lịch hẹn sắp tới và lịch hẹn đã qua (Tất cả / Sắp tới / Lịch sử).
   - Xem kết quả khám bệnh điện tử chi tiết: Chẩn đoán chính (kèm mã ICD-10 và nhãn mạn tính), chẩn đoán phụ, sinh hiệu (mạch, huyết áp, nhiệt độ, nhịp thở, cân nặng, chiều cao, BMI), khám lâm sàng, đơn thuốc điện tử (tên thuốc, hoạt chất, hàm lượng, số lượng, cách dùng, số ngày dùng), lời dặn bác sĩ, ngày hẹn tái khám.
   - Đánh giá lượt khám (số sao từ 1 đến 5, nhận xét chi tiết) sau khi lượt khám hoàn thành (`DA_HOAN_THANH`).
6. **Hồ sơ Y tế & Liên kết CCCD (`/patient/patient-profile`)**:
   - Quản lý hồ sơ sức khỏe cá nhân và danh sách người thân (cha, mẹ, con cái, người giám hộ).
   - Gửi yêu cầu liên kết số CCCD với hồ sơ y tế cũ tại cơ sở khám bệnh để đồng bộ toàn bộ dữ liệu lịch sử.
7. **Khám phá Bác sĩ & Chuyên khoa (`/doctors`, `/doctors/{doctorId}`, `/specialties`)**:
   - Xem danh sách bác sĩ, lọc theo chuyên khoa, học vị, kinh nghiệm, điểm đánh giá.
   - Xem chi tiết hồ sơ bác sĩ: Giới thiệu, học vấn, bằng cấp, ảnh hoạt động, lịch trực sắp tới và nút Đặt lịch trực tiếp.
   - Danh mục chuyên khoa kèm mô tả và danh sách triệu chứng gợi ý.
8. **Trợ lý AI Chatbot & Đa ngôn ngữ (VI / EN)**:
   - Chatbot triệu chứng thông minh hỗ trợ 24/7 (`SymptomChatWidget`): Tự động ẩn trên các trang quản trị (`/admin/*`) và trang bác sĩ (`/doctor/*`).
   - Nút chuyển đổi ngôn ngữ EN | VI (`LanguageToggle`): Cập nhật giao diện toàn diện và đồng bộ tiêu đề HTTP `Accept-Language`.
   - Chuông thông báo thời gian thực: Nhắc lịch khám trước 3 ngày và 1 ngày, nhắc tái khám trước 7 ngày, thông báo khi ca trực thay đổi hoặc bác sĩ hủy lịch kèm lý do.

---

## 2. Vòng đời Lịch hẹn (Appointment Lifecycle) Phía Bệnh nhân

```
[Bệnh nhân đặt lịch] ──▶ DA_XAC_NHAN (Xác nhận ngay, cấp mã phiếu & QR)
                             │
     ┌───────────────────────┼────────────────────────┬──────────────────────┐
     ▼                       ▼                        ▼                      ▼
[Bệnh nhân hủy]     [Bệnh nhân đổi lịch]      [Bác sĩ hủy lịch]       [Quá ngày chưa khám]
     │                       │                        │                      │
     ▼                       ▼                        ▼                      ▼
  DA_HUY             DA_HUY_DO_DOI_LICH           BI_TU_CHOI              KHONG_DEN
(Bệnh nhân chủ động) (Tự động cấp phiếu mới)   (Kèm lý do hủy lyDoHuy) (Sau 00:01 ngày hôm sau)
                             │
                             ▼ (Bác sĩ gọi khám & hoàn tất bệnh án)
                       DA_HOAN_THANH
               (Xem EMR, đơn thuốc & Đánh giá)
```

- **`CHO_XAC_NHAN`**: Trạng thái chờ xử lý (trong các trường hợp đặc biệt cần kiểm duyệt thủ công).
- **`DA_XAC_NHAN`**: Lịch hẹn được xác nhận tự động ngay sau khi đặt thành công. Bệnh nhân nhận được phiếu khám kèm mã QR để check-in tại phòng khám.
- **`BI_TU_CHOI`**: Bác sĩ hủy lịch hẹn trước giờ khám do sự cố đột xuất. Giao diện hiển thị rõ nhãn cảnh báo **"Bác sĩ đã hủy"** kèm lý do cụ thể trong `ticket.lyDoHuy`.
- **`DA_HUY`**: Bệnh nhân chủ động hủy lịch hẹn trước giờ khám.
- **`DA_HUY_DO_DOI_LICH`**: Lịch hẹn cũ bị hủy tự động khi bệnh nhân thực hiện đổi sang khung giờ hoặc ngày khám mới.
- **`KHONG_DEN`**: Lịch hẹn của ngày đã qua mà bệnh nhân không đến khám (hệ thống tự động cập nhật lúc 00:01 ngày hôm sau). Trạng thái này bị khóa, không cho phép hủy hoặc đổi lịch.
- **`DA_KHAM` / `DA_HOAN_THANH`**: Bác sĩ đã hoàn tất quá trình khám và lưu bệnh án điện tử EMR. Bệnh nhân có quyền xem đầy đủ kết quả khám, đơn thuốc và gửi đánh giá bác sĩ.

---

## 3. Danh sách Màn hình UI & Mapping API Chi tiết

### 3.1. Trang Chọn Vai trò Đầu vào (`/entry`)

- **Component**: `RoleSelectionPage.tsx`
- **Khối chức năng trên UI**:
  - Giao diện chào mừng người dùng, cung cấp 3 cổng điều hướng:
    - **Cổng Bệnh nhân & Khách**: Dẫn về Trang chủ (`/home`) hoặc trang Đặt lịch khám (`/appointment`).
    - **Cổng Bác sĩ**: Dẫn đến trang Đăng nhập Bác sĩ (`/doctor/login`).
    - **Cổng Quản trị viên**: Dẫn đến trang Đăng nhập Quản trị (`/admin/login`).

---

### 3.2. Màn hình Đặt lịch Khám bệnh (`/appointment`)

- **Component**: `AppointmentBookingPage.tsx`
- **Các bước thực hiện trên UI**:
  1. *Bước 1: Chọn Chuyên khoa*:
     - Gọi `GET /api/catalog/chuyen-khoa`.
     - Hiển thị danh sách chuyên khoa, biểu tượng, mô tả và danh sách triệu chứng thường gặp.
  2. *Bước 2: Chọn Bác sĩ (Tùy chọn)*:
     - Gọi `GET /api/catalog/bac-si?idChuyenKhoa=...`.
     - Hiển thị danh sách bác sĩ: Ảnh chân dung, học vị, họ tên, số năm kinh nghiệm, điểm đánh giá trung bình. Người bệnh có thể chọn một bác sĩ cụ thể hoặc để hệ thống tự phân bổ.
  3. *Bước 3: Chọn Ngày khám & Khung giờ*:
     - Gọi `GET /api/booking/khung-gio?ngay=...&idChuyenKhoa=...&idBacSi=...`.
     - Hiển thị các ca trực còn chỗ (`soChoConLai > 0`), các khung giờ khám dự kiến (mỗi lượt 15-20 phút).
  4. *Bước 4: Nhập Thông tin Bệnh nhân*:
     - **Bệnh nhân đã đăng nhập**: Tự động gọi `GET /api/booking/benh-nhan/toi/thong-tin-dat-lich`. Cho phép chọn đặt cho bản thân hoặc chọn người thân từ danh bạ đã lưu.
     - **Khách vãng lai**: Nhập họ tên, ngày sinh, giới tính, số điện thoại, số CCCD (12 số), email nhận thông báo, địa chỉ, lý do khám bệnh.
     - *Hướng dẫn Email*: Ghi chú rõ ràng: *"Khách không nhập email sẽ không nhận được email xác nhận hoặc nhắc lịch."*
  5. *Bước 5: Xác nhận & Đặt lịch*:
     - Hiển thị bảng tổng hợp toàn bộ thông tin đặt hẹn.
     - Bấm nút **"Xác nhận đặt lịch"**: Gửi yêu cầu đặt lịch hẹn, hệ thống cấp mã phiếu khám ngay lập tức.
- **API Mapping**:
  - `GET /api/catalog/chuyen-khoa`: Danh sách chuyên khoa kích hoạt.
  - `GET /api/catalog/bac-si`: Danh sách bác sĩ theo chuyên khoa.
  - `GET /api/booking/khung-gio`: Khung giờ và ca trực khả dụng.
  - `GET /api/booking/benh-nhan/toi/thong-tin-dat-lich`: Thông tin đặt lịch nhanh cho tài khoản bệnh nhân.
  - `POST /api/booking/lich-hen`: Đặt lịch khám mới (tự động nhận diện Khách hoặc Bệnh nhân qua JWT Bearer).
    - Request Body mẫu:
      ```json
      {
        "idLichLamViec": 12,
        "gioBatDauKhung": "08:00:00",
        "hoTen": "Nguyễn Văn A",
        "ngaySinh": "1995-05-15",
        "gioiTinh": "NAM",
        "soDienThoai": "0987654321",
        "email": "nguyenvana@gmail.com",
        "cccd": "001095012345",
        "diaChi": "123 Cầu Giấy, Hà Nội",
        "lyDoKham": "Đau nửa đầu kèm sốt nhẹ"
      }
      ```
    - Response trả về (`200 OK`): Trả về `maPhieuKham`, `maTraCuu`, `trangThai: "DA_XAC_NHAN"`. Tự động chuyển hướng sang `/phieu-kham/{maPhieuKham}`.

---

### 3.3. Màn hình Phiếu khám Điện tử (`/phieu-kham/{maPhieuKham}`)

- **Component**: `AppointmentTicketPage.tsx`
- **Nghiệp vụ trên UI**:
  1. *Hiển thị Thông tin Phiếu*:
     - Tra cứu và nạp thông tin phiếu theo mã phiếu trên URL hoặc quét mã QR.
     - Hiển thị Huy hiệu trạng thái lịch hẹn (`TrangThaiLichHen`).
     - Hiển thị Số thứ tự khám (STT), ngày khám, khung giờ khám dự kiến, họ tên bác sĩ phụ trách, phòng khám và số tầng.
     - Hiển thị hình ảnh Mã QR điện tử (chứa mã phiếu để nhân viên lễ tân quét tiếp đón tại phòng khám). Nút **"Tải mã QR"** lưu ảnh về thiết bị.
  2. *Hủy Lịch khám*:
     - Khả dụng khi `ticket.duocHuyDoi === true` (thời điểm hiện tại trước giờ khám quy định).
     - Bấm nút **"Hủy lịch"**: Mở modal yêu cầu nhập lý do hủy, sau đó gọi `POST /api/booking/lich-hen/{id}/huy`.
  3. *Đổi Lịch khám*:
     - Bấm nút **"Đổi lịch"**: Mở modal chọn ngày và khung giờ mới.
     - Xác nhận đổi lịch: Gọi `POST /api/booking/lich-hen/{id}/doi-lich`, hệ thống hủy vé cũ và chuyển hướng sang phiếu khám mới.
- **API Mapping**:
  - `GET /api/booking/phieu-kham/{maPhieuKham}`: Xem chi tiết phiếu khám.
  - `POST /api/booking/lich-hen/{id}/huy`: Hủy lịch hẹn (`{ "lyDo": string }`).
  - `POST /api/booking/lich-hen/{id}/doi-lich`: Đổi lịch hẹn sang ca/giờ mới.

---

### 3.4. Tra cứu Sổ khám bệnh Điện tử Công khai (`/so-kham`, `/so-kham/{maSoKham}`)

- **Component**: `MedicalBookPublicPage.tsx`
- **Nghiệp vụ trên UI**:
  - Cung cấp ô nhập **Mã sổ khám bệnh** để tra cứu nhanh toàn bộ hồ sơ khám bệnh điện tử công khai.
  - Hiển thị thông tin hành chính của bệnh nhân (đã bảo mật che bớt thông tin nhạy cảm).
  - Danh sách các đợt khám bệnh theo dòng thời gian: Ngày khám, bác sĩ khám, chẩn đoán ICD-10, kết quả khám lâm sàng, đơn thuốc được kê và ngày hẹn tái khám.
- **API Mapping**:
  - `GET /api/medical/so-kham/{maSoKham}`: Lấy thông tin sổ khám bệnh và lịch sử các đợt khám bệnh.

---

### 3.5. Bảng điều khiển Bệnh nhân (Patient Dashboard)

- **Đường dẫn**: `/patient/dashboard`
- **Component**: `DashboardPage.tsx`
- **Khối chức năng trên UI**:
  - Thẻ thông tin chào mừng bệnh nhân kèm trạng thái liên kết hồ sơ y tế CCCD.
  - Thẻ nhắc nhở **Lịch khám sắp tới gần nhất**: Ngày giờ, bác sĩ, phòng khám, nút mở phiếu khám điện tử nhanh.
  - Thống kê tóm tắt: Số lịch khám sắp tới, số đợt khám đã hoàn tất.
  - Lối tắt nhanh: Đặt lịch khám mới, tra cứu sổ khám bệnh, cập nhật hồ sơ cá nhân.
- **API Mapping**:
  - `GET /api/booking/benh-nhan/toi/tong-quan`: Lấy dữ liệu tổng quan dashboard bệnh nhân.
  - `GET /api/booking/benh-nhan/toi/lich-hen?loc=SAP_TOI&trang=0&kichThuoc=1`: Lấy lịch hẹn sắp tới gần nhất.

---

### 3.6. Lịch hẹn của Tôi & Lịch sử Khám bệnh (`/patient/appointments`, `/patient/my-appointments`)

- **Component**: `MyAppointmentsPage.tsx`, `PatientAppointmentsPage.tsx`
- **Khối chức năng trên UI**:
  1. *Bộ lọc Lịch hẹn*:
     - Chuyển tab nhanh: **Tất cả (`TAT_CA`)**, **Sắp tới (`SAP_TOI`)**, **Lịch sử (`LICH_SU`)**.
  2. *Danh sách Thẻ Lịch hẹn*:
     - Hiển thị mã tra cứu, bác sĩ, chuyên khoa, phòng khám, thời gian khám, trạng thái lịch hẹn.
     - Với lịch hẹn `DA_XAC_NHAN`: Có nút **Xem phiếu khám**, **Đổi lịch**, **Hủy lịch**.
     - Với lịch hẹn `BI_TU_CHOI`: Hiển thị rõ lý do bác sĩ hủy lịch (`lyDoHuy`).
  3. *Xem Chi tiết Bệnh án Điện tử (EMR Detail Modal)*:
     - Với lịch hẹn `DA_HOAN_THANH`: Nút **"Xem kết quả khám"** mở modal hiển thị đầy đủ:
       - Chẩn đoán chính (mã ICD-10, tên bệnh lý, nhãn mạn tính) và chẩn đoán kèm theo.
       - Chỉ số sinh hiệu: Mạch, huyết áp, nhiệt độ, nhịp thở, cân nặng, chiều cao, chỉ số BMI.
       - Khám lâm sàng và lời dặn của bác sĩ.
       - Đơn thuốc: Danh sách các thuốc (tên thuốc, hoạt chất, hàm lượng, số lượng, cách dùng, số ngày dùng).
       - Ngày hẹn tái khám (nếu có).
  4. *Đánh giá Lượt khám (Rating & Review)*:
     - Với lượt khám đã hoàn tất và chưa đánh giá: Nút **"Đánh giá bác sĩ"** mở modal chọn số sao (1 đến 5 sao) và nhập nhận xét.
- **API Mapping**:
  - `GET /api/booking/benh-nhan/toi/lich-hen?loc=...&trang=...&kichThuoc=...`: Danh sách lịch hẹn bệnh nhân.
  - `GET /api/medical/benh-nhan/toi/lich-hen/{id}/benh-an`: Lấy bệnh án điện tử chi tiết của lượt khám.
  - `POST /api/booking/benh-nhan/toi/lich-hen/{id}/danh-gia`: Gửi đánh giá bác sĩ (`{ "soSao": number, "nhanXet": string }`).

---

### 3.7. Hồ sơ Y tế & Liên kết CCCD (`/patient/patient-profile`)

- **Component**: `PatientProfilePage.tsx`
- **Khối chức năng trên UI**:
  1. *Thông tin Hồ sơ Y tế*:
     - Họ tên, ngày sinh, giới tính, số CCCD/Định danh, số điện thoại, địa chỉ, mã thẻ BHYT.
  2. *Trạng thái Liên kết Hồ sơ Y tế*:
     - `CHUA_LIEN_KET`: Chưa gửi yêu cầu liên kết. Form cho phép nhập số CCCD để gửi yêu cầu liên kết với hồ sơ cũ tại phòng khám.
     - `CHO_XAC_MINH`: Đã gửi yêu cầu liên kết, đang chờ Quản trị viên đối soát thông tin.
     - `DA_LIEN_KET`: Đã liên kết thành công, hiển thị dấu tích xanh xác thực.
  3. *Danh bạ Người thân*:
     - Thêm, sửa, xóa thông tin người thân (con cái, bố mẹ, người phụ thuộc) để thuận tiện đặt lịch khám hộ.
- **API Mapping**:
  - `GET /api/booking/benh-nhan/toi/ho-so`: Lấy thông tin hồ sơ y tế của bệnh nhân.
  - `PUT /api/booking/benh-nhan/toi/ho-so`: Cập nhật thông tin y tế cá nhân.
  - `POST /api/booking/benh-nhan/toi/yeu-cau-lien-ket`: Gửi yêu cầu liên kết CCCD (`{ "cccd": string }`).
  - `GET /api/booking/benh-nhan/toi/nguoi-than`: Danh sách hồ sơ người thân đã lưu.
  - `POST /api/booking/benh-nhan/toi/nguoi-than`: Thêm hồ sơ người thân mới.

---

### 3.8. Quản lý Tài khoản & Phiên đăng nhập (`/patient/account-info`, `/patient/sessions`)

- **Component**: `AccountInfoPage.tsx`, `SessionsPage.tsx`
- **Khối chức năng trên UI**:
  1. *Thông tin Tài khoản (`AccountInfoPage`)*:
     - Cập nhật họ tên, ảnh đại diện, đổi mật khẩu tài khoản.
     - **Đổi số điện thoại**: Nhập số điện thoại mới và xác thực.
     - **Đổi Email 2 bước**: Nhập email mới, hệ thống gửi email xác nhận chứa liên kết token (`/confirm-email-change`), bệnh nhân click link để hoàn tất việc cập nhật email.
  2. *Quản lý Phiên đăng nhập & Thiết bị (`SessionsPage`)*:
     - Hiển thị danh sách các thiết bị, trình duyệt, địa chỉ IP và thời gian đăng nhập gần nhất.
     - Nút **"Đăng xuất khỏi thiết bị này"** và nút **"Đăng xuất khỏi tất cả các thiết bị khác"** để bảo vệ tài khoản khi nghi ngờ bị lộ thông tin.
- **API Mapping**:
  - `GET /api/identity/tai-khoan/toi`: Thông tin tài khoản người dùng hiện tại.
  - `PUT /api/identity/tai-khoan/toi/thong-tin`: Cập nhật thông tin cá nhân.
  - `PUT /api/identity/tai-khoan/toi/doi-mat-khau`: Đổi mật khẩu.
  - `POST /api/identity/tai-khoan/toi/yeu-cau-doi-email`: Gửi yêu cầu đổi email (`{ "emailMoi": string }`).
  - `GET /api/identity/tai-khoan/toi/phien-dang-nhap`: Danh sách các phiên đăng nhập đang hoạt động.
  - `DELETE /api/identity/tai-khoan/toi/phien-dang-nhap/{idPhien}`: Thu hồi phiên đăng nhập cụ thể.
  - `DELETE /api/identity/tai-khoan/toi/phien-dang-nhap/tat-ca-khac`: Thu hồi tất cả các phiên đăng nhập khác.

---

### 3.9. Khám phá Bác sĩ & Chuyên khoa (`/doctors`, `/doctors/{doctorId}`, `/specialties`)

- **Component**: `DoctorPage.tsx`, `DoctorDetailPage.tsx`, `SpecialtyDirectoryPage.tsx`
- **Khối chức năng trên UI**:
  1. *Danh sách Bác sĩ (`DoctorPage`)*:
     - Tìm kiếm bác sĩ theo họ tên hoặc chuyên khoa.
     - Bộ lọc theo học vị (GS, PGS, TS, ThS, BSCK2, BSCK1), số năm kinh nghiệm, đánh giá cao.
     - Thẻ bác sĩ: Ảnh chân dung, học vị, tên, chuyên khoa, số năm kinh nghiệm, đánh giá trung bình, nút Xem chi tiết và nút Đặt lịch.
  2. *Chi tiết Bác sĩ (`DoctorDetailPage`)*:
     - Tiểu sử, quá trình đào tạo, kinh nghiệm công tác, chứng chỉ và giấy phép hành nghề.
     - Bộ sưu tập ảnh hoạt động chuyên môn của bác sĩ.
     - Lịch trực sắp tới của bác sĩ và đặt khám trực tiếp với bác sĩ tại đây.
  3. *Danh mục Chuyên khoa (`SpecialtyDirectoryPage`)*:
     - Danh sách đầy đủ các chuyên khoa kèm mô tả bệnh lý và các triệu chứng thường gặp.
- **API Mapping**:
  - `GET /api/catalog/bac-si`: Danh sách bác sĩ công khai.
  - `GET /api/catalog/bac-si/{id}`: Chi tiết hồ sơ bác sĩ và ảnh giới thiệu.
  - `GET /api/catalog/chuyen-khoa`: Danh sách chuyên khoa công khai.

---

### 3.10. Trợ lý AI Chatbot Tư vấn Triệu chứng (`SymptomChatWidget`)

- **Component**: `SymptomChatWidget.tsx` (tích hợp toàn cục qua `GlobalChatWidget` trong `routes/index.tsx`)
- **Quy tắc hiển thị**:
  - Tự động hiển thị dạng nút bong bóng nổi ở góc dưới bên phải màn hình trên tất cả các trang công khai và trang bệnh nhân.
  - **Tự động ẩn hoàn toàn** khi URL bắt đầu bằng `/admin/*` hoặc `/doctor/*`, hoặc khi tài khoản đang đăng nhập có vai trò `admin` hoặc `doctor`.
- **Khối chức năng trên UI**:
  - Người bệnh nhập mô tả triệu chứng hoặc cảm giác khó chịu (ví dụ: *"Tôi bị đau tức ngực trái khi vận động kèm khó thở"*).
  - Trợ lý AI phân tích ngôn ngữ tự nhiên, đối chiếu với cơ sở tri thức triệu chứng của các chuyên khoa và gợi ý chuyên khoa phù hợp (ví dụ: Chuyên khoa Tim mạch).
  - Cung cấp nút liên kết trực tiếp để người bệnh chuyển sang màn hình Đặt lịch khám ngay với chuyên khoa được gợi ý.
