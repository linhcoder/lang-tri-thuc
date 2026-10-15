# Bác Nông Dân theo ảnh tham khảo — 15/10/2026

Asset mới được tạo bằng OpenAI built-in `image_gen` từ ảnh người dùng cung cấp. Giữ nét mặt, kính chữ nhật, tóc ngắn và áo khoác họa tiết xanh/hồng, quần jeans, giày xám trong ảnh; chuyển sang phong cách NPC vẽ tay của game. Không lưu ảnh gốc vào bộ asset.

- Atlas: `apps/game-client/assets/resources/village/farmer-reference-v1.png`, PNG RGBA 1774×887, nền trong suốt.
- Prompt đầy đủ: [farmer-reference-v1.prompt.json](farmer-reference-v1.prompt.json).
- 8 cột: E, NE, N, NW, W, SW, S, SE. Ba hàng: đứng, bước đi, vẫy chào.

Registry giữ ID `character.farmer`, trỏ sang atlas mới. Hình ban đầu lấy ô đứng hướng nam. Các khung runtime cắt theo dải alpha đã đo: 8–295, 306–574, 583–872; dùng toàn bộ bề rộng ô để không đổi tỷ lệ giữa các hướng. `VillageArt.farmerFrame` cung cấp 24 frame riêng; chuyển động và vẫy chào của Bác Nông Dân dùng atlas này, không lật ảnh và không quay lại hàng farmer trong atlas NPC chung. Các đường đi và tương tác nhiệm vụ tiếp tục dùng dữ liệu hiện có, contentVersion `d92c670c`.

TypeScript, toàn bộ test client và build Cocos đạt. QA Cocos xác nhận 24 frame riêng, 8 hướng đứng/vẫy chào đúng atlas, scale ngang dương, hình trong game trên 1440×900 và 844×390, page errors rỗng. Đã xem ảnh mobile và bản tổng hợp 24 frame. Báo cáo/ảnh local ignored: `apps/game-client/temp/farmer-reference-qa/`.

## Triển khai VPS

Đã phát hành ngày 15/10/2026 tại https://ltt.vui-hoc.xyz/game/. Release `farmer-reference-3626919-20261015`, commit `3626919`, build `web-desktop`, contentVersion `d92c670c`. Overlay 14 file SHA-256 `694a3e7d315d696c6a744f6e78b26ed5b3f66bdb123c75eb5aa6557553d2aa1e`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T074244Z.sql` đã phục hồi thử khớp dữ liệu. Giữ release `ground-materials-b08555b-20261015` để rollback. Hai API MySQL khỏe; CMS không đổi.

QA HTTPS đạt 24 frame, tám hướng đứng/vẫy chào đúng atlas, không lật ảnh, hình thật trong game ở desktop và mobile ngang; page errors rỗng. Đã xem ảnh mobile live. Kiểm tra API/quyền quản trị, chặn API nội bộ và phòng không vé đạt; tài khoản QA đã xóa. Báo cáo/ảnh local ignored: `temp/deploy/qa/farmer-reference-live/`.
