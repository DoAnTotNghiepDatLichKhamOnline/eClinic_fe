# ĐẶC TẢ GIAO DIỆN & TÍCH HỢP API — VAI TRÒ QUẢN TRỊ VIÊN (ADMIN)

Tài liệu này đặc tả chi tiết toàn bộ các màn hình, quy trình vận hành và danh sách API tích hợp dành cho vai trò **Quản trị viên (Admin)** trong ứng dụng `eClinic_fe`, cập nhật toàn diện theo các thay đổi mã nguồn và nghiệp vụ tính đến cuối tháng 10/2026.

---

## 1. Tổng quan Kiến trúc Màn hình Quản trị viên

Thanh điều hướng bên (Sidebar - `AdminSidebar.tsx`) của Quản trị viên gồm 6 phân hệ vận hành chính:
1. **Bảng điều khiển (Dashboard)** (`/admin/dashboard`)
2. **Quản lý ca làm việc & Lịch trực (Schedule Management)** (`/admin/schedule-management`)
3. **Danh mục y tế (Medical Catalog)** (`/admin/medical-catalog`): Chuyên khoa, Phòng khám, Danh mục Thuốc
4. **Quản lý Bác sĩ (Doctor Management)** (`/admin/doctors`)
5. **Quản lý Bệnh nhân & Hồ sơ (Patient Management)** (`/admin/patients`)
6. **Quản lý Tài khoản (Account Management)** (`/admin/accounts`) *(Mới hoàn thiện)*

Header tích hợp:
- **Trung tâm thông báo Quản trị (`AdminNotificationCenter`)**: Chuông thông báo thời gian thực về yêu cầu đổi ca mới, lịch hẹn cần đổi lịch, liên kết hồ sơ chờ duyệt.
- **Nút chuyển đổi ngôn ngữ (`LanguageToggle`)**: Hỗ trợ chuyển đổi nhanh Tiếng Việt (VI) và Tiếng Anh (EN).
- **Menu thông tin cá nhân (`UserProfile`)**: Hiển thị avatar, tên quản trị viên, vai trò và nút Đăng xuất an toàn.

---

## 2. Các Cập nhật Nghiệp vụ & Giao diện Trọng tâm

