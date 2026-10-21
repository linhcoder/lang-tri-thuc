# aaPanel staging: ltt.vui-hoc.xyz

## Thành phố 10+ — VPS 21/10/2026 (hiện tại)

Đã kích hoạt `city-843b7864-20261021`, contentVersion `843b7864`, source `f512735` kèm toàn bộ working tree đã kiểm thử. Game: https://ltt.vui-hoc.xyz/game/; admin: https://ltt.vui-hoc.xyz/. Bốn dự án thành phố/16 bước, tiến độ theo hồ sơ và nâng tương thích CMS đã lên VPS.

Overlay 28 file, SHA-256 `fe5372da37d214b2120880e3c5deceea31b2d6cd8b61e3fbf40a2ebce64a65e4`; đối chiếu checksum, build API/rooms Linux, build admin với URL production và nginx -t đạt. Khôi phục đúng lockfile nguồn sau npm prune. Backup `/opt/lang-tri-thuc/backups/database-20261021T153152Z.sql` đã phục hồi thử khớp và xóa DB thử.

Hai API MySQL trả version mới, bốn services active. HTTPS/UI desktop 1600×900 và mobile 844×390 đạt bốn dự án/16 bước, đáp án sai không chuyển bước, nút không chồng nhau và không page error. Signed WebSocket hai client đạt đồng bộ, xác thực lượt chơi, lưu nhiệm vụ thành phố/checkpoint/trang trí/gốm vào MySQL, cách ly hồ sơ. Tài khoản QA đã xóa; ba hồ sơ thật, tiến độ, bản đồ published/draft và nội dung quản trị giữ nguyên checksum. Nội dung NPC và từng release CMS cũ được đối chiếu với backup, không thay đổi; active CMS đã nâng base từ `2e57529e` lên `843b7864`.

Gzip chỉ bật trong location `/game/`, xác nhận main JS trả `Content-Encoding: gzip`; backup cấu hình tại `/opt/lang-tri-thuc/backups/nginx-before-city-20261021.conf`. Giữ release trước `all-four-4b4ce2e5-20261020`; khi rollback khác contentVersion cần đưa active CMS về release tương thích trong lịch sử, giữ tiến độ mới, không phục hồi toàn DB đè tiến độ. Bằng chứng ignored: `temp/deploy/city-deploy-state.json`, `temp/deploy/qa/city-live/` và `apps/game-client/temp/phone-qa/summary.json`.

## Checkpoint sân chơi — VPS 20/10/2026

Release lịch sử `regional-checkpoint-4b4ce2e5-20261020`, source commit `aaecb6c`, contentVersion `4b4ce2e5`. Lưu ván sân chơi theo hồ sơ/vùng/tuổi và tải đồng thời hai ảnh khởi động. Chi tiết tại [LEVEL_100_AND_STUDENTS](../../docs/design/LEVEL_100_AND_STUDENTS.md).

Overlay 13 file SHA-256 `76d7f55d513358b4781715c68be3dfd35a98d0b165d1eb39f9fe96e52b5de72d`; checksum, build Linux API/rooms và nginx -t đạt. Backup `/opt/lang-tri-thuc/backups/database-20261020T034325Z.sql` phục hồi thử khớp. Hai API MySQL healthy, bốn dịch vụ active; signed WebSocket xác nhận lưu checkpoint/cách ly hồ sơ, gia đình QA đã xóa. Ba hồ sơ thật, tiến độ và nội dung quản trị/CMS/bản đồ giữ nguyên checksum. Giữ `game-six-4b4ce2e5-20261019` để rollback cùng contentVersion. Các release bên dưới là lịch sử.

QA HTTPS desktop/mobile giả lập đạt sáu nâng cấp và checkpoint qua cloud/reload; dùng API fixture riêng. WebSocket/MySQL thật được kiểm tra bằng hồ sơ QA riêng. Quyền quản trị/nội bộ không phiên đạt. Bằng chứng `temp/deploy/qa/regional-checkpoint-live/`.

## Sáu nâng cấp game — VPS 19/10/2026

Bản hiện tại `game-six-4b4ce2e5-20261019`, contentVersion `4b4ce2e5`: giảm tải lạnh, trợ giúp/dẫn đường nhiệm vụ, tự đọc và nghe lựa chọn, sân chơi theo vùng, bộ sưu tập/kéo trang trí, phân lượt mục tiêu nhóm. Chi tiết tại [LEVEL_100_AND_STUDENTS](../../docs/design/LEVEL_100_AND_STUDENTS.md).

Overlay 26 file SHA-256 `ea35e0e3c4c53a90b7dda291abb687f55aa71885296cd2ed75806845bb436aa8`; checksum, build Linux/nginx và hai API MySQL đạt. Backup `/opt/lang-tri-thuc/backups/database-20261019T051055Z.sql` đã phục hồi thử khớp. HTTPS desktop/mobile, signed WebSocket/phân lượt và lưu MySQL đạt; 3 hồ sơ/tiến độ thật, nội dung quản trị, bản đồ, draft và NPC giữ nguyên. Hồ sơ QA đã xóa. Giữ bản quản trị trước và các manifest CMS cũ để phục hồi theo quy trình bên tài liệu thiết kế. Các release dưới là lịch sử.

## Quản trị thông minh — VPS 19/10/2026

Release đang chạy `admin-smart-verified-2e57529e-20261019`, contentVersion `2e57529e`. Đủ bảy nâng cấp: cần xử lý, theo dõi học sinh, tìm toàn hệ thống/bộ lọc, kiểm duyệt theo lô, lớp kiểm tra bản đồ, phân tích học tập và lịch sử khôi phục. Hướng dẫn, giới hạn dữ liệu và bằng chứng tại [ADMIN_SMART_WORKSPACE](../../docs/design/ADMIN_SMART_WORKSPACE.md).

Bản đầu 25 file; bản chốt 9 file, SHA-256 `bb7887dfb99ac072b8c9d02dfbefef03eb6de6375d017b728f995f5d7f9382b7`. Checksum, build Linux API/rooms, nginx -t và hai API MySQL đạt. Backup `/opt/lang-tri-thuc/backups/database-20261019T032451Z.sql` phục hồi thử khớp. HTTPS desktop/mobile, role protection, preview không ghi nội dung thật, tìm NPC CMS, signed room/MySQL/cách ly hồ sơ đạt. Toàn bộ QA đã xóa; checksum nội dung/draft/map/NPC, 3 hồ sơ và tiến độ cũ giữ nguyên. Giữ `five-upgrades-2e57529e-20261019` để rollback ứng dụng; cùng rules nên không cần đổi con trỏ CMS. Các mục dưới là lịch sử.


