# ĐẶC TẢ GIAO DIỆN & TÍCH HỢP API — VAI TRÒ QUẢN TRỊ VIÊN (ADMIN)

Tài liệu này đặc tả chi tiết toàn bộ các màn hình, quy trình vận hành và danh sách API tích hợp dành cho vai trò **Quản trị viên (Admin)** trong ứng dụng `eClinic_fe`, cập nhật toàn diện theo các thay đổi backend ngày 05/10/2026, 14/10/2026 và 15/10/2026.

---

## 1. Tổng quan Kiến trúc Màn hình Quản trị viên

Thanh điều hướng bên (Sidebar) của Quản trị viên gồm 5 phân hệ vận hành chính:
1. **Bảng điều khiển (Dashboard)** (`/admin/dashboard`)
2. **Quản lý ca làm việc & Lịch trực (Schedule Management)** (`/admin/schedule-management`)
3. **Danh mục y tế (Medical Catalog)** (`/admin/medical-catalog`): Chuyên khoa, Phòng khám, Danh mục Thuốc
4. **Quản lý Bác sĩ (Doctor Management)** (`/admin/doctors`)
5. **Quản lý Bệnh nhân & Hồ sơ (Patient Management)** (`/admin/patients`)

---

## 2. Các Cập nhật Nghiệp vụ Backend Trọng tâm dành cho Admin

| Phân hệ | Cập nhật mới | Yêu cầu Frontend Quản trị |
|---|---|---|
| **Danh mục Thuốc** | Bắt buộc nhập `hoatChat`, `hamLuong`. Trùng `tenThuoc + hamLuong` bị chặn lỗi 409. Bổ sung `dangBaoChe`, `duongDung` | Thêm các trường vào form thêm/sửa thuốc. Đường dùng là danh sách chọn (`UONG`, `TIEM_BAP`, `TIEM_TINH_MACH`, `BOI_NGOAI_DA`, `NHO_MAT`...). Xác minh thuốc thiếu thông tin sẽ báo lỗi 409 `THUOC_THIEU_THONG_TIN`. |
| **Danh mục Chuyên khoa** | Bổ sung cặp trường triệu chứng thường gặp: `trieuChung` / `trieuChungEn` (tối đa 2000 ký tự) | Form chuyên khoa thêm ô nhập triệu chứng. Dữ liệu này dùng để trợ lý AI Chatbot gợi ý chuyên khoa chính xác cho bệnh nhân. |
| **Danh mục Phòng khám** | Hỗ trợ trường tầng: `tang` / `tangEn` | Form phòng khám thêm ô nhập tầng cho cả tiếng Việt và tiếng Anh. |
| **Quản lý Bác sĩ** | Đổi "Số năm kinh nghiệm" thành **"Năm bắt đầu hành nghề"** (`namBatDauHanhNghe`) | Form tạo và sửa bác sĩ nhập năm (từ 1950 đến năm hiện tại). Số năm kinh nghiệm được hệ thống tự tính toán động. |
| **Quản lý Ca làm việc** | Tạo ca lặp theo thứ, hủy ca kèm lý do bắt buộc, xử lý lịch hẹn cần đổi lịch | Bảng ca trực hiển thị rõ số lượt đã đặt / tối đa. Hủy ca trực bắt buộc nhập lý do; các lịch hẹn bị ảnh hưởng sẽ đưa vào danh mục "Lịch hẹn cần đổi lịch". Duyệt đơn xin nghỉ/đổi ca của bác sĩ. |
| **Quản lý Bệnh nhân** | Tìm kiếm CCCD đủ 12 số; Duyệt/từ chối liên kết tài khoản - hồ sơ | Ô tìm kiếm cho phép gõ đủ 12 số CCCD để tra cứu hồ sơ. Danh sách chờ xác minh hiển thị cờ khớp tên (`khopHoTen`) và khớp điện thoại (`khopSoDienThoai`). |

---

## 3. Đặc tả Chi tiết Từng Màn hình Quản trị & Mapping API

### 3.1. Bảng điều khiển Quản trị (Admin Dashboard)

