# Gameplay UI/UX — kết quả tối ưu ngày 13/10/2026

## Phạm vi đã thực hiện

Sửa trực tiếp UI native trong Cocos Creator 3.8.8, trên scene `VillageScene.scene`. Tiếp tục dùng HUD, journal, hội thoại, minigame và hình ảnh đang có; thêm `ResponsiveHudLayout`, `DialoguePresentation`, `UiClickSound`, không tạo một giao diện HTML thay thế game.

- Profile gọn: avatar thật, tên, level và tiến độ hoàn thành; bấm mở thành tích. Thanh tiến độ dùng dữ liệu thực của game, không thêm XP/xu hoặc luật thưởng mới.
- Banner làng tự ẩn; minimap có nút thu gọn và vẫn mở được bản đồ lớn. Layout riêng cho desktop, tablet, điện thoại dọc/ngang, đọc safe area và thêm `viewport-fit=cover`.
- Tracker chỉ liệt kê tối đa ba mục tiêu chưa xong (hai trên màn hình thấp), hiển thị số hoàn thành/tổng, mở journal đầy đủ và giữ nút đi tới mục tiêu. Tạm ẩn khi che ô trồng lúa chưa hoàn thành; trở lại khi vùng đó trống.
- Sáu cảm xúc thu vào một nút, đóng sau khi chọn. Desktop dùng click/WASD, có thể bật joystick; mobile giữ joystick. Nút tương tác chỉ hiện khi có NPC trong phạm vi; E tương tác, ESC đóng panel/cảm xúc.
- Tên NPC chỉ xuất hiện gần người chơi, giữ tránh va chạm nhãn; dấu `!`/`?` theo trạng thái Chương 1. NPC CMS tải muộn cũng được đăng ký nhãn. Cây/mái nhà tiếp tục mờ khi che nhân vật, nay áp dụng cả NPC CMS.
- Hội thoại có chân dung từ asset thật, chữ xuất hiện dần theo Unicode, chạm phần chữ/Space để hiện ngay. Enter tiếp tục khi đã đọc; CMS hỗ trợ phím 1–4 và nhiều trang cho nội dung dài. Màn hình ngang thấp dùng lựa chọn hai cột. Khi mở hội thoại, HUD/joystick ẩn ngay theo frame, không chờ chu kỳ cập nhật dữ liệu.
- Toast hoàn thành mục tiêu, feedback nhấn ngắn và âm click khi bật âm thanh. Không tự cấp lại sao hoặc sửa cốt truyện.
- Dữ liệu HUD/nameplate cập nhật tối đa 10 lần/giây, cache chuỗi theo signature; chữ typewriter và di chuyển vẫn cập nhật theo frame. Giữ lazy loading, culling, animation, chất lượng Thấp/Vừa/Cao hiện có.

Không thay đổi tọa độ làng, collision, nội dung nhiệm vụ, schema save, tài khoản hoặc snapshot CMS đã xuất bản. Không sửa scene, UUID hoặc asset cũ; ba module mới có `.meta` riêng. Các loại nhiệm vụ và chương vẫn đi qua journal/campaign hiện tại; đây không phải hệ thống tạo nhiệm vụ/XP/xu mới.

## Kiểm thử

- Strict TypeScript và build web Cocos thành công.
- State/gameplay: 63 nhóm kiểm thử và bốn kiểm thử lifecycle mạng.
- Native UI: 1366×768, 390×844, 844×390, 1024×768; đo hitbox thật ≥44 CSS px cho nút chính, cảm xúc/minimap/profile, WASD/E/ESC, tiến độ và toast, hội thoại CMS 600 ký tự giữ nguyên toàn bộ nội dung qua năm trang, bốn lựa chọn đủ lớn.
- Chương 1: desktop/mobile chơi đủ, trả lời sai/gợi ý, reload giữa trồng/đếm/chơi lại, mỗi cây đã trồng có sprite, sao chỉ nhận một lần; giữ save legacy, future save và backup save hỏng.
- Zoom: wheel, pinch, giới hạn 0,6–1,8, click-to-move khi zoom, HUD cố định, modal chặn zoom, lưu zoom, quyền sở hữu joystick, đổi dọc/ngang.
- CMS: Asset → tạo NPC → kéo thả → duyệt/xuất bản → sprite/hội thoại Cocos thật; bản nháp tách khỏi staging, liên kết nhiệm vụ và preview có xác thực vẫn hoạt động. Dùng API SQLite fixture, không sửa dữ liệu người chơi.

Lệnh tái chạy trên Windows tại root repo:

