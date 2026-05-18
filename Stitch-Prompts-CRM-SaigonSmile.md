# BỘ CÂU LỆNH STITCH – CRM SAIGON SMILE MEDICAL
> Dán từng prompt bên dưới vào Stitch theo thứ tự. Mỗi prompt đã có đầy đủ System Context để đảm bảo toàn bộ màn hình đồng nhất về phong cách, màu sắc, bố cục và dữ liệu mẫu.

---

## ═══ SYSTEM CONTEXT (Dán vào ô "System Prompt" hoặc đầu mỗi prompt) ═══

```
DESIGN SYSTEM – CRM SAIGON SMILE MEDICAL

BRAND IDENTITY
- Logo: https://saigonsmile.com.vn/wp-content/uploads/2025/07/logo-saigon-smile-medical-spa-1.png
- Thương hiệu: Medical Spa cao cấp tại Việt Nam

COLOR PALETTE
- Primary / CTA: #EC7700 (Cam rực rỡ)
- Background: #FFFFFF
- Text & Icons: #54595F (Slate Grey)
- Glassy layer: rgba(255,255,255,0.5) + backdrop-filter: blur(12px)
- Status Green: #22C55E | Status Yellow: #F59E0B | Status Red: #EF4444 | Status Blue: #3B82F6

TYPOGRAPHY
- Font: Inter (hoặc Montserrat)
- Heading: 28–32px / weight 300 (Light)
- Body: 14–15px / weight 400
- Line-height: 1.6

LAYOUT
- Sidebar: 260px wide, nền trắng tối giản, logo trên cùng
- Menu icons: màu #54595F, active → #EC7700
- Cards: border-radius 20px, glassmorphism nhẹ, soft shadow
- Buttons: border-radius 12px; Primary=cam nền #EC7700 chữ trắng; Secondary=viền xám mỏng
- Inputs: underline style hoặc nền xám nhạt, không viền cứng
- Badges: fully rounded, màu nhạt của cam hoặc xám

SAMPLE DATA
Leads:
1. Nguyễn Thị Lan Anh – Vingroup | VIP Diamond | Trẻ hóa da & Yến sào | 35.000.000 VND
2. Lê Văn Hoàng – Vietcombank | Doanh nghiệp | Yến sào cao cấp | 120.000.000 VND
3. Phạm Thu Trang – FPT Software | Tiềm năng cao | Giảm béo chuyên sâu | 22.000.000 VND
4. Đặng Minh Hùng – Masan Group | Khách mới | Trị nám & Chăm sóc da | 15.500.000 VND
5. Vũ Kim Chi – Vietnam Airlines | VIP Platinum | Làm trắng da & Yến huyết | 42.000.000 VND
6. Hoàng Quốc Bảo – Hòa Phát | Đối tác | Sức khỏe tổng quát & Yến chưng | 28.000.000 VND

Tasks:
1. Gửi báo giá Combo Yến sào "Trân Quý" cho chị Lan Anh – Cao – 15:00 hôm nay
2. Gọi xác nhận lịch tư vấn Giảm béo cho chị Trang – Trung bình – 09:30 ngày mai
3. Soạn hợp đồng Yến sào cho Vietcombank – Cao – 17:00 thứ Sáu
4. Gửi thông tin liệu trình Trị nám mới cho anh Hùng qua Zalo – Thấp – 10:00 ngày mai
5. Kiểm tra phản hồi sau buổi tắm trắng đầu tiên của chị Kim Chi – Trung bình – 14:00 hôm nay

Kanban Stages (theo thứ tự):
Mới nhận → Đang liên hệ → Đã tư vấn → Chờ đặt lịch → Đã đặt lịch → Thành công / Thất bại

Lists:
1. Khách hàng Chiến lược 2024
2. Hội viên Thẩm mỹ chuyên biệt
3. Khách hàng Thân thiết Yến sào
```

---

## PROMPT 1 – Màn hình Đăng nhập (Login)