- **Đường dẫn**: `/admin/dashboard`
- **Component**: `AdminDashboardPage.tsx`
- **Khối chức năng trên UI**:
  - Thống kê tổng số ca làm việc đang mở.
  - Thống kê tổng số lịch hẹn khám bệnh trong ngày / tháng.
  - Số lượng yêu cầu đổi ca / xin nghỉ của bác sĩ đang chờ duyệt.
  - Số hồ sơ bệnh nhân đang chờ xác minh liên kết CCCD.
  - Số lượng bác sĩ đang hoạt động và số chuyên khoa.
- **API Mapping**:
  - `GET /api/booking/quan-tri/tong-quan`: Lấy số liệu thống kê tổng hợp toàn hệ thống.

---

### 3.2. Quản lý Ca làm việc (Schedule Management)

- **Đường dẫn**: `/admin/schedule-management`
- **Component**: `AdminOperationsPanel.tsx` (`activeSection = "schedule"`)
- **Khối chức năng trên UI**:
  1. *Tạo ca làm việc mới / Ca lặp (Create Shifts)*:
     - Chọn Bác sĩ (`idBacSi`), Phòng khám (`idPhongKham`).
     - Chọn ngày (`ngay`), giờ bắt đầu (`gioBatDau`), giờ kết thúc (`gioKetThuc`).
     - Số lượt tối đa mỗi giờ (`soLuotToiDaMoiGio`, ví dụ: 4) và thời lượng mỗi lượt (`thoiLuongLuotPhut`, ví dụ: 15).
     - **Tùy chọn Lặp lại (Recurring shifts)**: Chọn các thứ trong tuần (Thứ 2 đến Chủ nhật) và ngày kết thúc chu kỳ lặp (`denNgay`).
  2. *Danh sách ca làm việc & Thao tác*:
     - Hiển thị lưới ca làm việc từ ngày hiện tại đến 42 ngày tiếp theo.
     - Nút **Sửa ca**: Cập nhật phòng khám, giờ bắt đầu, giờ kết thúc, công suất lượt khám.
     - Nút **Hủy ca**: Bắt buộc nhập lý do hủy. Khi hủy ca, mọi lịch hẹn đã đặt trong ca sẽ bị hủy và chuyển sang mục "Lịch hẹn cần đổi lịch".
  3. *Xử lý Yêu cầu Đổi ca / Xin nghỉ của Bác sĩ*:
     - Hiển thị danh sách yêu cầu có trạng thái `CHO_DUYET`.
     - Nút **"Duyệt"**: Chấp thuận đơn (ca trực cũ được đóng/đổi, lịch hẹn bệnh nhân được xử lý).
     - Nút **"Từ chối"**: Bắt buộc nhập ghi chú/lý do từ chối gửi lại cho bác sĩ.
  4. *Danh sách Lịch hẹn cần đổi lịch (Reschedule Needed)*:
     - Danh sách các bệnh nhân bị ảnh hưởng do ca trực bị hủy. Quản trị viên liên hệ hoặc đổi ca thủ công cho bệnh nhân.
- **API Mapping**:
  - `GET /api/booking/quan-tri/lich-lam-viec?tuNgay=...&denNgay=...`: Xem danh sách ca làm việc.
  - `POST /api/booking/quan-tri/lich-lam-viec`: Tạo ca làm việc (đơn lẻ hoặc lặp lại).
  - `PUT /api/booking/quan-tri/lich-lam-viec/{id}`: Chỉnh sửa ca làm việc.
  - `POST /api/booking/quan-tri/lich-lam-viec/{id}/huy`: Hủy ca làm việc (`{ lyDo: string }`).
  - `GET /api/booking/quan-tri/yeu-cau-doi-lich?trangThai=CHO_DUYET`: Danh sách đơn xin nghỉ/đổi ca.
  - `POST /api/booking/quan-tri/yeu-cau-doi-lich/{id}/duyet`: Duyệt đơn.
  - `POST /api/booking/quan-tri/yeu-cau-doi-lich/{id}/tu-choi`: Từ chối đơn (`{ ghiChu: string }`).
  - `GET /api/booking/quan-tri/lich-hen/can-doi-lich`: Danh sách lịch hẹn bị hủy ca cần bố trí lại.

---

### 3.3. Quản trị Danh mục Y tế (Medical Catalog)

