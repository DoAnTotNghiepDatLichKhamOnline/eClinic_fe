# ĐẶC TẢ GIAO DIỆN & TÍCH HỢP API — VAI TRÒ BÁC SĨ (DOCTOR)

Tài liệu này đặc tả chi tiết toàn bộ các màn hình, luồng nghiệp vụ và danh sách API tích hợp dành cho vai trò **Bác sĩ (Doctor)** trong ứng dụng `eClinic_fe`, cập nhật toàn diện theo các thay đổi mã nguồn và nghiệp vụ tính đến cuối tháng 10/2026.

---

## 1. Tổng quan Kiến trúc Màn hình Bác sĩ

Thanh điều hướng bên (Sidebar - `DoctorSidebar.tsx`) của Bác sĩ gồm 4 phân hệ chính:
1. **Bảng điều khiển (Dashboard)** (`/doctor/dashboard`)
2. **Lịch làm việc cá nhân (Work Schedule)** (`/doctor/work-schedule`)
3. **Tiếp nhận & Khám bệnh (Consultation / EMR)** (`/doctor/consultation`)
4. **Hồ sơ cá nhân (Doctor Profile)** (`/doctor/profile`)

*Lưu ý về định tuyến (Routing)*: Các đường dẫn cũ `/doctor/upcoming-appointments` và `/doctor/appointment-requests` được tự động chuyển hướng (redirect) về `/doctor/work-schedule` để quản lý tập trung trên cùng một không gian làm việc.

Thanh điều hướng trên (Header) tích hợp:
- **Thanh tìm kiếm nhanh (`DoctorSearchBar`)**: Tra cứu nhanh bệnh nhân hoặc mã lượt khám theo từ khóa, hỗ trợ mở ngay hồ sơ bệnh án.
- **Trung tâm thông báo (`DoctorNotificationCenter`)**: Chuông thông báo thời gian thực về ca trực mới, thông báo thay đổi lịch trực, kết quả phê duyệt đơn đổi ca/xin nghỉ từ ban quản trị.
- **Nút chuyển đổi ngôn ngữ (`LanguageToggle`)**: Hỗ trợ chuyển đổi giao diện Tiếng Việt (VI) và Tiếng Anh (EN).
- **Menu thông tin cá nhân (`UserProfile`)**: Hiển thị avatar, tên bác sĩ, chuyên khoa và nút Đăng xuất.

---

## 2. Các Cập nhật Nghiệp vụ & Kỹ thuật Trọng tâm

| Chức năng | Quy định trước đây | Quy định mới (Hiện tại) | Yêu cầu Frontend Bác sĩ |
|---|---|---|---|
| **Chỉ số Giờ làm việc** | Chỉ đếm số ca trực | Thêm thống kê **Số giờ làm việc trong tuần (`weeklyHours`)** và **trong tháng (`monthlyHours`)** | Thuật toán tính toán cross-month bao phủ lịch làm việc giáp ranh giữa các tháng. Tự động tính tổng giờ từ `gioBatDau` đến `gioKetThuc` của các ca trực. |
| **Bệnh nhân trong tháng** | Không có số liệu | Thêm chỉ số **Số bệnh nhân đã khám trong tháng (`monthlyPatients`)** | Hiển thị thẻ thống kê tổng số lượt khám hoàn thành (`DA_HOAN_THANH`) trong tháng hiện tại. |
| **Đánh giá & Nhận xét** | Dễ crash nếu trống dữ liệu | Bổ sung cơ chế Fallback an toàn cho điểm đánh giá và số lượt đánh giá | Hiển thị điểm rating mặc định `5.0` (hoặc tính từ danh sách đánh giá) và hiển thị danh sách 5 nhận xét gần nhất. |
| **Hàng đợi khám hôm nay** | Cần tải lại trang thủ công | **Tự động làm mới (Polling 15s)**; Bổ sung thao tác Gọi khám, Báo vắng mặt, Gọi lại | Tích hợp React Query với `refetchInterval: 15000`. Cung cấp 3 nút tác vụ: "Gọi vào khám" (`goi-kham`), "Báo vắng mặt" (`vang-mat`), "Gọi lại" (`goi-lai` đưa lại về hàng đợi). |
| **Lịch trực & Đổi ca** | Chỉ nhận `idLichLamViec` | **Tương thích cả `idLichLamViec` và `id`**; Kiểm tra điều kiện tối thiểu 24h | Hỗ trợ fallback tra cứu ca trực. Form đổi ca/xin nghỉ validate thời gian bắt đầu ca phải cách hiện tại ít nhất 24 giờ. Bổ sung nút "Rút yêu cầu" (`rut`) cho đơn `CHO_DUYET`. |
| **Bệnh án điện tử EMR** | Gõ text chẩn đoán tự do | **Mã ICD-10** (có nhãn mạn tính); **Sinh hiệu tự tính BMI**; **Kê đơn thuốc từ danh mục đã xác minh** | Tích hợp dropdown tìm kiếm mã ICD-10. Form nhập sinh hiệu tự tính chỉ số BMI động. Bác sĩ chỉ được chọn thuốc đã qua kiểm duyệt (`daXacMinh = true`). |
| **Quy định sửa bệnh án** | Sửa không giới hạn | **Chỉ được sửa trong vòng 7 ngày**. Khóa Read-only sau 7 ngày | Bắt buộc nhập `lyDoSua`, kiểm soát xung đột đồng thời qua `phienBan` (Optimistic Locking). Sau 7 ngày khóa toàn bộ form. |
| **Hồ sơ bác sĩ** | Thiếu chứng chỉ, nhảy layout | **Khôi phục thẻ bằng cấp (`credentials card`)**; Cố định layout view/edit; Hỗ trợ mã ISO 639 | Giữ cố định cấu trúc input khi chuyển đổi xem/sửa; Hỗ trợ mã ngôn ngữ chuẩn quốc tế ISO 639 (vi, en, fr, zh, de, ja...); Upload ảnh hoạt động multipart/form-data. |