## Năm nâng cấp trải nghiệm học — VPS 19/10/2026

Release đang chạy `five-upgrades-2e57529e-20261019`, contentVersion `2e57529e`: tải nền/cache engine, ôn câu sai, tổng hợp lịch sử vượt 200 sự kiện, mười đồ thưởng mốc cấp và trạng thái đồng bộ kèm bản sao khi xung đột. Chi tiết và giới hạn tại [LEVEL_100_AND_STUDENTS](../../docs/design/LEVEL_100_AND_STUDENTS.md).

Overlay 34 file, SHA-256 `c2a0e8e12b0f2a8dde71e3e8e224660dcdafb2a7c031a66a04dbb73647a0a5af`; checksum trước kích hoạt, build Linux API/rooms, nginx -t và hai API MySQL đạt. Backup `/opt/lang-tri-thuc/backups/database-20261019T021347Z.sql` phục hồi thử khớp. Bản đồ/draft/NPC và ba hồ sơ thật giữ nguyên; CMS chỉ nâng manifest sang cặp tương thích đã kiểm thử.

QA HTTPS desktop/mobile, báo cáo 800 lượt qua MySQL/reload, đồ thưởng, bảng tháng quản trị, signed WebSocket/câu hỏi hành trình/hoạt động/cách ly hồ sơ và quyền truy cập đạt. Gia đình QA đã xóa; báo cáo/ảnh ở `temp/deploy/qa/five-upgrades-live/`. Giữ release `free-painting-35eb627f-20261018`; rollback về rules cũ cần chọn lại manifest CMS có `baseVersion=35eb627f` bằng API rollback của bản cũ, giữ nguyên draft/lịch sử. Các release bên dưới là lịch sử.


## Nội thất toàn màn hình và tải dần — VPS 18/10/2026

Release đang chạy `fullscreen-loading-35eb627f-20261018`, source commit `ba14f3b`, contentVersion `35eb627f`. Phòng phủ kín Canvas, camera theo nhân vật, HUD/joystick theo bố cục chung; ảnh khu xa, chuyển động NPC và nội thất tải dần. Overlay 14 file SHA-256 `5fe3520f14f7c74feaa6bbd7c8976ac769d5ac1df6afa38efc6f79cd0a4b7372`; checksum từng file khớp sau khi phục hồi lockfile nguồn bị npm prune viết lại. Build Linux API/rooms và nginx -t đạt.

Backup `/opt/lang-tri-thuc/backups/database-20261018T110357Z.sql` phục hồi thử khớp. Hai API MySQL healthy; checksum bản đồ công bố, bản nháp, CMS và NPC giữ nguyên; sau cleanup còn đúng ba hồ sơ thật. Giữ `interior-art-35eb627f-20261018` để rollback. Metadata local ignored: `temp/deploy/fullscreen-loading-deploy-state.json`.

QA HTTPS năm nhà, tuổi 6–8, trên desktop 1600×900/mobile 844×390 đạt fullscreen, vị trí nút, joystick, tương tác hai ngón, kéo thả, quà, nặn/vẽ và reload. Một lượt mobile gặp lỗi kết nối nhận quà khi chạy các bài WAN đồng thời; chạy riêng lại đạt. QA tải dần trên cả hai viewport đạt khi cố tình giữ request chuyển động NPC: vẫn đi được, nội thất tải khi vào nhà và đảo tải khi tới gần. API/quyền truy cập và signed WebSocket/lưu MySQL/cách ly học sinh đạt; tài khoản QA tự xóa. Ảnh/báo cáo ở `temp/deploy/qa/houses-live/` và `temp/deploy/qa/fullscreen-progressive-*`; trường byte trong báo cáo live chỉ cộng Content-Length có sẵn, không đại diện tổng dung lượng WAN.

## Sprite nội thất — VPS 18/10/2026

Release đang chạy `interior-art-35eb627f-20261018`, contentVersion `35eb627f`, bổ sung 20 sprite nội thất vẽ tay cho năm nhà. Overlay 18 file SHA-256 `3a635323d9af7bff0825aa53adbc79bd1381c541e7e3c8621516479d528b918b`; checksum từng file khớp trước kích hoạt, build Linux API/rooms và nginx -t đạt. Backup `/opt/lang-tri-thuc/backups/database-20261018T100915Z.sql` phục hồi thử khớp.

Hai API MySQL healthy; checksum bản đồ công bố, bản nháp, CMS và NPC giữ nguyên, ba hồ sơ trước deploy không đổi. Giữ `houses-35eb627f-20261018` để rollback. HTTPS/API/quyền truy cập đạt. Metadata local ignored: `temp/deploy/interior-art-deploy-state.json`.

QA HTTPS bản mới đạt năm nhà × ba nhóm tuổi trên desktop 1600×900/mobile 844×390, đủ 20 sprite, kéo thả, nhận quà, thử lại khi mất mạng, nặn/vẽ và reload; không có page error. QA chờ API xác nhận checkpoint trước reload để tránh race WAN. Signed WebSocket hai hồ sơ xác nhận lưu MySQL và cách ly học sinh; toàn bộ gia đình QA tự xóa. Ảnh/báo cáo: `temp/deploy/qa/houses-live/`.

## Nhà riêng và xưởng gốm — VPS 18/10/2026

Release đang chạy `houses-35eb627f-20261018`, contentVersion `35eb627f`; Web/API/rooms đồng bộ. Năm nhà có ảnh ngoại thất riêng, nội thất đi lại được, nhiệm vụ theo tuổi, quà trang trí có xác nhận server và xưởng nặn/vẽ gốm tự do lưu theo học sinh. Chi tiết tại [LEVEL_100_AND_STUDENTS](../../docs/design/LEVEL_100_AND_STUDENTS.md).

Overlay 70 file, SHA-256 `9e301e86da0145062c8ac50af9d45a015d9a799b89aaad6869a40a8ea5a2e888`; từng file đã đối chiếu trước kích hoạt. `npm prune` viết lại metadata lockfile trên Linux; lockfile nguồn được phục hồi đúng từ archive sau build rồi kiểm tra SHA lại. Backup `/opt/lang-tri-thuc/backups/database-20261017T184349Z.sql` phục hồi thử khớp; build Linux API/rooms và nginx -t đạt. Hai API MySQL healthy. Bản đồ công bố, bản nháp, CMS và NPC giữ nguyên checksum; ba hồ sơ thật không đổi. Giữ `navigation-fix-35eb627f-20261016` để rollback ứng dụng.