- **Đường dẫn**: `/admin/medical-catalog`
- **Component**: `AdminOperationsPanel.tsx` (`activeSection = "catalog"`)
- **3 Tab Danh mục con**:

#### A. Quản lý Chuyên khoa (Specialties)
- Danh sách chuyên khoa hiển thị cả tên tiếng Việt và tiếng Anh (`tenChuyenKhoa` / `tenChuyenKhoaEn`).
- Form thêm/sửa chuyên khoa:
  - Tên chuyên khoa (VI / EN): Bắt buộc, không được trùng nhau.
  - Mô tả chuyên khoa (VI / EN).
  - **Triệu chứng thường gặp (VI / EN)**: Trường text lớn (tối đa 2000 ký tự). Ví dụ: *"Đau thắt ngực, khó thở khi gắng sức, hồi hộp, đánh trống ngực, phù chân..."*. Trường này cung cấp tri thức cho Chatbot AI phân luồng người bệnh.
- **API**:
  - `GET /api/catalog/quan-tri/chuyen-khoa`: Đọc đầy đủ chuyên khoa kèm cả 2 bản ngôn ngữ.
  - `POST /api/catalog/chuyen-khoa`: Thêm chuyên khoa mới.
  - `PUT /api/catalog/chuyen-khoa/{id}`: Cập nhật chuyên khoa.
  - `DELETE /api/catalog/chuyen-khoa/{id}`: Xóa chuyên khoa (nếu chưa có bác sĩ/phòng).

#### B. Quản lý Phòng khám (Clinics)
- Danh sách phòng khám: Tên phòng, chuyên khoa trực thuộc, tầng, trạng thái hoạt động (`HOAT_DONG` / `NGUNG_HOAT_DONG`).
- Form thêm/sửa phòng khám:
  - Tên phòng (VI / EN).
  - Tầng (VI / EN, ví dụ: "Tầng 2 - Khu A" / "Floor 2 - Block A").
  - Chuyên khoa quản lý (`idChuyenKhoa`).
- Nút **"Ngừng hoạt động"** và **"Kích hoạt lại"**: Khóa hoặc mở lại phòng khám mà không làm mất lịch sử ca trực.
- **API**:
  - `GET /api/catalog/quan-tri/phong-kham`: Lấy danh sách phòng khám.
  - `POST /api/catalog/quan-tri/phong-kham`: Thêm phòng khám mới.
  - `PUT /api/catalog/quan-tri/phong-kham/{id}`: Sửa phòng khám.
  - `POST /api/catalog/quan-tri/phong-kham/{id}/ngung-hoat-dong`: Dừng hoạt động phòng.
  - `POST /api/catalog/quan-tri/phong-kham/{id}/hoat-dong-lai`: Kích hoạt lại phòng.

#### C. Quản lý Danh mục Thuốc (Medicines)
- Danh sách thuốc: Tên thuốc, hoạt chất, hàm lượng, dạng bào chế, đường dùng, đơn vị, trạng thái xác minh (`daXacMinh`), trạng thái sử dụng (`DANG_DUNG` / `NGUNG_DUNG`).
- Form thêm/sửa thuốc:
  - Tên thuốc (`tenThuoc`, bắt buộc).
  - Hoạt chất (`hoatChat`, bắt buộc, ví dụ: *"Paracetamol"*).
  - Hàm lượng (`hamLuong`, bắt buộc, ví dụ: *"500mg"*).
  - Dạng bào chế (`dangBaoChe` / `dangBaoCheEn`, ví dụ: *"Viên nén"* / *"Tablet"*).
  - Đường dùng (`duongDung`, chọn mã: `UONG`, `TIEM_BAP`, `TIEM_TINH_MACH`, `BOI_NGOAI_DA`, `NHO_MAT`, `DAT_DUOI_LUOI`, `HIT_KHI_DUNG`...).
  - Đơn vị tính (`donVi` / `donViEn`, ví dụ: *"Viên"* / *"Tablet"*, *"Gói"* / *"Sachet"*, *"Lọ"* / *"Vial"*).
  - Mô tả / Chỉ định (`moTa` / `moTaEn`).