| Phân hệ | Cập nhật mới | Yêu cầu Frontend Quản trị |
|---|---|---|
| **Quản lý Tài khoản (`/admin/accounts`)** | Quản lý toàn bộ tài khoản người dùng (Admin, Bác sĩ, Bệnh nhân) | Tìm kiếm debounce 400ms, lọc theo Vai trò & Trạng thái, sắp xếp cột đa chiều (asc/desc), modal xem chi tiết, modal vô hiệu hóa (nhập lý do bắt buộc tối đa 500 ký tự), kích hoạt lại, xóa tài khoản chưa xác minh, phân trang chuẩn 10 dòng/trang. |
| **Danh mục Y tế (`/admin/medical-catalog`)** | Tích hợp phân trang và cuộn bảng nội bộ | Tích hợp component `<Pagination />` và class CSS `tableContainer` cuộn nội bộ cho cả 3 tab: Chuyên khoa, Phòng khám, Thuốc. |
| **Danh mục Thuốc** | Bắt buộc nhập `hoatChat`, `hamLuong`. Trùng `tenThuoc + hamLuong` bị chặn lỗi 409. Bổ sung `dangBaoChe`, `duongDung` | Thêm các trường vào form thêm/sửa thuốc. Đường dùng là danh sách chọn (`UONG`, `TIEM_BAP`, `TIEM_TINH_MACH`, `BOI_NGOAI_DA`, `NHO_MAT`...). Nút xác minh thuốc vào danh mục kê đơn. |
| **Danh mục Chuyên khoa** | Bổ sung cặp trường triệu chứng thường gặp: `trieuChung` / `trieuChungEn` (tối đa 2000 ký tự) | Form chuyên khoa thêm ô nhập triệu chứng song ngữ. Cung cấp tri thức cho Chatbot AI phân luồng người bệnh. |
| **Danh mục Phòng khám** | Hỗ trợ trường tầng: `tang` / `tangEn` | Form phòng khám thêm ô nhập tầng cho cả tiếng Việt và tiếng Anh. |
| **Quản lý Bác sĩ** | Đổi "Số năm kinh nghiệm" thành **"Năm bắt đầu hành nghề"** (`namBatDauHanhNghe`) | Form tạo và sửa bác sĩ nhập năm (từ 1950 đến năm hiện tại). Hệ thống tự tính toán số năm kinh nghiệm. Bộ sưu tập ảnh y khoa có chú thích song ngữ. |
| **Quản lý Ca làm việc** | Tạo ca lặp theo thứ, hủy ca kèm lý do bắt buộc, xử lý lịch hẹn cần đổi lịch | Bảng ca trực hiển thị rõ số lượt đã đặt / tối đa. Hủy ca trực bắt buộc nhập lý do; duyệt đơn xin nghỉ/đổi ca của bác sĩ; danh sách lịch hẹn cần đổi lịch. |
| **Quản lý Bệnh nhân** | Tìm kiếm CCCD đủ 12 số; Duyệt/từ chối liên kết tài khoản - hồ sơ | Ô tìm kiếm cho phép gõ đủ 12 số CCCD để tra cứu hồ sơ. Danh sách chờ xác minh hiển thị cờ khớp tên (`khopHoTen`) và khớp điện thoại (`khopSoDienThoai`). |
| **Admin Dashboard** | Thống kê số lượng danh mục y tế song song với vận hành | Đếm tổng số chuyên khoa (`totalSpecialties`), phòng khám (`totalClinics`), thuốc (`totalMedicines`) bên cạnh các thống kê ca trực và lịch hẹn. |

---

## 3. Đặc tả Chi tiết Từng Màn hình Quản trị & Mapping API

### 3.1. Bảng điều khiển Quản trị (Admin Dashboard)

- **Đường dẫn**: `/admin/dashboard`
- **Component**: `AdminDashboardPage.tsx`
- **Khối chức năng trên UI**:
  1. *Thẻ chỉ số vận hành khám chữa bệnh*:
     - Tổng số ca làm việc đang mở (`tongCaDangMo`).
     - Tổng số lịch hẹn khám bệnh trong ngày (`tongLichHenHomNay`).
     - Tổng số lịch hẹn trong tháng (`tongLichHenTrongThang`).
     - Số lượng yêu cầu đổi ca / xin nghỉ của bác sĩ đang chờ duyệt (`tongYeuCauDoiCaChoDuyet`).
     - Số hồ sơ bệnh nhân đang chờ xác minh liên kết CCCD (`tongHoSoChoXacMinh`).
     - Số lượng bác sĩ đang hoạt động (`tongBacSiHoatDong`).
  2. *Thẻ chỉ số danh mục y tế*:
     - Tổng số Chuyên khoa đang quản lý (`totalSpecialties`).
     - Tổng số Phòng khám cơ sở (`totalClinics`).
     - Tổng số Thuốc trong danh mục dược (`totalMedicines`).
  3. *Lối tắt thao tác nhanh (Quick Actions)*:
     - Dẫn trực tiếp đến tạo ca trực, thêm bác sĩ, thêm thuốc mới, xem đơn đổi ca chờ duyệt.
  4. *Trung tâm thông báo (`AdminNotificationCenter`)*:
     - Hiển thị danh sách thông báo hệ thống thời gian thực, đánh dấu đã đọc.
