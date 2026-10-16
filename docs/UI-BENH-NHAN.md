# ĐẶC TẢ GIAO DIỆN & TÍCH HỢP API — VAI TRÒ BỆNH NHÂN (PATIENT)

Tài liệu này đặc tả chi tiết toàn bộ các màn hình, luồng nghiệp vụ và danh sách API tích hợp dành cho vai trò **Bệnh nhân (Patient)** và **Khách vãng lai (Guest)** trong ứng dụng `eClinic_fe`, cập nhật chuẩn theo các mốc bàn giao backend ngày 05/10/2026, 14/10/2026 và 15/10/2026.

---

## 1. Tổng quan & Luồng Nghiệp vụ Chính của Bệnh nhân

1. **Xác thực & Tài khoản**:
   - Đăng ký tài khoản (`/register`), Xác thực email qua token (`/verify-email`), Đăng nhập (`/login`), Đăng nhập Google (`/api/auth/google`).
   - Đổi mật khẩu lần đầu, Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu (`/reset-password`).
   - Quản lý thông tin tài khoản (`/account`): Hồ sơ cá nhân, đổi số điện thoại, đổi email có xác nhận, quản lý phiên đăng nhập/thiết bị.
2. **Đặt lịch khám trực tuyến (`/appointment`)**:
   - Khách hoặc bệnh nhân đã đăng nhập chọn Chuyên khoa → Bác sĩ (tùy chọn) → Ngày khám → Khung giờ khám còn chỗ.
   - Điền thông tin người khám (hoặc chọn Bản thân / Người thân từ hồ sơ đã lưu).
   - **Xác nhận tức thì (Instant Confirmation - từ 15/10/2026)**: Lịch hẹn tạo xong chuyển ngay sang trạng thái `DA_XAC_NHAN` mà không cần bác sĩ duyệt. Phiếu khám điện tử và mã QR có hiệu lực ngay lập tức.
   - Nhận email xác nhận lịch khám tức thì (nếu có cung cấp email liên hệ).
3. **Tra cứu & Quản lý Phiếu khám (`/phieu-kham/{maPhieuKham}`)**:
   - Hiển thị đầy đủ thông tin: Mã tra cứu, số thứ tự khám, ngày giờ, bác sĩ, phòng khám, tầng, lý do khám.
   - Tải ảnh mã QR phiếu khám điện tử.
   - **Hủy lịch khám**: Cho phép bệnh nhân hủy lịch trước giờ khám nếu đáp ứng điều kiện (`duocHuyDoi: true`).
   - **Đổi lịch khám**: Chọn khung giờ hoặc ca khám mới, hệ thống tự động hủy lịch cũ và cấp mã phiếu mới.
4. **Lịch hẹn của tôi & Lịch sử khám bệnh (`/patient/appointments`, `/patient/profile`)**:
   - Quản lý danh sách lịch hẹn sắp tới và lịch hẹn đã qua.
   - Xem kết quả khám bệnh điện tử chi tiết: Chẩn đoán chính (kèm mã ICD-10 và trạng thái mạn tính), chẩn đoán kèm theo, sinh hiệu (mạch, huyết áp, nhiệt độ, nhịp thở, cân nặng, chiều cao), khám lâm sàng, đơn thuốc chi tiết (tên thuốc, hoạt chất, hàm lượng, số lượng, liều dùng, số ngày dùng), lời dặn bác sĩ, ngày hẹn tái khám.
   - Đánh giá lượt khám (số sao, nhận xét) sau khi lượt khám hoàn thành (`DA_HOAN_THANH`).
5. **Trợ lý AI Chatbot & Đa ngôn ngữ (VI / EN)**:
   - Chatbot triệu chứng thông minh hỗ trợ 24/7 ở góc phải màn hình (`SymptomChatWidget`).
   - Nút chuyển đổi ngôn ngữ EN | VI trên header (`LanguageToggle`): lưu ngôn ngữ ưa dùng vào tài khoản (`PUT /api/users/me/language`) và gửi qua header `Accept-Language` ở tất cả request.
   - Chuông thông báo thời gian thực: Nhắc lịch khám trước 3 ngày và 1 ngày (`NHAC_LICH_KHAM`), nhắc tái khám trước 7 ngày (`NHAC_TAI_KHAM`), thông báo khi bác sĩ hủy lịch kèm lý do (`LICH_HEN_BI_TU_CHOI`).