```
Sử dụng DESIGN SYSTEM ở trên.

Thiết kế màn hình ĐĂNG NHẬP cho CRM Saigon Smile Medical.

Layout:
- Nền trắng tinh khiết, phần bên trái chiếm 55% width là ảnh nền mờ (medical spa, tông cam-trắng), overlay gradient nhẹ rgba(236,119,0,0.08)
- Phần bên phải 45% là form đăng nhập trên nền trắng

Nội dung form (bên phải):
- Logo Saigon Smile Medical (URL ở Design System) căn giữa, kích thước vừa phải
- Tiêu đề "Chào mừng trở lại" – font Light 28px, màu #54595F
- Phụ đề "Đăng nhập để tiếp tục quản lý" – 14px xám nhạt
- Input Email: underline style, placeholder "Email công ty"
- Input Mật khẩu: underline style, icon mắt, placeholder "Mật khẩu"
- Link "Quên mật khẩu?" căn phải, màu #EC7700
- Nút chính "Đăng nhập" full-width, nền #EC7700, chữ trắng, border-radius 12px
- Divider "hoặc"
- Nút "Đăng nhập với Google" – viền xám mỏng, icon Google, chữ #54595F, border-radius 12px
- Footer nhỏ: "© 2025 Saigon Smile Medical. All rights reserved."

Không có sidebar. Không có header.
```

---

## PROMPT 2 – Layout chung & Sidebar Navigation

```
Sử dụng DESIGN SYSTEM ở trên.

Thiết kế SIDEBAR NAVIGATION dùng chung cho toàn bộ CRM. Sidebar này sẽ xuất hiện ở TẤT CẢ các màn hình nội bộ (Dashboard, Kanban, Tasks, Danh sách, Thanh toán, Cài đặt).

Sidebar specs:
- Rộng 260px, nền #FFFFFF, border-right: 1px solid rgba(84,89,95,0.08)
- Trên cùng: Logo Saigon Smile Medical (URL ở Design System), padding 24px
- Đường kẻ phân cách mảnh

Menu items (với icon outline mỏng, màu #54595F; khi active: icon + text màu #EC7700, background cam nhạt rgba(236,119,0,0.06), border-left 3px #EC7700):
  🏠 Tổng quan
  📊 Cơ hội bán hàng
  ✅ Công việc
  👥 Danh sách khách hàng
  💳 Thanh toán
  ⚙️ Cài đặt

- Dưới cùng sidebar: Avatar người dùng tròn + tên "Nguyễn Sales" + badge role "Sales" (badge cam nhạt) + icon đăng xuất

Main content area bên phải:
- Top header: Thanh tìm kiếm (nền xám nhạt, border-radius 20px, icon kính lúp #54595F) bên trái, bên phải có icon thông báo (badge đỏ số 3) + avatar nhỏ
- Nội dung trang thay đổi tùy module

Hiển thị màn hình với sidebar active tại "Tổng quan".
```

---

## PROMPT 3 – Dashboard (Tổng quan)

```
Sử dụng DESIGN SYSTEM ở trên. Sidebar active: "Tổng quan".

Thiết kế màn hình TỔNG QUAN (Dashboard) đầy đủ.

SECTION 1 – Metric Cards (hàng ngang, 4 cards):
Card dạng glassmorphism nhẹ (border-radius 20px, soft shadow), mỗi card gồm:
- Card 1: Icon 🧑‍🤝‍🧑 | Label "Leads mới hôm nay" | Số "12" lớn 32px | Xu hướng +18% xanh lá
- Card 2: Icon 📅 | Label "Lịch hẹn đã xác nhận" | Số "8" | +5% xanh lá
- Card 3: Icon 💰 | Label "Doanh thu dự kiến" | Số "262.500.000 ₫" | font cam #EC7700
- Card 4: Icon ✅ | Label "Công việc quá hạn" | Số "3" | màu đỏ #EF4444

SECTION 2 – Biểu đồ (2 cột):
Cột trái 65%: Biểu đồ đường "Xu hướng Lead theo tuần" – đường cam #EC7700 mảnh, nền trắng, trục nhẹ, dữ liệu 7 ngày gần nhất
Cột phải 35%: Biểu đồ tròn "Phân bổ dịch vụ" – 5 múi (Giảm béo 30%, Trẻ hóa da 25%, Làm trắng 20%, Trị nám 15%, Chăm sóc da 10%), legend đi kèm

SECTION 3 – Việc cần làm ngay (phía dưới):
Tiêu đề "⚡ Cần xử lý ngay" – font Light
Danh sách 3 tasks quá hạn / sắp đến hạn từ Sample Data, mỗi dòng: tên task + badge ưu tiên (Cao=đỏ, Trung bình=vàng) + thời hạn + nút "Xử lý" nhỏ cam

Tổng thể: khoảng trắng rộng rãi, không chật chội.
```