- **API Mapping**:
  - `GET /api/booking/quan-tri/tong-quan`: Lấy số liệu thống kê tổng hợp toàn hệ thống.
  - `GET /api/catalog/quan-tri/chuyen-khoa?trang=0&kichThuoc=1`: Lấy tổng số lượng chuyên khoa.
  - `GET /api/catalog/quan-tri/phong-kham?trang=0&kichThuoc=1`: Lấy tổng số lượng phòng khám.
  - `GET /api/medical/quan-tri/thuoc?trang=0&kichThuoc=1`: Lấy tổng số lượng thuốc.
  - `GET /api/notifications`: Danh sách thông báo cho Admin.
  - `PUT /api/notifications/{id}/read`: Đánh dấu đã đọc thông báo.

---

### 3.2. Quản lý Lịch khám & Phê duyệt Ca trực (Schedule Management & Request Approval)

- **Đường dẫn**: `/admin/schedule-management`
- **Component**: `AdminOperationsPanel.tsx` -> `AdminScheduleSection.tsx` & `AdminShiftRequestsTab.tsx`
- **Cấu trúc 2 Tab Chuyên biệt**:

#### Tab 1: Lịch trực & Khám bệnh
1. *Tạo ca làm việc mới / Ca lặp (Create Shifts)*:
   - Chọn Bác sĩ (`idBacSi`), Phòng khám (`idPhongKham`).
   - Chọn ngày (`ngay`), giờ bắt đầu (`gioBatDau`), giờ kết thúc (`gioKetThuc`).
   - Số lượt tối đa mỗi giờ (`soLuotToiDaMoiGio`, ví dụ: 4) và thời lượng mỗi lượt (`thoiLuongLuotPhut`, ví dụ: 15).
   - **Tùy chọn Lặp lại (Recurring shifts)**: Chọn các thứ trong tuần (Thứ 2 đến Chủ nhật) và ngày kết thúc chu kỳ lặp (`denNgay`).
2. *Danh sách ca làm việc & Thao tác*:
   - Hiển thị lưới ca làm việc từ ngày hiện tại đến 42 ngày tiếp theo.
   - Nút **Sửa ca**: Cập nhật phòng khám, giờ bắt đầu, giờ kết thúc, công suất lượt khám.
   - Nút **Hủy ca**: Bắt buộc nhập lý do hủy. Khi hủy ca, mọi lịch hẹn đã đặt trong ca sẽ bị hủy và chuyển sang mục "Lịch hẹn cần đổi lịch".
   - Nút **Bệnh nhân trong ca**: Xem danh sách bệnh nhân đã đặt khám trong ca đó.
3. *Danh sách Lịch hẹn cần đổi lịch (Reschedule Needed)*:
   - Danh sách các bệnh nhân bị ảnh hưởng do ca trực bị hủy. Quản trị viên liên hệ hoặc đổi ca thủ công cho bệnh nhân.

#### Tab 2: Duyệt đổi ca / Nghỉ phép (Kèm Badge số lượng chờ duyệt)
- **Huy hiệu Badge số lượng**: Hiển thị số lượng đơn `CHO_DUYET` thời gian thực (ví dụ: `(3)`).
- **Bộ lọc trên đầu**:
  - Trạng thái: Tất cả (`ALL`), Chờ duyệt (`CHO_DUYET`), Đã duyệt (`DA_DUYET`), Từ chối (`TU_CHOI`).
  - Lọc theo Bác sĩ yêu cầu (Dropdown danh sách bác sĩ).
  - Lọc theo Loại đơn (Tất cả / Xin nghỉ / Đổi ca).