---

## 2. Vòng đời Lịch hẹn (Appointment Lifecycle) Phía Bệnh nhân

```
[Bệnh nhân đặt lịch] ──▶ DA_XAC_NHAN (Xác nhận ngay, có mã tra cứu & QR)
                             │
     ┌───────────────────────┼────────────────────────┐
     ▼                       ▼                        ▼
[Bệnh nhân/Bác sĩ hủy]   [Bác sĩ khám]           [Quá ngày chưa khám]
     │                       │                        │
     ▼                       ▼                        ▼
  BI_TU_CHOI / DA_HUY    DA_HOAN_THANH             KHONG_DEN
(Kèm lý do hủy lyDoHuy) (Có bệnh án EMR & đơn thuốc) (Sau 00:01 ngày hôm sau)
```

- **`DA_XAC_NHAN`**: Lịch hẹn đã được xác nhận tự động ngay sau khi đặt. Bệnh nhân có thể tải mã QR đến phòng khám check-in.
- **`BI_TU_CHOI`**: Bác sĩ đã hủy lịch hẹn trước giờ khám. Giao diện hiển thị rõ nhãn **"Bác sĩ đã hủy"** kèm lý do cụ thể trong `ticket.lyDoHuy`.
- **`DA_HUY`**: Bệnh nhân chủ động hủy lịch.
- **`DA_HOAN_THANH`**: Bác sĩ đã hoàn tất khám và lưu bệnh án. Bệnh nhân có thể xem chi tiết hồ sơ bệnh án và đánh giá bác sĩ.
- **`KHONG_DEN`**: Lịch hẹn của ngày đã qua mà bệnh nhân không đến khám (tự động cập nhật lúc 00:01 ngày hôm sau). Trạng thái này không cho phép hủy hay đổi lịch.

---

## 3. Danh sách Màn hình UI & Mapping API Chi tiết

### 3.1. Màn hình Đặt lịch Khám bệnh (`/appointment`)

- **Component**: `AppointmentBookingPage.tsx`
- **Các bước thực hiện trên UI**:
  1. *Chọn chuyên khoa*: Gọi `GET /api/catalog/chuyen-khoa`. Hiển thị danh sách chuyên khoa, mô tả và triệu chứng liên quan.
  2. *Chọn bác sĩ*: Gọi `GET /api/catalog/bac-si?idChuyenKhoa=...`. Hiển thị ảnh, học vị, họ tên, số năm kinh nghiệm, đánh giá trung bình.
  3. *Chọn ngày & Khung giờ*: Gọi `GET /api/booking/khung-gio?ngay=...&idChuyenKhoa=...&idBacSi=...`. Hiển thị các ca làm việc còn chỗ (`soChoConLai > 0`).
  4. *Thông tin bệnh nhân*:
     - Bệnh nhân đã đăng nhập: Gọi `GET /api/booking/benh-nhan/toi/thong-tin-dat-lich` để lấy thông tin bản thân và danh sách người thân đã lưu.
     - Khách vãng lai: Nhập họ tên, ngày sinh, giới tính, số điện thoại, CCCD (bắt buộc nếu ≥ 18 tuổi), email liên hệ.
     - **Ghi chú Email**: Cạnh ô email có hướng dẫn: *"Khách không nhập email sẽ không nhận được email xác nhận hoặc nhắc lịch."*
  5. *Xác nhận đặt lịch*: Gửi request tạo lịch hẹn.
- **API Mapping**:
  - `GET /api/catalog/chuyen-khoa`: Danh sách chuyên khoa kích hoạt.
  - `GET /api/catalog/bac-si`: Danh sách bác sĩ theo chuyên khoa.
  - `GET /api/booking/khung-gio`: Khung giờ và ca trực khả dụng.
  - `GET /api/booking/benh-nhan/toi/thong-tin-dat-lich`: Thông tin đặt lịch nhanh cho tài khoản bệnh nhân.
  - `POST /api/booking/lich-hen`: Đặt lịch khám mới (tự động nhận diện Khách qua thông tin liên hệ hoặc Bệnh nhân qua JWT Bearer).
    - Request Body:
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
    - Response trả về (`200 OK`): Chứa `maPhieuKham`, `maTraCuu`, `trangThai: "DA_XAC_NHAN"`. Chuyển hướng sang màn hình phiếu khám.

