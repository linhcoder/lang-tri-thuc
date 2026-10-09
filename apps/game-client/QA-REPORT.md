# Kết quả nghiệm thu bản playable

## Đợt hoàn thiện tổng thể — 10/10/2026

Trạng thái hiện hành: [đối chiếu toàn bộ yêu cầu](../../docs/COMPLETION_CHECKLIST.md). Các mục “chưa có tóc/khăn/biểu cảm” và số test phía dưới là lịch sử.

- Tóc riêng cho bốn avatar, lưu/migration và đồng bộ room; lazy avatar/NPC/tóc, loading overlay. Thêm atlas tám loại scenery, chín node; collision/A* dùng model chung.
- 12 trò có minh họa state bằng Graphics, pool label; cửa sổ nhịp rộng hơn cho trẻ nhỏ. Đèn ông sao có kéo thả và nút thay thế. Luyện/lễ hội sau tám sao không nhận lại sao truyện.
- 90 câu theo tuổi/kỹ năng; admin form chương/quest title, câu hỏi, sáu NPC, 24 metadata asset; review/audit/export. Import kiểm tra toàn gói, hỗ trợ --check, release từ chối draft. Admin mặc định đọc nội dung từ shipped pack trước draft trong DB.
- Sửa pending join sau offline/dispose, callback room cũ, sai phiên bản nội dung, thất bại ba lần; callback chuyển solo gỡ hook authoritative để trò local tiếp tục chạy.

### Kiểm thử đã chạy

| Nhóm | Kết quả / phạm vi |
| --- | --- |
| Strict client, Cocos Web, API, admin build | Đạt; Creator import meta thật; giữ nguyên scene |
| Client | 42 nhóm engine/save/content/input + 3 test lifecycle network đạt |
| API | 4 test logic trong suite MySQL đạt; lượt standalone trước khi bổ sung hồi quy shipped-pack có 3 đạt/1 MySQL skip |
| MySQL riêng | 5 đạt, gồm admin shipped defaults, rollback, concurrent lock, Unicode, reconnect durable |
| Colyseus | 4 đạt; invalid avatar/hair, packet cũ giữ appearance, handshake và 20 client local |
| Campaign | Đủ 8 chương, 12 trò minh họa, 8 receipt, luyện, reload, reset thất bại giữ dữ liệu |
| Avatar | 4×24 frame, tóc, khăn, gesture, reload, touch mobile, remote appearance; không lỗi JS |
| Assets | Lazy NPC theo vùng, click 7 điểm NPC, 3 sen, 9 node/8 frame scenery; không lỗi JS |
| Drag | Desktop/mobile touch, thả sai, cancel/blur, click thay thế, không tăng sao truyện; không lỗi JS |
| Speech | Đủ 8 chương, câu/lựa chọn, hint, mute, stop/blur, callback lỗi, thiếu giọng rồi thử lại; API giọng mock |
| Admin browser | Form chapter/quest/lesson/NPC/asset, review và full export; API fixture riêng |
| Chương 1 browser | Desktop/mobile đầy đủ, partial reload/replay, save legacy/future/corrupt, touch ≥44 CSS px, landscape; không lỗi JS |
| Stack browser | MySQL/phụ huynh, vé riêng, save scoped, avatar 2/tóc 1/khăn 3, portal/nhà/emote và offline gỡ hook server; không lỗi JS |

Mẫu chương 1 bản cuối trên AMD Radeon: 60,14 FPS, p95 16,9 ms, 68 draw calls, JS heap 62,65 MB. Đây là mẫu ngắn trên một GPU; không suy ra kết quả Intel/điện thoại thật hoặc RAM toàn tiến trình.

Stack Low/Medium/High đo p95 16,9/16,9/17 ms, shading scale 0,75/0,9/1, JS heap khoảng 43,5–46,9 MiB. Session có tổng resource transfer khoảng 35,53 MiB sau mở avatar/tóc; không phải dung lượng tải ban đầu.

### Sửa lỗi trong quá trình QA

Đã sửa label form để tên truy cập không thay đổi theo nội dung textarea, tăng cửa sổ nhịp cho trẻ nhỏ và rút hướng dẫn Ô ăn quan về hai dòng để hết clipping. Drag test chờ trạng thái input/ghost và UI thật thay vì giả định frame đã xử lý sự kiện. Một lượt chương 1 nhầm cổng mặc định 8080 đã dừng, chạy lại đúng GAME_WEB_URL=38080 đạt. API test trong sandbox gặp uv_os_get_passwd; chạy lại ngoài sandbox đạt. Không tính các lượt lỗi này là pass.