- **Bảng dữ liệu Data Table chuẩn y tế**:
  - **Bác sĩ yêu cầu**: Avatar/Initials tròn + Học vị + Họ tên + Chuyên khoa (ví dụ: *TS.BS Nguyễn Văn An - Nội tổng quát*).
  - **Loại yêu cầu**: Tag màu phân biệt rõ ràng ([Xin nghỉ] màu cam/amber, [Đổi ca] màu tím/purple).
  - **Ca làm việc liên quan**: Ngày khám, Khung giờ (08:00 - 11:30), Phòng khám (Phòng 101).
  - **Người nhận đổi ca / Ca mong muốn**: Tên bác sĩ trực thay / thời gian ca mong muốn (nếu là Đổi ca) hoặc `— (Nghỉ phép)` (nếu là Xin nghỉ).
  - **Lý do**: Hiển thị ngắn gọn kèm nút xem chi tiết modal đầy đủ.
  - **Bệnh nhân bị ảnh hưởng**: Số lượng lịch hẹn đã đặt trong ca đó (Ví dụ: `⚠️ 1 bệnh nhân cần chuyển ca` hoặc `✓ 0 bệnh nhân (an toàn)`).
  - **Hành động (Action)**:
    - Đơn chờ duyệt: Nút **"Duyệt"** (Xanh lục/Primary), Nút **"Từ chối"** (Đỏ Outline mở modal nhập lý do từ chối).
    - Đơn đã xử lý: Huy hiệu trạng thái Đã duyệt / Đã từ chối kèm ghi chú xử lý.
- **Điều hướng từ Thông báo (Notification Deep-linking)**:
  - Khi Admin click vào thông báo có `idYeuCau`, hệ thống tự động điều hướng sang `/admin/schedule-management?tab=requests&idYeuCau=...` và tự động cuộn/highlight đơn yêu cầu đó.
- **Cơ chế Đóng khi Click ra ngoài (Click Outside)**:
  - Khung popover thông báo (`AdminNotificationCenter`, `DoctorNotificationCenter`) và các modal xác nhận hỗ trợ tự động đóng khi người dùng click ra vùng bên ngoài hoặc nhấn phím Escape.

- **API Mapping**:
  - `GET /api/booking/quan-tri/lich-lam-viec?tuNgay=...&denNgay=...`: Xem danh sách ca làm việc.
  - `POST /api/booking/quan-tri/lich-lam-viec`: Tạo ca làm việc (đơn lẻ hoặc lặp lại).
  - `PUT /api/booking/quan-tri/lich-lam-viec/{id}`: Chỉnh sửa ca làm việc.
  - `POST /api/booking/quan-tri/lich-lam-viec/{id}/huy`: Hủy ca làm việc (`{ lyDo: string }`).
  - `GET /api/booking/quan-tri/yeu-cau-doi-lich`: Danh sách đơn xin nghỉ/đổi ca theo trạng thái.
  - `POST /api/booking/quan-tri/yeu-cau-doi-lich/{id}/duyet`: Duyệt đơn.
  - `POST /api/booking/quan-tri/yeu-cau-doi-lich/{id}/tu-choi`: Từ chối đơn (`{ ghiChu: string }`).
  - `GET /api/booking/quan-tri/lich-hen/can-doi-lich`: Danh sách lịch hẹn bị hủy ca cần bố trí lại.

---

### 3.3. Quản trị Danh mục Y tế (Medical Catalog)

- **Đường dẫn**: `/admin/medical-catalog`
- **Component**: `AdminOperationsPanel.tsx` (`activeSection = "catalog"`)
- **3 Tab Danh mục con (Tích hợp phân trang `<Pagination />` và cuộn nội bộ)**:

#### A. Quản lý Chuyên khoa (SpecialtiesTab)
- Danh sách chuyên khoa hiển thị cả tên tiếng Việt và tiếng Anh (`tenChuyenKhoa` / `tenChuyenKhoaEn`), mô tả, danh sách triệu chứng gợi ý.
- Phân trang nội bộ với component `<Pagination />` và thanh cuộn bảng riêng biệt.
- Form thêm/sửa chuyên khoa:
  - Tên chuyên khoa (VI / EN): Bắt buộc, không được trùng nhau.
  - Mô tả chuyên khoa (VI / EN).
  - **Triệu chứng thường gặp (VI / EN)**: Trường text lớn (tối đa 2000 ký tự). Ví dụ: *"Đau thắt ngực, khó thở khi gắng sức, hồi hộp, đánh trống ngực, phù chân..."*. Dữ liệu này cung cấp tri thức cho Chatbot AI phân luồng người bệnh.
