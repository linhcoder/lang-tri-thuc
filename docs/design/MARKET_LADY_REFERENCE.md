# Bà bán hàng theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt, nụ cười và tóc búi theo ảnh người dùng cung cấp. Trang phục đổi thành áo bà ba tím trầm, quần đen, tạp dề màu kem và dép phù hợp chợ quê.

- PNG: `apps/game-client/assets/resources/village/market-lady-reference-v1.png`.
- Prompt: `docs/design/market-lady-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, tám hướng × ba trạng thái đứng/đi/chào.
- ID NPC `ba-ban-hang`, ID asset `character.ba-ban-hang` được giữ nguyên.
- Sprite dùng atlas riêng cả khi chuyển động và chào, không quay về hình NPC chung; các frame được giải phóng khi đóng scene.

## Kiểm tra trước triển khai

TypeScript, 64 nhóm test client, sáu test lifecycle/startup và build Cocos đạt. QA local kiểm tra 24 frame, tám hướng đứng/đi/chào không lật ảnh, desktop 1440×900 và mobile ngang 844×390; page errors rỗng. Kiểm tra lại atlas Bác Nông Dân cũng đạt. Evidence local: `apps/game-client/temp/market-lady-reference-qa/`.

## VPS 15/10/2026

Release `market-lady-fb92eda-20261015`, source commit `fb92eda`, build `web-desktop`, contentVersion `d92c670c`. Overlay 14 file, SHA-256 `140dca770cab988f1fb95a54d0f842c984c25c628c5a1408699b4f18179f3dae`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T082245Z.sql` phục hồi thử đạt; giữ release `co-tam-bfa9954-20261015` để rollback. Hai API MySQL healthy, CMS giữ nguyên.

QA HTTPS xác nhận atlas 24 frame, tám hướng đứng/đi/chào, không lật ảnh và desktop/mobile đạt cho bà bán hàng; kiểm tra lại Bác Nông Dân đạt, page errors rỗng. Tài khoản QA đã xóa. API đăng nhập quản trị, danh mục 90 bài học/12 NPC/24 asset, chặn API nội bộ và phòng không có quyền đạt. Evidence live: `temp/deploy/qa/market-lady-reference-live/`.