---

## PROMPT 4 – Cơ hội bán hàng (Kanban Board)

```
Sử dụng DESIGN SYSTEM ở trên. Sidebar active: "Cơ hội bán hàng".

Thiết kế màn hình KANBAN – CƠ HỘI BÁN HÀNG.

Header màn hình:
- Tiêu đề "Cơ hội bán hàng" font Light 28px
- Bên phải: nút "+ Thêm cơ hội" nền #EC7700 chữ trắng border-radius 12px | nút lọc viền xám

Kanban Board (cuộn ngang):
7 cột theo thứ tự: Mới nhận | Đang liên hệ | Đã tư vấn | Chờ đặt lịch | Đã đặt lịch | Thành công | Thất bại

Mỗi cột:
- Header: Tên cột (font Light, #54595F) + badge số lượng thẻ (cam nhạt)
- Nền cột: xám cực nhạt #F8F8F8, border-radius 16px

Kanban Cards (tối giản nhất có thể):
- Nền trắng, border-radius 16px, soft shadow
- Dòng 1: Tên khách hàng (font 500, #54595F)
- Dòng 2: Công ty (xám nhạt 13px)
- Dòng 3: Badge phân khúc (VIP Diamond=cam, Doanh nghiệp=xanh, v.v.) + sản phẩm quan tâm
- Dòng 4: Giá trị dự kiến màu #EC7700 font 500

Phân bổ leads vào cột:
- Mới nhận: Đặng Minh Hùng
- Đang liên hệ: Phạm Thu Trang, Hoàng Quốc Bảo
- Đã tư vấn: Nguyễn Thị Lan Anh
- Chờ đặt lịch: Vũ Kim Chi
- Đã đặt lịch: Lê Văn Hoàng

Hiển thị đủ 7 cột, cuộn ngang nếu cần.
```

---

## PROMPT 5 – Chi tiết Lead (Lead Detail / Hồ sơ khách hàng)

```
Sử dụng DESIGN SYSTEM ở trên. Sidebar active: "Cơ hội bán hàng".

Thiết kế màn hình CHI TIẾT KHÁCH HÀNG (khi click vào thẻ Kanban).

Dùng dữ liệu: Nguyễn Thị Lan Anh – Vingroup – VIP Diamond – Trẻ hóa da & Yến sào – 35.000.000 VND

Layout 2 cột:
CỘT TRÁI (35%) – Thông tin cá nhân:
- Avatar tròn (chữ viết tắt "LA" trên nền cam)
- Tên to: Nguyễn Thị Lan Anh
- Công ty: Tập đoàn Vingroup
- Badge phân khúc: VIP Diamond (cam)
- Thông tin: 📞 0912.345.678 | ✉ lananh@vingroup.com | 📍 Hà Nội
- Sản phẩm quan tâm: tags "Trẻ hóa da", "Yến sào Thượng hạng"
- Giá trị dự kiến: 35.000.000 ₫ (cam, to)
- Nhân viên phụ trách: avatar nhỏ + "Anh Minh Sales"
- Nút "Chỉnh sửa" viền cam | Nút "Đổi trạng thái" cam

CỘT PHẢI (65%) – Tabs: Ghi chú | Công việc | Lịch sử
Tab Ghi chú (active):
- Ô nhập ghi chú mới (textarea underline, nút "Lưu ghi chú" cam)
- 2 ghi chú mẫu dạng timeline: dot cam + ngày giờ + nội dung ghi chú nhỏ

Tab Công việc:
- Danh sách tasks liên quan (tham chiếu task "Gửi báo giá Combo Yến sào")
- Nút "+ Thêm công việc"

Tab Lịch sử:
- Activity log dạng timeline: các sự kiện "Tạo lead", "Chuyển giai đoạn", v.v.

Không dùng modal. Đây là trang riêng biệt có sidebar.
```

---

## PROMPT 6 – Module Công việc (Tasks)