Hồi quy shipped-pack phát hiện admin đọc lại câu mặc định khi runtime được import qua module khác trong tsx. Đã gom getter câu hiện hành vào LessonCatalog, kiểm tra GET và export cùng đọc prompt đã import; suite MySQL cuối đạt cả năm test.

Gói fixture import --draft --check đạt 8/90/6/24; --check release từ chối draft trước ghi. Không import fixture vào resource thật. Screenshot/report trong temp của từng suite và apps/admin/temp đã xem mẫu avatar/mobile, NPC/ao/scenery, Ô ăn quan/mê cung và form admin. Dữ liệu fixture không được duyệt để phát hành.

Còn gate người biên tập, nguồn/license art, thử trẻ có giám sát, Intel/mobile thật, soak mạng, Docker/VPS. Máy hiện tại không có Docker; chưa deploy. Nội dung vẫn draft; giọng mock không chứng minh âm thanh thực nghe được.


## Đọc thoại và bài học đủ tám chương — 10/10/2026

Chương 2–8 có nút Nghe/Dừng đọc ở hội thoại, câu hỏi bài học và luật/gợi ý mini game. Bài học đọc cả các lựa chọn theo thứ tự, không tiết lộ đáp án đúng. Dùng chung `SpeechReader` với chương 1: chỉ đọc khi bật âm thanh, chọn giọng tiếng Việt (ưu tiên giọng local), tốc độ 0,85; thiếu API/giọng hoặc lỗi engine có thông báo. Có thể bấm lại khi danh sách giọng tải xong.

Đóng/đổi bảng, gợi ý, chuyển câu, blur/hide và dispose dừng đọc; callback cũ sau khi hủy không ghi lên bảng mới. Việc nghe không đổi tiến độ hoặc nhận thưởng. Không thêm file âm thanh hay dịch vụ đọc thoại ngoài.

- Strict TypeScript, 38 nhóm test client và Cocos build đạt; `.meta` của module mới do Creator import.
- `test:speech` đạt: click đọc hội thoại cả tám chương, bài học/lựa chọn, luật trò chơi; mute, thiếu giọng rồi thử lại, lỗi callback, dừng/blur và touch Android giả lập. Không có lỗi JavaScript. Fixture hoàn thành chương 1 và completion qua engine dùng để mở các bảng, không thay thế nghiệm thu gameplay tám chương.
- Speech API trong test được giả lập: đã xác nhận nội dung gửi, lang/rate và lifecycle; chưa xác nhận âm thanh nghe được hoặc chất lượng giọng tiếng Việt trên máy/điện thoại thật. Ảnh desktop/mobile và report ở `temp/speech-qa` đã xem trực tiếp.
- `test:m2` trên stack cổng 38080 đạt: toàn luồng chương 1 desktop/mobile, lưu và reload giữa bài, replay, sao duy nhất, giữ save legacy/future và phục hồi save lỗi. Không có lỗi JavaScript; mẫu AMD p95 17 ms. Lượt đầu ở server cũ cổng 8080 lỗi HTTP; chạy lại trên stack đang dùng đã đạt.

Còn thiếu chỉnh tóc riêng và nghiệm thu thiết bị thật. Các mục dưới ghi kết quả các đợt trước.

## Biểu cảm avatar — 10/10/2026

Người lớn → Chọn nhân vật có nút Vẫy chào/Vui mừng. Bàn tay vẫy dùng Graphics; vui mừng nhún sprite và khăn, thêm đốm sáng. Đây là animation bằng code trên sprite idle hiện tại, chưa phải bộ sprite cử chỉ vẽ riêng. Chạy 1,6 giây, dừng khi di chuyển, không đổi tọa độ/collision/save/tiến độ.