QA local đủ ba tuổi trên desktop/Android đạt; HTTPS desktop 1600×900 và Android 844×390 đạt năm ảnh/nhà, kéo thả, quà, trang trí, nặn/vẽ và reload MySQL, page errors rỗng. Signed WebSocket hai hồ sơ đạt lưu checkpoint/tác phẩm và cách ly học sinh. Gia đình QA đã được xóa. Báo cáo/ảnh local ignored: `temp/deploy/qa/houses-live/`; metadata triển khai `temp/deploy/houses-deploy-state.json`. Các release bên dưới là lịch sử.

## Sửa điều hướng — 16/10/2026

Release hiện tại `navigation-fix-35eb627f-20261016`, contentVersion `35eb627f`; đóng gói working tree gồm bản sửa điều hướng và nâng tương thích CMS. NPC không tạo tuyến tuần tra từ ô bị chặn; tiếp cận đồ vật ở tọa độ lẻ dùng ô lưới nguyên. Web/API/rooms đã triển khai đồng bộ. Overlay 15 file SHA-256 `8d7947419bef72d6de305607d2ef9faee78ba80e760c8fe5237f6531b60bb07a`, từng file khớp trước kích hoạt. Backup `/opt/lang-tri-thuc/backups/database-20261016T092156Z.sql` phục hồi thử trùng khớp; build Linux API/rooms và nginx -t đạt. Hai API MySQL healthy; giữ NPC CMS, bản đồ công bố và release `reward-art-936d016-20261016` để rollback ứng dụng.

QA HTTPS/quyền truy cập và signed WebSocket/câu trả lời hành trình/lưu MySQL đạt. QA desktop 1600×900/mobile ngang 844×390 xác nhận tiếp cận con gà, tọa độ NPC trùng bản công bố và không có page error; tài khoản QA đã xóa. Ảnh/báo cáo local ignored: `temp/deploy/qa/navigation-live/`. Các release bên dưới là lịch sử.

## Hình ảnh phòng riêng và cây thưởng — 16/10/2026

Release `reward-art-936d016-20261016`, source `936d016`, contentVersion `0d971c1a`. Tạo mới bảy ảnh và tích hợp sprite cho phòng riêng/cây thưởng, tải khi cần. Overlay 49 file SHA-256 `585b2e38f3ed3480a8d254586b323b419f44baae2641e03caa9b5b9b4ebde116`; backup `/opt/lang-tri-thuc/backups/database-20261015T183116Z.sql` khôi phục thử đạt. Hai API MySQL healthy; giữ dữ liệu NPC, bản đồ và hồ sơ. Chi tiết tại [REWARD_ART_PASS](../../docs/design/REWARD_ART_PASS.md).

## Chín nâng cấp game — 16/10/2026

Release `upgrades-3065cfd-20261016`, source `3065cfd`, contentVersion `0d971c1a`. Overlay ban đầu 38 file; bản hoàn thiện gồm 11 file, SHA-256 `461921b977b7c142bdc665fe78fac58853e58921c0182c8c8fd975aad0e84a66`; toàn bộ checksum source/game/admin được đối chiếu trước kích hoạt. Backup `/opt/lang-tri-thuc/backups/database-20261015T175726Z.sql` đã phục hồi thử đạt. Hai API MySQL healthy; CMS NPC được giữ nguyên. Bản đồ công bố là dữ liệu riêng có lịch sử, không cần dựng game cho mỗi lần chỉnh. Chi tiết tại [GAME_UPGRADES_2026_10](../../docs/design/GAME_UPGRADES_2026_10.md).

## Sửa lớp ảnh trường che Cô Giáo Lan — 15/10/2026

Release hiện tại `teacher-depth-a2c06c8-20261015`, source `a2c06c8`, contentVersion `0d971c1a`. Overlay năm file SHA-256 `33080e1acb2166c2220056a73c1f61654cd0f72943578e8e29689074deab6f6b`; source/game/admin checksum khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T162510Z.sql` phục hồi thử đạt, hai API MySQL healthy. Mốc xếp lớp trường tính theo chân tòa nhà thay vì đáy phần sân trong ảnh; bố trí/CMS giữ nguyên. Chi tiết tại [TEACHER_LAN_REFERENCE](../../docs/design/TEACHER_LAN_REFERENCE.md).

## Áp dụng bố trí bản đồ revision 3 — 15/10/2026

Release hiện tại `applied-layout-501aa6a-20261015`, source `501aa6a`, contentVersion `0d971c1a`. Game/rooms dùng đủ 23 vật thể đã lưu ở revision 3. Overlay 10 file SHA-256 `b0be1d8c9e7c845cbe584f435849496806018d13a3161b3da7fab8978cf143eb`; checksum source/game/admin khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T154600Z.sql` phục hồi thử đạt. Hai API MySQL healthy, nội dung NPC CMS đã xuất bản giữ nguyên và snapshot được nâng baseVersion; lịch sử bất biến giữ lại. Chi tiết tại [ADMIN_SCENE_LAYOUT](../../docs/design/ADMIN_SCENE_LAYOUT.md).

## Lưu hàng loạt NPC, ghi chú bố trí tùy chọn — 15/10/2026

Release hiện tại `npc-batch-c10b260-20261015`, source `c10b260`, contentVersion `d92c670c`. Overlay 13 file SHA-256 `bac86990492158a1afa560fb5b4276598de50ebce018861f157c78732e8a75a0`; source/game/admin checksum khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T152311Z.sql` phục hồi thử đạt, hai API MySQL healthy, CMS giữ nguyên. QA local lưu nguyên tử/hoán đổi hai NPC, ghi chú trống và reload đạt; HTTPS giữ nhiều thay đổi, ghi chú tùy chọn, hoàn tác và desktop/mobile đạt. Bản nháp live không bị thay đổi bởi QA; phiên QA thu hồi. Chi tiết tại [ADMIN_SCENE_LAYOUT](../../docs/design/ADMIN_SCENE_LAYOUT.md).

## Sửa kéo đối tượng và chuyển loại trong toàn màn hình — 15/10/2026

Release hiện tại `scene-drag-84ae6b0-20261015`, source `84ae6b0`, contentVersion `d92c670c`. Overlay tám file SHA-256 `961e76a9704f6788ffe60ee9f3be0db38154db3f5485d3e17b9db182efdcbcb2`; source/game/admin checksum khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T145609Z.sql` phục hồi thử đạt, hai API MySQL healthy, CMS giữ nguyên. QA HTTPS toàn màn hình và chuyển sang chỉnh vật thể, đổi kích thước/hoàn tác, desktop/mobile đạt; bản nháp không thay đổi. Giữ release trước để rollback. Chi tiết tại [ADMIN_SCENE_LAYOUT](../../docs/design/ADMIN_SCENE_LAYOUT.md).

