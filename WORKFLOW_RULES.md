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
- **Imports:** Luôn ưu tiên dùng alias `@/...` thay vì relative path dài (`../../`).
- **Clean Code:** Đảm bảo TypeScript types chặt chẽ, không dùng `any` bừa bãi.