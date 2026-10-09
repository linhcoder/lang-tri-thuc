# Milestone 01A — Isometric Village Prototype

## Mở và chạy bằng Cocos Creator 3.8.8

1. Trong Cocos Dashboard, chọn **Add / Import Project**, trỏ đến thư mục `apps/game-client` của workspace này. Chọn engine **3.8.8**, mở project hiện có.
2. Nếu project đang mở từ trước, đóng rồi mở lại project để lấy script/scene trên đĩa và đồng bộ Asset Database. Không lưu đè bằng scene cũ đang nằm trong bộ nhớ Editor. Các script đã có `.meta` do Editor tạo; giữ nguyên chúng.
3. Trong Assets, mở `assets/scenes/VillageScene.scene`.
4. Trong Hierarchy, chọn **Canvas** và xác nhận đã có **VillageBootstrap** trong Inspector. Bootstrap đã được gắn vào scene, không cần kéo thêm script hoặc tạo node/prefab.
5. Giữ Canvas, UITransform 1280 × 720 và camera UI hiện có. Nếu preview đang ở chế độ dọc, dùng **Rotate** trên toolbar preview để xem thiết kế ngang; không cần sửa cấu hình project.
6. Chọn Preview in Browser và bấm nút Play trên toolbar. Click vào vùng game để nhận bàn phím.

Đây là các thao tác Editor duy nhất cần thiết. Bootstrap tạo bản đồ, nhân vật, NPC và UI trong runtime; chúng không xuất hiện ở chế độ chỉnh sửa scene. Scene chỉ được thêm một component bằng class ID thực do Cocos đăng ký, giữ nguyên các node/camera/Canvas và cấu hình cũ. Không có prefab mới, chưa có commit/push.

## Điều khiển và nghiệm thu

- WASD hoặc phím mũi tên: đi theo hướng màn hình, tốc độ chéo được chuẩn hóa.
- Khi đi sát vật cản bằng bàn phím/joystick, nhân vật trượt theo cạnh isometric nếu còn lối đi, thay vì đứng kẹt khi hướng chéo chạm cạnh.
- Chuột trái / chạm tile: tự tìm đường A*, không đi qua ao hay NPC. Chạm ngoài bản đồ hoặc vị trí bị chặn không đổi lệnh đang chạy.
- Vòng sáng đánh dấu ô đích; vòng biến mất khi tới nơi, hủy đường đi hoặc điều khiển trực tiếp. Chạm phần hướng dẫn không phát lệnh đi.
- Điện thoại: joystick ở góc trái dưới, kéo nhẹ để đi chậm; ngón khác vẫn có thể chạm bản đồ. Thả joystick hoặc hủy touch sẽ dừng điều khiển trực tiếp. Kéo màn hình không tạo lệnh đi.
- Click/chạm hình Bác Nông Dân cạnh ruộng lúa: đi đến ô lân cận rồi mở hội thoại. Đi bằng bàn phím/joystick sẽ hủy yêu cầu tương tác.
- Chạm hộp thoại hoặc Esc: đóng hội thoại. Trong lúc hội thoại mở, nhân vật dừng và input di chuyển bị bỏ qua.
- Ra khỏi cửa sổ/tab: xóa trạng thái phím và joystick để tránh phím bị giữ.
- Chạm tâm joystick dừng lệnh tự đi ngay. Tap cho phép rung tay nhỏ theo pixel màn hình; một thao tác đã kéo ra xa rồi trở về điểm đầu vẫn được nhận là drag. Mất focus hủy cả lệnh đi/tương tác đang chờ.

Kiểm tra trực tiếp trong browser: đi quanh ao, bốn rìa bản đồ, click NPC từ xa, đóng/mở hội thoại, đi phía trước/sau NPC, xoay điện thoại, multi-touch và mất focus. Bản đồ có hình thoi; giới hạn camera là hộp chữ nhật bao bản đồ, vì vậy góc màn hình có thể lộ nền ngoài hình thoi.

## Cấu trúc

- `VillageModel.ts`: bản đồ 40 × 40, chuyển đổi tile 64 × 32 (2:1), terrain, collision footprint, A* bốn láng giềng và giới hạn camera.
- `PlayerController.ts`: di chuyển có substep tối đa 2 px để tránh xuyên vật cản; trạng thái `moving`, `direction` (E, NE, N, NW, W, SW, S, SE) dành cho adapter animation sau này.
- `PlayerVisual` trong `PlayerController.ts`: adapter placeholder có hai chân bước luân phiên, thân nhún nhẹ và mặt/quay lưng theo tám hướng; chỉ cập nhật hình đầu khi hướng đổi. Có thể thay bằng sprite animation mà không sửa input/A*.
- `FarmerNPC.ts`: nội dung tiếng Việt, ID ổn định và sự kiện `npc-interact` để nối hệ thống nhiệm vụ.
- `VillageBootstrap.ts`: render Graphics placeholder, sắp xếp hai actor theo tọa độ chân, input, camera theo nhân vật bằng dịch world dưới Canvas và UI cố định.