- **API**:
  - `GET /api/catalog/quan-tri/chuyen-khoa?trang=...&kichThuoc=...`: Đọc danh sách chuyên khoa phân trang kèm 2 bản ngôn ngữ.
  - `POST /api/catalog/chuyen-khoa`: Thêm chuyên khoa mới.
  - `PUT /api/catalog/chuyen-khoa/{id}`: Cập nhật chuyên khoa.
  - `DELETE /api/catalog/chuyen-khoa/{id}`: Xóa chuyên khoa (nếu chưa có bác sĩ/phòng).

#### B. Quản lý Phòng khám (ClinicsTab)
- Danh sách phòng khám: Tên phòng (VI/EN), chuyên khoa trực thuộc, tầng (VI/EN), trạng thái hoạt động (`HOAT_DONG` / `NGUNG_HOAT_DONG`).
- Tích hợp component `<Pagination />` và cuộn nội bộ.
- Form thêm/sửa phòng khám:
  - Tên phòng (VI / EN).
  - Tầng (VI / EN, ví dụ: "Tầng 2 - Khu A" / "Floor 2 - Block A").
  - Chuyên khoa quản lý (`idChuyenKhoa`).
- Nút **"Ngừng hoạt động"** và **"Kích hoạt lại"**: Khóa hoặc mở lại phòng khám mà không làm mất lịch sử ca trực.
- **API**:
  - `GET /api/catalog/quan-tri/phong-kham?trang=...&kichThuoc=...`: Lấy danh sách phòng khám phân trang.
  - `POST /api/catalog/quan-tri/phong-kham`: Thêm phòng khám mới.
  - `PUT /api/catalog/quan-tri/phong-kham/{id}`: Sửa phòng khám.
  - `POST /api/catalog/quan-tri/phong-kham/{id}/ngung-hoat-dong`: Dừng hoạt động phòng.
  - `POST /api/catalog/quan-tri/phong-kham/{id}/hoat-dong-lai`: Kích hoạt lại phòng.

#### C. Quản lý Danh mục Thuốc (MedicinesTab)
- Danh sách thuốc: Tên thuốc, hoạt chất, hàm lượng, dạng bào chế, đường dùng, đơn vị, trạng thái xác minh (`daXacMinh`), trạng thái sử dụng (`DANG_DUNG` / `NGUNG_DUNG`).
- Tích hợp component `<Pagination />` và cuộn nội bộ.
- Form thêm/sửa thuốc:
  - Tên thuốc (`tenThuoc`, bắt buộc).
  - Hoạt chất (`hoatChat`, bắt buộc, ví dụ: *"Paracetamol"*).
  - Hàm lượng (`hamLuong`, bắt buộc, ví dụ: *"500mg"*).
  - Dạng bào chế (`dangBaoChe` / `dangBaoCheEn`, ví dụ: *"Viên nén"* / *"Tablet"*).
  - Đường dùng (`duongDung`, chọn mã chuẩn: `UONG`, `TIEM_BAP`, `TIEM_TINH_MACH`, `BOI_NGOAI_DA`, `NHO_MAT`, `DAT_DUOI_LUOI`, `HIT_KHI_DUNG`...).
  - Đơn vị tính (`donVi` / `donViEn`, ví dụ: *"Viên"* / *"Tablet"*, *"Gói"* / *"Sachet"*, *"Lọ"* / *"Vial"*).
  - Mô tả / Chỉ định (`moTa` / `moTaEn`).
