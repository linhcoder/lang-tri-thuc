# Hành trình 100 cấp và hồ sơ học sinh

## Sửa kéo đối tượng trong bản đồ admin — VPS 15/10/2026

Release `scene-drag-84ae6b0-20261015`, source `84ae6b0`: nút chuyển NPC/vật thể nằm trong vùng toàn màn hình; kéo được đối tượng đang chọn dù ở chế độ kéo nền. Chọn từ danh sách tự bật chế độ chọn. Kiểm tra local và HTTPS desktop/mobile đạt. Chi tiết tại [ADMIN_SCENE_LAYOUT](ADMIN_SCENE_LAYOUT.md).

## Chỉnh vị trí và kích thước vật thể — VPS 15/10/2026

Admin **Bản đồ NPC → Cây, nhà và sân chơi** hỗ trợ chọn/kéo vật thể, kéo góc đổi kích thước, nhập tọa độ/rộng/cao, giữ tỉ lệ, hoàn tác/làm lại, lưu bản nháp và xuất bố trí. Gói bố trí được kiểm tra lối đi trước khi dựng game/backend/rooms cùng nhau. Release `scene-layout-c379c7f-20261015`, source commit `c379c7f`; kiểm tra desktop/mobile và HTTPS đạt. Hướng dẫn tại [ADMIN_SCENE_LAYOUT](ADMIN_SCENE_LAYOUT.md).

## Nghệ Nhân Gốm theo ảnh — VPS 15/10/2026

Nghệ Nhân Gốm giữ nét mặt, kính chữ nhật và tóc theo ảnh tham chiếu, mặc áo nâu xắn tay và tạp dề làm gốm. Nhân vật dùng atlas riêng khi đứng/đi/chào. Release hiện tại `potter-1a05ffb-20261015`, source commit `1a05ffb`, contentVersion `d92c670c`. Chi tiết tại [POTTER_REFERENCE](POTTER_REFERENCE.md).

## Cô Giáo Lan theo ảnh — VPS 15/10/2026

Cô Giáo Lan giữ nét mặt, kính tròn và tóc tết theo ảnh tham chiếu, mặc áo dài xanh nhạt và quần trắng. Nhân vật dùng atlas riêng khi đứng/đi/chào. Release hiện tại `teacher-lan-6870386-20261015`, source commit `6870386`, contentVersion `d92c670c`. Chi tiết tại [TEACHER_LAN_REFERENCE](TEACHER_LAN_REFERENCE.md).

## Bà bán hàng theo ảnh — VPS 15/10/2026

Bà bán hàng giữ nét mặt và tóc theo ảnh tham chiếu, mặc áo bà ba tím trầm, quần đen và tạp dề. Nhân vật dùng atlas riêng khi đứng/đi/chào. Release hiện tại `market-lady-fb92eda-20261015`, source commit `fb92eda`, contentVersion `d92c670c`. Chi tiết tại [MARKET_LADY_REFERENCE](MARKET_LADY_REFERENCE.md).

## Cô Tấm và Bác Nông Dân theo ảnh — VPS 15/10/2026

Cô Tấm giữ nét mặt và tóc theo ảnh tham chiếu, mặc áo tứ thân và váy dân gian; Bác Nông Dân giữ bản áo nâu, quần lao động. Cả hai dùng atlas riêng khi đứng/đi/chào. Release hiện tại `co-tam-bfa9954-20261015`, source commit `bfa9954`, contentVersion `d92c670c`. Chi tiết tại [CO_TAM_REFERENCE](CO_TAM_REFERENCE.md).

## Bác Nông Dân theo ảnh tham khảo — VPS 15/10/2026

Đã thay Bác Nông Dân bằng atlas riêng theo ảnh người dùng. Bản sửa v2 chỉ giữ mặt/kính/tóc từ ảnh, mặc áo nâu, quần tối màu và dép nông dân, đủ tám hướng và ba hàng đứng/bước đi/vẫy chào. Release `farmer-workwear-1bc07ed-20261015`, commit `1bc07ed`, contentVersion `d92c670c`. QA HTTPS 24 frame và desktop/mobile ngang đạt, page errors rỗng; backup/restore và hai API MySQL đạt, tài khoản QA đã xóa. Ảnh, prompt và chi tiết tại [FARMER_REFERENCE](FARMER_REFERENCE.md).

## Ghi nhớ đăng nhập và chuyển học sinh — VPS 15/10/2026

