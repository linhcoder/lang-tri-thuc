# Tối ưu gameplay UI/UX — 13/10/2026

## Audit

Gameplay chính là `assets/scenes/VillageScene.scene` và `VillageBootstrap`; HUD/panel dựng bằng node Cocos trong `VillageHUD`, `VillageHub`, `ChapterOneView`, `CmsActors`. Không có prefab HUD riêng cần thay thế. UI sử dụng layer UI_2D, Canvas và camera isometric; bản đồ, UUID, asset, save và luật chơi được giữ nguyên.

Vấn đề: banner tên làng cố định; tracker desktop liệt kê nhiều mục và ở gần vùng cây đa; thanh cảm xúc luôn mở trên desktop; tên/bong bóng NPC xuất hiện ở khoảng cách 600 đơn vị; HUD tạo chuỗi/collection mỗi frame; phím E chưa nối tương tác và ESC chưa đóng hội thoại CMS. Hộp thoại đã có skin giấy/gỗ nhưng thiếu chân dung, chữ xuất hiện dần và keyboard choices.

## Thứ tự triển khai

1. Chụp/đo baseline trên cùng bản Cocos, Chromium Windows/D3D11, các viewport 1366×768, 390×844, 844×390, 1024×768. Ghi FPS/cadence, draw calls/texture memory khi engine cung cấp, node và heap; không quy kết số đo giả lập là Android thật.
2. Responsive layout theo từng vùng: profile gọn và mở hồ sơ; banner tự ẩn; minimap thu gọn; tracker tối đa ba mục tiêu chưa xong ở dưới trái; cảm xúc mặc định đóng; nút tương tác chỉ hiện khi có đối tượng gần; hitbox tối thiểu 44px CSS; safe area.
3. Nhãn NPC theo khoảng cách, tách name và icon tương tác; không chồng nhãn/mặt. Hội thoại giữ nội dung, thêm chân dung thật, typewriter có skip, keyboard, wrap/fit cho mobile; giữ nút/lifecycle mini game.
4. Toast mục tiêu hoàn thành, tiến độ thực và feedback ngắn. Không tạo XP/xu hoặc cấp lại thưởng không có trong game.
5. Giữ art và animation sẵn có; cải thiện lớp che nhân vật/NPC mới, giảm đồ trang trí và hiệu ứng theo chất lượng. Không thay hình minh họa bằng sprite giả.
6. Giảm cập nhật chuỗi/layout và allocations HUD/nameplate bằng signature/throttling; so sánh số đo trước/sau cùng môi trường.
7. Build, strict check và kiểm thử di chuyển, keyboard, HUD/pan/zoom, nhiệm vụ, dialogue/CMS, viewport. Ghi ảnh và kết quả vào tài liệu bàn giao; commit các thay đổi đã xác minh.

Low/Medium/High đã có trong game; tiếp tục dùng cơ chế quality/culling hiện tại. Mục tiêu 60 FPS desktop và 30–60 FPS mobile chỉ là mục tiêu cho tới khi có benchmark thiết bị thật. Số đo ngắn trên headless browser không chứng minh soak lâu hoặc hiệu suất điện thoại.