## Chỉnh bố trí vật thể — 15/10/2026

Release hiện tại `scene-layout-c379c7f-20261015`, source commit `c379c7f`, contentVersion `d92c670c`. Trình chỉnh cây/nhà/sân chơi lưu bản nháp có revision, xuất gói và áp dụng đồng bộ hình ảnh/va chạm khi build game cùng backend/rooms. Admin build base `/` theo Nginx gốc domain; đã sửa index sau kiểm tra đầu tiên và tạo overlay cuối 28 file SHA-256 `4f8f4b6d4e6946d0f60d942716fa98603e6ba087f22569faabcd2e5b43740e02`. Backup `/opt/lang-tri-thuc/backups/database-20261015T130613Z.sql` phục hồi thử đạt. API MySQL và QA HTTPS admin desktop/mobile đạt; bản nháp live giữ nguyên. Chi tiết và cách áp dụng tại [ADMIN_SCENE_LAYOUT](../../docs/design/ADMIN_SCENE_LAYOUT.md). Các release dưới đây là lịch sử.

## Nghệ Nhân Gốm theo ảnh tham chiếu — 15/10/2026

Release hiện tại `potter-1a05ffb-20261015`, source commit `1a05ffb`, build `web-desktop`, contentVersion `d92c670c`. Nghệ Nhân Gốm dùng atlas riêng theo ảnh với áo nâu và tạp dề làm gốm. Overlay 14 file SHA-256 `5ab82c018e129cef9a2d70b46ac17117e4bc216e04ff766f9ca77c972eee82ee`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T084242Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [POTTER_REFERENCE](../../docs/design/POTTER_REFERENCE.md). Các release dưới đây là lịch sử.

## Cô Giáo Lan theo ảnh tham chiếu — 15/10/2026

Release hiện tại `teacher-lan-6870386-20261015`, source commit `6870386`, build `web-desktop`, contentVersion `d92c670c`. Cô Giáo Lan dùng atlas riêng theo ảnh với kính tròn, tóc tết và áo dài xanh nhạt. Overlay 14 file SHA-256 `36423f260383e19d82efc8141b020a0209e9d92be99fb85e06755fdc4ab263ca`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T083242Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [TEACHER_LAN_REFERENCE](../../docs/design/TEACHER_LAN_REFERENCE.md). Các release dưới đây là lịch sử.

## Bà bán hàng theo ảnh tham chiếu — 15/10/2026

Release hiện tại `market-lady-fb92eda-20261015`, source commit `fb92eda`, build `web-desktop`, contentVersion `d92c670c`. Bà bán hàng dùng atlas riêng theo khuôn mặt tham chiếu với áo bà ba và tạp dề. Overlay 14 file SHA-256 `140dca770cab988f1fb95a54d0f842c984c25c628c5a1408699b4f18179f3dae`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T082245Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [MARKET_LADY_REFERENCE](../../docs/design/MARKET_LADY_REFERENCE.md). Các release dưới đây là lịch sử.

## Cô Tấm theo ảnh tham chiếu — 15/10/2026

Release hiện tại `co-tam-bfa9954-20261015`, source commit `bfa9954`, build `web-desktop`, contentVersion `d92c670c`. Cô Tấm dùng atlas riêng theo khuôn mặt tham chiếu với trang phục dân gian; Bác Nông Dân tiếp tục mặc đồ lao động nâu. Overlay 14 file SHA-256 `6296ab3c74c47794fa330c4310793481ef04aa225ce74135ba0ee74b2670185d`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T081413Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [CO_TAM_REFERENCE](../../docs/design/CO_TAM_REFERENCE.md). Các release dưới đây là lịch sử.

## Trang phục nông dân, giữ mặt tham khảo — 15/10/2026

Release hiện tại `farmer-workwear-1bc07ed-20261015`, commit `1bc07ed`, build `web-desktop`, contentVersion `d92c670c`. Bác Nông Dân mặc áo nâu, quần tối màu và dép; giữ mặt/kính/tóc từ ảnh. Atlas mới đủ 24 frame, tám hướng đứng/đi/vẫy chào. Overlay 13 file SHA-256 `7970a711a537c2f6e9b7e019ba039cf29817730dd9abf1859d97ac9b57af84a9`, checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T080024Z.sql` phục hồi thử đạt. Giữ `farmer-reference-3626919-20261015` để rollback. Hai API MySQL khỏe, CMS giữ nguyên. QA HTTPS desktop/mobile, 24 frame/hướng đứng/vẫy chào/không lật ảnh và API/quyền phòng đạt; page errors rỗng, tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/farmer-workwear-live/`. Chi tiết tại [FARMER_REFERENCE](../../docs/design/FARMER_REFERENCE.md). Các release dưới đây là lịch sử.

## Bác Nông Dân theo ảnh tham khảo — 15/10/2026

Release hiện tại `farmer-reference-3626919-20261015`, source commit `3626919`, build `web-desktop`, contentVersion `d92c670c`. Atlas riêng cho Bác Nông Dân từ ảnh người dùng, 24 frame đứng/bước đi/vẫy chào theo tám hướng. Overlay 14 file SHA-256 `694a3e7d315d696c6a744f6e78b26ed5b3f66bdb123c75eb5aa6557553d2aa1e`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T074244Z.sql` phục hồi thử đạt. Giữ `ground-materials-b08555b-20261015` để rollback. Hai API MySQL khỏe, CMS không đổi. QA HTTPS 24 frame/hướng đứng/vẫy chào, không lật ảnh, desktop/mobile ngang và API/quyền phòng đạt; page errors rỗng, tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/farmer-reference-live/`. Chi tiết tại [FARMER_REFERENCE](../../docs/design/FARMER_REFERENCE.md). Các release dưới đây là lịch sử.

