# Cô Tấm theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt và tóc theo ảnh người dùng cung cấp. Trang phục đổi thành áo tứ thân nâu, áo trong màu kem, thắt lưng hồng trầm, váy đen và dép; bỏ mũ, áo tốt nghiệp và bó hoa.

- PNG: `apps/game-client/assets/resources/village/co-tam-reference-v1.png`.
- Prompt: `docs/design/co-tam-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, 8 hướng × 3 trạng thái đứng/đi/chào.
- Bác Nông Dân tiếp tục dùng `farmer-workwear-v2.png`, giữ khuôn mặt và kính theo ảnh tham chiếu, mặc áo nâu và quần lao động.
- Cả hai nhân vật dùng atlas riêng khi chuyển động và chào, được giải phóng SpriteFrame khi đóng scene.

## VPS 15/10/2026

Release `co-tam-bfa9954-20261015`, source commit `bfa9954`, build `web-desktop`, contentVersion `d92c670c`. Overlay 14 file, SHA-256 `6296ab3c74c47794fa330c4310793481ef04aa225ce74135ba0ee74b2670185d`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T081413Z.sql` phục hồi thử đạt; giữ release `farmer-workwear-1bc07ed-20261015` để rollback. Hai API MySQL healthy, CMS giữ nguyên.

TypeScript, 64 nhóm test client, sáu test lifecycle/startup và build Cocos đạt. QA local kiểm tra riêng cả hai atlas: 24 frame, tám hướng đứng/chào không lật ảnh, desktop 1440×900 và mobile ngang 844×390, không có page error. Evidence local: `apps/game-client/temp/co-tam-reference-qa/`.

QA HTTPS lặp lại toàn bộ kiểm tra atlas của cả hai nhân vật và hai kích thước màn hình đạt, page errors rỗng; tài khoản QA đã xóa. Kiểm tra API đăng nhập quản trị, danh mục 90 bài học/12 NPC/24 asset, chặn API nội bộ và phòng không có quyền đạt. Evidence live: `temp/deploy/qa/co-tam-reference-live/`.
