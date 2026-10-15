# Cô Giáo Lan theo ảnh tham chiếu

## Sửa cô giáo bị ảnh trường che — 15/10/2026

Ảnh `journey.school` có phần sân nằm dưới chân tòa nhà. Xếp lớp theo đáy toàn ảnh khiến cô giáo bị che khi đi về đầu tuyến. Đã dùng mốc sâu cao hơn đáy ảnh 30% chiều cao để xếp lớp trường và xác định che khuất nhất quán. Cô giáo đứng/đi trên sân được vẽ phía trước trường. Vị trí NPC và bố trí bản đồ giữ nguyên.

Kiểm thử `npm run test:teacher-depth` kiểm tra tất cả điểm trên tuyến đi và mười vị trí nội suy mỗi đoạn, đối chiếu thứ tự vẽ thật trong Cocos; ảnh desktop/mobile và page errors đạt. TypeScript và build Cocos đạt. Evidence local: `apps/game-client/temp/teacher-depth-qa/`.

Release `teacher-depth-a2c06c8-20261015`, source `a2c06c8`, contentVersion `0d971c1a`. Overlay năm file SHA-256 `33080e1acb2166c2220056a73c1f61654cd0f72943578e8e29689074deab6f6b`; backup `/opt/lang-tri-thuc/backups/database-20261015T162510Z.sql` phục hồi thử đạt. Hai API MySQL healthy; nội dung CMS và bố trí đã áp dụng giữ nguyên. Release trước giữ để rollback.

QA HTTPS lặp lại kiểm tra thứ tự vẽ toàn tuyến/nội suy và ảnh desktop/mobile đạt, không page error; tài khoản game QA đã xóa. Evidence live: `temp/deploy/qa/teacher-depth-live/`.

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