---

## 3. Đặc tả Chi tiết Từng Màn hình & Mapping API

### 3.1. Bảng điều khiển Bác sĩ (Doctor Dashboard)

- **Đường dẫn**: `/doctor/dashboard`
- **Component**: `DoctorDashboardPage.tsx`
- **Khối chức năng trên UI**:
  1. *Thẻ thống kê chỉ số làm việc & hiệu suất*:
     - **Số ca trực**: Hiển thị số ca trực đã được phân công trong tuần và trong tháng.
     - **Số giờ làm việc**: Tổng số giờ làm việc trong tuần hiện tại (`weeklyHours`) và trong tháng (`monthlyHours`) với thuật toán cross-month chính xác.
     - **Bệnh nhân trong tháng**: Tổng số bệnh nhân đã được bác sĩ khám xong trong tháng (`monthlyPatients`).
     - **Lịch hẹn sắp tới**: Tổng số lịch hẹn đã xác nhận đang chờ khám (`lichHenSapToi`).
     - **Đang chờ tại phòng khám**: Số lượng bệnh nhân trong ca hiện tại đang ở trạng thái `DANG_CHO` (chỉ tính lịch hẹn `DA_XAC_NHAN`).
     - **Đánh giá trung bình**: Điểm số sao trung bình (1.0 đến 5.0) và tổng số lượt đánh giá, có fallback an toàn.
  2. *Hàng đợi khám hôm nay (Queue Management)*:
     - Tự động thăm dò dữ liệu mới mỗi 15 giây (`refetchInterval: 15000`).
     - Hiển thị danh sách bệnh nhân theo số thứ tự (STT).
     - 4 trạng thái lượt khám:
       - `DANG_CHO`: Đang chờ gọi vào phòng khám.
       - `DANG_KHAM`: Đang trong quá trình khám tại phòng.
       - `DA_KHAM`: Đã hoàn tất khám và lưu bệnh án.
       - `VANG_MAT`: Bác sĩ đã gọi nhiều lần nhưng bệnh nhân không có mặt.
     - Các nút thao tác nghiệp vụ:
       - Nút **"Gọi vào khám"**: Chuyển trạng thái lượt khám sang `DANG_KHAM` và tự động điều hướng sang tab Consultation với mã bệnh nhân đã nạp sẵn.
       - Nút **"Báo vắng mặt"**: Mở dialog xác nhận, đánh dấu bệnh nhân vắng mặt (`POST .../hang-doi/{id}/vang-mat`).
       - Nút **"Gọi lại"**: Phục hồi bệnh nhân từ trạng thái `VANG_MAT` về cuối hàng đợi khi người bệnh quay lại.
  3. *Danh sách đánh giá gần đây (Recent Reviews)*:
     - Hiển thị tối đa 5 đánh giá mới nhất: Số sao, nhận xét của người bệnh, họ tên người đánh giá, ngày đánh giá.