- **Nút Xác minh (`Xác minh`)**: Bác sĩ chỉ được kê các thuốc đã được xác minh (`daXacMinh = true`). Nếu thuốc thiếu hoạt chất hoặc hàm lượng, backend trả về lỗi 409 `THUOC_THIEU_THONG_TIN`.
- Nút **"Ngừng dùng"** / **"Dùng lại"**: Tạm khóa hoặc mở lại quyền kê đơn của thuốc.
- **API**:
  - `GET /api/medical/quan-tri/thuoc?trang=...&kichThuoc=...`: Lấy danh sách thuốc quản trị (hỗ trợ phân trang, lọc).
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
     - **Năm bắt đầu hành nghề (`namBatDauHanhNghe`)**: Nhập năm (từ 1950 đến năm hiện tại). Hệ thống tự động tính ra số năm kinh nghiệm.
     - Số giấy phép hành nghề, nơi cấp, phạm vi hoạt động chuyên môn.
     - Hệ thống tự động tạo tài khoản bác sĩ, gửi mật khẩu mặc định qua email.
  3. *Chỉnh sửa Hồ sơ Bác sĩ*:
     - Hỗ trợ nhập thông tin song ngữ (VI/EN) cho: Quá trình đào tạo, Quá trình công tác, Lĩnh vực khám chữa, Giải thưởng, Công trình nghiên cứu.
     - Quản lý phiên bản (`phienBan`) để chống ghi đè đồng thời (Optimistic Locking).
  4. *Quản lý Bộ sưu tập Ảnh giới thiệu Bác sĩ*:
     - Tải lên nhiều ảnh giới thiệu hoạt động khám chữa bệnh của bác sĩ (hỗ trợ multipart/form-data).
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
     - Khi bệnh nhân yêu cầu liên kết với hồ sơ khám cũ qua CCCD, yêu cầu chuyển vào mục **"Liên kết chờ xác minh"**.
     - Giao diện hiển thị: Tên và email tài khoản yêu cầu, thông tin trên hồ sơ y tế cũ.
     - Cờ kiểm tra tự động: **Khớp họ tên (`khopHoTen: true/false`)**, **Khớp số điện thoại (`khopSoDienThoai: true/false`)**.
     - Nút **"Duyệt"**: Xác nhận liên kết thành công.
     - Nút **"Từ chối"**: Bắt buộc nhập lý do từ chối.
  3. *Lịch sử Chỉnh sửa Bệnh án của Bác sĩ*:
     - Tra cứu lịch sử sửa đổi bệnh án của bất kỳ lượt khám nào qua `GET /api/medical/quan-tri/lich-hen/{id}/benh-an/lich-su` để giám sát tính minh bạch y tế.
- **API Mapping**:
  - `GET /api/booking/quan-tri/ho-so-benh-nhan?tuKhoa=...&trang=...&kichThuoc=...`: Tra cứu danh sách hồ sơ bệnh nhân.
  - `GET /api/booking/quan-tri/ho-so-benh-nhan/cho-xac-minh`: Danh sách yêu cầu liên kết CCCD chờ duyệt.
  - `POST /api/booking/quan-tri/ho-so-benh-nhan/{id}/xac-minh-lien-ket`: Phê duyệt liên kết hồ sơ.
  - `POST /api/booking/quan-tri/ho-so-benh-nhan/{id}/tu-choi-lien-ket`: Từ chối liên kết hồ sơ (`{ lyDo: string }`).
  - `GET /api/booking/quan-tri/ho-so-benh-nhan/{id}`: Chi tiết hồ sơ bệnh nhân.
  - `PUT /api/booking/quan-tri/ho-so-benh-nhan/{id}`: Sửa hồ sơ bệnh nhân.
  - `GET /api/booking/quan-tri/ho-so-benh-nhan/{id}/lich-hen`: Xem danh sách lịch hẹn trong hồ sơ.
  - `GET /api/medical/quan-tri/lich-hen/{id}/benh-an/lich-su`: Lịch sử chỉnh sửa bệnh án.

---

