# Sổ ngày lễ truyền thống

Hai chuỗi tìm hiểu mở quanh năm. Sổ tự nhận diện ngày lễ theo giờ Việt Nam bằng bộ chuyển đổi âm/dương thiên văn UTC+7, khoảng ngày dương 1900–2199:

- Tết: đọc về sum họp/lời chúc → chọn lời chúc lịch sự → gói bánh chưng trong game.
- Trung thu: đọc về đèn/bánh/rước đèn → chọn cách đi cùng nhóm → ghép đèn ông sao.

Nội dung ngắn do dự án viết lại, minh họa Graphics tự vẽ; không sao chép ảnh/bài viết. Mốc mùng 1 tháng Giêng và rằm tháng Tám âm lịch tham khảo [Vietnam Tourism — festivals](https://vietnam.travel/things-to-do/top-festivals-vietnam). Đèn ông sao/rước đèn tham khảo [Vietnam Tourism — Mid-autumn](https://vietnam.travel/things-to-do/vietnams-magical-mid-autumn-festival). Đã đọc ngày 11/10/2026; ngày sự kiện 2020 trong bài Trung thu là thông tin lịch sử, không dùng làm lịch runtime.

Tiến độ 0=đọc, 1=câu hỏi, 2=trò chơi, 3=hoàn thành; lưu theo hồ sơ local. Sai đáp án chỉ đưa gợi ý. Game phải kết thúc trước khi đánh dấu xong. Chơi lại giữ dấu hoàn thành và không tăng sao truyện. Checkpoint dùng cơ chế ván luyện đã có. Hoạt động được đồng bộ theo hồ sơ phòng riêng; xem ACTIVITY_SYNC.md. Lịch lễ tự nhận diện Tết/Trung thu bằng VietnamLunarCalendar (1900–2199). Ngoài phạm vi hoặc tính toán lỗi, sổ giữ chế độ học quanh năm. Các ngày 2026–2028 bên dưới là fixtures đã đối chiếu, không phải giới hạn runtime. Nội dung còn cần biên tập sư phạm/văn hóa trước beta.

## Ngày lễ tự nhận diện

Tết: 17/2/2026, 6/2/2027, 26/1/2028. Trung thu: 25/9/2026, 15/9/2027, 3/10/2028. Mốc đổi ngày 00:00 UTC+7; nhãn hiển thị ngày tới/còn bao nhiêu ngày, hoặc Đang vui ngày lễ. Tết được đánh dấu ba ngày trong game, Trung thu một ngày; đây không phải lịch nghỉ chính thức. Không khóa nội dung khi ngoài ngày lễ. Sau 2028 runtime tính ngày từ lịch âm UTC+7; không dùng ngày theo lịch Trung Quốc. Đây là quy tắc thiên văn hiện đại, không phải lịch pháp định lịch sử hoặc lịch nghỉ chính thức.

Nguồn ngày: [Time and Date — Vietnam 2026](https://www.timeanddate.com/holidays/vietnam/2026), [UBND Long Xuyên — Trung thu 2026](https://longxuyen.angiang.gov.vn/tang-cuong-bao-dam-an-toan-thuc-pham-dip-tet-trung-thu-2026-ram-thang-tam-am-lich-binh-ngo-nham-thu-sau-ngay-2592026-duong-lich), [General Blue — Vietnam 2027](https://www.generalblue.com/calendar/downloads/vietnam-holidays-2027-list-classic-en-vn.pdf), [General Blue — Vietnam 2028](https://www.generalblue.com/calendar/downloads/vietnam-holidays-2028-list-striped-en-vn.pdf). Đã đối chiếu ngày 11/10/2026. Chỉ sử dụng dữ kiện ngày, không sao chép hình/calendar template.
## Tích hợp và kiểm chứng

FestivalCalendar đã import VietnamLunarCalendar để tính Tết/Trung thu. Đã đối chiếu 448 mốc 1976–2199 với lịch tham chiếu của Hồ Ngọc Đức, lưu 30 fixtures độc lập và kiểm tra 109.573 ngày đổi hai chiều trong 1900–2199. Browser kiểm tra midnight, ba ngày Tết, đổi năm, năm 2030, tháng nhuận 2033/2034 và fallback ngoài phạm vi. Chi tiết/nguồn tại [LUNAR_CALENDAR_QA](LUNAR_CALENDAR_QA.md).
