// data.js - Mock Database for Saigon Smile Medical CRM

const CRM_DATA = {
    leads: [
        { id: 1, name: "Nguyễn Thị Lan Anh", company: "Vingroup", segment: "VIP Diamond", service: "Trẻ hóa da & Thermage FLX", value: "35.000.000", stage: "Đã tư vấn", phone: "0912.345.678" },
        { id: 2, name: "Lê Văn Hoàng", company: "Vietcombank", segment: "Doanh nghiệp", service: "Meso căng bóng cao cấp", value: "120.000.000", stage: "Đã đặt lịch", phone: "0988.111.222" },
        { id: 3, name: "Phạm Thu Trang", company: "FPT Software", segment: "Tiềm năng cao", service: "Giảm béo chuyên sâu", value: "22.000.000", stage: "Đang liên hệ", phone: "0903.999.888" },
        { id: 4, name: "Đặng Minh Hùng", company: "Masan Group", segment: "Khách mới", service: "Trị nám & Chăm sóc da", value: "15.500.000", stage: "Mới nhận", phone: "0913.444.555" },
        { id: 5, name: "Vũ Kim Chi", company: "Vietnam Airlines", segment: "VIP Platinum", service: "Tắm trắng Collagen 4D", value: "42.000.000", stage: "Chờ đặt lịch", phone: "0933.222.111" },
        { id: 6, name: "Hoàng Quốc Bảo", company: "Hòa Phát", segment: "Đối tác", service: "Sức khỏe tổng quát & Ultherapy", value: "28.000.000", stage: "Đang liên hệ", phone: "0944.666.777" }
    ],
    tasks: [
        { id: 1, title: "Gửi báo giá Combo Thermage FLX cho chị Lan Anh", customer: "Lan Anh", priority: "Cao", deadline: "15:00 hôm nay", status: "pending" },
        { id: 2, title: "Gọi xác nhận lịch tư vấn Giảm béo cho chị Trang", customer: "Chị Trang", priority: "Trung bình", deadline: "09:30 ngày mai", status: "pending" },
        { id: 3, title: "Soạn hợp đồng Meso căng bóng cho Vietcombank", customer: "Vietcombank", priority: "Cao", deadline: "17:00 thứ Sáu", status: "pending" },
        { id: 4, title: "Gửi thông tin liệu trình Trị nám mới cho anh Hùng", customer: "Anh Hùng", priority: "Thấp", deadline: "10:00 ngày mai", status: "pending" },
        { id: 5, title: "Kiểm tra phản hồi sau buổi tắm trắng đầu tiên của chị Kim Chi", customer: "Chị Kim Chi", priority: "Trung bình", deadline: "14:00 hôm nay", status: "pending" }
    ]
};

// Global Helper function
function formatCurrency(amount) {
    return amount + " ₫";
}
