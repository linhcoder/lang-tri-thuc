# Chăm hoa — UI native Cocos

## Điểm tích hợp

`assets/scenes/VillageScene.scene` khởi tạo `VillageBootstrap`, sau đó `VillageHub`. Mini game hiện có là `ExpansionGame('flower-care', age, step)` trong `ExpansionActivities.ts`; không có scene hoặc prefab riêng cho Chăm hoa. Panel mới là node native Cocos được tạo bởi `FlowerCareView`, chỉ thay nhánh `expansion-game` có ID `flower-care`. Các hoạt động khác giữ renderer và luật cũ.

## Giao diện và asset

- Panel gỗ, giấy kem, lá xanh; tiêu đề, tiến độ, câu hỏi, ba thẻ có hình và nhãn, vùng phản hồi/gợi ý, đóng và Tiếp tục.
- Atlas PNG RGBA 1254 × 1254, 1.39 MB, được tạo bằng OpenAI built-in imagegen ngày 2026-10-13 theo phong cách tranh minh họa làng quê trong ảnh tham chiếu. Các hình không chứa chữ; Cocos hiển thị chữ tiếng Việt bằng Label.
- Nguồn `assets/resources/village/flower-care-v1/atlas.png`, UUID và `.meta` mới. Không thay UUID của asset cũ. `FlowerCareAtlasRects.ts` chứa 16 vùng cắt của ảnh gốc; không chỉnh pixel bằng script.
- SpriteFrame dùng chung một Texture2D. Khung giấy và thẻ dùng nine-slice; bảng tên, vùng gợi ý và nút có node skin riêng, giữ chiều cao nguồn và scale đều hai trục, chỉ kéo vùng giữa. Icon giữ đúng tỷ lệ nguồn khi fit vào ô. Label cache CHAR. Cả 16 vùng có ID `ui.flower-care.*` trong `VisualAssets.ts` và manifest, hỗ trợ preview trong thư viện admin.
- Asset có đủ panel, bảng tên, thẻ, nút xanh, nút tròn, hạt, đá, bút, bình tưới, sách, bóng, cành gãy, giày/hoa, dấu đúng, dấu sai và bóng đèn. Không còn emoji hoặc hình Graphics làm minh họa Chăm hoa. Không có asset thiếu phải thay bằng placeholder.

## Tương tác và tiến độ

Thẻ mặc định trung tính. Chạm một thẻ tạo trạng thái đang chọn và tween 180 ms, sau đó hiển thị trạng thái đúng hoặc sai, dấu phản hồi và câu giải thích. Chọn sai được thử lại; không tự tô thẻ đúng khác.

Trước khi chọn, không hiển thị dấu đúng hoặc hình minh họa riêng của đáp án đúng. Chạm bóng đèn mới mở gợi ý; gợi ý mô tả đặc tính để suy luận, không đọc tên đáp án.

Tiếp tục chỉ xử lý khi đáp án hiện tại đúng. Nó gọi lại `ExpansionGame.choose` ở chế độ solo hoặc gửi `onExpansionChoice` ở phòng riêng; không thay payload hoặc bước xác thực trên server. Server vẫn quyết định kết quả ở chế độ online. Cập nhật step, checkpoint và huy hiệu dùng cơ chế hiện có. Chọn đúng rồi đóng trước khi bấm Tiếp tục chưa ghi bước đó; mở lại sẽ làm lại bước chưa xác nhận. Không cấp sao truyện hoặc thêm huy hiệu trùng.

`FlowerCareContent.ts` chứa ID, version, câu hỏi, đáp án, ID lựa chọn, chỉ số minh họa, gợi ý và phản hồi. `ExpansionGame` và UI cùng đọc nguồn này, để có thể nối Learning CMS sau này. Lượt này chưa thêm endpoint biên tập câu hỏi mới. Save schema và compatibility hash `818a32e3` không đổi.

Nút Âm bật/tắt dùng `campaign.data.sound` và save hiện có. `UiClickSound` dùng chung AudioContext, có tín hiệu ngắn khác nhau cho đúng/sai và giải phóng khi dispose. Kiểm thử tự động xác minh tùy chọn tắt âm, không xác nhận âm lượng qua loa vật lý.

## Responsive và tái sử dụng

- PC/tablet: panel 960 × 650, ba thẻ nằm ngang.
- Điện thoại ngang thấp: 840 × 450, giảm khoảng trống nhưng giữ thẻ và nút lớn.
- Điện thoại dọc: 620 × 1010, ba thẻ xếp dọc, hình bên trái và nhãn bên phải.

`VillageBootstrap` scale theo kích thước thực của panel và vùng nhìn. Label có wrap và SHRINK, không tạo node chữ mới khi chọn hoặc chuyển bước. Panel được tạo một lần và tái sử dụng khi mở lại; chỉ cập nhật nội dung, màu và SpriteFrame. Kiểm thử xác minh một texture dùng chung, số node gốc không tăng, vùng chạm ≥44 CSS px và các vùng tương tác không chồng nhau. Nút đóng góc trên, gợi ý và âm thanh trên bố cục dọc có kích thước 90 × 90 để dùng được cả màn hình 320 px.