- **API Mapping**:
  - `GET /api/booking/bac-si/toi/tong-quan`: Thống kê tổng quan ca trực, lịch hẹn, đánh giá.
  - `GET /api/booking/bac-si/toi/lich-tuan?tuNgay=...&denNgay=...`: Lấy danh sách ca làm việc phục vụ tính toán giờ làm việc cross-month và đếm ca trực.
  - `GET /api/booking/bac-si/toi/hang-doi?ngay=YYYY-MM-DD`: Lấy hàng đợi khám theo ngày hôm nay.
  - `POST /api/booking/bac-si/toi/hang-doi/{id}/goi-kham`: Gọi bệnh nhân vào phòng khám.
  - `POST /api/booking/bac-si/toi/hang-doi/{id}/vang-mat`: Đánh dấu vắng mặt.
  - `GET /api/booking/bac-si/toi/danh-gia?trang=0&kichThuoc=5`: Danh sách đánh giá nhận xét từ bệnh nhân.

---

### 3.2. Lịch làm việc Cá nhân (Work Schedule)

- **Đường dẫn**: `/doctor/work-schedule`
- **Component**: `DoctorWorkspace.tsx` (`activeSection = "schedule"`) -> `DoctorScheduleSection.tsx`
- **Khối chức năng trên UI**:
  1. *Lịch trực (Calendar / Week / Day View)*:
     - Hỗ trợ chuyển đổi chế độ xem theo Tuần (Week view) hoặc theo Ngày (Day view).
     - Hiển thị ca trực: Khung giờ bắt đầu - kết thúc, phòng khám trực thuộc, tầng, số lượt đã đặt / tổng công suất (`soLuotDaDat / tongSoLuot`).
     - **Khả năng tương thích mã ca**: Hỗ trợ tra cứu ca trực thông qua cả `shift.idLichLamViec` và `shift.id`.
     - Danh sách bệnh nhân đã đặt trong từng ca: Mã tra cứu, họ tên bệnh nhân, giờ hẹn dự kiến, số điện thoại, lý do khám.
  2. *Gửi yêu cầu Đổi ca / Xin nghỉ*:
     - Chọn ca trực cần xin nghỉ hoặc đổi ca.
     - Chọn loại yêu cầu:
       - `XIN_NGHI`: Bác sĩ xin nghỉ ca trực đột xuất.
       - `DOI_CA`: Bác sĩ xin chuyển sang ca khác hoặc ngày khác.
     - **Ràng buộc thời gian**: Kiểm tra nghiêm ngặt ca trực phải bắt đầu sau thời điểm gửi đơn ít nhất **24 giờ**. Nếu vi phạm, hệ thống hiển thị cảnh báo không cho gửi.
     - Form nhập dữ liệu:
       - Lý do (bắt buộc, mô tả cụ thể lý do cá nhân hoặc y tế).
       - Đối với `DOI_CA`: Chọn ngày mong muốn, giờ bắt đầu/kết thúc mong muốn, phòng khám mong muốn.
  3. *Danh sách yêu cầu đã gửi*:
     - Danh sách đơn đã gửi kèm huy hiệu trạng thái: `CHO_DUYET` (Chờ duyệt), `DA_DUYET` (Đã duyệt), `TU_CHOI` (Từ chối kèm ghi chú của Quản trị viên).
     - Nút **"Rút yêu cầu"**: Cho phép bác sĩ chủ động hủy đơn khi đang ở trạng thái `CHO_DUYET`.
- **API Mapping**:
  - `GET /api/booking/bac-si/toi/lich-lam-viec?tuNgay=...&denNgay=...`: Danh sách ca làm việc của bác sĩ.
  - `GET /api/booking/bac-si/toi/lich-hen/lich?tuNgay=...&denNgay=...`: Danh sách lịch hẹn chi tiết trong khoảng thời gian để hiển thị trên lưới lịch.
  - `POST /api/booking/bac-si/toi/yeu-cau-doi-lich`: Gửi đơn xin nghỉ hoặc đổi ca:
    ```json
    {
      "idLichLamViec": 15,
      "loaiYeuCau": "DOI_CA",
      "lyDo": "Tham gia hội thảo tim mạch toàn quốc",
      "ngayMongMuon": "2026-10-30",
      "gioBatDauMongMuon": "08:00:00",
      "gioKetThucMongMuon": "12:00:00"
    }
    ```
  - `GET /api/booking/bac-si/toi/yeu-cau-doi-lich`: Xem danh sách đơn yêu cầu đổi ca của bản thân.
  - `POST /api/booking/bac-si/toi/yeu-cau-doi-lich/{id}/rut`: Rút đơn yêu cầu đang chờ duyệt.

