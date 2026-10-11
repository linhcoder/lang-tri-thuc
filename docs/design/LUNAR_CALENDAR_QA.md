# Lịch âm Việt Nam và lịch lễ runtime — 11/10/2026

FestivalCalendar hiện tính Tết (mùng 1 tháng Giêng) và Trung thu (rằm tháng Tám, không nhuận) qua VietnamLunarCalendar, trong khoảng ngày dương 1900–2199. Dùng UTC+7, đổi ngày lúc 00:00 giờ Việt Nam. Năm ngoài phạm vi hoặc tính toán lỗi giữ chế độ học quanh năm. Bộ ngày 2026–2028 được giữ làm fixture kiểm chứng, không còn là giới hạn runtime.

Phép tính dùng sóc và kinh độ mặt trời từ LunarAstronomy/Meeus, delta-T theo NASA; license astronomia đã nằm trong docs/licenses. Đây là lịch thiên văn theo múi giờ hiện đại, không phục dựng mọi lịch pháp định lịch sử và không xác định lịch nghỉ chính thức. Tết trong game vẫn đánh dấu ba ngày, Trung thu một ngày.

## Đối chiếu độc lập

Nguồn quy tắc: [Hồ Ngọc Đức — Thuật toán tính âm lịch](https://xemamlich.uhm.vn/calrules.html). Mốc ngày được đối chiếu với [bảng lịch JavaScript của cùng tác giả](https://xemamlich.uhm.vn/JavaScript/), đọc 11/10/2026. Bản thư viện tham chiếu chỉ được đọc ở temp để kiểm tra; không đưa code/thư viện của tác giả vào game hay repo.

Đã đối chiếu 448 mốc Tết/Trung thu cho 1976–2199, không có khác biệt. Repo lưu 30 cặp ngày thực tế làm fixtures, gồm năm 1985, 2007 và 2030 để phát hiện việc nhầm UTC+8 với UTC+7. Kiểm tra thêm tháng 2 nhuận năm 2023, tháng 11 nhuận năm 2033 và ví dụ 13/12/1974 = 1/11 âm lịch tại miền Bắc trong bài của tác giả. Khoảng trước 1976 chỉ được xem là áp dụng quy tắc thiên văn hiện đại.

## Kiểm thử

`npm run test:lunar` kiểm tra fixtures độc lập, tháng nhuận, ngày không hợp lệ, biên phạm vi và 109.573 ngày dương đổi sang âm rồi đổi ngược trong 1900–2199. Đã sửa lỗi ngày dương đầu tháng 1/1900 thuộc năm âm 1899 nhưng chiều đổi ngược từng từ chối năm đó.

Browser `test:calendar` đạt Android giả lập: midnight UTC+7, ba ngày Tết, chuyển năm, lịch sau 2028, ngày Tết Việt Nam 2030, đổi 2033/2034 và fallback năm 2200. Kiểm tra tính nhất quán hai chiều không tự chứng minh độ chính xác thiên văn; fixtures độc lập và đối chiếu bảng tham chiếu là bằng chứng bổ sung. Vẫn cần người biên tập duyệt nội dung lễ.
