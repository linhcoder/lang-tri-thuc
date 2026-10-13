# Công trình, va chạm và biển tên — 13/10/2026

## Lỗi và cách sửa

- Collider ô vuông cũ nhỏ hơn phần chân đình/nhà/chợ. Thêm footprint hình thoi theo tọa độ thế giới cho đình, nhà, gốc đa, chợ, trường và luống vườn; dùng chung `VillageMap` ở client, server, API và dữ liệu bản đồ admin. Chặn tường/quầy và phần chân công trình; không biến cả vùng chiếu của mái/tán cây thành tường.
- Chợ/đình bị alpha 92 khi NPC phía sau bị bao chữ nhật ảnh nhận nhầm là đang bị che. Công trình đình, nhà và chợ giữ alpha 255; cây/tán lá vẫn dùng cơ chế làm mờ đang có.
- Vườn bốn mùa cũ ở (40,11), quá xa biển (43,22). Đưa ảnh về (42,20), rộng 280 đơn vị; collider đặt cùng vị trí. Điểm đến trên bản đồ chuyển về (43,22), cạnh biển và lối vào. Kiểm tra phần ảnh vườn không lấn các sprite ô trồng lúa Chương 1.
- Biển ruộng lúa cũ (34,24) chiếu lên mái trường (40,30). Chuyển về (28,21), bờ ruộng cạnh bác nông dân; nằm ngoài ảnh trường và vườn.
- Tracker tạm ẩn khi che biển ba khu mở rộng, để trên mobile vẫn thấy biển và người chơi tại lối vào; giữ cơ chế tránh che ô trồng lúa.

Không sửa PNG, UUID hoặc scene, không đổi nhiệm vụ/phần thưởng/save. Nhân vật vẫn đi được phía sau mái/tán cây ở nơi mặt đất cho phép, nhưng không đi vào footprint tường/quầy.

## Tương thích CMS và mạng

Navigation thay đổi nên contentVersion mới là `818a32e3` (trước là `785f4e7e`). Build đồng bộ game/API/game-server và admin. Người chơi đang mở bản cũ cần tải lại; phòng online dùng handshake phiên bản hiện có.

API có migration giới hạn cho snapshot staging từ đúng `785f4e7e`: kiểm tra lại toàn bộ NPC theo map mới, tạo snapshot/hash mới chứa nguyên NPC/hội thoại, giữ lịch sử cũ, tăng revision và ghi audit `cms.navigation.upgrade`. Không sửa hoặc xuất bản bản nháp đang biên tập; không tự nâng snapshot từ phiên bản không biết hoặc có vị trí mới bị chặn. Giao dịch giữ nguyên dữ liệu nếu kiểm tra không đạt; không xóa lịch sử để vượt giới hạn 50 bản.

Preflight live xác nhận NPC đã xuất bản vẫn hợp lệ trên navigation mới. Kiểm thử migration xác nhận đọc lần hai không tăng revision/nhân bản snapshot; bản nháp và snapshot cũ giữ nguyên.

## Xác minh

- Strict TypeScript; build Cocos, API, server, admin.
- 64 nhóm gameplay + bốn lifecycle mạng; thêm chặn tile chân công trình, canStand/path, đường tới các ô trồng và zone/CMS vẫn mở.
- API: 13 bài đạt, MySQL integration riêng được skip vì chưa cấu hình DB test. Bao gồm migration CMS, giao dịch và quyền truy cập.
- Browser Cocos thật: desktop 1920×918 và mobile 390×844, màu alpha công trình, va chạm khi di chuyển, vị trí ảnh/biển, ảnh vườn không đè sprite nhiệm vụ, biển ruộng không nằm trong vườn/mái trường.
- Regression Chương 1 đầy đủ desktop/mobile, save/replay/sao một lần, zoom/pinch và CMS Asset → NPC → kéo thả → publish → sprite/hội thoại thật đã qua.
- Bộ native UI bốn viewport kiểm tra lại HUD, các nút ≥44 CSS px, keyboard, hội thoại dài và tiến độ.

Ảnh/report local (gitignore): `apps/game-client/temp/landmark-qa/`. Ảnh overview dùng zoom 0,6 để so vị trí toàn làng; ảnh mobile dùng zoom 1 tại lối vào vườn. Chạy `npm.cmd run test:landmarks` sau build `game-ui-v1` và `api:build`; runner dùng API SQLite fixture và không sửa dữ liệu người chơi.

## Staging

Kết quả triển khai được bổ sung sau health check và smoke game live. Thông tin admin local đã bị từ chối trong đợt trước; không đổi mật khẩu để xử lý công trình.