---

### 3.3. Tiếp nhận & Khám bệnh (Consultation / EMR)

- **Đường dẫn**: `/doctor/consultation`
- **Component**: `DoctorWorkspace.tsx` (`activeSection = "consultation"`) -> `DoctorConsultationSection.tsx`
- **Khối chức năng trên UI**:
  1. *Tra cứu Lượt khám & Bệnh nhân*:
     - Ô nhập mã phiếu khám / mã tra cứu bệnh nhân hoặc nạp tự động từ nút "Gọi vào khám" tại Dashboard.
     - Hiển thị thông tin hành chính: Họ tên, ngày sinh, tuổi, giới tính, số điện thoại, CCCD, địa chỉ, lý do đến khám ban đầu.
     - Lịch sử các lần khám trước đây của bệnh nhân (nếu có).
  2. *Chẩn đoán & Mã bệnh ICD-10*:
     - Dropdown tìm kiếm mã bệnh quốc tế ICD-10 (`GET /api/medical/bac-si/toi/icd10?tuKhoa=`).
     - Hiển thị mã bệnh, tên bệnh, và gắn cờ nhãn **(mạn tính)** đối với các bệnh lý mãn tính.
     - Ô nhập mô tả chẩn đoán xác định và chẩn đoán phân biệt/kèm theo.
  3. *Sinh hiệu (Vital Signs) & Tự tính BMI*:
     - Nhập các chỉ số sinh hiệu:
       - Mạch (`mach`, lần/phút)
       - Huyết áp tâm thu (`huyetApTamThu`, mmHg) & Huyết áp tâm trương (`huyetApTamTruong`, mmHg)
       - Thân nhiệt (`nhietDo`, °C)
       - Nhịp thở (`nhipTho`, lần/phút)
       - Cân nặng (`canNang`, kg)
       - Chiều cao (`chieuCao`, cm)
     - **Tự động tính BMI**: Hệ thống tự động tính $BMI = \frac{\text{Cân nặng (kg)}}{(\text{Chiều cao (m)})^2}$ và hiển thị trạng thái phân loại thể trạng (Gầy, Bình thường, Thừa cân, Béo phì).
  4. *Khám Lâm sàng*:
     - Ô nhập kết quả khám thực thể (toàn thân, các cơ quan tim mạch, hô hấp, tiêu hóa, thần kinh...).
  5. *Kê đơn Thuốc Điện tử (Prescription)*:
     - Ô tìm kiếm thuốc tự động từ **danh mục thuốc chuẩn đã được quản trị viên xác minh** (`daXacMinh = true`).
     - Hiển thị chi tiết: Tên thuốc, hoạt chất, hàm lượng, dạng bào chế, đường dùng, đơn vị tính.
     - Nhập số lượng kê đơn, số ngày dùng, hướng dẫn cách dùng chi tiết (ví dụ: *"Uống 1 viên sau ăn sáng và 1 viên sau ăn tối"*).
  6. *Lời dặn Bác sĩ & Hẹn Tái khám*:
     - Ghi chú chế độ sinh hoạt, dinh dưỡng, kiêng cữ.
     - Chọn ngày hẹn tái khám (nếu cần theo dõi thêm).
  7. *Lưu Bệnh án & Quy định Chỉnh sửa (Optimistic Locking & 7-Day Window)*:
     - Nút **"Lưu hồ sơ bệnh án"**: Tạo bệnh án điện tử lần đầu, chuyển trạng thái lịch hẹn sang `DA_HOAN_THANH`.
     - **Chỉnh sửa bệnh án trong 7 ngày**: Bác sĩ chỉ được phép chỉnh sửa bệnh án trong vòng 7 ngày kể từ ngày khám ban đầu.
     - Khi chỉnh sửa, bắt buộc nhập **Lý do sửa (`lyDoSua`)** và truyền đúng số phiên bản (`phienBan`) để chống xung đột ghi đè.
     - Hết thời hạn 7 ngày, màn hình tự động chuyển sang chế độ **Chỉ xem (Read-only)**, vô hiệu hóa toàn bộ nút lưu và các ô nhập liệu.