Ruộng lúa đi được; ao và ô đứng của NPC không đi được. Chưa có animation sprite thật, nhà/đình dựng hình, multiplayer hay nhiệm vụ. Sân đình được biểu diễn bằng nền và nhãn. Nhân vật có hình người và mũi tên thể hiện hướng nhìn.

## Kiểm thử tự động

Từ root workspace, dùng TypeScript đi kèm Cocos đã cài trên máy này:

```powershell
node C:/ProgramData/cocos/editors/Creator/3.8.8/resources/app.asar.unpacked/node_modules/typescript/lib/tsc.js --project apps/game-client/tsconfig.json --skipLibCheck --strict --pretty false
node apps/game-client/tests/milestone01a.cjs C:/ProgramData/cocos/editors/Creator/3.8.8/resources/app.asar.unpacked/node_modules/typescript/lib/typescript.js
git diff --check
```

Nếu Cocos cài ở chỗ khác, thay đường dẫn đến `typescript/lib`. Test runner không cần cài npm dependency. Nó chạy TypeScript thực qua một cc harness nhỏ; không kiểm thử renderer Cocos.

TypeScript strict với `skipLibCheck` đạt. Không dùng tùy chọn đó thì bộ `.d.ts` của engine 3.8.8 trên máy có lỗi TypedArray, WebGPU và các module nội bộ; không thay cấu hình project để che những lỗi đó. Test tự động kiểm tra round-trip 1.600 tile, tọa độ lẻ, collision/bounds, A* so với BFS độc lập, đường vòng ao, chuyển động liên tục, hủy route, tốc độ/frame dài, hướng tám chiều, camera, key/touch/joystick và hội thoại.

15 nhóm test logic/controller/scene đạt, gồm tốc độ joystick analog, trượt cạnh ao với collision footprint, gesture tap/drag, hủy đường đi khi nhận joystick và bảo toàn yêu cầu NPC khi chạm đích không hợp lệ. Browser smoke test đạt trên preview engine Cocos 3.8.8 thật: scene deserialize với bootstrap đã gắn, render, bàn phím, bước chân placeholder, marker điểm đến, click A*, NPC, Esc, resize, joystick mobile, tap A*, kéo rồi trở về điểm đầu, chặn input HUD, chạm đóng hội thoại và xoay màn hình. Không có lỗi runtime/console; screenshot xác nhận hiển thị tiếng Việt. Camera và UI mobile tự điều chỉnh theo tỷ lệ màn hình để giữ nhân vật, chữ và joystick ở kích thước dễ đọc/chạm.

Editor đang mở giữ một số cache import cũ. Smoke test đọc scene trên đĩa, deserialize bằng Cocos, đồng thời transpile các script hiện tại sang SystemJS và giữ class ID bằng cơ chế RF của Cocos, thay response script cache chỉ trong phiên kiểm thử. Engine, asset và input vẫn là thật; bài test không xác minh thao tác reload/import trong giao diện Editor. Mở lại project theo bước 2 trước khi Preview.

Browser QA dùng Playwright và Chrome đã cài, không thêm dependency vào game:

```powershell
node apps/game-client/tests/browser-smoke.cjs C:/Users/truon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright C:/Users/truon/.cache/puppeteer/chrome/win64-149.0.7827.22/chrome-win64/chrome.exe http://localhost:7456 C:/ProgramData/cocos/editors/Creator/3.8.8/resources/app.asar.unpacked/node_modules/typescript/lib/typescript.js
```

Đường dẫn module/browser và cổng preview cần thay nếu chạy trên máy khác. Kết quả và ảnh nằm trong `temp/milestone01a-qa/` (được Git ignore). Chrome dùng SwiftShader; mobile là mô phỏng Android/touch. Chưa đo FPS trên Intel HD/UHD hay kiểm tra điện thoại thật, multi-touch thật và giao diện import của Editor; vẫn cần checklist nghiệm thu thủ công phía trên.

## Hiệu năng

Mặt đất vẽ một lần trong 25 cụm Graphics 8 × 8, không tạo 1.600 node hay redraw map mỗi frame. Các cụm ngoài vùng camera được tắt render, bật lại khi đi vào vùng nhìn. Chỉ có hai actor; mũi tên chỉ vẽ lại khi đổi hướng. A* chỉ chạy khi nhận lệnh. Không thêm shadow, shader tùy chỉnh, physics engine hoặc asset tải ngoài. FPS thực cần đo trên máy đích; số draw call phụ thuộc batching của engine.