---

### 3.2. Màn hình Phiếu khám Điện tử (`/phieu-kham/{maPhieuKham}`)

- **Component**: `AppointmentTicketPage.tsx`
- **Nghiệp vụ trên UI**:
  - Tra cứu thông tin phiếu khám bằng mã phiếu (hoặc quét mã QR dẫn đến URL này).
  - Hiển thị thẻ trạng thái:
    - `DA_XAC_NHAN`: Thẻ xanh lục "Đã xác nhận".
    - `DA_HOAN_THANH`: Thẻ xanh dương "Đã hoàn thành".
    - `BI_TU_CHOI`: Thẻ đỏ "Bác sĩ đã hủy" kèm ô thông báo lý do hủy: `{ticket.lyDoHuy}`.
    - `DA_HUY`: Thẻ đỏ "Đã hủy".
    - `KHONG_DEN`: Thẻ hổ phách "Không đến".
  - Hiển thị mã QR khám bệnh (có nút Tải ảnh QR về điện thoại).
  - Nút **Hủy lịch khám**:
    - Chỉ hiển thị khi `ticket.duocHuyDoi === true`.
    - Người dùng tài khoản: gọi API hủy tài khoản.
    - Khách vãng lai: yêu cầu nhập số điện thoại đặt lịch để xác thực quyền hủy.
  - Nút **Đổi lịch khám**:
    - Chọn ca khám/khung giờ mới. Hệ thống cập nhật và cấp mã phiếu khám mới.
- **API Mapping**:
  - `GET /api/booking/phieu-kham/{ma}`: Xem thông tin chi tiết phiếu khám.
  - `GET /api/booking/phieu-kham/{ma}/qr`: Tải hình ảnh mã QR (dạng blob image/png).
  - `POST /api/booking/phieu-kham/{ma}/huy`: Hủy lịch đối với tài khoản bệnh nhân (`{ lyDo?: string }`).
  - `POST /api/booking/phieu-kham/{ma}/khach/huy`: Hủy lịch đối với khách (`{ soDienThoai: string, lyDo?: string }`).
  - `POST /api/booking/phieu-kham/{ma}/doi-lich`: Đổi lịch đối với tài khoản bệnh nhân.
  - `POST /api/booking/phieu-kham/{ma}/khach/doi-lich`: Đổi lịch đối với khách.

---

### 3.3. Màn hình Lịch hẹn & Kết quả Khám của Tôi (`/patient/appointments`, `/patient/profile`)

- **Component**: `PatientProfilePage.tsx`
- **Nghiệp vụ trên UI**:
  - **Tab Lịch hẹn**:
    - Phân chia: *Lịch hẹn sắp tới* (`DA_XAC_NHAN`) và *Lịch sử lịch hẹn* (`DA_HOAN_THANH`, `BI_TU_CHOI`, `DA_HUY`, `KHONG_DEN`).
    - Nút mở nhanh phiếu khám hoặc hủy lịch hẹn trực tiếp từ danh sách.
  - **Tab Bệnh án & Kết quả khám**:
    - Hiển thị danh sách các lần khám đã hoàn thành.
    - Chi tiết mỗi lần khám (EMR Viewer):
      - Bác sĩ phụ trách, chuyên khoa, phòng khám, ngày giờ khám.
      - **Chẩn đoán**: Chẩn đoán chính, mã ICD-10 (kèm nhãn *"Mạn tính"* nếu là bệnh mạn tính), chẩn đoán kèm theo.
      - **Chỉ số sinh hiệu**: Mạch (lần/phút), Huyết áp tâm thu/tâm trương (mmHg), Nhiệt độ (°C), Nhịp thở (lần/phút), Cân nặng (kg), Chiều cao (cm), BMI tính toán tự động.
      - **Khám lâm sàng & Tiền sử bệnh**.
      - **Đơn thuốc điện tử**: Bảng danh sách thuốc gồm: Tên thuốc, hoạt chất, hàm lượng, đường dùng, số lượng, liều dùng, số ngày dùng, ghi chú cách uống.
      - **Lời dặn của bác sĩ & Ngày hẹn tái khám**: Nếu có ngày tái khám, hiển thị thông báo nhắc nhở và nút đặt lịch tái khám nhanh.
      - **Đánh giá bác sĩ**: Cho điểm (1-5 sao) và nhận xét dịch vụ khám. Cho phép sửa đánh giá trong vòng 30 ngày.
