# Cô Giáo Lan theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt, nụ cười, kính tròn và tóc tết theo ảnh người dùng cung cấp. Trang phục đổi thành áo dài xanh nhạt, quần trắng và giày kín phù hợp cô giáo.

- PNG: `apps/game-client/assets/resources/village/teacher-lan-reference-v1.png`.
- Prompt: `docs/design/teacher-lan-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, tám hướng × ba trạng thái đứng/đi/chào.
- Giữ ID NPC `co-giao-lan` và ID asset `character.co-giao-lan`.
- Sprite dùng atlas riêng cả khi chuyển động và chào; frame được giải phóng khi đóng scene.

## Kiểm tra trước triển khai

TypeScript, 64 nhóm test client, sáu test lifecycle/startup và build Cocos đạt. QA local xác nhận atlas 24 frame, tám hướng đứng/đi/chào không lật ảnh, desktop 1440×900 và mobile ngang 844×390, không có page error. Kiểm tra lại Bác Nông Dân đạt. Ảnh QA đưa cô giáo ra trước sân để kiểm tra hình không bị mái trường che; không thay vị trí NPC trong dữ liệu game. Evidence: `apps/game-client/temp/teacher-lan-reference-qa/`.

## VPS 15/10/2026

Release `teacher-lan-6870386-20261015`, source commit `6870386`, build `web-desktop`, contentVersion `d92c670c`. Overlay 14 file, SHA-256 `36423f260383e19d82efc8141b020a0209e9d92be99fb85e06755fdc4ab263ca`; source/Web checksum khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T083242Z.sql` phục hồi thử đạt; giữ release `market-lady-fb92eda-20261015` để rollback. Hai API MySQL healthy, CMS giữ nguyên.

QA HTTPS xác nhận 24 frame, tám hướng đứng/đi/chào không lật ảnh và desktop/mobile đạt; kiểm tra lại Bác Nông Dân đạt, page errors rỗng, tài khoản QA đã xóa. API đăng nhập quản trị, danh mục 90 bài học/12 NPC/24 asset, chặn API nội bộ và phòng không có quyền đạt. Evidence live: `temp/deploy/qa/teacher-lan-reference-live/`.