Game lưu phiên phụ huynh và học sinh đã chọn trên trình duyệt. Lần mở sau, API kiểm tra phiên và quyền sở hữu hồ sơ rồi tự vào học sinh gần nhất. Đăng nhập từ game xin phiên ghi nhớ tối đa 30 ngày; phiên cũ giữ hạn hết hiệu lực đã cấp. Phiên đăng nhập thông thường vẫn có hạn tám giờ. Đăng xuất thu hồi token trên máy chủ và xóa phiên/học sinh ghi nhớ trên cả localStorage và sessionStorage. Phiên bị thu hồi hoặc hết hạn chuyển về yêu cầu đăng nhập lại.

Trong game, mở **Cài đặt → Đổi học sinh / hồ sơ** để chọn bé khác, thêm hoặc sửa hồ sơ, hay đăng xuất. Chuyển học sinh mở danh sách thay vì tự vào lại bé cũ; học sinh được chọn tiếp theo trở thành lựa chọn cho lần mở sau. Tiến độ tiếp tục dùng khóa riêng theo mã hồ sơ và kiểm tra sở hữu từ API. Hồ sơ đã bị xóa hoặc chưa hoàn thiện không tự khởi động. Đã triển khai trong release `ground-materials-b08555b-20261015`; QA HTTPS phiên 30 ngày, reload tự vào A, chuyển B và reload nhớ B đạt. Chi tiết tại [GROUND_MATERIALS](GROUND_MATERIALS.md).

Kiểm tra: API xác nhận phiên phụ huynh 30 ngày, phiên quản trị tám giờ và thu hồi token; `npm run test:student-session` kiểm tra mở context trình duyệt mới, tự vào bé gần nhất, chuyển A/B, reload nhớ B, đăng xuất và fallback khi phiên bị thu hồi. Test client, TypeScript và build Cocos đạt; QA hành trình đầy đủ kiểm tra lại luồng reload tự vào game.

## Thiết kế mới toàn bộ cảnh vùng — VPS 15/10/2026

Mười vùng hành trình có mười ảnh cảnh chính mới, sinh độc lập, không dùng chung nhà/đình/cây đa để thay thế cảnh vùng khác. Bộ PNG alpha riêng nằm trong `assets/resources/village/journey-regions-v1/`; thông tin, prompt và checksum tại [JOURNEY_REGION_ASSETS](JOURNEY_REGION_ASSETS.md). Đã triển khai release `journey-regions-546c4ff-20261015`, source commit `546c4ff`, contentVersion `d92c670c`. QA HTTPS đủ 10 texture riêng trên desktop/mobile ngang, page errors rỗng; backup/restore và hai API MySQL đạt, tài khoản QA đã xóa. Mục Bản đồ bên dưới mô tả lần mở rộng trước khi có bộ hình riêng.

## Chọn nhân vật từ assets — VPS 15/10/2026

Màn hồ sơ và phần chọn nhân vật trong game dùng avatar 0 cho mẫu áo đỏ sao vàng, avatar 1 cho mẫu áo xanh–trắng. Cả hai dùng atlas có sẵn trong `web/characters` cho xem trước, HUD và hoạt ảnh tám hướng; dùng được ở cả ba nhóm tuổi, không đổi độ khó bài học hoặc ID đã lưu. Hình vẽ sẵn giữ tóc và màu da của mẫu, các nhân vật còn lại vẫn hỗ trợ tùy chỉnh tóc/da. Nếu tải ảnh lỗi, game dùng hình dự phòng.