## Texture cỏ/đất và ghi nhớ phiên — 15/10/2026

Release hiện tại `ground-materials-b08555b-20261015`, build `web-desktop`, contentVersion `d92c670c`. Texture cỏ/đất mới từ commit `83a0812`; ghi nhớ đăng nhập/chuyển học sinh từ `43056e4`; sửa thời gian chờ mở hồ sơ từ `b08555b`. Overlay nền 29 file SHA-256 `8690bd5b27fce24b9ceb4ae27cdae12ab14ccde1989439c45f69561b0e0ad043`; overlay cuối ba file SHA-256 `b8159ced9b51027cedecfd1260f7420eb5f95289233d15feca6cc04415b999ba`. Checksum source/Web khớp; backup `/opt/lang-tri-thuc/backups/database-20261015T031737Z.sql` phục hồi thử đạt. Hai API MySQL khỏe, CMS giữ nguyên. QA HTTPS hai texture, mười cảnh desktop/mobile, phiên 30 ngày/reload/chuyển học sinh đạt; page errors rỗng, các fixture đã xóa. Release `ground-materials-83a0812-20261015` và `journey-regions-546c4ff-20261015` giữ để rollback. Chi tiết tại [GROUND_MATERIALS](../../docs/design/GROUND_MATERIALS.md). Các release dưới đây là lịch sử.

## Cảnh mới cho 10 vùng — 15/10/2026

Release hiện tại `journey-regions-546c4ff-20261015`, source commit `546c4ff`, build `web-desktop`, contentVersion `d92c670c`. Mỗi vùng có một ảnh cảnh mới riêng. Overlay 66 file SHA-256 `a9083d2f9556f600a16972fbc97687a5a4edd8ef80bdd23e38c3f50f8e5a59c2`, checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T231650Z.sql` phục hồi thử khớp dữ liệu; giữ release `character-assets-8eb9f85-20261015` để rollback. Hai API MySQL healthy, CMS giữ nguyên. QA HTTPS đủ mười texture riêng, 20 ảnh desktop/mobile ngang, không có page error; API/quyền phòng đạt và tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/journey-regions-live/`. Chi tiết tại [JOURNEY_REGION_ASSETS](../../docs/design/JOURNEY_REGION_ASSETS.md). Các release dưới đây là lịch sử.

## Chọn nhân vật từ assets — 15/10/2026

Release hiện tại `character-assets-8eb9f85-20261015`, source commit `8eb9f85`, build `web-desktop`, contentVersion `d92c670c`. Chọn mẫu áo đỏ sao vàng hoặc xanh–trắng ở màn hồ sơ và trong game, dùng cùng atlas cho preview/HUD/đứng/đi tám hướng ở mọi nhóm tuổi. Overlay 12 file SHA-256 `a95878c515d9fd231fa252db3b65aa4c2f85ea48d1dc853ac2591251e9ac8d3a`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T194401Z.sql` phục hồi thử đạt; bản `red-star-boy-d92c670c-20261015` giữ để rollback. Hai API MySQL healthy, CMS giữ nguyên. QA HTTPS avatar xanh–trắng/24 frame/HUD/hồ sơ MySQL/desktop/mobile ngang và API/quyền phòng đạt, page errors rỗng; tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/character-assets-live/`. Các release dưới đây là lịch sử.

## Nhân vật bé trai áo đỏ sao vàng — 15/10/2026

Release hiện tại `red-star-boy-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`. Bé trai nhóm 6–8 tuổi chọn avatar 0 có hình vẽ theo ảnh tham khảo và concept `docs/design/characters/boy-6-8-red-star-concept-v1.png`. Atlas `apps/game-client/web/characters/boy-red-star-6-8-v1.png` gồm tám hướng, một hàng đứng và hai hàng bước đi. Cắt hàng theo các rãnh thực tế, chuẩn hóa khung 96×128 và đặt chân cùng đường chuẩn; dùng chung trong làng, HUD và xem trước. Màn hồ sơ ghi “Áo đỏ sao vàng”. Giữ avatar ID cũ, không đổi cấu trúc dữ liệu. Hình painted dùng tóc/màu da mặc định; tùy chỉnh tóc hoặc da dùng fallback vẽ với áo đỏ sao vàng. Nhóm tuổi và avatar khác giữ hình hiện có.

