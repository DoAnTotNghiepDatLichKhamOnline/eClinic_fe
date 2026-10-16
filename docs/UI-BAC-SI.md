# ĐẶC TẢ GIAO DIỆN & TÍCH HỢP API — VAI TRÒ BÁC SĨ (DOCTOR)

Tài liệu này đặc tả chi tiết toàn bộ các màn hình, luồng nghiệp vụ và danh sách API tích hợp dành cho vai trò **Bác sĩ (Doctor)** trong ứng dụng `eClinic_fe`, cập nhật toàn diện theo các thay đổi backend ngày 05/10/2026, 14/10/2026 và 15/10/2026.

---

## 1. Tổng quan Kiến trúc Màn hình Bác sĩ

Thanh điều hướng bên (Sidebar) của Bác sĩ gồm 5 phân hệ chính:
1. **Bảng điều khiển (Dashboard)** (`/doctor/dashboard`)
2. **Lịch làm việc cá nhân (Work Schedule)** (`/doctor/work-schedule`)
3. **Lịch hẹn sắp tới (Upcoming Appointments)** (`/doctor/upcoming-appointments` - thay thế hoàn toàn *Appointment Requests* từ ngày 15/10/2026)
4. **Tiếp nhận & khám bệnh (Consultation / EMR)** (`/doctor/consultation`)
5. **Hồ sơ cá nhân (Doctor Profile)** (`/doctor/profile`)

Ngoài ra, thanh trên (Header) tích hợp:
- Thanh tìm kiếm nhanh lượt khám / bệnh nhân (`DoctorSearchBar`).
- Trung tâm thông báo chuông thời gian thực (`DoctorNotificationCenter`).
- Nút chuyển đổi ngôn ngữ EN | VI (`LanguageToggle`).
- Menu thông tin cá nhân và đăng xuất (`UserProfile`).

---

## 2. Các Thay đổi Nghiệp vụ Quan trọng từ Backend (14/10 & 15/10/2026)

| Chức năng | Quy định cũ | Quy định mới (Hiện tại) | Yêu cầu Frontend Bác sĩ |
|---|---|---|---|
| **Duyệt lịch hẹn** | Bác sĩ duyệt/từ chối lịch ở màn hình "Appointment Requests" | Bỏ duyệt lịch: Mọi lịch đặt hoặc đổi đều **xác nhận ngay** (`DA_XAC_NHAN`). Chuyển thành màn hình **Upcoming Appointments**. Bác sĩ chỉ có quyền hủy lịch trước giờ khám | Đổi sang `/doctor/upcoming-appointments`. Nút Hủy lịch bắt buộc nhập lý do (`POST .../lich-hen/{id}/huy`). |
| **Kê đơn thuốc** | Tự gõ tên thuốc dạng text tự do | Bác sĩ **chỉ được chọn thuốc từ danh mục chuẩn** của quản trị viên | Ô chọn thuốc có gợi ý tìm kiếm theo tên hoặc hoạt chất. Bắt buộc gửi `idThuoc`, `soLuong`, `soNgayDung`. |
| **Gợi ý thuốc** | Trả về tên thuốc, đơn vị | Trả về `{ id, tenThuoc, hoatChat, hamLuong, dangBaoChe, duongDung, donVi }` | Hiển thị rõ tên thuốc kèm hàm lượng, dạng bào chế và đường dùng để phân biệt (vd: Paracetamol 500mg viên nén vs 250mg gói). |
| **Mã chẩn đoán ICD-10** | Chỉ gõ text chẩn đoán | Bổ sung danh mục mã ICD-10 (`GET /api/medical/bac-si/toi/icd10?tuKhoa=`) | Thêm ô chọn mã ICD-10 chính bên cạnh ô chẩn đoán. Hiển thị nhãn *(mạn tính)* nếu bệnh mạn tính. |
| **Sinh hiệu & Khám lâm sàng** | Chỉ có chẩn đoán & ghi chú | Đầy đủ sinh hiệu: mạch, huyết áp (tâm thu/tâm trương), nhiệt độ, nhịp thở, cân nặng, chiều cao; khám lâm sàng | Bổ sung form nhập sinh hiệu và khám lâm sàng. Tự động tính chỉ số BMI. |
| **Sửa hồ sơ bệnh án** | Sửa không giới hạn | **Chỉ được sửa trong vòng 7 ngày** kể từ lần lưu đầu. Bắt buộc có `lyDoSua` và `phienBan` | Thêm ô nhập lý do sửa bệnh án. Quản lý optimistic locking qua `phienBan`. Hết 7 ngày chuyển sang chế độ Chỉ xem (Read-only). |
| **Hồ sơ bác sĩ** | Quản trị viên quản lý 100% | Bác sĩ được **tự cập nhật** một phần hồ sơ giới thiệu của mình | Thêm form tự sửa giới thiệu ngắn, tiểu sử, giải thưởng, công trình nghiên cứu (`PUT /api/catalog/bac-si/toi/ho-so`). |