```
Sử dụng DESIGN SYSTEM ở trên. Sidebar active: "Công việc".

Thiết kế màn hình QUẢN LÝ CÔNG VIỆC (Tasks).

Header:
- Tiêu đề "Công việc" font Light 28px
- Bộ lọc nhanh dạng pills (border-radius tròn): Tất cả | Hôm nay | Quá hạn | Đã hoàn thành
- Nút "+ Thêm công việc" nền #EC7700

Bộ lọc nâng cao (dòng thứ 2, compact):
Dropdown: Loại (Gọi điện / Nhắn tin / Hẹn gặp) | Ưu tiên | Nhân viên phụ trách

Danh sách Tasks (dạng bảng tối giản, không viền, dòng cách rộng):
Mỗi dòng gồm:
- Checkbox tròn bên trái (unchecked=xám, checked=cam)
- Tiêu đề task (font 500)
- Tag khách hàng liên quan (xám nhạt, dạng pill nhỏ)
- Badge ưu tiên: Cao=#EF4444 nhạt | Trung bình=#F59E0B nhạt | Thấp=#54595F nhạt
- Thời hạn (quá hạn hiển thị đỏ, sắp đến vàng, ổn xanh)
- Nút "..." (kebab menu)

Hiển thị đủ 5 tasks từ Sample Data, sắp xếp theo deadline tăng dần.

Dưới cùng: Pagination đơn giản.
```

---

## PROMPT 7 – Danh sách khách hàng (Customer List)

```
Sử dụng DESIGN SYSTEM ở trên. Sidebar active: "Danh sách khách hàng".

Thiết kế màn hình DANH SÁCH KHÁCH HÀNG.

Header:
- Tiêu đề "Danh sách khách hàng" font Light 28px
- Bên phải: nút "📥 Nhập CSV" viền xám | nút "📤 Xuất CSV" viền xám | nút "+ Thêm khách hàng" cam

Thanh lọc (card trắng, border-radius 16px, soft shadow):
- Ô tìm kiếm rộng: icon kính lúp + placeholder "Tìm theo tên, SĐT, mã KH..."
- Hàng 2: Dropdown Phân khúc | Dropdown Sản phẩm quan tâm | Dropdown Nguồn | Date picker Ngày tạo | Nút "Đặt lại"

Tabs Danh sách:
- Tab "Tất cả" (active) | Tab "Khách hàng Chiến lược 2024" | Tab "Hội viên Thẩm mỹ" | Tab "Thân thiết Yến sào" | Nút "+ Danh sách mới"

Bảng dữ liệu (không viền cứng, alternate row xám cực nhạt):
Cột: Checkbox | Tên KH + avatar chữ tắt | Công ty | Phân khúc (badge) | Sản phẩm quan tâm | Nhân viên PTrach | Ngày tạo | Hành động (icon xem / sửa)

Hiển thị 6 leads từ Sample Data.

Pagination + "Hiển thị 1–6 / 6 kết quả" bên dưới.
```

---

## PROMPT 8 – Module Thanh toán (Payments)

```
Sử dụng DESIGN SYSTEM ở trên. Sidebar active: "Thanh toán".

Thiết kế màn hình THANH TOÁN.

Header:
- Tiêu đề "Thanh toán" font Light 28px
- Nút "+ Ghi nhận thanh toán" cam

SECTION 1 – Tổng quan tài chính (3 metric cards hàng ngang):
- Card 1: Tổng thu tháng này – 262.500.000 ₫ – màu cam
- Card 2: Đã thu – 185.000.000 ₫ – xanh lá
- Card 3: Chưa thu / Pending – 77.500.000 ₫ – vàng

SECTION 2 – Biểu đồ cột "Dòng tiền theo tháng" (6 tháng gần nhất):
- Cột cam cho đã thu, cột xám nhạt cho pending
- Trục Y: đơn vị triệu ₫
- Nền trắng, soft shadow

SECTION 3 – Lịch sử giao dịch (bảng tối giản):
Cột: Khách hàng | Dịch vụ | Số tiền | Hình thức (Tiền mặt / Chuyển khoản) | Ngày | Trạng thái (badge)

Dữ liệu mẫu 4 giao dịch:
1. Lê Văn Hoàng | Yến sào cao cấp | 120.000.000 ₫ | Chuyển khoản | 14/05/2025 | Hoàn thành (xanh)
2. Vũ Kim Chi | Làm trắng da | 42.000.000 ₫ | Tiền mặt | 13/05/2025 | Hoàn thành (xanh)
3. Nguyễn Thị Lan Anh | Trẻ hóa da | 35.000.000 ₫ | Chuyển khoản | 12/05/2025 | Đang xử lý (vàng)
4. Hoàng Quốc Bảo | Yến chưng tươi | 28.000.000 ₫ | Tiền mặt | 10/05/2025 | Hoàn thành (xanh)
```