Overlay 15 file, SHA-256 `f4122498242f76f74ed8be75e359514d75e994e9b12be04db3bc4a2786d2759b`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T184047Z.sql` đã phục hồi thử đạt. Giữ release `level100-students-d92c670c-20261015` để rollback. Hai API health MySQL đạt; CMS manifest và nội dung không thay đổi. QA local TypeScript, client logic/lifecycle và Cocos desktop/mobile đạt; kiểm 24 frame, hình xem trước, tên HUD và phân biệt tuổi/avatar, không có page error. Artifact local `apps/game-client/temp/red-star-qa/`.

## Triển khai VPS — 15/10/2026

Release `/opt/lang-tri-thuc/releases/level100-students-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`, game https://ltt.vui-hoc.xyz/game/. Source working tree được đóng gói đầy đủ; 43 file khác release trước được tải bằng overlay sau khi đối chiếu SHA-256 từng file. Overlay SHA-256 `769465ccf15c78da1f29ffe832a4340a0b17fb676352fa29f8b675248fe81420`. `package-lock.json` được npm prune cập nhật trên Linux.

Backup `/opt/lang-tri-thuc/backups/database-20261014T181651Z.sql` đã phục hồi thử và khớp dữ liệu. Giữ release `schoolyard-mobile-e5d974a-20261014` để rollback ứng dụng. Hai API và hai rooms active; cả hai API health MySQL/version đạt. CMS được nâng compatibility sang bản mới, NPC không thay đổi; manifest mới `9526d4b358c398958d5b83d7beb1a45fe8ad475c3eb6e3b5caf15ce3e060c1f4`.

QA HTTPS quản trị/CMS, chặn API nội bộ và phòng không vé đạt. QA signed WebSocket đạt tên/tuổi/nhân vật, câu trả lời hành trình do server xác nhận và đọc lại tiến độ MySQL. Tài khoản QA đã xóa. Thông tin mật khẩu QA local là JSON string có dấu nháy; cần giải mã trước khi đăng nhập.

Triển khai riêng dưới `/opt/lang-tri-thuc`, dùng Nginx/Node 24/MariaDB hiện có của aaPanel. Không dùng Compose/Caddy vì cổng 80/443 đang phục vụ các site khác. Giao diện preview yêu cầu tài khoản staging; API dùng bearer, WebSocket dùng vé phụ huynh.

## Bố trí

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/schoolyard-mobile-e5d974a-20261014`, build `schoolyard-mobile-v3`, contentVersion `818a32e3`. Asset sân đất có khung thành gỗ và cờ Việt Nam 8 khung; điện thoại dọc có thông báo xoay ngang, ngang phủ viewport và có nút fullscreen. PWA khai báo landscape/fullscreen; native fullscreen phụ thuộc API trình duyệt và thao tác người dùng. Overlay SHA-256 `e6243cc4d6d2bbe5c00cf812f729588a4bb0e422fa1823f64f872711da4f87b2`; backup/restore drill và checksum đạt, snapshot CMS giữ nguyên khi kích hoạt. Bản trước `schoolyard-e5d974a-20261014` giữ để rollback. Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/schoolyard-e5d974a-20261014`, build `schoolyard-v1`, contentVersion `818a32e3`. Thêm sân bóng đất/khung thành gỗ cạnh trường và cờ Việt Nam chuyển động, bảng nhiệm vụ tránh che khu này trên mobile. Overlay SHA-256 `af62cf331d9456482482f5767c319ea63f78b21a5dedbd21ae1ad800293eaef9`; backup/restore drill, checksum và health MySQL đạt; snapshot CMS giữ nguyên. Bản trước `pwa-brand-e5d974a-20261014` giữ để rollback. Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/pwa-brand-e5d974a-20261014`, build `pwa-brand-v1`, contentVersion `818a32e3`. Logo/favicon, PWA giới hạn `/game/` và splash logo/tiến độ đã bật. Overlay SHA-256 `b92a0eab66627dc4cb51b81e63740db45f17964bb16cea0fd02568787ac4952d`; backup/restore drill, checksum, health MySQL, QA manifest/splash/offline HTTPS desktop/mobile đạt; snapshot CMS không đổi. Bản trước `village-signs-e5d974a-20261014` giữ để rollback. Chi tiết và lưu ý vòng đời service worker tại [CMS_STAGING](../../docs/design/CMS_STAGING.md). Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/village-signs-e5d974a-20261014`, build `village-signs-v1`, contentVersion `818a32e3`. Sửa chữ biển Cây Đa và đồng bộ ba biển khu mở rộng sang asset gỗ. Overlay SHA-256 `cbe85f62e0c65febe0ad579f5162ded37f9c4565ad1fe05a06ecef9a71e1bfe1`; backup/restore drill, checksum, health MySQL và QA HTTPS desktop/mobile đạt; snapshot CMS không đổi. Bản trước `npc-walk-clean-e5d974a-20261013` giữ để rollback. Các release bên dưới là lịch sử.

Release hiện tại: `/opt/lang-tri-thuc/releases/npc-walk-clean-e5d974a-20261013`, build `npc-walk-clean-v1`, contentVersion `818a32e3`. NPC giữ nguyên ảnh nguồn khi đi bộ, bỏ atlas nhỏ/cắt chân; giữ các bản sửa tải làng và nút zoom. Overlay SHA-256 `2e9fb94ff511b623033096e367ebe75a648004fa504ccab565ace57a1c2b7b8c`; backup/restore drill, checksum và health MySQL đạt, snapshot CMS không đổi. Bản trước `zoom-flicker-e5d974a-20261013` giữ để rollback. Các release bên dưới là lịch sử.

Bản vá mới nhất: `/opt/lang-tri-thuc/releases/zoom-flicker-e5d974a-20261013`, build `zoom-flicker-v1`, contentVersion `818a32e3`. Sửa nhãn nút zoom giữa nhấp nháy; giữ bản sửa tải làng. Overlay SHA-256 `6954df45dc119a1969f02b6e7ddfaf993bdfc435dfcae73ea31223fc4e340cd3`, backup/restore drill đạt, health MySQL và snapshot CMS không đổi. Bản trước `loading-parallel-e5d974a-20261013` giữ để rollback.

Cập nhật mới nhất 13/10/2026: release `/opt/lang-tri-thuc/releases/loading-parallel-e5d974a-20261013`, build `loading-parallel-v1`, contentVersion `818a32e3`. Source working tree trên baseline `e5d974a`; overlay SHA-256 `98f77da71d1349995104c970e9876c23c88d54194453b8b1885a38448efd307d`. Đã đối chiếu 185 asset giữ lại, backup/restore drill, health MySQL và smoke HTTPS desktop/mobile. Snapshot CMS `500f4374bb2c…` giữ nguyên. Symlink `/opt/lang-tri-thuc/current`; bản trước `shared-modals-601caae-20261013` giữ để rollback. Chi tiết [CMS_STAGING](../../docs/design/CMS_STAGING.md). Mục release bên dưới là lịch sử trước đợt cập nhật này.

- Release đã kích hoạt gần nhất: `/opt/lang-tri-thuc/releases/68f79b9-village-expansion-547e04f2-20261012`, build `village-expansion-v4`, contentVersion `547e04f2` (rules 9). Source được commit thành `1de349a` sau triển khai; tên release vẫn giữ baseline `68f79b9` và working tree tại thời điểm đóng gói. Bản trước `68f79b9-playtest-feedback-8f4c4bbd-20261012` giữ để rollback. Symlink `/opt/lang-tri-thuc/current`; RELEASE.txt ghi nguồn bản phát hành. Health HTTPS kiểm tra ngày 12/10 vẫn trả MySQL/`547e04f2`; chi tiết [VILLAGE_EXPANSION](../../docs/design/VILLAGE_EXPANSION.md).
- Admin: `https://ltt.vui-hoc.xyz/`; game: `/game/`; API: `/api/`; Colyseus: `/colyseus/`.
- Hai systemd service `lang-tri-thuc-api`, `lang-tri-thuc-rooms`, user `langtri`.
- Cổng chỉ bind `127.0.0.1:33080` và `127.0.0.1:32580`; `ALLOW_DEV_ROOMS=0` tắt room development kể cả loopback. `/api/internal/` bị chặn từ Nginx.
- DB riêng `lang_tri_thuc`, user giới hạn database `lang_tri_thuc_app` trên MariaDB 10.11 của VPS; repository tương thích MySQL.
- Secret root-only `/etc/lang-tri-thuc/api.env`, `rooms.env`, `access.txt`; Nginx chỉ đọc hash preview qua nhóm `www`. Không copy các file này vào repo/web root.
- aaPanel giữ cấu hình chính/certificate và đường dẫn `/.well-known/` cũ; extension riêng `.../vhost/nginx/extension/ltt.vui-hoc.xyz/lang-tri-thuc.conf`.