---

## 3. Đặc tả Chi tiết Từng Màn hình & Mapping API

### 3.1. Bảng điều khiển Bác sĩ (Doctor Dashboard)

- **Đường dẫn**: `/doctor/dashboard`
- **Component**: `DoctorDashboardPage.tsx`
- **Khối chức năng trên UI**:
  1. *Thẻ thống kê nhanh*:
     - Số ca trực trong tuần / tháng.
     - Số lịch hẹn sắp tới (`lichHenSapToi`).
     - Số bệnh nhân đang chờ khám trong ca hiện tại (`dangCho` - chỉ tính lịch `DA_XAC_NHAN`).
     - Điểm đánh giá trung bình và tổng số lượt đánh giá của bệnh nhân.
  2. *Hàng đợi khám hôm nay (Queue Management)*:
     - Hiển thị danh sách bệnh nhân theo số thứ tự (STT).
     - Trạng thái hàng đợi: `DANG_CHO` (Đang chờ), `DANG_KHAM` (Đang khám), `DA_KHAM` (Đã khám xong), `VANG_MAT` (Vắng mặt).
     - Nút **"Gọi vào khám"**: Chuyển trạng thái lượt khám sang `DANG_KHAM` và mở màn hình Consultation.
     - Nút **"Báo vắng mặt"**: Đánh dấu bệnh nhân vắng mặt khi gọi nhiều lần không có mặt.
     - Nút **"Gọi lại"**: Phục hồi bệnh nhân vắng mặt về cuối hàng đợi khi họ quay lại.
- **API Mapping**:
  - `GET /api/booking/bac-si/toi/tong-quan`: Thống kê tổng quan dashboard.
  - `GET /api/booking/bac-si/toi/hang-doi?ngay=YYYY-MM-DD`: Hàng đợi khám bệnh theo ca hôm nay.
  - `POST /api/booking/bac-si/toi/hang-doi/{id}/goi-kham`: Gọi bệnh nhân vào phòng khám.
  - `POST /api/booking/bac-si/toi/hang-doi/{id}/vang-mat`: Đánh dấu vắng mặt.
  - `GET /api/booking/bac-si/toi/danh-gia`: Danh sách đánh giá nhận xét từ bệnh nhân.

---

### 3.2. Lịch làm việc Cá nhân (Work Schedule)

- **Đường dẫn**: `/doctor/work-schedule`
- **Component**: `DoctorWorkspace.tsx` (`activeSection = "schedule"`)
- **Khối chức năng trên UI**:
  1. *Lịch trực (Calendar View)*:
     - Hỗ trợ chế độ xem theo Ngày (Day view) và Tuần (Week view).
     - Hiển thị ca trực: Giờ bắt đầu - kết thúc, phòng khám, số lượt đã đặt / tổng lượt (`soLuotDaDat / tongSoLuot`).
     - Danh sách bệnh nhân đã đặt trong từng ca.
  2. *Gửi yêu cầu Đổi ca / Xin nghỉ*:
     - Chọn ca trực cần thay đổi.
     - Chọn loại yêu cầu: `XIN_NGHI` (Xin nghỉ trực) hoặc `DOI_CA` (Đổi sang ca/ngày khác).
     - Nhập lý do (bắt buộc). Nếu là đổi ca: nhập thời gian mong muốn và phòng mong muốn.
     - **Ràng buộc thời gian**: Yêu cầu phải gửi **trước giờ bắt đầu ca ít nhất 24 giờ**. Nếu gửi trễ hơn, hệ thống báo lỗi quá hạn.
  3. *Danh sách yêu cầu đã gửi*:
     - Hiển thị trạng thái: `CHO_DUYET` (Chờ duyệt), `DA_DUYET` (Đã duyệt), `TU_CHOI` (Từ chối).
     - Nút **"Rút yêu cầu"**: Cho phép bác sĩ hủy yêu cầu khi đang ở trạng thái `CHO_DUYET`.
