// import-export.js - Động cơ xuất/nhập CSV hỗ trợ tiếng Việt có dấu chuẩn UTF-8 BOM chống vỡ font trong Excel

const CSVEngine = {
    // 1. Xuất dữ liệu ra file CSV
    export(data, filename = 'saigonsmile_customers.csv') {
        if (!data || data.length === 0) {
            showToast('Không có dữ liệu để xuất!', 'warning');
            return;
        }

        // Tạo tiêu đề cột
        const headers = ['Họ và tên', 'Số điện thoại', 'Email', 'Phân khúc', 'Địa chỉ', 'Nguồn khách'];
        
        // Mape dữ liệu thành các dòng tương ứng
        const rows = data.map(item => [
            item.full_name || '',
            item.phone || '',
            item.email || '',
            item.segment || 'Khách vãng lai',
            (item.address || '').replace(/"/g, '""'), // Escape double quotes
            item.source || 'Trực tiếp'
        ]);

        // Tạo nội dung CSV dạng chuỗi
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(val => `"${val}"`).join(','))
        ].join('\n');

        // Thêm UTF-8 Byte Order Mark (BOM) để Excel nhận dạng tiếng Việt có dấu
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) { // Cho IE cổ
            navigator.msSaveBlob(blob, filename);
        } else {
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        showToast('Xuất danh sách khách hàng thành công!', 'success');
    },

    // 2. Nhập dữ liệu từ file CSV
    async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split(/\r?\n/);
                if (lines.length < 2) {
                    reject(new Error('File CSV rỗng hoặc sai định dạng.'));
                    return;
                }

                // Loại bỏ UTF-8 BOM ở dòng đầu tiên nếu có
                let headerLine = lines[0];
                if (headerLine.startsWith('\uFEFF')) {
                    headerLine = headerLine.substring(1);
                }

                const headers = headerLine.split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
                const importedRecords = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Regex tách CSV hỗ trợ dấu ngoặc kép bọc chuỗi có chứa dấu phẩy
                    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
                    const values = matches.map(v => v.replace(/^["']|["']$/g, '').replace(/""/g, '"').trim());

                    const record = {};
                    headers.forEach((header, index) => {
                        const val = values[index] || '';
                        
                        // Map Vietnamese header name or English names
                        if (header === 'họ và tên' || header === 'fullname' || header === 'name') {
                            record.full_name = val;
                        } else if (header === 'số điện thoại' || header === 'phone' || header === 'sđt') {
                            record.phone = val;
                        } else if (header === 'email') {
                            record.email = val;
                        } else if (header === 'phân khúc' || header === 'segment') {
                            record.segment = val;
                        } else if (header === 'địa chỉ' || header === 'address') {
                            record.address = val;
                        } else if (header === 'nguồn khách' || header === 'source') {
                            record.source = val;
                        }
                    });

                    // Validate tối thiểu phải có Tên và SĐT
                    if (record.full_name && record.phone) {
                        importedRecords.push(record);
                    }
                }

                resolve(importedRecords);
            };

            reader.onerror = () => reject(new Error('Lỗi đọc tập tin.'));
            reader.readAsText(file, 'UTF-8');
        });
    }
};

window.CSVEngine = CSVEngine;
