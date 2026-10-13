# Giao diện modal dùng chung

Áp dụng giao diện gỗ, giấy kem và lá xanh của Chăm hoa trực tiếp trong Cocos Creator 3.8.8. Các modal dùng SpriteFrame thật từ `village/flower-care-v1/atlas`; không thêm ảnh hay thay đổi dữ liệu Learning CMS.

## Phạm vi

- 12 mini game luyện tập/cốt truyện và 7 hoạt động mở rộng.
- Hội thoại chương 1, bài học, hội thoại NPC từ CMS và panel demo cũ.
- Sổ tay, bản đồ, kho đồ, cài đặt và các menu tương tác trong VillageHub.
- Bàn ghép tranh, mê cung, vẽ và kéo thả giữ nguyên tọa độ và luật chơi.

## Triển khai

`ModalTheme.ts` dùng chung một texture, bộ SpriteFrame được cache, khung nine-slice, bảng tên gỗ, nút kem và nút hành động xanh. Không tải lại texture trong vòng lặp khung hình. Graphics vẫn được giữ cho các bàn chơi có hình vẽ tương tác.

Khi nhấn, nút đổi màu và chữ co nhẹ; khi nhả, trở lại trong 180 ms. Hitbox không co theo hiệu ứng. Kéo, hủy chạm, mất focus và Escape giải phóng trạng thái nhấn. Chăm hoa tiếp tục dùng bộ hiệu ứng riêng đã kiểm thử.

Các đáp án sai trong bài học, đếm lúa và hoạt động mở rộng có phản hồi màu ngắn 250 ms. Không tô đáp án của câu tiếp theo. Nút hoàn thành/nhận thưởng chỉ xuất hiện theo điều kiện của luật chơi hiện có; không tự chuyển bước hoặc cấp thưởng từ UI.

Modal trên PC có giới hạn kích thước và luôn scale đồng nhất. Panel ghép tranh giữ bố cục ngang/dọc riêng. Font tiêu đề và thông báo được đổi sang màu nâu/xanh đậm để đọc trên nền kem.

## File thay đổi

- `apps/game-client/assets/scripts/ui/ModalTheme.ts`
- `apps/game-client/assets/scripts/ui/VillageHub.ts`
- `apps/game-client/assets/scripts/ui/ChapterOneView.ts`
- `apps/game-client/assets/scripts/ui/LearningPanel.ts`
- `apps/game-client/assets/scripts/ui/CmsActors.ts`
- `apps/game-client/assets/scripts/core/VillageBootstrap.ts`
- `apps/game-client/tests/modal-theme-web.cjs`
- `apps/game-client/tests/campaign-web.cjs`
- `apps/game-client/tests/flower-care-web.cjs`
- `apps/game-client/tests/milestone01a.cjs`
- `package.json`

## Kiểm thử

Chạy `npm run check:client`, `npm run test:client`, build bằng `GAME_BUILD_NAME=flower-care-v1 npm run web:build`, rồi `npm run test:modal-theme` và `npm run test:flower-care`. Trên Windows dùng `npm.cmd` và `$env:GAME_BUILD_NAME='flower-care-v1'`.

`test:modal-theme` tự chạy web/API fixture riêng. Kiểm tra 12 modal luyện tập, 10 nhóm hội thoại/menu, nhấn chuột thật, hitbox ổn định và checkpoint khi đóng, trên 1920×925 (DPR 2), 1024×768, 390×844 và 844×390. Ảnh và báo cáo được lưu trong thư mục bỏ qua git `apps/game-client/temp/modal-theme-qa`.

Các suite campaign, expansion, ghép tranh và chơi chung dùng `GAME_WEB_URL` để kiểm tra cùng bản build. Bộ kiểm thử thuật toán giữ nguyên kiểm tra luật chơi; mock phần header native chỉ trong harness không có node Cocos thật.

Đã qua TypeScript strict, build Creator 3.8.8, 64 nhóm kiểm tra logic và 4 bài network lifecycle. UI native đã qua 12 modal luyện tập/10 nhóm hội thoại-menu ở 4 viewport; phản hồi chọn sai được kiểm tra thêm trên PC và điện thoại dọc. Chăm hoa qua 7 viewport. Cả 7 hoạt động mở rộng qua chơi riêng/chơi chung và khôi phục checkpoint. Ghép tranh 4/6/9 mảnh qua chuột/touch, thả sai, lưu/tải lại và gửi thao tác server ở 3 viewport. Suite campaign kiểm tra nhiệm vụ chương 2–8, hoàn thành mini game, phần thưởng, chơi lại và bảo toàn dữ liệu khi reset thất bại.

Staging: chờ cập nhật bản đã kiểm thử. Kiểm thử điện thoại dùng trình duyệt mô phỏng touch; chưa kiểm tra thiết bị Android vật lý trong lượt này.