- **API Mapping**:
  - `GET /api/booking/bac-si/toi/lich-hen/{maPhieuKham}`: Tra cứu thông tin lượt khám.
  - `GET /api/medical/bac-si/toi/icd10?tuKhoa=...`: Tìm kiếm danh mục mã ICD-10.
  - `GET /api/medical/bac-si/toi/thuoc?tuKhoa=...`: Tìm kiếm danh mục thuốc hợp chuẩn để kê đơn.
  - `POST /api/medical/bac-si/toi/lich-hen/{id}/benh-an`: Lưu hồ sơ bệnh án điện tử mới:
    ```json
    {
      "chanDoan": "Viêm họng cấp",
      "maIcd10": "J02.9",
      "mach": 82,
      "huyetApTamThu": 120,
      "huyetApTamTruong": 80,
      "nhietDo": 37.5,
      "nhipTho": 18,
      "canNang": 65.0,
      "chieuCao": 170.0,
      "khamLamSang": "Họng đỏ, niêm mạc xung huyết nhẹ, không giả mạc",
      "loiDan": "Uống nhiều nước ấm, súc họng nước muối sinh lý",
      "ngayTaiKham": "2026-11-05",
      "donThuoc": [
        {
          "idThuoc": 101,
          "soLuong": 10,
          "soNgayDung": 5,
          "cachDung": "Uống 1 viên sau ăn sáng, 1 viên sau ăn tối"
        }
      ]
    }
    ```
  - `PUT /api/medical/bac-si/toi/lich-hen/{id}/benh-an`: Chỉnh sửa bệnh án (chỉ khả dụng trong vòng 7 ngày):
    ```json
    {
      "phienBan": 1,
      "lyDoSua": "Bổ sung kết quả đo huyết áp chính xác hơn",
      "chanDoan": "...",
      ...
    }
    ```

---

### 3.4. Hồ sơ Cá nhân Bác sĩ (Doctor Profile)

- **Đường dẫn**: `/doctor/profile`
- **Component**: `DoctorWorkspace.tsx` (`activeSection = "profile"`) -> `DoctorProfileSection.tsx`
- **Khối chức năng trên UI**:
  1. *Thẻ bằng cấp & Giấy phép hành nghề (`Credentials Card`)*:
     - Hiển thị số giấy phép hành nghề y khoa, ngày cấp, nơi cấp, phạm vi hoạt động chuyên môn.
  2. *Thông tin Giới thiệu Chuyên môn*:
     - Xem và chỉnh sửa tiểu sử, quá trình đào tạo học vị, quá trình công tác tại các bệnh viện.
     - Lĩnh vực khám chữa bệnh chuyên sâu.
     - Giải thưởng y khoa, các công trình nghiên cứu và bài báo khoa học.
  3. *Ngôn ngữ Giao tiếp (ISO 639)*:
     - Hỗ trợ lựa chọn và hiển thị các ngôn ngữ bác sĩ có thể giao tiếp theo mã chuẩn quốc tế ISO 639 (vi: Tiếng Việt, en: Tiếng Anh, fr: Tiếng Pháp, zh: Tiếng Trung...).
  4. *Cố định Bố cục Giao diện (Stable Layout)*:
     - Đảm bảo giữ nguyên kích thước và cấu trúc các khung hiển thị khi chuyển đổi qua lại giữa chế độ Xem (View mode) và chế độ Chỉnh sửa (Edit mode).
  5. *Tải lên Ảnh Hoạt động Khám chữa bệnh*:
     - Hỗ trợ tải lên các hình ảnh tư liệu về hoạt động chuyên môn, hội thảo thông qua giao thức `multipart/form-data`.
- **API Mapping**:
  - `GET /api/catalog/bac-si/toi/ho-so`: Lấy toàn bộ hồ sơ chuyên môn của bác sĩ.
  - `PUT /api/catalog/bac-si/toi/ho-so`: Cập nhật thông tin hồ sơ bác sĩ (tiểu sử, đào tạo, công tác, giải thưởng, nghiên cứu, ngôn ngữ).
  - `POST /api/catalog/bac-si/toi/anh`: Tải lên ảnh hoạt động y khoa (`multipart/form-data`).