- **API Mapping**:
  - `GET /api/booking/bac-si/toi/lich-lam-viec?tuNgay=...&denNgay=...`: Lấy danh sách ca làm việc của bác sĩ.
  - `GET /api/booking/bac-si/toi/lich-hen/lich?tuNgay=...&denNgay=...`: Lấy danh sách lịch hẹn trong khoảng thời gian để vẽ lịch.
  - `POST /api/booking/bac-si/toi/yeu-cau-doi-lich`: Gửi đơn xin nghỉ hoặc đổi ca.
  - `GET /api/booking/bac-si/toi/yeu-cau-doi-lich`: Xem danh sách đơn yêu cầu đổi ca của bản thân.
  - `POST /api/booking/bac-si/toi/yeu-cau-doi-lich/{id}/rut`: Rút đơn yêu cầu đang chờ duyệt.

---

### 3.3. Lịch hẹn Sắp tới (Upcoming Appointments)

- **Đường dẫn**: `/doctor/upcoming-appointments`
- **Component**: `DoctorWorkspace.tsx` (`activeSection = "appointments"`)
- **Khối chức năng trên UI**:
  - Danh sách tất cả lịch hẹn đã xác nhận (`DA_XAC_NHAN`) thuộc ca làm việc sắp tới của bác sĩ.
  - Mỗi thẻ lịch hẹn hiển thị: Mã tra cứu, họ tên bệnh nhân, tuổi, giới tính, số điện thoại, khung giờ khám dự kiến, lý do khám.
  - Nút **"Mở hồ sơ khám"**: Chuyển ngay sang tab Khám bệnh (Consultation / EMR) với thông tin bệnh nhân đã được nạp sẵn.
  - Nút **"Hủy lịch hẹn"**:
    - Dùng khi bác sĩ có sự cố đột xuất hoặc lý do y khoa không thể tiếp nhận lượt khám này trước giờ khám.
    - Modal popup yêu cầu **nhập lý do hủy bắt buộc** (tối thiểu 5 ký tự).
    - Sau khi hủy thành công: Lịch hẹn chuyển sang trạng thái `BI_TU_CHOI`, hệ thống tự động gửi email thông báo và tạo thông báo chuông cho bệnh nhân kèm lý do của bác sĩ.
- **API Mapping**:
  - `GET /api/booking/bac-si/toi/lich-hen/lich?tuNgay=...&denNgay=...`: Lấy danh sách lịch hẹn sắp tới.
  - `POST /api/booking/bac-si/toi/lich-hen/{id}/huy`: Bác sĩ hủy lịch hẹn.
    - Body: `{ "lyDo": "Bác sĩ có ca phẫu thuật cấp cứu đột xuất" }`

---

### 3.4. Tiếp nhận & Khám bệnh điện tử (Consultation / EMR)