PC không còn chọn bố cục ngang thấp chỉ vì màn hình rộng. Modal được giới hạn tối đa 960 × 620 CSS px ở màn hình ngang thông thường, và tối đa 84% kích thước viewport; tại 1920 × 925, panel khoảng 916 × 620. Điện thoại ngang thấp vẫn dùng bố cục compact để giữ vùng chạm.

Pointer-down tạo hiệu ứng lún ngay trên thẻ và nút; nhả tạo animation hồi, kéo vượt ngưỡng/cancel/blur sẽ nhả hiệu ứng. Vùng hit không co theo animation để bấm gần viền không hụt. Gợi ý và âm thanh có màu trạng thái. Tiếp tục chưa đủ điều kiện dùng skin kem/xám; bấm sẽ nhắc chọn đáp án, không tăng bước. Sau đáp án đúng nó đổi sang skin xanh và chữ trắng.

## Kiểm thử

```powershell
npm.cmd run check:client
npm.cmd run test:client
npm.cmd run test:expansion
npm.cmd run api:build
$env:GAME_BUILD_NAME='flower-care-v1'
npm.cmd run web:build
npm.cmd run test:flower-care
# Khi tools/serve-web.cjs phục vụ build mới tại 8134:
$env:GAME_WEB_URL='http://127.0.0.1:8134/'
npm.cmd run test:expansion-coop
npm.cmd run test:expansion-ui
```

Đã qua TypeScript strict, Cocos Creator 3.8.8 build, 64 nhóm client + 4 kiểm thử network, 21 lượt luật hoạt động, API 13 pass/1 MySQL integration skip và server 10 pass. Kiểm tra native bằng Playwright ở 1440×900, 1024×768, 844×390, 390×844, 320×568 và 568×320: mouse/touch, chọn sai/thử lại/gợi ý, chặn Tiếp tục, chuyển ba bước, cả hai nút đóng/mở lại, reload checkpoint, âm tắt được lưu và một huy hiệu. Kiểm tra hồi quy cả bảy hoạt động ở ba nhóm tuổi, cùng phòng hai người desktop/mobile và checkpoint trên phiên thiết bị mới đều qua.

Lượt sửa modal/input bổ sung 1920×925 với deviceScaleFactor=2 (tổng bảy viewport), kiểm tra kích thước PC, tỷ lệ icon, giữ chuột để xác nhận pointer-down và click trực tiếp vào hình/nhãn. Xác minh thẻ đúng đổi màu, hiện dấu đúng, Tiếp tục đổi skin; kiểm thử input client hiện tại cũng đã qua.

Báo cáo và ảnh tự động ở `apps/game-client/temp/flower-care-qa/` (ignore). Draw calls ghi trong report là tổng toàn cảnh làng, không phải riêng panel; không dùng số này để khẳng định đã tối ưu toàn bộ game. Chưa kiểm tra bằng thiết bị Android vật lý hoặc build native Android/iOS. Cần xác minh âm thanh qua loa và thao tác trên thiết bị thật trước khi gọi đó là QA thiết bị hoàn tất.

## Staging đã xác minh

Ngày 2026-10-13, release `flower-care-70c5cba-20261013` hoạt động tại `https://ltt.vui-hoc.xyz/game/`. Commit UI/asset `7b45bc7`, bổ sung vùng chạm `70c5cba`. Overlay được kiểm SHA, build API/server trước khi kích hoạt, health check/rollback theo runbook hiện có. MySQL health đạt và snapshot CMS giữ nguyên `500f4374bb2c86639d1f48f29ae8a09ade5d6e5e42302fbafe72e778076ee7bc`.

Kiểm tra trực tiếp staging bằng browser context mới đã qua cả sáu viewport, bao gồm vùng chạm ≥44 px, không chồng vùng tương tác, chọn sai/thử lại/gợi ý, Tiếp tục, cả hai nút đóng, mute, reload checkpoint và một huy hiệu. Báo cáo/ảnh ở `apps/game-client/temp/flower-care-live/` (ignore). Có thể hard refresh game rồi mở Vườn bốn mùa → Anh Nam → Chăm hoa để xem bản mới.

## File thay đổi

`FlowerCareView.ts`, `FlowerCareAtlasRects.ts`, `FlowerCareContent.ts` và `.meta`; atlas PNG/folder `.meta`; `VillageHub.ts`, `VillageBootstrap.ts`, `UiClickSound.ts`, `ExpansionActivities.ts`, `VisualAssets.ts`; `flower-care-web.cjs`, `expansion-web.cjs`, `expansion-coop-web.cjs`, `expansion.cjs`; `package.json`, `docs/design/asset-manifest.json` và tài liệu này.