```powershell
npm.cmd run api:build
npm.cmd run check:client
$env:GAME_BUILD_NAME='game-ui-v1'
npm.cmd run web:build
npm.cmd run test:client
npm.cmd run test:game-ui
npm.cmd run test:game-ui-regression
$env:UI_BUILD='game-ui-v1'
$env:UI_PHASE='after'
npm.cmd run profile:game-ui
```

Regression CMS cần Vite admin đang chạy ở port 35173 với API local 33000. Runner tự khởi động API fixture 33004/game 8131; kiểm thử CMS có fixture riêng 33003/game 38081. Chạy browser QA tuần tự; không chạy song song khi đo hiệu suất. Build baseline `cms-staging-v1` từ commit `4ae8f0e` trước tối ưu; profiler chọn build bằng `UI_BUILD`, tên báo cáo bằng `UI_PHASE`.

Ảnh/report local, được gitignore: `apps/game-client/temp/ui-optimization-qa/`, `apps/game-client/temp/ui-profile/`, `apps/game-client/temp/chapter-one-qa/`, `apps/game-client/temp/zoom-qa/`, `apps/admin/temp/cms-qa/`.

## Profiling trước/sau

Windows, Chromium headless/D3D11 trên AMD Radeon; viewport nhỏ dùng Android user agent và touch. Mỗi mẫu chờ asset, đóng intro, warm-up 1,5 giây rồi đo rAF sáu giây, cùng vị trí/chất lượng mặc định. Số liệu draw calls/texture lấy từ device Cocos, heap từ CDP. Chỉ đo cảnh đứng yên; không đại diện gameplay lâu, tải cực đại hoặc thiết bị Android thật.

| Viewport | FPS trước → sau | p95 frame (ms) trước → sau | Draw calls trước → sau | Node hoạt động trước → sau | Texture MiB trước → sau | Heap MiB trước → sau |
| --- | --- | --- | --- | --- | --- | --- |
| 1366×768 | 56,65 → 58,60 | 16,8 → 16,9 | 203 → 176 | 321 → 288 | 230,59 → 230,32 | 31,09 → 36,16 |
| 390×844 | 58,97 → 59,16 | 16,9 → 16,9 | 134 → 134 | 205 → 205 | 221,57 → 221,47 | 41,17 → 43,57 |
| 844×390 | 58,94 → 59,13 | 16,8 → 16,9 | 150 → 142 | 240 → 230 | 226,31 → 226,14 | 37,01 → 46,60 |
| 1024×768 | 58,79 → 59,12 | 16,9 → 16,9 | 197 → 160 | 315 → 268 | 230,18 → 229,91 | 36,40 → 50,60 |

Median frame trước/sau đều khoảng 16,7 ms. Tổng node tăng nhẹ để có portrait/controls; node hoạt động và draw calls giảm trên desktop/tablet/ngang, màn hình điện thoại dọc giữ cùng draw calls. Draw calls desktop giảm khoảng 13%, tablet khoảng 19%; chưa có bằng chứng giảm thời gian p95 frame hoặc giảm heap.

Các giá trị FPS gần cadence 60 Hz không chứng minh tăng tốc GPU. Heap chịu ảnh hưởng thời điểm GC/JIT và có thể tăng; không kết luận tổng bộ nhớ giảm. Texture memory vẫn cần kiểm tra trên điện thoại thật. Mục tiêu 30–60 FPS Android chưa được xác minh bằng thiết bị vật lý; safe area tai thỏ cũng cần xác minh trên thiết bị có inset thật.

## Staging

Bản `game-ui-53f16ef-20261013` đã triển khai lên `https://ltt.vui-hoc.xyz/game/` qua overlay SHA-256, build backend/server và health check MySQL; cơ chế rollback tự động vẫn áp dụng. Commit mã nguồn: `53f16ef`; audit: `7fe6ac5`.

Smoke trên live qua bốn viewport xác minh HUD mới, hitbox chính ≥44 CSS px, E/Space/ESC khi canvas có focus, HUD/joystick ẩn khi mở panel, sprite CMS thật và tọa độ Bác Kể Chuyện (-128, -800); không có page error. Report/ảnh local ở `apps/game-client/temp/ui-live/`. Đây là browser mô phỏng touch/Android UA, không phải lượt test điện thoại vật lý.

Giữ snapshot CMS `578f129d038e…`, NPC Bác Kể Chuyện và phiên bản luật game `785f4e7e`. Người chơi đang mở trang cần tải lại để nhận bundle mới. Các bước CMS tiếp theo (upload asset mới, world editor đa đối tượng, nhiệm vụ mới, production publishing) vẫn theo `docs/design/CMS_STAGING.md`, ngoài đợt gameplay UI này.