### 3.6. Quản lý Tài khoản Người dùng (Account Management) *(Phân hệ mới)*

- **Đường dẫn**: `/admin/accounts`
- **Component**: `AdminDashboardPage.tsx` (`activeSection = "accounts"`)
- **Khối chức năng trên UI**:
  1. *Bộ lọc & Tìm kiếm Tài khoản*:
     - Ô tìm kiếm từ khóa (Họ tên, Email, Số điện thoại) tích hợp **Debounce 400ms** để tối ưu hóa truy vấn mạng.
     - Bộ lọc theo Vai trò (`vaiTro`): Tất cả (`ALL`), Quản trị viên (`QUAN_TRI_VIEN`), Bác sĩ (`BAC_SI`), Bệnh nhân (`BENH_NHAN`).
     - Bộ lọc theo Trạng thái (`trangThai`): Tất cả (`ALL`), Chờ xác nhận (`CHO_XAC_NHAN`), Đã kích hoạt (`DA_KICH_HOAT`), Vô hiệu hóa (`VO_HIEU_HOA`).
  2. *Bảng Dữ liệu & Sắp xếp Đa chiều*:
     - Các cột: ID, Họ tên, Email, Số điện thoại, Vai trò (Badge màu riêng biệt), Trạng thái (Badge xanh/vàng/đỏ), Thao tác.
     - Hỗ trợ click tiêu đề cột để **sắp xếp tăng/giảm** (`sortDirection: "asc" | "desc"`) kèm biểu tượng trực quan (`ArrowUp`, `ArrowDown`, `ArrowUpDown`) cho 4 trường: ID, Họ tên, Email, Số điện thoại (sử dụng localeCompare song ngữ chuẩn tiếng Việt/Anh).
  3. *Xem Chi tiết Tài khoản (`AccountDetailModal`)*:
     - Nút Xem (`Eye` icon): Mở modal xem toàn bộ thông tin chi tiết của tài khoản (ID, họ tên, email, SĐT, vai trò, trạng thái, ngày tạo, lần đăng nhập gần nhất, lý do vô hiệu hóa nếu có).
  4. *Vô hiệu hóa Tài khoản (`DisableAccountModal`)*:
     - Với tài khoản đang hoạt động (`DA_KICH_HOAT`), click icon Khóa (`Lock` icon) mở modal nhập **Lý do vô hiệu hóa bắt buộc** (textarea kiểm soát độ dài tối đa 500 ký tự).
     - Không cho phép vô hiệu hóa chính tài khoản Quản trị viên (`QUAN_TRI_VIEN`).
  5. *Kích hoạt lại Tài khoản*:
     - Với tài khoản đang bị vô hiệu hóa (`VO_HIEU_HOA`), click icon Mở khóa (`Unlock` icon) mở dialog xác nhận (`ConfirmDialog`) để phục hồi trạng thái `DA_KICH_HOAT`.
  6. *Xóa Tài khoản Chưa xác nhận*:
     - Với tài khoản ở trạng thái `CHO_XAC_NHAN`, hiển thị icon Thùng rác (`Trash2` icon) cho phép Quản trị viên xóa vĩnh viễn tài khoản rác/sai sót khỏi hệ thống qua dialog xác nhận.
  7. *Phân trang Chuẩn (`Pagination`)*:
     - Hiển thị tổng số tài khoản tìm thấy, số trang hiện tại, hỗ trợ chuyển trang mượt mà (mặc định 10 dòng/trang).
- **API Mapping**:
  - `GET /api/identity/quan-tri/tai-khoan?tuKhoa=...&vaiTro=...&trangThai=...&trang=...&kichThuoc=10`: Lấy danh sách tài khoản phân trang và lọc.
  - `PUT /api/identity/quan-tri/tai-khoan/{id}/trang-thai`: Cập nhật trạng thái tài khoản:
    - Kích hoạt lại: `{ "trangThai": "DA_KICH_HOAT" }`
    - Vô hiệu hóa: `{ "trangThai": "VO_HIEU_HOA", "lyDoVoHieuHoa": "Lý do vi phạm chính sách..." }`
  - `DELETE /api/identity/quan-tri/tai-khoan/{id}`: Xóa tài khoản chưa xác minh email.