- **Nút Xác minh (`Xác minh`)**: Bác sĩ chỉ được kê các thuốc đã được xác minh (`daXacMinh = true`). Nếu thuốc thiếu hoạt chất hoặc hàm lượng, backend trả về lỗi 409 `THUOC_THIEU_THONG_TIN`.
- Nút **"Ngừng dùng"** / **"Dùng lại"**: Tạm khóa hoặc mở lại quyền kê đơn của thuốc.
- **API**:
  - `GET /api/medical/quan-tri/thuoc`: Lấy danh sách thuốc quản trị (hỗ trợ phân trang, lọc).
  - `POST /api/medical/quan-tri/thuoc`: Tạo mới thuốc.
  - `PUT /api/medical/quan-tri/thuoc/{id}`: Sửa thông tin thuốc.
  - `POST /api/medical/quan-tri/thuoc/{id}/xac-minh`: Xác nhận thuốc hợp chuẩn vào danh mục kê đơn.
  - `POST /api/medical/quan-tri/thuoc/{id}/ngung-dung`: Ngừng cho phép kê thuốc này.
  - `POST /api/medical/quan-tri/thuoc/{id}/dung-lai`: Cho phép kê thuốc này trở lại.

---

### 3.4. Quản trị Bác sĩ (Doctor Management)

- **Đường dẫn**: `/admin/doctors`
- **Component**: `AdminDoctorPanel.tsx`
- **Khối chức năng trên UI**:
  1. *Danh sách Bác sĩ*:
     - Hiển thị: Mã bác sĩ, ảnh chân dung, họ tên, chuyên khoa, chức vụ/học vị, năm bắt đầu hành nghề, số điện thoại, email, trạng thái tài khoản.
     - Bộ lọc theo chuyên khoa và ô tìm kiếm theo tên bác sĩ.
  2. *Thêm Bác sĩ mới*:
     - Nhập họ tên, email, số điện thoại, ngày sinh, giới tính.
     - Chọn Chuyên khoa (`idChuyenKhoa`), Học vị (`hocVi`: Thạc sĩ, Bác sĩ CK1, CK2, Tiến sĩ, PGS, GS...).
     - **Năm bắt đầu hành nghề (`namBatDauHanhNghe`)**: Nhập năm (ví dụ: `2012`). Hệ thống tự tính ra số năm kinh nghiệm.
     - Số giấy phép hành nghề, nơi cấp, phạm vi hoạt động chuyên môn.
     - *Hệ thống tự động tạo tài khoản bác sĩ*: Mật khẩu mặc định gửi qua email, bác sĩ đăng nhập lần đầu sẽ phải đổi mật khẩu.
  3. *Chỉnh sửa Hồ sơ Bác sĩ*:
     - Hỗ trợ nhập thông tin song ngữ (VI/EN) cho: Quá trình đào tạo, Quá trình công tác, Lĩnh vực khám chữa, Giải thưởng, Công trình nghiên cứu.
     - Quản lý phiên bản (`phienBan`) để chống ghi đè đồng thời (Optimistic Locking).
  4. *Quản lý Bộ sưu tập Ảnh giới thiệu Bác sĩ*:
     - Tải lên nhiều ảnh giới thiệu hoạt động khám chữa bệnh của bác sĩ.
     - Chỉnh sửa thứ tự hiển thị và chú thích ảnh (song ngữ `chuThich` / `chuThichEn`).
  5. *Xem Đánh giá của Bệnh nhân*:
     - Xem danh sách chi tiết các đánh giá, số sao và nhận xét của bệnh nhân dành cho từng bác sĩ.
- **API Mapping**:
  - `GET /api/catalog/quan-tri/bac-si`: Danh sách bác sĩ cho quản trị.
  - `POST /api/catalog/quan-tri/bac-si`: Tạo mới bác sĩ.
  - `GET /api/catalog/bac-si/{id}`: Lấy chi tiết thông tin và hồ sơ bác sĩ.
  - `PUT /api/catalog/quan-tri/bac-si/{id}/ho-so`: Cập nhật hồ sơ chuyên môn của bác sĩ.
  - `POST /api/catalog/quan-tri/bac-si/{id}/anh`: Tải lên ảnh chân dung hoặc ảnh giới thiệu.
  - `PUT /api/catalog/quan-tri/anh-bac-si/{id}`: Sửa chú thích ảnh.
  - `DELETE /api/catalog/quan-tri/anh-bac-si/{id}`: Xóa ảnh giới thiệu.
  - `GET /api/booking/quan-tri/danh-gia?idBacSi=...`: Xem đánh giá của bác sĩ.