- **API Mapping**:
  - `GET /api/booking/lich-hen/cua-toi`: Lấy danh sách lịch hẹn của tài khoản (phân trang).
  - `GET /api/booking/lich-su-kham/cua-toi`: Lấy danh sách lịch sử các lần khám bệnh kèm hồ sơ bệnh án EMR.
  - `POST /api/booking/danh-gia`: Đánh giá lượt khám (`{ idLichHen, soSao, nhanXet }`).
  - `PUT /api/booking/danh-gia/{id}`: Sửa đánh giá đã gửi.

---

### 3.4. Chatbot Trợ lý Triệu chứng Thông minh (`SymptomChatWidget`)

- **Component**: `src/features/landing/components/chat/SymptomChatWidget.tsx`
- **Nghiệp vụ trên UI**:
  - Nút tròn "Hỏi trợ lý AI" cố định ở góc dưới bên phải màn hình trên tất cả trang.
  - Bệnh nhân mô tả triệu chứng bệnh bằng ngôn ngữ tự nhiên (tiếng Việt hoặc tiếng Anh).
  - Trợ lý AI phân tích và đưa ra:
    - Lời khuyên y tế sơ bộ và mức độ khẩn cấp (nếu nguy cấp, hiển thị cảnh báo đỏ và khuyên đến cơ sở cấp cứu gần nhất).
    - Thẻ gợi ý **Chuyên khoa phù hợp** (bấm vào sẽ tự động chọn chuyên khoa trên trang `/appointment`).
    - Thẻ gợi ý **Bác sĩ chuyên gia** và **Khung giờ khám sớm nhất** (bấm vào sẽ điền sẵn bác sĩ và giờ khám trên form đặt lịch).
    - Thẻ mở lại phiếu khám gần nhất hoặc xem lịch sử khám bệnh.
- **API Mapping**:
  - `POST /api/chatbot/phien`: Khởi tạo phiên chat (gửi header `X-Chat-Khach` nếu chưa đăng nhập).
  - `POST /api/chatbot/phien/{id}/tin-nhan`: Gửi câu hỏi và nhận câu trả lời AI kèm cấu trúc thẻ gợi ý (`goiY`).
  - `GET /api/chatbot/phien/{id}/tin-nhan`: Lấy lịch sử hội thoại của phiên.
  - `POST /api/chatbot/phien/{id}/dong-y`: Người dùng đồng ý cho chatbot truy xuất dữ liệu lịch hẹn/hồ sơ để tư vấn cá nhân hóa.

---

### 3.5. Chuyển đổi Ngôn ngữ & Trung tâm Thông báo

- **Header Accept-Language**: Mọi request API đều đính kèm `Accept-Language: vi` hoặc `Accept-Language: en`. Dữ liệu danh mục, thông báo và thông điệp lỗi tự động được backend bản địa hóa.
- **Đổi ngôn ngữ tài khoản**: Gọi `PUT /api/users/me/language` `{ "ngonNgu": "VI" | "EN" }`.
- **Thông báo chuông (`GET /api/notification/thong-bao`)**:
  - `NHAC_LICH_KHAM`: Nhắc trước giờ khám 3 ngày và 1 ngày. Bấm vào mở trực tiếp phiếu khám `/phieu-kham/{ma}`.
  - `NHAC_TAI_KHAM`: Nhắc lịch tái khám trước 7 ngày. Bấm vào mở trang đặt lịch `/appointment` tương ứng với chuyên khoa đã khám.
  - `LICH_HEN_BI_TU_CHOI`: Thông báo khi bác sĩ hủy ca/lịch kèm lý do hủy chi tiết.