---

## PROMPT 9 – Module Cài đặt (Settings)

```
Sử dụng DESIGN SYSTEM ở trên. Sidebar active: "Cài đặt".

Thiết kế màn hình CÀI ĐẶT (Settings) – hiển thị cho vai trò Admin.

Layout 2 cột:
CỘT TRÁI (25%) – Menu dọc các nhóm cài đặt (pills dọc, active = cam):
- Hồ sơ cá nhân (active)
- Bảo mật
- Quản lý nhân viên
- Phân quyền
- Danh mục dịch vụ
- Nhãn & Tags

CỘT PHẢI (75%) – Nội dung tương ứng (hiển thị "Hồ sơ cá nhân"):

Card trắng, border-radius 20px, soft shadow:
Section "Thông tin cá nhân":
- Avatar tròn lớn + nút "Thay đổi ảnh" cam nhạt
- Input "Họ và tên": Nguyễn Admin
- Input "Email": admin@saigonsmile.com.vn (disabled, có icon khóa)
- Input "Số điện thoại": 0909.000.001
- Nút "Lưu thay đổi" cam

Card trắng thứ 2 – Section "Bảo mật":
- Dòng "Mật khẩu" + nút "Đổi mật khẩu" viền xám
- Dòng "Đăng nhập với Google" + toggle switch (đang bật, màu cam)
- Dòng "Xác thực 2 yếu tố" + toggle switch (đang tắt, xám)

Card trắng thứ 3 – Section "Quản lý nhân viên" (preview nhỏ):
Bảng 3 nhân viên: Tên | Role badge | Trạng thái | Nút "Quản lý" →
Nút "Xem tất cả nhân viên" cam outline

Tất cả inputs dùng underline style hoặc nền xám nhạt không viền cứng.
```

---

## PROMPT 10 – Form Thêm/Sửa Lead (Modal hoặc Slide-over)

```
Sử dụng DESIGN SYSTEM ở trên.

Thiết kế FORM THÊM KHÁCH HÀNG MỚI dạng slide-over panel từ bên phải (chiều rộng 480px), overlay nền mờ nhẹ phía sau.

Header panel:
- Tiêu đề "Thêm khách hàng mới" font Light 24px
- Nút X đóng (icon, không viền)

Body (form cuộn được):
Nhóm "Thông tin cơ bản":
- Họ và tên* (underline input, required)
- Số điện thoại* (underline input, required, có icon kiểm tra trùng)
- Email (underline input)
- Ngày sinh (date picker)
- Giới tính (radio pill: Nam | Nữ | Khác)
- Địa chỉ (underline input)

Nhóm "Thông tin kinh doanh":
- Công ty / Tổ chức (underline input)
- Phân khúc (dropdown: Khách mới / Tiềm năng cao / VIP Platinum / VIP Diamond / Doanh nghiệp / Đối tác)
- Sản phẩm quan tâm (multi-select chips: Giảm béo | Trẻ hóa da | Làm trắng da | Trị nám | Chăm sóc da)
- Giá trị dự kiến (input number, suffix "VND")
- Nguồn (dropdown: Facebook / Website / Giới thiệu / Khách vãng lai)
- Nhân viên phụ trách (dropdown có avatar)
- Giai đoạn Kanban (dropdown stages)

Footer panel (sticky):
- Nút "Hủy" viền xám | Nút "Lưu khách hàng" cam
```

---

## GHI CHÚ SỬ DỤNG

- **Thứ tự khuyến nghị**: Chạy Prompt 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
- **System Context**: Luôn dán vào ô System Prompt của Stitch để đảm bảo đồng nhất
- **Supabase mapping**: Mỗi màn hình đã căn chỉnh với schema (leads, tasks, pipeline_stages, payments, profiles)
- **RLS**: Các màn hình đã phân biệt role Sales (chỉ thấy lead của mình) vs Admin (toàn bộ)
- **Responsive**: Thiết kế cho màn hình laptop 1440px; tablet cần sidebar thu gọn thành icon