---

### 3.5. Quản trị Bệnh nhân & Hồ sơ (Patient Management)

- **Đường dẫn**: `/admin/patients`
- **Component**: `AdminOperationsPanel.tsx` (`activeSection = "patients"`)
- **Khối chức năng trên UI**:
  1. *Tra cứu Hồ sơ Bệnh nhân*:
     - Ô tìm kiếm thông minh: Tìm kiếm theo họ tên, số điện thoại, hoặc **số CCCD đầy đủ 12 chữ số** (bảo mật dữ liệu công dân).
     - Bảng danh sách: Mã hồ sơ, Họ tên, Ngày sinh, Số điện thoại, CCCD (đã che các số giữa), Số lịch hẹn đã đặt.
     - Nút **"Chi tiết"**: Mở modal xem thông tin hành chính, thẻ BHYT, địa chỉ, và toàn bộ lịch sử lịch hẹn khám bệnh của hồ sơ này.
     - Cho phép quản trị viên chỉnh sửa thông tin hành chính nếu bệnh nhân cung cấp giấy tờ đính chính.
  2. *Xác minh Liên kết Tài khoản - Hồ sơ Bệnh nhân (Profile Linking Verification)*:
     - Khi một bệnh nhân đăng ký tài khoản và yêu cầu liên kết với hồ sơ khám cũ qua CCCD, yêu cầu sẽ được chuyển vào mục **"Liên kết chờ xác minh"**.
     - Giao diện hiển thị:
       - Tên và email tài khoản yêu cầu.
       - Tên và thông tin trên hồ sơ y tế cũ.
       - Cờ kiểm tra tự động: **Khớp họ tên (`khopHoTen: true/false`)**, **Khớp số điện thoại (`khopSoDienThoai: true/false`)**.
     - Nút **"Duyệt"**: Xác nhận liên kết thành công. Bệnh nhân có thể xem toàn bộ lịch sử khám cũ trên tài khoản mới.
     - Nút **"Từ chối"**: Bắt buộc nhập lý do từ chối (ví dụ: *"Thông tin số điện thoại không trùng khớp với dữ liệu gốc"*).
  3. *Lịch sử Chỉnh sửa Bệnh án của Bác sĩ*:
     - Quản trị viên có quyền tra cứu lịch sử sửa đổi bệnh án của bất kỳ lượt khám nào qua `GET /api/medical/quan-tri/lich-hen/{id}/benh-an/lich-su` để giám sát tính minh bạch y tế.
- **API Mapping**:
  - `GET /api/booking/quan-tri/ho-so-benh-nhan?tuKhoa=...&trang=...&kichThuoc=...`: Tra cứu danh sách hồ sơ bệnh nhân.
  - `GET /api/booking/quan-tri/ho-so-benh-nhan/cho-xac-minh`: Danh sách yêu cầu liên kết CCCD chờ duyệt.
  - `POST /api/booking/quan-tri/ho-so-benh-nhan/{id}/xac-minh-lien-ket`: Phê duyệt liên kết hồ sơ.
  - `POST /api/booking/quan-tri/ho-so-benh-nhan/{id}/tu-choi-lien-ket`: Từ chối liên kết hồ sơ (`{ lyDo: string }`).
  - `GET /api/booking/quan-tri/ho-so-benh-nhan/{id}`: Chi tiết hồ sơ bệnh nhân.
  - `PUT /api/booking/quan-tri/ho-so-benh-nhan/{id}`: Sửa hồ sơ bệnh nhân.
  - `GET /api/booking/quan-tri/ho-so-benh-nhan/{id}/lich-hen`: Xem danh sách lịch hẹn trong hồ sơ.
  - `GET /api/medical/quan-tri/lich-hen/{id}/benh-an/lich-su`: Lịch sử chỉnh sửa bệnh án.