---

### 3.7. Chuẩn hóa Nút Thao tác (Action Buttons) & Hộp thoại Xác nhận (Confirm Modals)

1. **Hệ thống Nút Thao tác Chuẩn (Action Buttons Design System)**:
   - Áp dụng kích thước đồng bộ (`5px 11px`, font 12px font-weight 600, `rounded-8px`, `white-space: nowrap`) trên toàn bộ các bảng dữ liệu Admin:
     * **Nút Chi tiết (`.actionBtnOutline`)**: Nền trắng, viền `#cbd5e1`, chữ `#334155` kèm icon `Eye`.
     * **Nút Sửa / Hồ sơ (`.actionBtn`)**: Nền `#eef2ff`, viền `#c7d2fe`, chữ `#4338ca` kèm icon `Edit3` hoặc `FileText`.
     * **Nút Xóa / Khóa / Ngừng / Từ chối (`.actionBtnDanger`)**: Nền `#fef2f2`, viền `#fecaca`, chữ `#b91c1c` kèm icon `Trash2`, `Lock` hoặc `X`.
     * **Nút Kích hoạt / Duyệt / Xác minh / Phục hồi (`.actionBtnSuccess`)**: Nền `#ecfdf5`, viền `#a7f3d0`, chữ `#047857` kèm icon `Check`, `ShieldCheck` hoặc `RotateCcw`.
     * **Nút Bệnh nhân ca trực (`.actionBtnTeal`)**: Nền `#f0fdfa`, viền `#99f6e4`, chữ `#0f766e` kèm icon `Users`.
     * **Nút Thêm mới đầu trang (`.actionBtnPrimary`)**: Nền `#0d9488`, viền `#0d9488`, chữ trắng `#ffffff` kèm icon `Plus`, `CalendarPlus` hoặc `UserPlus`.
   - Đảm bảo độ tương phản màu chuẩn WCAG AA/AAA, không bao giờ xảy ra hiện tượng chữ trắng trên nền sáng.

2. **Quy tắc Bố cục Tab Không Tiêu đề Dư thừa**:
   - Khi các phân hệ đã có cấu trúc Tab rõ ràng (ví dụ: Tab Chuyên khoa, Tab Phòng khám, Tab Thuốc), các tiêu đề bảng dạng `<h3>` bên trong bảng được lược bỏ hoàn toàn để không gây trùng lặp thông tin và tối ưu hóa không gian hiển thị.
   - Nút hành động chính (Thêm mới) được căn lề phải ngay phía trên bảng.

3. **Chuẩn hóa Hộp thoại Xác nhận (Confirm Modals)**:
   - Nút hủy thao tác luôn hiển thị rõ ràng là **"Hủy"** (`cancelLabel="Hủy"` / `Cancel`).
   - **Vô hiệu hóa Click Backdrop**: Mọi hộp thoại xác nhận quan trọng (`ConfirmDialog`, modal vô hiệu hóa tài khoản, modal hủy ca làm việc, modal từ chối yêu cầu đổi ca) được thiết lập `closeOnBackdropClick = false`. Người dùng không thể vô tình đóng modal bằng cách click vào vùng tối bên ngoài; modal chỉ đóng khi người dùng chủ động bấm nút "Hủy", nút "X", hoặc hoàn thành tác vụ.
   - Tiêu đề modal (`title`) luôn mô tả chính xác và cụ thể hành động cần xác nhận (ví dụ: "Xác nhận xóa tài khoản", "Xác nhận hủy ca làm việc", "Xác nhận đăng xuất", "Xác nhận xóa ảnh hoạt động",...).
