# Agent Instructions & Workflow Rules

## 1. Git & Commit Guidelines (BẮT BUỘC)
- **Atomic Commits theo từng file:** Mỗi khi tạo mới hoặc cập nhật xong nội dung của **từng file**, phải commit ngay lập tức file đó trước khi chuyển sang xử lý file kế tiếp.
  - Cú pháp lệnh:
    ```bash
    git add <đường-dẫn-chính-xác-tới-file>
    git commit -m "<type>(<scope>): <mô tả ngắn bằng tiếng Anh/Việt>"
    ```
  - **Tuyệt đối không** dùng `git add .` hoặc gom nhiều file độc lập vào chung 1 commit.
  - **Không tự ý `git push`** lên remote trừ khi người dùng yêu cầu rõ ràng.
- **Quy ước Conventional Commits:**
  - `feat`: Thêm file/chức năng mới (ví dụ: `feat(catalog): add specialty.service.ts`)
  - `refactor`: Tách file, tái cấu trúc mã nguồn (ví dụ: `refactor(auth): split user profile service`)
  - `fix`: Sửa lỗi logic hoặc type trong file
  - `test`: Thêm hoặc cập nhật file test
- **Xử lý Dependency:** Nếu file hiện tại phụ thuộc vào một file khác sắp tạo khiến linter/typecheck bị lỗi (pre-commit hook chặn), hãy tạo khung (stub/interface) cho file phụ thuộc trước để commit không bị gãy, hoặc hoàn thành cặp file phụ thuộc rồi commit tuần tự.

## 2. Kế hoạch thực hiện (Execution Plan)
- Khi lập Plan/Checklist, mỗi bước phải gắn liền với hành động commit cụ thể:
  - *Ví dụ:* `[ ] Bước 1: Tạo src/services/specialty.service.ts -> Test syntax -> Git commit`

## 3. Kiến trúc Code & File (React / TypeScript)
- **Single Responsibility Principle:** Mỗi file service hoặc type chỉ quản lý một domain entity cụ thể (ví dụ: `specialty`, `doctor`, `clinic`, `auth`).
- Mọi cấu trúc thư mục, phân cấp component và ranh giới module bắt buộc phải tuân thủ nghiêm ngặt theo tài liệu ARCHITECTURE.md.
- **Imports:** Luôn ưu tiên dùng alias `@/...` thay vì relative path dài (`../../`).
- **Clean Code:** Đảm bảo TypeScript types chặt chẽ, không dùng `any` bừa bãi.

## 4. UI & Styling Guidelines (Quy chuẩn Giao diện)
- **Công nghệ Style chính:** Chỉ sử dụng duy nhất giải pháp styling của dự án (ví dụ: Tailwind CSS hoặc CSS Modules). Tuyệt đối **không dùng inline style** (`style={{ ... }}`) trừ khi tính toán vị trí động (dynamic coordinates, width theo progress bar).
- **Thư viện Component & Icon:**
  - Tái sử dụng tối đa các Base UI components sẵn có trong dự án (ví dụ: Button, Input, Modal, Table trong thư mục `@/components/common` hoặc `@/components/ui`).
  - Chỉ sử dụng bộ icon hiện có của dự án (ví dụ: `lucide-react`, `react-icons`), không tự ý import thêm thư viện icon mới.
- **Hệ màu & Design System:**
  - Không hardcode mã màu hex ngẫu nhiên 
  -  Bắt buộc dùng class màu theo semantic/theme đã cấu hình 
- **Responsive & Trạng thái UI (States):**
  - Mọi thành phần giao diện phải tính toán cho cả màn hình Mobile và Desktop (`sm:`, `md:`, `lg:`).
  - Luôn xử lý đầy đủ các trạng thái giao diện: **Loading** (Skeleton hoặc Spinner), **Empty State** (khi không có dữ liệu), **Error State**, và trạng thái tương tác (`hover:`, `focus-visible:`, `disabled:`).
- **Form & Validation:** 
  - Đảm bảo hiển thị thông báo lỗi rõ ràng bên dưới input khi validate thất bại (`aria-invalid`, text đỏ).
  - Nút Submit phải chuyển sang trạng thái disabled và có loading spinner khi đang gọi API để ngăn submit trùng lặp (double-click).