- Strict TypeScript, 36 nhóm test client, build Cocos và 4 test server đạt. Test thời gian hữu hạn, hết hạn, hủy khi di chuyển; server chỉ nhận emote có sẵn, giới hạn 2 giây và tôn trọng chặn bạn.
- `test:avatars`: cả bốn avatar chạy hai biểu cảm, kết thúc trả sprite/khăn về vị trí gốc, không đổi tọa độ; chọn vẫy chào bằng touch trên Android giả lập. Các kiểm tra phụ kiện, reload, tám hướng và remote avatar vẫn đạt.
- `test:stack`: UI phát vui mừng sau phản hồi server; SDK peer từ hồ sơ thứ hai gửi hello/happy, browser nhận và chạy animation remote. Sau chọn offline, nút vẫy chào chạy local. Không có lỗi JavaScript. Ảnh ở `temp/avatars-qa/gesture-*.png` và `temp/stack-qa/remote-*.png`.

Còn thiếu chỉnh tóc riêng và nghiệm thu điện thoại thật. Các mục bên dưới ghi kết quả từng đợt trước.

## Khăn quàng độc lập — 10/10/2026

Người lớn → Chọn nhân vật → Chọn khăn quàng: không dùng khăn, đỏ, xanh hoặc vàng. Khăn vẽ bằng Cocos Graphics, gắn ở cổ theo tám hướng và nhịp bước; dùng được với cả bốn avatar. Save cũ thiếu phụ kiện mặc định không khăn; mã không hợp lệ về 0. Xóa sổ chương 2–8 giữ lựa chọn. Tiến độ từ server không ghi đè phụ kiện local.

- Strict TypeScript và 35 nhóm test client đạt, gồm migration/normalization và reset khi storage lỗi.
- Bốn test server đạt; kiểm mã phụ kiện không hợp lệ, đồng bộ giữa hai client và packet cũ giữ lựa chọn.
- Cocos build và `test:avatars` đạt: click bốn lựa chọn, reload, tám hướng di chuyển, chọn khăn bằng touch trên mobile Android giả lập, nhận phụ kiện remote qua production Colyseus. Không có lỗi JavaScript. Ảnh và JSON tại `temp/avatars-qa`.

- `test:stack` chạy lại trên MySQL local đạt: UI hồ sơ chọn avatar 2/khăn 3, state phòng riêng nhận đúng cả hai; portal, nhà, emote, tiến độ server và offline fallback đạt. Không có lỗi JavaScript; mẫu AMD Low/Medium/High p95 ≤17 ms.

Chưa có chỉnh tóc riêng hoặc animation vẫy tay/vui mừng; mobile hiện kiểm bằng giả lập.

## Avatar bé trai/bé gái — 10/10/2026

Bổ sung `boy-blue.png`, `girl-pink.png`, `girl-yellow.png` (mỗi sheet 8 hướng × idle/hai bước chân), giữ sheet bé trai áo đỏ gốc. Menu Người lớn → Chọn nhân vật có bốn preview và dấu chọn. Không nhuộm màu da hoặc thêm nơ Graphics lên boy. Avatar IDs 0–3 và save version giữ nguyên; lựa chọn lưu theo campaign/profile. Nhân vật remote dùng cùng sheet/avatar ID; tên màu xanh giúp nhận ra bạn online.

- Client strict, 34 nhóm test client, Cocos build và 4 test server: đạt.
- Server kiểm avatar là integer 0–3; gói tin cũ thiếu avatar giữ lựa chọn trước đó. Test hai client xác nhận thay avatar 2 → 3 được đồng bộ, mã 99 không làm đổi state.
- `test:avatars`: UI chọn đủ bốn avatar bằng click; mỗi lựa chọn sống qua reload; input bàn phím kiểm đứng/đi cả tám hướng; mobile Android giả lập chọn bằng touch với nút ≥44 CSS px. Browser khác nhận đúng avatar/hướng/idle hoặc walk qua production server Colyseus riêng. Không có lỗi JavaScript. Ảnh menu/nhân vật/mobile/online và JSON tại `temp/avatars-qa` đã được xem trực tiếp.
- `test:stack`: phòng riêng có vé phụ huynh chọn bé gái, server state và SpriteFrame cùng avatar 2; các kiểm tra portal/nhà/emote/offline fallback vẫn đạt. Mẫu AMD Radeon Low/Medium/High có p95 17 ms; tổng resource tải cold khoảng 29,27 MB trong session. Đây chưa là nghiệm thu điện thoại thật hoặc Intel HD/UHD.