## Build và cập nhật

Trạng thái hiện tại theo mục Bố trí phía trên. Các đợt mini game/art/completion dưới đây là lịch sử triển khai, không phải bản đang chạy. Sau mỗi lần cập nhật cần ghi release/build/contentVersion mới tại mục Bố trí và giữ bản đã kiểm tra để rollback.

Bản mini game ngày 12/10 đã triển khai: build `minigame-complete-v3`, rules 7 / contentVersion `6f44a0a8`. Baseline HTTPS/API trước deploy trả `e48dccf3`; sau activate trả `6f44a0a8`, MySQL và hai services active. SHA-256 archive local/remote khớp, backup/restore drill khớp state, API/rooms build Linux và nginx -t đạt. Giữ release NPC trước để rollback.

Đóng gói tên riêng để giữ archive các bản trước:

```powershell
python tools/prepare-release.py --build minigame-complete-v3 --archive minigame-6f44a0a8-20261012.tar.gz
```

Metadata/SHA-256 ở `temp/deploy/minigame-6f44a0a8-20261012.json`. Gói chứa source working tree (bao gồm thay đổi chưa commit), Web đã build và admin dùng URL staging. Release mới cần cập nhật cả API/rooms/Web vì rules đã đổi; giữ DB và secrets hiện có.

QA live: `verify-api.cjs` đạt quyền truy cập/admin/catalog; `verify-web.cjs` đạt parent UI, hai client signed WebSocket/avatar/hair/emote, MySQL save/reload và offline. `test:art` trên HTTPS đạt 12 bảng desktop/mobile giả lập và điều khiển trực tiếp. `verify-minigames.cjs` dùng tài khoản tạm, tiến độ chương 1 thật và bài học chương 2 hợp lệ để kiểm tra phản hồi từ chối riêng cho người thao tác, trace/progress giữ nguyên, thao tác đúng lưu và khôi phục sau reload. Các tài khoản QA được xóa ở finally; browser errors rỗng. Ca di chuyển đầu timeout do tab không ở trước; QA bổ sung `bringToFront()` và chạy lại đạt, không thay mã runtime. Báo cáo ở `temp/deploy/qa/`.

`prepare.py` dành cho lần triển khai đầu và cố ý từ chối database đã có. Nó sao lưu site trước khi tạo DB, sinh secret riêng và không in mật khẩu. Không chạy lại để reset tài khoản. Node path trong unit/install hiện khớp bản aaPanel đã kiểm tra, cần cập nhật nếu aaPanel gỡ Node đó.

Build Cocos trên máy có Creator 3.8.8. Build admin với VITE_API_URL/VITE_SERVER_URL/VITE_GAME_URL trỏ domain. Bundle source từ Git và hai thư mục build thành `public/game`, `public/admin`; loại `.env`, backup, temp, node_modules. `install.sh` cài dependencies, build backend/rooms trên Linux, prune dev, tạo symlink, cài services và test Nginx trước reload. Script này là **lần cài đầu**; nó từ chối ghi đè extension đã có.

Lần cập nhật sau dùng release mới, build và health check trước khi đổi symlink; giữ secret/DB và release trước. Sau đổi symlink phải restart cả hai service để tránh client/server khác gói nội dung. Kiểm tra health, admin, signed WebSocket, save/reload trước khi kết thúc.

## Vận hành / rollback

```sh
systemctl status lang-tri-thuc-api lang-tri-thuc-rooms
curl -fsS http://127.0.0.1:33080/health
/www/server/nginx/sbin/nginx -t
python3 /opt/lang-tri-thuc/current/deploy/aapanel/backup-verify.py
```

Backup SQL lưu root-only trong `/opt/lang-tri-thuc/backups/`. Restore drill tạo một DB tên ngẫu nhiên riêng, so SHA-256 state và chỉ xóa DB thử đó; không sửa DB đang phục vụ. Snapshot state prototype chứa dữ liệu tài khoản nên phải bảo vệ và có retention theo chính sách vận hành.

Rollback app: đổi `current` về release đã kiểm tra trước, restart hai service; giữ DB. Rollback lần cài đầu: dừng/disable **hai service của ứng dụng**, chuyển extension riêng ra thư mục backup, chạy nginx -t rồi reload. Site aaPanel gốc chưa bị thay root/cert/file; không xóa database hoặc thư mục backup.

Chạy `node deploy/aapanel/verify-web.cjs` trên máy QA có file local ignored `temp/deploy/access.txt`. Suite tạo tài khoản thử rồi xóa nó ở finally, không sử dụng tài khoản admin thật. Chưa thay thế soak WAN, kiểm thử thiết bị thật hoặc biên tập nội dung trước beta.

`node deploy/aapanel/verify-api.cjs` kiểm tra admin/catalog, chặn UI anonymous/internal API, từ chối room development và phòng riêng thiếu vé; logout phiên admin thử ở finally.

## Cập nhật completion — đã triển khai 11/10/2026

Gói `temp/deploy/completion-release.tar.gz` chứa source working tree, public/admin dùng URL staging, public/game build completion-v1. Metadata/SHA-256 ở completion-release.json; contentVersion e48dccf3. Đã upload và activate qua SSH ngày 11/10/2026; SHA-256 archive khớp local, backend/rooms build trên Linux đạt, hai services active và HTTPS health MySQL trả contentVersion e48dccf3. Backup SQL và restore drill khớp state trước khi chuyển release.

Để triển khai một bản cập nhật tương tự, upload archive vào `/opt/lang-tri-thuc/completion-release.tar.gz` và script local `deploy/aapanel/update-release.sh` vào `/opt/lang-tri-thuc/update-release.sh`, rồi chạy:

```sh
sh /opt/lang-tri-thuc/update-release.sh 0b4a42e-completion-e48dccf3-20261011 completion-release.tar.gz
python3 /opt/lang-tri-thuc/releases/0b4a42e-completion-e48dccf3-20261011/deploy/aapanel/activate-release.py 0b4a42e-completion-e48dccf3-20261011 e48dccf3
```

