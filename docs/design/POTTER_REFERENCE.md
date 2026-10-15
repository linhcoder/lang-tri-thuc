# Nghệ Nhân Gốm theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt, nụ cười, kính chữ nhật và tóc ngắn theo ảnh người dùng cung cấp. Trang phục đổi thành áo nâu xắn tay, tạp dề màu kem có vết đất sét, quần tối màu và dép phù hợp làm gốm.

- PNG: `apps/game-client/assets/resources/village/potter-reference-v1.png`.
- Prompt: `docs/design/potter-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, tám hướng × ba trạng thái đứng/đi/chào.
- Giữ ID NPC `nghe-nhan-gom` và ID asset `character.nghe-nhan-gom`.
- Sprite dùng atlas riêng khi chuyển động và chào; frame được giải phóng khi đóng scene.

## Kiểm tra trước triển khai

TypeScript, 64 nhóm test client, sáu test lifecycle/startup và build Cocos đạt. QA local kiểm tra 24 frame, tám hướng đứng/đi/chào không lật ảnh, desktop 1440×900 và mobile ngang 844×390, page errors rỗng; kiểm tra lại Bác Nông Dân đạt. Ảnh từng frame được lấy trực tiếp từ atlas Cocos để kiểm tra đầy đủ hình; ảnh trong làng có thể bị mái xưởng che tùy vị trí NPC. Evidence: `apps/game-client/temp/potter-reference-qa/`.

## VPS 15/10/2026

Release `potter-1a05ffb-20261015`, source commit `1a05ffb`, build `web-desktop`, contentVersion `d92c670c`. Overlay 14 file, SHA-256 `5ab82c018e129cef9a2d70b46ac17117e4bc216e04ff766f9ca77c972eee82ee`; source/Web checksum khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T084242Z.sql` phục hồi thử đạt; giữ release `teacher-lan-6870386-20261015` để rollback. Hai API MySQL healthy, CMS giữ nguyên.

QA HTTPS xác nhận 24 frame, tám hướng đứng/đi/chào không lật ảnh, desktop/mobile đạt; kiểm tra lại Bác Nông Dân đạt, page errors rỗng, tài khoản QA đã xóa. API đăng nhập quản trị, danh mục 90 bài học/12 NPC/24 asset, chặn API nội bộ và phòng không có quyền đạt. Evidence live: `temp/deploy/qa/potter-reference-live/`.