Đợt này chưa thêm trình chỉnh tóc/phụ kiện độc lập hoặc animation vẫy tay/vui mừng. Bộ mới có idle/walk hai bước như baseline. Prompt dùng built-in imagegen và đường dẫn asset ghi trong [ART.md](ART.md).

## Asset NPC và ao sen — 10/10/2026

Tám PNG alpha được tạo bằng built-in imagegen và lưu trong `assets/resources/village`: `elder`, `co-tam`, `teacher`, `market-lady`, `potter`, `ti-na`, `hang-cuoi`, `lotus`. Creator import `.meta` thật. Sprite thay Graphics cho Ông Đồ và sáu điểm NPC trong Sổ làng; ba cụm sen trang trí mặt ao. Hai cặp nhân vật có vùng chạm rộng theo sprite. Cô Giáo Lan/Nghệ Nhân Gốm dịch sang ô đất gần đó để tránh cây/mái nhà che hình; điểm trường học và model collision client/server đồng bộ.

- `check:client`, 34 nhóm test client, build Cocos và 4 test server: đạt.
- `test:assets`: xác nhận SpriteFrame thật cho mọi NPC và ba cụm sen; click cả bảy điểm NPC mở hội thoại, gồm click lệch tâm ±45 px ở hai cặp nhân vật. Không có lỗi JavaScript. Ảnh từng khu và report ở `temp/assets-qa`; đã xem trực tiếp ảnh trong renderer để kiểm tra nền alpha, tỉ lệ và tình trạng che khuất.
- `test:m2` trên bản cuối: đạt toàn luồng desktop/mobile giả lập, lưu/reload/replay, sao duy nhất và recovery save. Mẫu AMD Radeon: 60,11 FPS, p95 17 ms, 65 draw calls, JS heap 83,02 MB. Asset mới làm tăng dung lượng/chi phí bộ nhớ; mẫu ngắn này chưa xác nhận điện thoại thật hoặc Intel HD/UHD.
- Các sprite NPC mới là idle tĩnh; chưa có animation walk/gesture riêng. Cụm sen không tạo tương tác hoặc đổi collision ao. Prompt và nguồn tạo ảnh ở [ART.md](ART.md).

## Giữ tiến độ khi bộ nhớ lỗi — 10/10/2026

`CampaignSave.resetLaterChapters` chỉ thay tiến độ trong phiên sau khi ghi thành công cả bản sao trước xóa và save mới. Nếu một bước ghi thất bại, giữ nguyên tiến độ trong phiên và save đang dùng. Khôi phục save lỗi giữ bản `.recovery` đầu tiên; dữ liệu lỗi mới nằm trong `.recovery.latest`. Nếu không ghi được bản phục hồi, phiên không ghi đè raw save.

Client strict và 34 nhóm kiểm thử đạt; build Cocos đạt. Các test mới kiểm tra lỗi ghi backup, lỗi ghi save chính, reset thành công giữ setting và bảo toàn bản phục hồi đầu tiên.

`test:campaign` chạy trên Cocos build thật: hoàn thành 12 mini game và đủ 8 sao; giả lập `QuotaExceededError` khi ghi save chính trong thao tác xóa từ giao diện phụ huynh, kiểm tra tiến độ trong phiên và localStorage giữ nguyên, reload vẫn đủ 8 sao. Kết quả `failedResetPreservesProgress: true`, không có lỗi JavaScript; report ở `temp/campaign-qa/report.json`. Lỗi bộ nhớ được giả lập, không phải đo ổ đĩa đầy trên thiết bị thật.

## Kiểm tra lại bản tám chương — 09/10/2026

Môi trường: Node.js 22.14.0, Cocos Creator 3.8.8, Chrome headless/WebGL D3D11 trên AMD Radeon. Phiên bản Node khuyến nghị trong README vẫn là 24.13+.

