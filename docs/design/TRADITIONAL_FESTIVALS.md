# Sổ ngày lễ truyền thống

Hai chuỗi tìm hiểu mở quanh năm. Sổ tự nhận diện ngày lễ theo giờ Việt Nam từ bảng ngày dương đã kiểm chứng cho 2026–2028:

- Tết: đọc về sum họp/lời chúc → chọn lời chúc lịch sự → gói bánh chưng trong game.
- Trung thu: đọc về đèn/bánh/rước đèn → chọn cách đi cùng nhóm → ghép đèn ông sao.

Nội dung ngắn do dự án viết lại, minh họa Graphics tự vẽ; không sao chép ảnh/bài viết. Mốc mùng 1 tháng Giêng và rằm tháng Tám âm lịch tham khảo [Vietnam Tourism — festivals](https://vietnam.travel/things-to-do/top-festivals-vietnam). Đèn ông sao/rước đèn tham khảo [Vietnam Tourism — Mid-autumn](https://vietnam.travel/things-to-do/vietnams-magical-mid-autumn-festival). Đã đọc ngày 11/10/2026; ngày sự kiện 2020 trong bài Trung thu là thông tin lịch sử, không dùng làm lịch runtime.

Tiến độ 0=đọc, 1=câu hỏi, 2=trò chơi, 3=hoàn thành; lưu theo hồ sơ local. Sai đáp án chỉ đưa gợi ý. Game phải kết thúc trước khi đánh dấu xong. Chơi lại giữ dấu hoàn thành và không tăng sao truyện. Checkpoint dùng cơ chế ván luyện đã có. Hoạt động được đồng bộ theo hồ sơ phòng riêng; xem ACTIVITY_SYNC.md. Lịch lễ tự nhận diện Tết/Trung thu cho 2026–2028; không phải bộ chuyển đổi âm/dương tổng quát. Ngoài phạm vi bảng, sổ giữ chế độ học quanh năm. Nội dung còn cần biên tập sư phạm/văn hóa trước beta.

## Ngày lễ tự nhận diện

Tết: 17/2/2026, 6/2/2027, 26/1/2028. Trung thu: 25/9/2026, 15/9/2027, 3/10/2028. Mốc đổi ngày 00:00 UTC+7; nhãn hiển thị ngày tới/còn bao nhiêu ngày, hoặc Đang vui ngày lễ. Tết được đánh dấu ba ngày trong game, Trung thu một ngày; đây không phải lịch nghỉ chính thức. Không khóa nội dung khi ngoài ngày lễ. Sau 2028 cần cập nhật bảng ngày đã xác minh; không đoán ngày hoặc dùng lịch Trung Quốc thay âm lịch Việt Nam.

Nguồn ngày: [Time and Date — Vietnam 2026](https://www.timeanddate.com/holidays/vietnam/2026), [UBND Long Xuyên — Trung thu 2026](https://longxuyen.angiang.gov.vn/tang-cuong-bao-dam-an-toan-thuc-pham-dip-tet-trung-thu-2026-ram-thang-tam-am-lich-binh-ngo-nham-thu-sau-ngay-2592026-duong-lich), [General Blue — Vietnam 2027](https://www.generalblue.com/calendar/downloads/vietnam-holidays-2027-list-classic-en-vn.pdf), [General Blue — Vietnam 2028](https://www.generalblue.com/calendar/downloads/vietnam-holidays-2028-list-striped-en-vn.pdf). Đã đối chiếu ngày 11/10/2026. Chỉ sử dụng dữ kiện ngày, không sao chép hình/calendar template.
## Phân biệt lịch runtime và module chuyển đổi

`FestivalCalendar.ts` hiện vẫn dùng bảng đã xác minh 2026–2028; browser QA kiểm tra midnight UTC+7, ba ngày Tết, đổi năm và fallback ngoài bảng. `VietnamLunarCalendar.ts` và `LunarAstronomy.ts` đã có trong source, khai báo khoảng 1900–2199 và chuyển đổi hai chiều. Chúng chưa được FestivalCalendar import và chưa có bộ QA riêng được ghi nhận, nên không coi khoảng 1900–2199 là lịch lễ đã nghiệm thu. Mở rộng runtime cần đối chiếu tháng nhuận và nguồn lịch Việt Nam trước khi thay bảng.