Script update chỉ chuẩn bị release mới. Script activate kiểm tra health MySQL/contentVersion và hai services, tự rollback app khi sai; giữ DB/secret. Sau activate chạy verify-api.cjs, verify-web.cjs và test đồng bộ trên hai browser. Chưa thay thế nghiệm thu trẻ/thiết bị thật hoặc soak WAN.

QA live ngày 11/10/2026 đạt HTTPS/admin/catalog, chặn UI anonymous/internal API/room không có vé, parent UI, signed WebSocket hai client, ngoại hình/cử chỉ, lưu tiến trình và reload online/offline. Tranh vẽ desktop được lưu trên MySQL và khôi phục ở browser mobile cùng hồ sơ trong phòng riêng khác; không mở trùng một hồ sơ trong cùng phòng. Browser errors rỗng. Báo cáo local ignored tại `temp/deploy/qa/api-report.json` và `report.json`.

## Deploy art — 11/10/2026

Đợt ghép tranh ngày 12/10 dùng overlay được tạo bằng `tools/prepare-release-delta.py`. Script `update-overlay.sh BASE RELEASE ARCHIVE SHA256` yêu cầu base đúng release hiện chạy, kiểm tra SHA, sao chép sang thư mục mới rồi build API/rooms; không activate trong bước chuẩn bị. Dùng `activate-release.py RELEASE CONTENT_VERSION` sau khi chuẩn bị đạt. Giữ release trước để rollback; backup/restore drill trước mỗi lần cập nhật.

Đã activate release art sau khi kiểm tra SHA-256 delta, backup/restore drill khớp state, build backend/rooms trên Linux và nginx -t đạt. Delta được áp dụng vào bản sao release completion; không sửa thư mục đang phục vụ trong lúc chuẩn bị. Hai services active, health MySQL cùng contentVersion e48dccf3. Các file static cũ giữ trong bản sao release nhưng index/manifest dùng bundle art mới.

QA live đạt API/admin/quyền truy cập, parent UI, signed WebSocket hai client, avatar/hair/emote, save/reload online/offline và errors rỗng. Test art trên HTTPS đạt tám NPC × tám hướng không mirror và đủ 12 bảng desktop/Android giả lập; ảnh ở apps/game-client/temp/art-polish-qa. Các gate biên tập, người làm art, trẻ và thiết bị thật vẫn còn.

## Bỏ splash Cocos — 11/10/2026

Commit `72a3a50` tắt splash trong tools/build-web.cjs: totalTime=0, logo.type=none và bỏ base64 logo. Mỗi lần build Web đều áp dụng cấu hình này. So sánh build cho thấy chỉ public/game/src/settings.json thay đổi. Đã deploy vào release riêng, SHA-256 khớp, giữ release art để rollback; API/rooms dùng runtime cũ cùng contentVersion, không thay DB/secret. Browser local/live xác nhận settings không có logo, splash thời lượng 0, game tải được và errors rỗng.

## Lịch âm và vận hành tự động — 11/10/2026

Cập nhật vận hành 13/10: xem [BETA_TECHNICAL_QA](../../docs/BETA_TECHNICAL_QA.md). Release `29b35d8-beta-ready-785f4e7e-20261013` đang chạy Cocos v6/rules 10. Hai API 33080/33081, hai rooms 32580/32581 và Redis loopback 36379. Redis runtime riêng nằm trong `/opt/lang-tri-thuc/runtime/redis`; dùng gói Redis/liblzf từ kho hệ điều hành có chữ ký, giải nén vào thư mục ứng dụng, không cài đè Redis của site khác. Installer yêu cầu runtime này trước khi chạy `install-scaling.py prepare`/`enable`.

Các instance dùng environment file riêng để systemd không ghi đè port bằng cấu hình chung. API nội bộ qua Nginx loopback 33082. Trước rollback cần đảm bảo bản cũ hiểu Redis/publicAddress và schema hiện tại; release giữ để rollback app, không tự coi cấu hình scale đã rollback. Muốn về một instance phải phục hồi Nginx extension đã lưu, tắt B, bỏ drop-in scale của A, kiểm tra Nginx/health và restart A; không xóa database hoặc secret. Offsite chỉ chờ kết nối, lịch Windows thử đã tắt.

Đã deploy commit 3d986c8: Web tính Tết/Trung thu bằng lịch âm UTC+7, khoảng 1900–2199. Timer backup bật: mỗi ngày 02:00 giờ Việt Nam; restore drill Chủ nhật 02:30. Hai service đầu chạy thành công trong sandbox systemd, Result=success/ExecMainStatus=0; SQL/JSON root-only, giữ 30 ngày/tối thiểu bảy bản và bản verify gần nhất. Backup thủ công cũ được giữ. Code vận hành ở /opt/lang-tri-thuc/operations độc lập symlink game. Chi tiết [BACKUP_OPERATIONS](../../docs/BACKUP_OPERATIONS.md).

QA live calendar đạt midnight/range/ngày tương lai, API/admin/quyền truy cập và signed WebSocket hai client, save/reload online/offline đạt; errors rỗng. Đã restore dump snapshot khi live QA thay đổi tài khoản, dữ liệu dump vẫn khớp. Bản sao offsite, thông báo lỗi ra kênh bên ngoài và soak WAN dài chưa được nghiệm thu.

QA trình duyệt HTTPS đã đạt đăng nhập bắt buộc, tên bé chính xác, ba nhóm tuổi/giới tính, thưởng cấp một lần, tiến độ MySQL và trang phục sau reload, cách ly học sinh, bốn khu mới, desktop/mobile ngang và logout; page errors rỗng. Báo cáo/ảnh local ignored `temp/deploy/qa/level100-live/`. Cleanup sau logout cần đăng nhập lại tài khoản fixture vì token cũ đã bị thu hồi; đã xác minh và tự xóa qua API.

QA HTTPS cuối cùng đã đạt hình xem trước sau khi ảnh tải xong, 24 khung painted trong Cocos, đúng tên HUD, phân biệt nhóm tuổi/avatar, ảnh làng sau khi splash đóng, desktop/mobile ngang; page errors rỗng. API quản trị/quyền phòng đạt. Tài khoản QA đã tự xóa. Hai lượt đầu bị timeout 10 giây ở request hồ sơ; các lượt cuối GET play/PUT progress đạt và không đổi mã xác thực. Báo cáo/ảnh local ignored `temp/deploy/qa/red-star-live/`.