Đã triển khai release `character-assets-8eb9f85-20261015` từ commit `8eb9f85`, build `web-desktop`, contentVersion `d92c670c`. Overlay 12 file, SHA-256 `a95878c515d9fd231fa252db3b65aa4c2f85ea48d1dc853ac2591251e9ac8d3a`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T194401Z.sql` đã phục hồi thử khớp dữ liệu; giữ release `red-star-boy-d92c670c-20261015` để rollback. Hai API health MySQL đạt, CMS không đổi. TypeScript, test client và build Cocos đạt. QA HTTPS đạt chọn mẫu xanh–trắng, lưu avatar vào hồ sơ MySQL, 24 khung hoạt ảnh, cả hai bộ hình qua nhóm tuổi, HUD tên học sinh, desktop/mobile ngang, không có page error. Đã xem ảnh mobile và atlas; tài khoản QA đã xóa. Báo cáo local ignored: `temp/deploy/qa/character-assets-live/`. QA API/quyền quản trị và chặn phòng không vé đạt.

## Nhân vật bé trai áo đỏ sao vàng — 15/10/2026

Release hiện tại `red-star-boy-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`. Bé trai nhóm 6–8 tuổi chọn avatar 0 có hình vẽ theo ảnh tham khảo và concept `docs/design/characters/boy-6-8-red-star-concept-v1.png`. Atlas `apps/game-client/web/characters/boy-red-star-6-8-v1.png` gồm tám hướng, một hàng đứng và hai hàng bước đi. Cắt hàng theo các rãnh thực tế, chuẩn hóa khung 96×128 và đặt chân cùng đường chuẩn; dùng chung trong làng, HUD và xem trước. Màn hồ sơ ghi “Áo đỏ sao vàng”. Giữ avatar ID cũ, không đổi cấu trúc dữ liệu. Hình painted dùng tóc/màu da mặc định; tùy chỉnh tóc hoặc da dùng fallback vẽ với áo đỏ sao vàng. Nhóm tuổi và avatar khác giữ hình hiện có.

Overlay 15 file, SHA-256 `f4122498242f76f74ed8be75e359514d75e994e9b12be04db3bc4a2786d2759b`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T184047Z.sql` đã phục hồi thử đạt. Giữ release `level100-students-d92c670c-20261015` để rollback. Hai API health MySQL đạt; CMS manifest và nội dung không thay đổi. QA local TypeScript, client logic/lifecycle và Cocos desktop/mobile đạt; kiểm 24 frame, hình xem trước, tên HUD và phân biệt tuổi/avatar, không có page error. Artifact local `apps/game-client/temp/red-star-qa/`.

Luồng chơi web: đăng nhập tài khoản phụ huynh → chọn học sinh → hoàn thiện tên, nhóm tuổi, giới tính và trang phục nhân vật → vào làng. Hồ sơ cũ thiếu giới tính được đưa về màn hình chỉnh sửa. Mỗi tài khoản giữ tối đa tám hồ sơ theo giới hạn hiện có.

## Tiến độ

- Cấp bắt đầu: 1; cấp tối đa: 100; mỗi 100 XP tăng một cấp.
- Nhiệm vụ truyện hoàn thành: 20 XP; sao truyện: 100 XP.
- Trò luyện tập hoàn thành lần đầu: 50 XP; góc làng khám phá lần đầu: 20 XP; hoạt động mở rộng hoàn thành lần đầu: 100 XP.
- Một thử thách hành trình gồm ba câu hỏi, thưởng 100 XP sau khi trả lời đúng cả ba. Đáp án sai và trả lời lại không tạo thêm XP.
- 100 thử thách chia vào mười vùng. Độ khó câu hỏi theo nhóm tuổi 3–5, 6–8 hoặc 9–11. Bài toán thay đổi theo thử thách; các kỹ năng khác dùng ngân hàng bài học hiện có.
- XP được suy ra từ thành tích đã lưu. Không lưu một trường XP tùy ý. Tám chương và tám sao truyện vẫn giữ nguyên.
- Huy hiệu thử thách được ghi bằng danh sách hoàn thành. Cấp mới mở các tuyến thử thách và cổng vùng; chưa bổ sung bộ vật phẩm riêng cho từng cấp.

## Bản đồ

Hành trình gồm làng khởi đầu, trường học, nông trại, chợ quê, làng nghề, rừng, sông nước, đồi khoa học, phố văn hóa và đảo tri thức. Các tuyến lần lượt mở ở Lv.1, 11, 21, 31, 41, 51, 61, 71, 81 và 91.

Bản đồ tăng từ 48×48 lên 72×72 ô; bổ sung bốn mốc cảnh quan, đường nối và biển tên tương tác cho rừng, đồi khoa học, phố văn hóa và đảo tri thức. Cảnh quan tái sử dụng nhà, đình và cây đã vẽ trong bộ hình của làng, kết hợp biểu tượng riêng cho từng vùng. Các tòa nhà mới có footprint cản di chuyển. Menu bản đồ và cổng chuyển vùng kiểm tra cấp; người chơi vẫn có thể đi bộ khám phá địa hình trước khi mở thử thách.

## Hồ sơ và lưu trữ

HUD lấy tên từ hồ sơ đang chọn. Nhân vật dùng bộ vẽ hiện có, với tỉ lệ và trang phục theo nhóm tuổi; lựa chọn trang phục được lọc theo giới tính nhân vật. Người chơi trong phòng riêng nhận tên và nhóm tuổi từ backend.

Trang phục thay đổi trong game được đồng bộ riêng vào hồ sơ, giữ nguyên tên và nhóm tuổi.

