# Hoàn thiện art NPC, cảnh và mini game — 11/10/2026

Đợt này bổ sung ba nhóm hình ảnh trên build Cocos `art-polish-v1`. Nội dung/luật/collision giữ cùng contentVersion `e48dccf3`.

## NPC

Atlas mới có 64 khung: tám góc nhìn cho tám NPC, có mặt sau/lưng thật. Nguồn built-in imagegen, prompt và bước làm sạch alpha theo cho phép của người dùng được ghi tại [NPC_POSES.md](NPC_POSES.md). Runtime lấy hướng từ patrol solo hoặc server, dùng khung chào cũ và giữ fallback khi asset không tải được. Chu kỳ chân/nhún vẫn bằng code; chưa phải tám hướng × nhiều khung bước đi.

## Cảnh làng

Nền ruộng dùng một contour liền thay các ô đất màu xen kẽ; rạ vẫn có tọa độ ổn định. Đường thêm dấu bánh/đá nhỏ và cỏ ven đường. Bờ ao thêm lau/đá/đất theo đường biên liền. Tất cả bake vào terrain atlas một lần, vẽ theo tọa độ world để không lệch giữa chunk; không thêm collider hay đổi vị trí nhiệm vụ. Terrain vẫn 25 chunk, hai trang 1542 × 1806 và 1028 × 516.

## Mini game

12 bảng có nền giấy/viền chung và chi tiết theo trò: hạt Ô ăn quan, bụi lúa/giọt nước, dây kéo và người chơi, đốt tre/người nhảy, rau củ, nan/tua đèn, bánh/lạt, viền mảnh ghép, ao/cá, thẻ chữ, bát nước và gà, tường/cờ mê cung. Bảng nhận phản hồi viền ngắn khi state thay đổi; hoạt động chuyển động vẽ tối đa 12 nhịp/giây. Label được tái sử dụng trong mỗi bảng. Nút hành động và trace authoritative giữ nguyên.

Đây là nâng cấp minh họa và phản hồi thị giác; mô phỏng sâu, art riêng cho toàn bộ trò và thiết bị thật vẫn là việc tiếp theo.

## Kiểm chứng

Strict client typecheck và 58 nhóm unit + 3 network tests đạt. Build Cocos thật đạt. Browser visual đạt năm viewport, HUD bounds/non-overlap, quality/reload, fade, interaction và dispose, errors rỗng. Mẫu local AMD/ANGLE khoảng 60 FPS, p95 16.8–17 ms; không thay nghiệm thu điện thoại/Intel thật.

`test:art` kiểm tra cả tám NPC đổi đủ tám khung mà không mirror, 12 bảng desktop/mobile, không tăng label node khi animation, không đổi receipts truyện và bảng nằm trong viewport. Screenshot ở `apps/game-client/temp/art-polish-qa/`, không đưa vào Git. Kết quả NPC/campaign và deploy được ghi trong QA-REPORT sau khi hoàn tất.

Deploy live đợt art ngày 11/10/2026: commit `9b48e24`, release `9b48e24-art-e48dccf3-20261011`. SHA-256 delta khớp, build Linux/Nginx/backup-restore đạt. API/admin/quyền truy cập, phòng riêng hai client, save/reload online/offline và bộ art tám hướng/12 bảng desktop-mobile qua HTTPS đạt; errors rỗng. Giữ bản completion để rollback, không thay DB/secret.
