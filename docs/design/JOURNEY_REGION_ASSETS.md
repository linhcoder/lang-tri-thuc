# Cảnh riêng cho 10 vùng hành trình — 15/10/2026

Tạo mới bằng OpenAI built-in `image_gen`, mỗi vùng một lần sinh ảnh riêng. Mười PNG RGBA nền trong suốt nằm ở `apps/game-client/assets/resources/village/journey-regions-v1/`. Không lấy lại nhà, đình, cây đa hoặc cắt một atlas cũ để làm cảnh chính cho vùng khác.

| Vùng | File | Nội dung thiết kế mới |
| --- | --- | --- |
| Làng khởi đầu | `village.png` | Cổng gỗ mái ngói, sân học, cây cổ thụ, chòi đọc sách |
| Trường học tuổi thơ | `school.png` | Trường chữ L, cửa xanh, góc đọc sách, bảng và chuông |
| Nông trại xanh | `farm.png` | Kho hạt mái lá, guồng nước, luống rau và mạ |
| Chợ quê | `market.png` | Ba sạp chợ, mái vải, giỏ rau quả và cân |
| Làng nghề | `craft.png` | Lò gốm, bàn xoay, kệ phơi và khung dệt |
| Rừng khám phá | `forest.png` | Trạm quan sát, cầu dây, khe suối, cây rừng và thân cây rỗng |
| Sông nước | `river.png` | Bến gỗ, chòi ngư cụ, thuyền và sen |
| Đồi khoa học | `science.png` | Đài thiên văn mái vòm, kính ngắm, điện gió, mô hình hành tinh |
| Phố văn hóa | `culture.png` | Nhà phố di sản, đèn lồng, sân khấu rối nước và trống |
| Đảo tri thức | `island.png` | Thư viện mở, mái gợi trang sách, bậc đá, bến đảo |

Phong cách chung: minh họa truyện tranh vẽ tay, góc isometric, ánh sáng ấm từ trái trên. Cùng phong cách nhưng mười file và mười checksum khác nhau. Prompt đầy đủ tại [journey-regions-v1-prompts.json](journey-regions-v1-prompts.json); kích thước, dung lượng và SHA-256 tại [journey-regions-v1-manifest.json](journey-regions-v1-manifest.json). Giữ nguyên alpha gốc, không dùng xử lý xóa nền sau sinh ảnh.

## Tích hợp

Registry có mười ID `journey.<region>`. `JourneyScenery.ts` tải từng ảnh bằng đúng ID, giữ tỷ lệ ảnh và tạo một landmark riêng cho mỗi vùng. Bỏ hình cây đa chính, sạp chợ và bến sông cũ ở những vị trí đã thay bằng cảnh mới. Bốn vùng cuối dùng trực tiếp cảnh riêng, bỏ phần ghép nhà/đình/cây làng và biểu tượng Graphics. Các ảnh là cụm cảnh trang trí; các cổng và điểm tương tác vẫn dùng nhãn chữ của game.

Landmark nằm trong lớp actor để sắp độ sâu cùng NPC và đồ trang trí, có cơ chế mờ khi che người chơi. Trường học và làng nghề đặt trên đất ở gần NPC tương ứng; cây cũ bên đông được bỏ để không che nông trại mới.

Đây là bản local, chưa phát hành lên VPS. Nội dung câu hỏi và phiên bản tương thích hiện là `d92c670c`. Bộ ảnh đang chờ duyệt mỹ thuật trong registry.

## Kiểm tra

Đã kiểm tra mười ảnh có kênh alpha thực, mỗi ảnh có pixel trong suốt và đục hoàn toàn, mười checksum khác nhau. TypeScript, toàn bộ test client và build Cocos đạt. Bài trình duyệt `npm run test:level-journey` xác nhận đủ mười SpriteFrame với mười UUID texture khác nhau, đăng nhập/hồ sơ, thưởng cấp, lưu tiến độ và trang phục, cách ly học sinh, logout, desktop và mobile ngang; page errors rỗng. Ảnh từng vùng nằm ở thư mục ignored `apps/game-client/temp/level-journey-qa/region-*-landscape.png`. Đã xem cả mười ảnh và chỉnh vị trí trường/làng nghề về đất liền, bỏ cây cũ che cảnh nông trại.

Bản cuối sau sửa thứ tự vẽ đã chạy `npm run test:journey-regions`: đủ mười texture riêng, chụp 20 ảnh ở 1440×900 và 844×390, không có page error. Ảnh/report local ignored tại `apps/game-client/temp/journey-regions-qa/`; đã xem mười cảnh trong ảnh mobile cuối. Test client và TypeScript vẫn đạt.