Lưu cục bộ tách theo mã học sinh. Phiên solo đồng bộ cả chương đầu và campaign về backend bằng revision; khi có xung đột, giữ bản trên máy và yêu cầu tải lại. Revision cục bộ cho phép tiếp tục bản lưu chưa kịp đồng bộ khi server chưa thay đổi. Bản lưu cũ được chuyển sang hệ thống cấp mới bằng cách tính XP từ các thành tích cũ. Với bản chơi chưa có tài khoản, màn hình chọn học sinh có lựa chọn nhập tiến độ cũ vào một hồ sơ chưa có tiến độ cloud; bản gốc vẫn được giữ. Backup trước khi tải bản cloud nằm ở hậu tố `.before-cloud`.

Lịch sử học tập và hành trình đã lưu được mang theo khi vào phòng cùng bạn. XP lịch sử được ghi bằng mã thành tích hợp lệ và khử trùng lặp, giúp giữ cấp mà không trao lại sao cốt truyện. Các câu trả lời mới trong phòng riêng được game server kiểm tra. Sao cốt truyện của phòng riêng vẫn do server xác nhận; bản lưu solo không tự nhận sao trong phòng.

## Kiểm tra

`npm run check:client`, `npm run test:client`, `npm run test:api`, `npm run test:server`, `npm run web:build` và `npm run test:level-journey`.

Bài kiểm tra hành trình mô phỏng đủ 100 thử thách cho cả ba nhóm tuổi, kiểm tra thưởng một lần, phục hồi tiến độ cũ, đường đi tới các vùng mới, quyền sở hữu và cách ly hồ sơ. Bài trình duyệt kiểm tra đăng nhập, tên trên HUD, hồ sơ tuổi/giới tính, tăng cấp, tải lại, đổi học sinh và bố cục desktop/ngang điện thoại.

Đã phát hành lên VPS tại https://ltt.vui-hoc.xyz/game/; thông tin release bên dưới.

## Triển khai VPS — 15/10/2026

Release `/opt/lang-tri-thuc/releases/level100-students-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`, game https://ltt.vui-hoc.xyz/game/. Source working tree được đóng gói đầy đủ; 43 file khác release trước được tải bằng overlay sau khi đối chiếu SHA-256 từng file. Overlay SHA-256 `769465ccf15c78da1f29ffe832a4340a0b17fb676352fa29f8b675248fe81420`. `package-lock.json` được npm prune cập nhật trên Linux.

Backup `/opt/lang-tri-thuc/backups/database-20261014T181651Z.sql` đã phục hồi thử và khớp dữ liệu. Giữ release `schoolyard-mobile-e5d974a-20261014` để rollback ứng dụng. Hai API và hai rooms active; cả hai API health MySQL/version đạt. CMS được nâng compatibility sang bản mới, NPC không thay đổi; manifest mới `9526d4b358c398958d5b83d7beb1a45fe8ad475c3eb6e3b5caf15ce3e060c1f4`.

QA HTTPS quản trị/CMS, chặn API nội bộ và phòng không vé đạt. QA signed WebSocket đạt tên/tuổi/nhân vật, câu trả lời hành trình do server xác nhận và đọc lại tiến độ MySQL. Tài khoản QA đã xóa. Thông tin mật khẩu QA local là JSON string có dấu nháy; cần giải mã trước khi đăng nhập.

QA trình duyệt HTTPS đã đạt đăng nhập bắt buộc, tên bé chính xác, ba nhóm tuổi/giới tính, thưởng cấp một lần, tiến độ MySQL và trang phục sau reload, cách ly học sinh, bốn khu mới, desktop/mobile ngang và logout; page errors rỗng. Báo cáo/ảnh local ignored `temp/deploy/qa/level100-live/`. Cleanup sau logout cần đăng nhập lại tài khoản fixture vì token cũ đã bị thu hồi; đã xác minh và tự xóa qua API.

QA HTTPS cuối cùng đã đạt hình xem trước sau khi ảnh tải xong, 24 khung painted trong Cocos, đúng tên HUD, phân biệt nhóm tuổi/avatar, ảnh làng sau khi splash đóng, desktop/mobile ngang; page errors rỗng. API quản trị/quyền phòng đạt. Tài khoản QA đã tự xóa. Hai lượt đầu bị timeout 10 giây ở request hồ sơ; các lượt cuối GET play/PUT progress đạt và không đổi mã xác thực. Báo cáo/ảnh local ignored `temp/deploy/qa/red-star-live/`.