- **Đường dẫn**: `/doctor/consultation`
- **Component**: `DoctorWorkspace.tsx` (`activeSection = "consultation"`)
- **Khối chức năng trên UI**:
  1. *Tra cứu bệnh nhân*:
     - Nhập mã tra cứu phiếu khám (ví dụ: `PK-20261017-001`) hoặc quét mã QR qua webcam/camera điện thoại.
     - Kiểm tra trạng thái đối chiếu giấy tờ: Nếu bệnh nhân đặt lịch dùng CCCD lần đầu, hiển thị nút **"Đã đối chiếu giấy tờ"** (`POST .../da-doi-chieu`).
  2. *Xem tiền sử & Hồ sơ bệnh nhân*:
     - Tiền sử bệnh lý, dị ứng thuốc.
     - Lịch sử các lần khám trước (bấm vào xem chi tiết chẩn đoán và đơn thuốc cũ).
     - Cho phép bác sĩ cập nhật nhanh thông tin hành chính bệnh nhân nếu có sai sót (`PUT .../benh-nhan`).
  3. *Ghi kết quả khám bệnh (EMR Form)*:
     - **Lý do khám**: Kế thừa lý do ban đầu hoặc bác sĩ cập nhật lại.
     - **Sinh hiệu y tế**:
       - Mạch (`mach`): 30 - 250 lần/phút.
       - Huyết áp (`huyetApTamThu` / `huyetApTamTruong`): 50 - 260 / 30 - 180 mmHg. Huyết áp tâm trương phải nhỏ hơn tâm thu.
       - Nhiệt độ (`nhietDo`): 34.0 - 43.0 °C.
       - Nhịp thở (`nhipTho`): 8 - 60 lần/phút.
       - Cân nặng (`canNang`): 0.5 - 300.0 kg. Trẻ dưới 72 tháng tuổi nếu kê đơn thuốc **bắt buộc phải có cân nặng**.
       - Chiều cao (`chieuCao`): 20 - 250 cm.
     - **Khám lâm sàng (`khamLamSang`)**: Mô tả triệu chứng thực thể phát hiện khi thăm khám.
     - **Chẩn đoán**:
       - Ô chọn **Mã ICD-10 chính** (`maIcdChinh`): Có ô tìm kiếm gợi ý từ `GET /api/medical/bac-si/toi/icd10?tuKhoa=...`. Hiển thị nhãn *(mạn tính)* nếu mã là bệnh mạn tính.
       - Chẩn đoán xác định dạng văn bản (`chanDoan`).
       - Chẩn đoán kèm theo (`chanDoanKemTheo`).
     - **Kê đơn thuốc điện tử**:
       - Bấm "Thêm thuốc" để thêm dòng thuốc.
       - Ô tìm kiếm thuốc: Gọi `GET /api/medical/bac-si/toi/thuoc?tuKhoa=...`. Hiển thị danh sách gợi ý gồm: Tên thuốc, hoạt chất, hàm lượng, dạng bào chế, đường dùng. Chọn thuốc để lưu `idThuoc`.
       - Các trường mỗi dòng thuốc:
         - `idThuoc` (bắt buộc)
         - `soLuong` (bắt buộc, số nguyên dương)
         - `soNgayDung` (bắt buộc, tối đa 30 ngày đối với bệnh cấp tính, 90 ngày đối với mã ICD-10 mạn tính)
         - `lieuDung` (ví dụ: "Uống 1 viên / lần")
         - `soLanMoiNgay` (ví dụ: 2)
         - `ghiChuSuDung` (ví dụ: "Uống sau ăn 30 phút")
     - **Ngày hẹn tái khám (`ngayTaiKhamDeXuat`)**: Chọn ngày tái khám trong tương lai. Hệ thống sẽ tự động gửi email và thông báo nhắc lịch trước 7 ngày.
     - **Lời dặn bác sĩ (`ghiChu`)**: Hướng dẫn chế độ nghỉ ngơi, sinh hoạt.
  4. *Lưu & Hoàn tất khám*:
     - Bấm "Hoàn tất và lưu bệnh án" (`POST /api/medical/bac-si/toi/lich-hen/{id}/benh-an`). Lịch hẹn chuyển thành `DA_HOAN_THANH`.
     - Xuất hiện mẫu **Sổ khám bệnh điện tử** kèm mã QR để in hoặc lưu file PDF gửi bệnh nhân.
  5. *Chỉnh sửa Bệnh án & Xem Lịch sử sửa*:
     - Khi mở lại một lượt khám đã hoàn thành trong vòng **7 ngày**, hiển thị form sửa.
     - Form sửa bắt buộc nhập **Lý do sửa (`lyDoSua`)** và truyền kèm **`phienBan`** hiện tại.
     - Quá 7 ngày: Khóa form và hiển thị nhãn "Bệnh án đã hết hạn chỉnh sửa (chế độ chỉ xem)".
     - Tab Lịch sử sửa: Gọi `GET /api/medical/bac-si/toi/lich-hen/{id}/benh-an/lich-su`, hiển thị chi tiết thời gian sửa, lý do sửa và đối chiếu giá trị trước/sau.
