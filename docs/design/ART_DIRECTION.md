# Làng Tri Thức — Art direction

Snapshot 10/10/2026. Người dùng mở rộng phạm vi từ milestone 1 sang toàn bộ milestone 2–6. Không commit, push hoặc deploy. Đây là bản triển khai kỹ thuật với asset candidate/placeholder, chưa nghiệm thu art final.

## Phân tích ảnh và renderer

village-reference.png do người dùng cung cấp để định hướng phong cách, không đóng gói làm background và không trích pixel thành asset. Ảnh có ánh sáng vàng ấm, cỏ thành mảng, đường đất cong, mái ngói đỏ và nhiều lớp cây/hoa/đá. Cây đa phía trên trái là điểm nhấn; sân đình giữa; ao/giếng bên trái; chợ dưới; ruộng phải. Công trình cao khoảng 2–3 lần người lớn vùng giữa ảnh. Đây là phối cảnh nghệ thuật, không phải atlas isometric chuẩn. Quyền trích asset từ ảnh chưa xác nhận.

VillageScene giữ Canvas/Bootstrap và UUID. World/HUD/NPC dựng runtime. Map 40×40, diamond 64×32 world pixel, toWorld(x,y)=((x-y)*32,-(x+y)*16). World Y lên, Canvas texture Y xuống. Ground anchor (.5,.5); actor/building (.5,0), depth sort theo chân. VillageModel là authority collision; A* bốn láng giềng. Physical actor footprint ±5×±3 world pixel; scale hình .65 không thu collision/hit target.

## Bố cục hiện tại

| Khu / đối tượng | Grid | Thiết kế world px | Vai trò |
|---|---|---|---|
| Cây Đa Tri Thức | 7,21 | 340×365 | Điểm nhấn trái sân; radius 1 |
| Đình | 21,17 | 330×270 | Trung tâm phía sau sân |
| Sân đình | x17…23, y17…23 | tile 64×32 | Trung tâm / khởi đầu |
| Ao sen | x1…5, y20…26 | 384×192 | Bên trái, gradient/ripple/shore bake |
| Cầu tre | 3,23 | 220×115 | Strip x1…5,y23 đi được |
| Giếng | 1,28 | 110×110 | Bờ trái phía trước ao |
| Chợ / người bán | 26,32 / 27,34 | quầy 250×220 | Phía dưới, NPC trước quầy |
| Ruộng chính | x25…34, y12…20 | tile 64×32 | Phía phải |
| Ruộng thực hành | x5…13, y6…14 | tile 64×32 | Giữ plot và reward ID Chương 1 |
| Nông dân | 12,15 | sprite .65 | Gần plot, thao tác mobile trong viewport |
| Cô Giáo Lan | 4,28 | sprite .65 | Tách khỏi tán cây / mái nhà |
| Nhà bé / nhà tây | 30,26 / 2,34 | 230×210 | Mốc home 30,28 trước nhà |
| Cổng | 17,32 | 180×145 | Tiền cảnh trái, không che Tí–Na |

Đường là control point độc lập, nối qua cầu/vòng gốc đa về sân, nhà, vườn, chợ. Hoa/bụi/cỏ/đá và cây tiền cảnh tái sử dụng atlas; 43 scenery instance. Dressing nhỏ không collider; quầy/đèn/fence/gốc cây có footprint và hiển thị khi trong camera cả ở Low. Quality không tạo vật cản vô hình.

## Pipeline, NPC và HUD

VisualAssets.ts là registry 10 nhóm, 48 record. VillageArt loader dùng ID → path registry, hỗ trợ PNG riêng hoặc atlas cell. Snapshot JSON xuất bằng npm.cmd run assets:manifest. Design size khác kích thước file; instance override scale/position. Thêm ground-v2.png và scenery-v2.png, giữ asset cũ; prompt/source ở GENERATION_PROMPTS.md.

HUD màu kem/nâu/xanh, avatar từ sheet; level suy ra từ sao (chưa có hệ XP riêng), progress từ quest completed/total, sao từ receipts. Có nhiệm vụ chính, tiến độ luyện tập phụ, minimap/pin, túi/bộ sưu tập, thành tích, settings Low/Medium/High và âm thanh, tương tác NPC, joystick. Desktop có toolbar; portrait mobile dùng menu gọn với cùng chức năng. Parent gate vẫn riêng. Nameplate ở overlay, ưu tiên NPC gần và tránh chồng; ẩn tên ở xa. Thông báo lỗi tránh các nút HUD/joystick. Cầu có anchor (.5,.5), ở Ground dưới actor; cây/mái che mặt bé được giảm alpha còn 92/255, giữ collision và màu trang trí nhà.

## Hiệu năng

Texture cỏ lặp theo world + mảng màu có seed + đường/ao/shadow bake, không redraw mỗi frame. 25 chunk ghép hai atlas 1542×1806 và 1028×516, mỗi chiều dưới 2048; tổng RGBA terrain khoảng 12.65 MiB, bằng ngân sách chunk cũ. Không realtime shadow. SpriteFrame dùng chung atlas, terrain/scenery culling theo camera. NPC/avatar/tóc và nhà/chuối/lúa tải khi cần khu vực; đình/đa/nhân vật chính core preload. Cache theo ID/path, chưa có streaming eviction hoặc zone bundle riêng.

Low dùng shadingScale .75 và ẩn dressing tùy chọn; Medium .9, High 1. Collision/speed/quest/reward không đổi theo quality. Mục tiêu 30 FPS cần kiểm chứng thiết bị đích; AMD/ANGLE và mobile emulation không thay điện thoại/Intel yếu thật. Không suy ra tổng draw calls giảm chỉ từ số atlas: HUD/cảnh đã thêm sprite.

## Preview và khác biệt

Mở apps/game-client bằng Cocos Creator 3.8.8, chờ import .meta, mở assets/scenes/VillageScene.scene → Preview Browser. Terrain Canvas yêu cầu Browser; Native chưa hỗ trợ. Build bằng npm.cmd run web:build rồi npm.cmd run local:stack; game http://127.0.0.1:38080/. Thử Low/High, zoom/pinch 60–180%, cầu, NPC, Chương 1, HUD menu.

Ảnh mẫu đặc và hữu cơ hơn, lighting/shadow thống nhất hơn. Bản này vẫn có ruộng/sân/ao theo grid, đường procedural, HUD chữ thay icon minh họa. Atlas generated cần rà cell/padding/alpha. Nguồn tạo PNG cũ đã xác định trong apps/game-client/ART.md; review văn hóa và điều kiện phát hành vẫn chưa hoàn tất. Không coi placeholder/candidate là đạt ảnh mẫu. Chi tiết từng milestone, test và số đo cuối: VISUAL_UPGRADE_REPORT.md và apps/game-client/QA-REPORT.md.