- Client strict và 31 nhóm kiểm thử: đạt. Test mới kiểm tra kết quả từng câu rải hạt, chặn trả lời thêm khi đang xem kết quả và hiển thị câu cuối trước huy hiệu trong demo.
- Build Cocos web, API và admin: đạt; server build và 4 integration test: đạt, gồm phòng riêng/authorization/result/emote và tải 10/16/20 client.
- API: 2 test đạt bằng SQLite in-memory; test MySQL được bỏ qua khi chưa có cấu hình. Sau khi provision MySQL local bằng helper, `test:mysql` đạt cả 3 test, gồm API và rollback/20 transaction đồng thời/Unicode/reconnect trên database `_test` riêng.
- Browser demo: đạt luồng thu hoạch/đếm/rải hạt/huy hiệu, cảm ứng, reload và hai người chơi leave/reconnect. Ảnh `temp/release-qa/sowing-final-result.png` xác nhận kết quả cuối cùng và nút **Nhận huy hiệu**.
- Browser Chương 1: đạt desktop/mobile, reload giữa trồng/đếm/replay, sao duy nhất, legacy migration và save future/corrupt.
- Browser campaign: hoàn thành chương 2–8, đủ 12 mini game và 8 sao; reload mỗi chương giữ tiến độ, không có lỗi JavaScript. Chương 1 được kiểm tra riêng bằng `test:m2`.
- Browser phụ huynh/game/MySQL: đạt đăng ký/cấp vé, phòng riêng, save theo profile, tiến độ server, portal/nhà/emote và offline fallback. `test:stack` xóa tài khoản thử sau khi chạy.

Demo đo khoảng 60,04 FPS, p95 17 ms, 48 draw calls. Chương 1 khoảng 60,26 FPS, p95 16,9 ms, 63 draw calls. Stack Low/Medium/High đều có p95 17 ms trong mẫu ngắn. Không dùng các mẫu AMD này để xác nhận Intel HD/UHD, điện thoại thật hoặc soak 30 phút.

Dependency được cài lại từ lockfile. Cấu hình local sinh trong `.env.local` bị ignore; không ghi credential vào báo cáo/Git. Test MySQL chỉ reset database `_test`; không migration hoặc reset dữ liệu legacy trong đợt này.

Đợt tiếp theo: validator chapter pack từ chối phần tử null/primitive, questTitles dạng array, văn bản trống và title vượt giới hạn API; kiểm tra toàn gói trước khi thay nội dung. Client strict và 32 nhóm test đạt, bao gồm kiểm tra dữ liệu lỗi không gây exception hoặc cập nhật dở dang.

## Kết quả baseline playable — lịch sử

Ngày kiểm tra: 09/10/2026. Cocos Creator 3.8.8, Node.js 24, Chrome headless/WebGL D3D11 trên AMD Radeon tích hợp.

- TypeScript client strict và server build: đạt.
- Client: 17 nhóm kiểm thử đạt (1.600 tile round-trip, A* so với BFS, collision, input, camera, scene, nhiệm vụ và lưu tiến độ).
- Server: 3 kiểm thử đạt, gồm hai client đồng bộ/thoát, chống teleport và kết nối bản JavaScript production trong tiến trình riêng.
- Bản web Cocos thực tế: hoàn thành thu hoạch → đếm → rải hạt → huy hiệu; kiểm tra trả lời sai và khôi phục tiến độ sau reload.
- Browser giả lập Android: joystick, touch tương tác NPC, đóng hội thoại và xoay ngang đạt.
- Hai browser online: đồng bộ di chuyển, xóa người đã thoát và tự vào lại phòng đạt; không có lỗi JavaScript.

Hai lần đo trong 5 giây ở viewport 1280 × 720: khoảng **60 FPS**, p95 **16,9 ms**, **48 draw calls**, JS heap khoảng **34–39 MB**, 20 chunk terrain đang hiển thị. Đây là mẫu đo ngắn trên AMD Radeon, chưa xác nhận Intel HD/UHD hoặc điện thoại vật lý. Không dùng kết quả này để khẳng định mọi thiết bị đạt 60 FPS.

Ảnh kiểm tra và báo cáo JSON được tạo tại `temp/release-qa/` khi chạy `npm run test:web`; thư mục sinh tự động không đưa vào Git. Hướng dẫn chạy ở [PLAYABLE-VILLAGE.md](PLAYABLE-VILLAGE.md) và README root.

Scene và các `.meta` có sẵn được giữ nguyên trong đợt mở rộng này; asset mới được Cocos CLI import thật. Công cụ điều khiển giao diện Windows không khởi tạo được trong môi trường hiện tại, nên thao tác GUI Editor chưa được kiểm tra tự động. Không có điện thoại kết nối ADB để nghiệm thu phần cứng. Không commit hoặc push các thay đổi mới.