- **API Mapping**:
  - `GET /api/booking/bac-si/toi/lich-hen/tra-cuu/ho-so-kham?ma=...`: Tra cứu thông tin khám qua mã.
  - `GET /api/booking/bac-si/toi/lich-hen/{id}/ho-so-kham`: Lấy hồ sơ khám.
  - `POST /api/booking/bac-si/toi/lich-hen/{id}/da-doi-chieu`: Đánh dấu đã đối chiếu giấy tờ.
  - `GET /api/medical/bac-si/toi/icd10?tuKhoa=...`: Gợi ý mã ICD-10.
  - `GET /api/medical/bac-si/toi/thuoc?tuKhoa=...`: Gợi ý thuốc từ danh mục chuẩn.
  - `POST /api/medical/bac-si/toi/lich-hen/{id}/benh-an`: Lưu kết quả khám lần đầu.
  - `PUT /api/medical/bac-si/toi/lich-hen/{id}/benh-an`: Chỉnh sửa kết quả khám (cần `lyDoSua` và `phienBan`).
  - `GET /api/medical/bac-si/toi/lich-hen/{id}/benh-an/lich-su`: Xem lịch sử chỉnh sửa bệnh án.

---

### 3.5. Hồ sơ Cá nhân Bác sĩ (Doctor Profile)

- **Đường dẫn**: `/doctor/profile`
- **Component**: `DoctorWorkspace.tsx` (`activeSection = "profile"`)
- **Khối chức năng trên UI**:
  1. *Thông tin hành chính (Chỉ xem - Quản trị viên quản lý)*:
     - Họ tên, Email, Số điện thoại.
     - Chuyên khoa, Học vị / Chức vụ, Số năm hành nghề.
     - Số giấy phép hành nghề, nơi cấp, phạm vi hoạt động chuyên môn.
  2. *Thông tin Bác sĩ tự chỉnh sửa (Mới từ 14/10/2026)*:
     - Giới thiệu ngắn (`gioiThieuNgan` / `gioiThieuNganEn`).
     - Tiểu sử chuyên môn (`tieuSu` / `tieuSuEn`).
     - Giải thưởng & chứng nhận (`giaiThuong` / `giaiThuongEn`).
     - Đề tài nghiên cứu khoa học (`congTrinhNghienCuu` / `congTrinhNghienCuuEn`).
  3. *Quản lý ảnh đại diện*:
     - Tải lên ảnh chân dung chuyên nghiệp (`POST /api/catalog/bac-si/toi/anh`).
- **API Mapping**:
  - `GET /api/catalog/bac-si/toi/ho-so`: Đọc hồ sơ đầy đủ của bác sĩ đang đăng nhập.
  - `PUT /api/catalog/bac-si/toi/ho-so`: Bác sĩ cập nhật thông tin giới thiệu.
    - Body:
      ```json
      {
        "gioiThieuNgan": "Bác sĩ chuyên khoa Tim mạch hơn 15 năm kinh nghiệm...",
        "gioiThieuNganEn": "Cardiologist with over 15 years of clinical practice...",
        "tieuSu": "Tốt nghiệp Đại học Y Hà Nội...",
        "tieuSuEn": "Graduated from Hanoi Medical University...",
        "giaiThuong": "Thầy thuốc ưu tú năm 2024",
        "giaiThuongEn": "Meritorious Doctor Award 2024",
        "congTrinhNghienCuu": "Nghiên cứu điều trị tăng huyết áp ở người cao tuổi",
        "congTrinhNghienCuuEn": "Research on hypertension in the elderly"
      }
      ```
  - `POST /api/catalog/bac-si/toi/anh`: Tải lên ảnh hồ sơ bác sĩ (multipart/form-data).
