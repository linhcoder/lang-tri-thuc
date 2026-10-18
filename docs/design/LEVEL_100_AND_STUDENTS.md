# Hành trình 100 cấp và hồ sơ học sinh

### Tách hai nút trong bảng Thành tích — 18/10/2026

- Source `63936a0` đặt “Luyện tập nhận huy hiệu” và “Đóng” cạnh nhau trên cùng hàng dưới, thay vì hai hàng chỉ cách nhau 30 px trong khi nút cao 76 px. Giữ nội dung thành tích; nút luyện tập rộng 350 px bên trái, nút đóng bên phải, có khoảng trống 47.5 px giữa hai hitbox.
- TypeScript và build Web đạt. QA desktop 1600×900/mobile 844×390 xác nhận hai hitbox không giao nhau, nằm trong viewport, bấm luyện tập mở hoạt động và bấm đóng thoát bảng; đã xem ảnh ở `temp/deploy/qa/achievements-*.png`.
- Đã kích hoạt `achievements-footer-35eb627f-20261018`, contentVersion `35eb627f`. Backup/restore MySQL, checksum bốn file, build Linux và health hai API đạt; bản đồ revision 7, CMS/NPC và ba hồ sơ thật giữ nguyên. Rollback ứng dụng: `house-swap-35eb627f-20261018`.
- QA JavaScript/asset qua HTTPS sau deploy đạt cả desktop/mobile với API fixture riêng: hai nút nằm trong màn hình, có khoảng cách và bấm đúng chức năng; không có page error.

### Hoán đổi hai nhà và biển gỗ lối vào — 18/10/2026

- Bản đồ xuất bản revision 7 hoán đổi vị trí nhà của bé và nhà Bác Nông Dân: `house` từ (29,12) sang (5.75,19.75), `journey.farm` sang (29,12). Giữ kích thước riêng của mỗi nhà. Biển trang trí `sign-home` chuyển tới (3.75,17.25) cùng nhà, tránh ghi nhầm tên trên nhà nông dân. Giữ nguyên toàn bộ NPC và các công trình khác.
- Source `d6c3f30` thay nền xanh của cả năm biển vào nhà bằng asset biển gỗ chung, chữ sáng một dòng tự co. Biển gỗ vẽ dự phòng hiển thị khi ảnh đang tải hoặc lỗi mạng. Hitbox 220×64 khớp biển mới; caption được tìm theo tên node để vẫn đổi thành “Vào nhà →” sau khi thêm ảnh.
- TypeScript, 70 nhóm logic và 11 bài mạng/khởi động/cache/retry đạt. Đối chiếu bản đồ đang xuất bản xác nhận không chặn thêm đường nhiệm vụ/spawn; 12 NPC và đường tiếp cận đều hợp lệ. QA Cocos desktop 1600×900/mobile 844×390: hai nhà đúng tọa độ mới, cả năm biển gỗ tải được, bấm mép biển vào đúng năm nội thất; đã xem ảnh `temp/deploy/qa/house-swap-*.png`.
- Release `house-swap-35eb627f-20261018`, contentVersion `35eb627f` đã kích hoạt; backup/restore MySQL, checksum năm file, build Linux và health hai API đạt. Trạng thái bản đồ/draft/CMS/NPC và ba hồ sơ thật được giữ nguyên khi chuyển release. Rollback ứng dụng: `npc-sizing-35eb627f-20261018`.
- QA asset/JavaScript HTTPS sau deploy đạt cả desktop/mobile với API fixture riêng: vào đúng cả năm nhà bằng mép biển gỗ, không có page error. API thật xác nhận revision 7 và đúng tọa độ hai nhà/biển nhỏ; đã xem ảnh mobile, biển “Nhà Của Bé” không còn nằm trên nhà nông dân.

### Điều chỉnh tỷ lệ nhân vật và công trình — 18/10/2026

- Bà Bán Hàng tăng chiều cao sprite 105 → 140 (+33%); Ông Đồ giảm 140 → 115 (−18%); Bác Nông Dân giảm 145 → 120 (−17%). Giữ tỷ lệ ảnh, chân tại mặt đất và hoạt ảnh; cập nhật nhãn tên dự phòng theo chiều cao mới. Source `03bf5e1`.
- Bản đồ xuất bản revision 6 tăng Chợ quê lên 390×286 (+30%), nhà Cô Tấm lên 270×247 (khoảng +30%). Giữ tọa độ công trình; Cô Tấm dịch sang (51,44) để nhà lớn không che người. Nghệ nhân và các NPC khác giữ nguyên.
- TypeScript, 70 nhóm logic và 11 bài mạng/khởi động/cache/retry đạt. Kiểm tra toàn bộ 12 NPC và đường tiếp cận của revision 6 đạt. QA Cocos desktop 1600×900/mobile 844×390 xác nhận kích thước sprite, tranh công trình và đi từ điểm xuất phát vào nhà Cô Tấm; đã xem ảnh ở `temp/deploy/qa/size-*.png`.
- Đã triển khai release `npc-sizing-35eb627f-20261018`, contentVersion `35eb627f`. Backup/restore MySQL, checksum bốn file, build Linux và health hai API đạt; giữ nguyên bản đồ/CMS/NPC đã xuất bản và ba hồ sơ thật khi chuyển release. Rollback ứng dụng: `region-signs-35eb627f-20261018`.
- QA JavaScript/asset qua HTTPS sau deploy đạt cả desktop/mobile với API fixture riêng: đủ năm thay đổi kích thước và vào nhà Cô Tấm được, không có page error. API thật xác nhận đúng revision 6 và hai kích thước công trình mới.

### Nghệ nhân đứng cạnh xưởng — 18/10/2026

- Bản đồ xuất bản revision 5 đưa riêng Nghệ Nhân Gốm từ (43,42) về (29,45), bên trái phía trước xưởng tại (30,41.5). Đã kiểm tra đường tiếp cận và va chạm, xem ảnh để tránh biển cửa che nhân vật. Giữ nguyên công trình, Cô Tấm và các NPC còn lại.
- QA HTTPS thật đạt ở desktop 1600×900 và mobile 844×390: nghệ nhân ở cạnh xưởng, bấm cửa vào đúng nội thất xưởng gốm, không có page error. Tài khoản kiểm thử đã xóa; ảnh tại `temp/deploy/qa/artisan-1600.png` và `artisan-844.png`.
- Cập nhật qua bản đồ xuất bản nên không cần build/deploy lại; release tiếp tục là `region-signs-35eb627f-20261018`, contentVersion `35eb627f`.

### Biển khu vực và vị trí Cô Tấm — 18/10/2026

- Biển Rừng khám phá, Đồi khoa học, Làng văn hóa và Đảo tri thức bám tọa độ công trình trong layout đã xuất bản, thay vì vị trí spawn cũ. Dùng asset biển gỗ chung; có biển gỗ vẽ dự phòng trong lúc tải ảnh.
- Bản đồ xuất bản revision 3 chuyển riêng Cô Tấm từ (27,15) về (52,42), cạnh nhà ở (53.75,40.75). Đã kiểm tra va chạm và đường tiếp cận; giữ nguyên toàn bộ công trình và 11 NPC còn lại. Tọa độ này lưu trong bản đồ xuất bản, không sửa NPC pack nền để giữ tương thích client/API/rooms.
- Source `0112ffa` và `149eb12`. TypeScript, 70 nhóm logic, 11 bài mạng/khởi động/cache/retry và QA Cocos desktop 1600×900/mobile 844×390 đạt. Kiểm tra biển theo tọa độ CMS phân số, asset công trình tải dần và Cô Tấm cạnh nhà tại `apps/game-client/tests/journey-signs-web.cjs`.
- Đã kích hoạt `region-signs-35eb627f-20261018`, contentVersion `35eb627f`; gồm cả WebP và retry nhận quà bên dưới. Backup MySQL đã thử khôi phục; build API/rooms Linux, checksum candidate và health hai API đạt. Lần kích hoạt đầu tự rollback do NPC pack làm đổi phiên bản nội dung; đã bỏ thay đổi pack, kiểm tra health candidate riêng rồi kích hoạt thành công. Giữ `fullscreen-loading-35eb627f-20261018` để rollback.
- QA asset/JavaScript qua HTTPS đạt ở desktop/mobile với API fixture riêng, không tạo hồ sơ thật; đã xem ảnh biển và Cô Tấm. API HTTPS thật xác nhận revision 3, 90 bài học/12 NPC/24 asset và phiên bản `35eb627f`; các kiểm tra phân quyền đạt. Trạng thái xuất bản/draft/CMS/NPC giữ nguyên sau chuyển release.

### Giảm dữ liệu ảnh và phục hồi nhận quà — 18/10/2026

- Build Web chạy thêm `tools/optimize-web-images.py` (Python + Pillow hỗ trợ WebP). 83 ảnh có bản WebP bên cạnh PNG dự phòng; Cocos `ImageAsset.fmt=4_0` tự chọn WebP khi hỗ trợ. Không ghi đè ảnh nguồn, không đổi kích thước hoặc tọa độ atlas; mọi alpha được so byte sau giải mã. 80 ảnh nhân vật/UI/atlas và các cảnh không đạt ngưỡng dùng lossless; ba tranh cảnh dùng quality 90, PSNR vùng nhìn thấy ở kích thước gốc và preview 768 px đều tối thiểu 34 dB, giữ ICC profile.
- Tổng WebP của 83 ảnh là 105.680.580 byte so với PNG tương ứng 153.291.375 byte (giảm khoảng 31% dữ liệu ảnh được chọn). Giữ PNG để thiết bị không hỗ trợ vẫn chơi được nên dung lượng thư mục build tăng, không phải giảm. Manifest/checksum/chính sách ở `build/web-desktop/image-optimization.json`; manifest cũng tham gia fingerprint service worker, tránh cache cũ khi chỉ ảnh thay đổi.
- Đo local cùng fixture: dữ liệu nhận trước khi chơi giảm từ 23.546.767 xuống 15.339.545 byte, khoảng 35%. Đây là dung lượng tải tới `assetsReady`, không phải cam kết thời gian WAN. Không giảm độ phân giải theo thiết bị trong bản này; giữ nguyên kích thước để bảo vệ sprite/frame hiện có.
- Nhận quà tự thử lại tối đa một lần sau 700 ms với lỗi mạng/timeout hoặc HTTP 408/500/502/503/504. Có trạng thái kết nối chậm; giữ nút Nhận quà thủ công nếu vẫn lỗi. Không tự gửi lại khi sai quyền/phiên/tuổi/đáp án hoặc HTTP 429. Server vẫn xác thực và cấp quà một lần.
- TypeScript, 70 nhóm logic, 11 bài mạng/khởi động/cache/retry, ba kiểm tra optimizer và build Web đạt. QA năm nhà ở tuổi 6–8 trên desktop/mobile đạt; fixture server đã cấp quà nhưng trả 504 lần đầu xác nhận UI tự gửi lại đúng một lần, không cấp trùng. Đã xem ảnh WebP và nội thất; PNG fallback được kiểm tra bằng cách tắt tính năng WebP trong engine.
- QA offline tuổi 3–5 trên desktop đạt: cả hai lần gửi nhận quà đều lỗi mạng thì không mở quà chưa xác thực; khi nối lại, Nhận quà thủ công phục hồi đúng và reload giữ tiến độ.
- QA mạng dùng server fixture giới hạn tổng băng thông game HTTP 1,6 Mbps, trễ 80 ms, bao gồm fetch của service worker (API fixture không giới hạn, server không gzip). Mobile 844×390: tải lạnh 95.180 ms; sau khi cache được điền đủ, mở lại 24.659 ms và ba texture nền lớn không phát sinh request server mới. Đây là giả lập, chưa phải kiểm thử điện thoại thật/4G thực tế. Báo cáo và ảnh ở `apps/game-client/temp/web-images-qa/`.
- Mã tối ưu đã commit `dc1bdb2`. Kết nối VPS đã phục hồi; WebP/retry đã triển khai cùng release `region-signs-35eb627f-20261018` sau khi kiểm tra lại baseline và sao lưu dữ liệu.

**Bản VPS đang chạy: `achievements-footer-35eb627f-20261018`, source commit `63936a0`, contentVersion `35eb627f`.** Bao gồm nội thất toàn màn hình, tải dần, WebP/retry, biển gỗ, tỷ lệ nhân vật và sửa nút bảng Thành tích. Bản đồ hiện tại revision 7: nhà của bé/nhà nông dân đã hoán đổi, chợ quê/nhà Cô Tấm lớn hơn, Cô Tấm cạnh nhà và Nghệ Nhân Gốm cạnh xưởng; ba hồ sơ thật giữ nguyên.

### Cảnh nội thất toàn màn hình — 18/10/2026

- Khi vào nhà, nền nội thất phủ kín Canvas, không còn khung modal hoặc viền để lộ làng. Phòng được phóng lớn theo màn hình, camera theo nhân vật trong giới hạn phòng. Cỡ chữ nhãn đồ vật độc lập với độ phóng cảnh.
- HUD dùng `hudLayout` và safe area chung: tên nhà/mục tiêu phía trên, Ra sân góc phải trên, Tương tác tròn bên phải, joystick vòng/cần kéo như ngoài làng (mobile bên trái, desktop bên phải). Trang trí và Nặn gốm nằm ở thanh dưới; Chơi lại và quà thu gọn. Nút toàn màn hình của thiết bị tiếp tục dùng được.
- Hit test theo vị trí/kích thước node thực thay cho tọa độ modal cố định. Nút tương tác dừng thao tác đi bộ trước khi tới mục tiêu; hỗ trợ ngón thứ hai chạm Tương tác khi giữ joystick. Bài nhiệm vụ/xưởng gốm tự co theo viewport; Ra sân vẫn thoát được khi bài đang mở.
- TypeScript, 70 nhóm logic, 8 bài mạng/khởi động/cache và build Web đạt. Đã triển khai trong release `fullscreen-loading-35eb627f-20261018`.
- QA bản cuối đạt năm nhà ở tuổi 6–8 trên desktop 1600×900 và mobile 844×390: Canvas phủ kín với scale 1, nút nằm trong viewport, joystick chuột/cảm ứng, tương tác hai ngón, kéo thả, nặn/vẽ, quà và reload. Ra sân thoát được giữa bài; không có page error. Đã xem ảnh desktop/mobile ở `apps/game-client/temp/house-interior-qa/`.

### Tải dần để vào làng sớm — 18/10/2026

- Bỏ chờ ảnh khu hành trình, sân trường, cảnh đồng quê, động vật và atlas chuyển động NPC trước khi mở màn chơi. Khu hành trình tải khi gần camera; các nhóm ảnh phụ tải nền lần lượt sau khung hình đầu tiên. Dữ liệu va chạm, nhiệm vụ và vị trí CMS vẫn có sẵn ngay từ đầu.
- Atlas nội thất chỉ yêu cầu khi mở nhà. Service worker dùng ảnh/font/binary đã cache ngay trong cache của bản build; code, cấu hình và điều hướng tiếp tục kiểm tra server. Cache được tách theo bản build.
- Đo local cùng fixture, desktop 1600×900: trước tối ưu 17.601 ms, 114 response, 83.522.598 byte tới lúc `assetsReady`; sau tối ưu 2.765 ms, 58 response, 23.546.767 byte. Giảm khoảng 72% dữ liệu trước khi chơi. Đây là số đo local, không phải cam kết tốc độ WAN; tổng ảnh vẫn tải dần khi cần.
- TypeScript, 70 nhóm logic và 8 bài mạng/khởi động/cache đạt; build Web đạt. `test:progressive-loading` đạt desktop 1600×900 và mobile 844×390: giữ request atlas NPC vẫn di chuyển được, nội thất tải khi vào nhà, đảo tải khi tới gần vị trí CMS, không có page error. Báo cáo/ảnh ở `apps/game-client/temp/progressive-loading-*`; baseline ở `temp/loading-*.json`. Đã triển khai trong release `fullscreen-loading-35eb627f-20261018`.
- Hồi quy năm nhà ở tuổi 6–8 trên desktop/mobile đạt: kéo thả, mang đồ, quà, nặn/vẽ gốm, trang trí và checkpoint sau reload.
- QA HTTPS bản mới đạt năm nhà ở tuổi 6–8 trên desktop/mobile, gồm fullscreen, joystick hai ngón, nhiệm vụ, quà, gốm và reload; một lượt nhận quà lỗi kết nối, chạy riêng lại mobile đạt. QA tải dần với request NPC bị giữ, API/quyền truy cập và signed WebSocket/MySQL/cách ly học sinh đều đạt. Tài khoản QA đã xóa; báo cáo ở `temp/deploy/qa/houses-live/` và `temp/deploy/qa/fullscreen-progressive-*`.

### Bộ sprite nội thất vẽ tay — 18/10/2026

- Tạo atlas `interior-furniture-v1.png` bằng built-in image_gen, giữ alpha gốc, gồm 20 sprite riêng cho năm nhà: bàn học/kệ sách, giỏ rau/tủ bát, bàn gieo hạt/khay hạt, bàn xoay/bảng men và bàn đọc/giỏ truyện. Prompt và SHA-256 ở `docs/design/interior-furniture-v1.*`.
- Atlas tải bất đồng bộ một lần; lỗi tải vẫn dùng Graphics dự phòng. Cắt sprite theo khoảng trống đã đo, giữ đồ vật nhiệm vụ và dấu hoàn thành ở lớp riêng; không đổi vị trí hay va chạm. Bài QA nhà kiểm tra đủ bốn sprite mỗi phòng và giới hạn cắt ảnh.
- TypeScript client, 70 nhóm logic, 6 bài mạng/khởi động và build Web đạt. Đã triển khai VPS trong release `interior-art-35eb627f-20261018`; contentVersion `35eb627f`, giữ release nhà trước để rollback. Backup/restore drill, build Linux, checksum 18 file và hai API MySQL đạt; bản đồ/CMS/NPC giữ nguyên.
- QA HTTPS đủ năm nhà × ba tuổi trên desktop/mobile đạt, không có page error; signed WebSocket xác nhận checkpoint/tác phẩm lưu MySQL và cách ly hồ sơ. Toàn bộ tài khoản QA đã xóa; báo cáo ở `temp/deploy/qa/houses-live/`. Kiểm thử chờ API xác nhận lưu checkpoint trước reload qua WAN.
- QA bản build cuối đạt năm nhà × ba nhóm tuổi trên desktop 1600 × 900 và mobile 844 × 390: đủ sprite, kéo thả, nhận quà, thử lại khi mất mạng, nặn/vẽ gốm và reload; không có page error. Đã xem ảnh nội thất desktop/mobile ở `apps/game-client/temp/house-interior-qa/`.

### Nâng cấp hình ảnh nội thất — 18/10/2026

- Bổ sung viền sàn có chiều sâu, đường ghép sàn, cửa sổ khung gỗ và ánh sáng, thảm viền dệt với màu riêng cho cả năm nhà. Bàn tương tác có chân, cạnh gỗ, bóng đổ và vòng sáng khi là mục tiêu hiện tại.
- Tiếp tục dùng Graphics có sẵn; không thêm lượt tải ảnh, không đổi vị trí đồ vật, lưới va chạm hoặc tiến độ nhiệm vụ.
- Kiểm tra local: TypeScript client, 70 nhóm logic, 6 bài mạng/khởi động, hồi quy hướng dẫn, build API/Web đạt; API 27 đạt, một fixture MySQL bỏ qua khi chưa cấu hình. Không triển khai VPS trong lần nâng cấp này.
- QA Web bản mới đạt cả năm nhà × ba nhóm tuổi trên desktop 1600 × 900 và mobile ngang 844 × 390; kéo thả, mang đồ, nhận quà, thử lại khi mất mạng và tải lại tiến độ đều đạt, không có page error. Đã xem ảnh nội thất desktop/mobile; báo cáo và ảnh ở `apps/game-client/temp/house-interior-qa/`.

## Thiết kế nhà có thể vào làm nhiệm vụ — 18/10/2026

**Trạng thái: đã triển khai VPS trong release `houses-35eb627f-20261018`, kiểm tra HTTPS đạt ngày 18/10/2026.** Bé đi từ đường làng tới cửa, vào nhà, di chuyển trong phòng và tương tác với đồ vật để làm nhiệm vụ. Trước bản này, phòng trang trí chỉ trưng bày ba món đồ; bản mới bổ sung không gian nội thất có lối đi, va chạm và cửa ra.

### Hoàn thiện hình nhà và xưởng gốm — 18/10/2026

- Năm ảnh ngoại thất riêng được tạo bằng built-in image_gen, giữ alpha và sao chép vào `apps/game-client/assets/resources/village/enterable-houses-v1/`: `home.png`, `tam-v3.png`, `farm.png`, `pottery.png`, `books.png`. Prompt cuối ở `docs/design/enterable-houses-v1.prompts.json`; kích thước/SHA-256 ở `docs/design/enterable-houses-v1.manifest.json`. Ảnh tải riêng, giữ tỉ lệ, dùng đúng vị trí/kích thước đã công bố; lỗi tải vẫn có hình dự phòng. Không thêm vật cản hoặc đổi vị trí NPC.
- Xưởng gốm có nút Nặn gốm tự do. Kéo hai bên để đổi dáng bình, chọn men, chuyển Vẽ hoa văn và kéo để vẽ nét, xóa nét cuối hoặc lưu tác phẩm. Bản nháp `upgrades.potteryDraft` lưu theo học sinh, đồng bộ theo thời điểm mới nhất và được giữ sau reload; có giới hạn kích thước để không làm phình dữ liệu lưu. Chế độ sáng tạo không cấp sao hoặc thay đổi bằng chứng nhận quà.
- Đã bổ sung kiểm tra hình nhà tải đủ, nặn/vẽ bằng chuột và cảm ứng, lưu rồi tải lại tác phẩm. Xóa hồ sơ hoặc tài khoản cũng xóa dữ liệu quà nhà tương ứng.
- Đã triển khai đồng bộ Web/API/rooms trong release `houses-35eb627f-20261018`, contentVersion `35eb627f`. Overlay 70 file SHA-256 `9e301e86da0145062c8ac50af9d45a015d9a799b89aaad6869a40a8ea5a2e888`; checksum từng file khớp trước kích hoạt. Backup `/opt/lang-tri-thuc/backups/database-20261017T184349Z.sql` đã phục hồi thử trùng khớp. Hai API MySQL healthy; checksum bản đồ công bố, bản nháp, CMS và NPC giữ nguyên. Release trước `navigation-fix-35eb627f-20261016` được giữ để rollback ứng dụng.

- Xác minh cuối: TypeScript, 70 nhóm logic, 6 bài mạng/khởi động và bài hồi quy ẩn hướng dẫn đạt; API 27 đạt, một fixture MySQL riêng bỏ qua khi chưa cấu hình. Build Cocos/admin/backend/rooms đạt; build Linux và nginx -t đạt. QA local đủ năm nhà × ba tuổi trên desktop 1600 × 900 và Android ngang 844 × 390 đạt. QA HTTPS hai kích thước đạt đủ ảnh, nhiệm vụ, nhận quà, trang trí, nặn/vẽ và reload; signed WebSocket hai hồ sơ xác nhận checkpoint nhà/tác phẩm gốm lưu MySQL và cách ly học sinh. Không có page error. Toàn bộ gia đình QA đã xóa, ba hồ sơ thật giữ nguyên. Báo cáo ở `apps/game-client/temp/house-interior-qa/` và `temp/deploy/qa/houses-live/`.

### Lịch sử nâng cấp nội thất và nhiệm vụ — 18/10/2026

- Năm nội thất có vị trí đồ vật, màu tường, nền và trang trí riêng: góc học tập, gian bếp, góc gieo hạt, xưởng gốm và phòng đọc. Đồ được vẽ bằng Graphics, không cần tải bộ ảnh mới. Khi lấy đồ, nhân vật hiển thị sách/rau/hạt/đất sét hoặc dụng cụ đang mang; nguồn đồ vơi đi, nơi nhận đồ thay hình và có dấu hoàn thành.
- Thay chuỗi chạm tự hoàn thành bằng 25 bước thử thách: chọn đồ, kéo thả vào nơi phù hợp, đếm bát/bút/hạt, chọn hình và màu gốm, chọn diễn biến tiếp theo của truyện. Có ba nhóm tuổi 3–5, 6–8, 9–11; nhóm lớn thêm phép tính và quy luật. Nút Nghe lại tuân theo cài đặt âm thanh, tùy giọng tiếng Việt trên thiết bị; gợi ý và hình ảnh luôn dùng được. Sai đáp án không mất tiến độ hoặc sao.
- Chạm đồ vật có dấu mục tiêu để đi tới và mở bài. Kéo món đồ vào một ô hoặc chạm đáp án; bàn phím 1/2/3 chọn đáp án, Escape đóng bài, Escape tiếp theo ra sân. Nút Ra sân dùng được cả khi bài đang mở. Mỗi nhà có thể Chơi lại sau khi hoàn thành; lượt đang luyện lưu riêng qua `upgrades.houseRuns`, không làm mất mốc hoàn thành cũ.
- Năm quà mới: Thảm gọn gàng, Giỏ hoa Cô Tấm, Chậu mầm xanh, Bình gốm hoa văn và Đèn góc đọc sách. API `POST /profiles/:id/houses/:house/claim` kiểm tra quyền hồ sơ, nhóm tuổi và đủ năm đáp án đúng. Quà ghi trong dữ liệu `houseRewards` của repository, tách khỏi tiến độ do client gửi; hai yêu cầu đồng thời chỉ mở quà một lần. `GET /profiles/:id/houses` trả bộ quà đã xác nhận. Không cộng sao hoặc cấp hành trình.
- Quà đã xác nhận được chọn ở Trang trí nhà bé và hiển thị trong phòng. Mất mạng vẫn làm bài và lưu chứng cứ đáp án trên máy; sau đó chọn Nhận quà để thử lại. Tải lại nạp quà từ API; khi chưa kết nối được, lựa chọn đồ mới vẫn được giữ nhưng quà cần xác nhận lại trước khi hiển thị. Tiến độ cũ không bị chuyển thành chứng cứ nhận quà: chọn Chơi lại để hoàn thành bài mới.
- Giới hạn còn lại: ngoại thất tận dụng công trình hiện có; đồ trong phòng dùng hình vẽ chương trình, chưa có bộ ảnh minh họa riêng. Nhiệm vụ gốm dùng chọn hình/màu/thứ tự, chưa có thao tác nặn tự do. Đọc thoại phụ thuộc thiết bị. Chưa triển khai VPS.

- Xác minh nâng cấp: TypeScript client, build backend/rooms và build Web Cocos 3.8.8 đạt; 69 nhóm logic, 6 bài mạng/khởi động đạt. API 27 bài đạt, một fixture MySQL bỏ qua. QA đủ năm nhà × ba nhóm tuổi trên desktop 1600 × 900 và mobile ngang 844 × 390 đạt, gồm kéo thả chuột/cảm ứng thật, vật đang mang, không tự tiến khi sai, thưởng qua API, thử lại sau lỗi mạng và tải lại lượt luyện. Kiểm tra bổ sung chọn quà mới trong trình trang trí và giữ lựa chọn sau reload đạt. Báo cáo/ảnh ở `apps/game-client/temp/house-interior-qa/`; chạy lại bằng `npm run test:houses` sau khi build backend/Web. Khi phát hành cần đồng bộ Web, API và rooms; chưa triển khai VPS.

### Lịch sử bản đầu — 18/10/2026

- Năm biển cửa: Nhà của bé (`house`), Nhà Cô Tấm (`house-west`), Nhà Bác Nông Dân (`JourneyLandmark-farm`), Xưởng Gốm (`JourneyLandmark-craft`) và Nhà sách (`JourneyLandmark-school`). Tận dụng công trình hiện có và vị trí CMS, không tự di chuyển NPC. Chạm biển để tới cửa, chạm lại khi đã đến để vào.
- Có phòng nhìn chéo cắt mái, nhân vật theo hồ sơ, tìm đường và va chạm đồ đạc; đi bằng chạm sàn, bàn phím hoặc bảng điều hướng cảm ứng. Chạm đồ vật để tới gần và thực hiện bước nhiệm vụ. Ra bằng cửa, nút Ra sân hoặc Escape.
- Mỗi nhà có chuỗi năm thao tác riêng theo chủ đề; lưu bước qua `upgrades.houseSteps`, giữ tương thích `homeStep` của Nhà của bé. Bước mang đồ được suy ra từ checkpoint. Hoàn thành hiện kỷ niệm trong phòng và ghi hoạt động, không cấp sao/cấp hành trình. Đồng bộ checkpoint qua luồng hoạt động/API hiện có, hợp nhất theo bước cao nhất.
- Nhà của bé hiển thị đồ trang trí đã chọn, có nút mở trình trang trí hiện tại. Trong lúc chơi nội thất, nhân vật ngoài làng đứng ở cửa; tọa độ nội thất không gửi vào phòng bạn bè.
- Giới hạn bản đầu: năm nhà dùng chung bố cục phòng và hình đồ vật vẽ bằng Graphics, khác nhãn/nhiệm vụ; chưa có bộ ngoại thất/nội thất riêng, bài đếm/ghép chữ, quà đồ trang trí mới hoặc chơi lại nhiệm vụ đã hoàn thành. Kỷ niệm chỉ phản ánh checkpoint hoạt động, không phải phần thưởng có xác thực máy chủ. Các mục này thuộc thiết kế đích, chưa tính hoàn tất.
- Kiểm tra: TypeScript client, build backend, 67 nhóm logic và 6 bài mạng/khởi động đạt; API 26 đạt, một fixture MySQL bỏ qua. Build Cocos 3.8.8 và QA bản Web desktop 1600 × 900/mobile ngang 844 × 390 đạt: đủ năm cửa có đường đi, nhiệm vụ đúng thứ tự và độc lập, ra/vào, bàn phím, mở trang trí, tải lại. Lệnh `npm run test:houses`; ảnh và báo cáo ở `apps/game-client/temp/house-interior-qa/`. Chưa triển khai VPS.

### Các căn nhà

Giữ phong cách làng Việt nhìn chéo: mái ngói, tường vôi, hiên gỗ, sân gạch và ánh sáng ấm. Mỗi nhà có màu mái, biển hình và nội thất riêng. Bên trong dùng góc nhìn cắt mái, bỏ tường phía trước để không che nhân vật; đồ vật tách lớp, không dùng một ảnh nền chứa sẵn mọi thứ.

| Nhà | Hình ảnh và nội thất | Nhiệm vụ mẫu | Quà lần đầu |
| --- | --- | --- | --- |
| Nhà của bé | Ngói đỏ, giàn hoa; thảm, bàn học, kệ sách, giỏ đồ | Dọn góc học tập: tìm sách, đưa lên kệ, đặt bút vào hộp | Huy hiệu Gọn gàng, mẫu thảm |
| Nhà Cô Tấm | Mái nâu, hàng cau; bàn tre, gian bếp, giỏ rau | Chuẩn bị bữa cơm: chọn rau, đếm bát theo số khách, bày mâm | Giỏ hoa |
| Nhà Bác Nông Dân | Mái rơm, giàn bầu; hạt giống, giỏ nông sản | Phân loại rau/củ/quả, đếm đủ hạt cho luống trồng | Chậu mầm |
| Xưởng Nghệ Nhân Gốm | Ngói cam, biển bình gốm; bàn xoay, bàn màu, kệ trưng bày | Chọn hình khối, sắp thứ tự làm gốm, tô và trưng bày bình | Bình có họa tiết |
| Nhà sách Cô Giáo Lan | Mái xanh rêu, biển sách; bàn đọc và kệ sách thấp | Tìm sách theo gợi ý, ghép chữ hoặc xếp tranh thành truyện | Tranh chữ cái |

Nhà của bé dùng đối tượng `house` hiện có. Các nhà khác cần đối tượng ngoại thất và ID riêng; chốt vị trí sau khi kiểm tra bản đồ CMS đang công bố. Có thể dùng `house-west` để thử cơ chế cửa, chưa mặc định gán chủ nhà. NPC trong nhà là vai diễn theo cảnh, không tự thay vị trí NPC ngoài làng đã lưu.

### Luồng vào và ra

1. Chạm nhà hoặc biển nhà để tìm đường tới ô trước cửa. Nhân vật không đi xuyên chân tường. Nhà có nhiệm vụ hiện biểu tượng cuộn giấy; nhà khác vẫn cho tham quan.
2. Đứng cách cửa tối đa một ô mới hiện **Vào nhà**. Chạm từ xa chỉ dẫn đường; cần xác nhận tại cửa để tránh chuyển cảnh khi đi ngang.
3. Tải nội thất, chuyển cảnh mờ ngắn rồi đặt nhân vật phía trong cửa. Bé tiếp tục dùng chạm để đi hoặc joystick; có thể đi tới từng đồ vật trong phòng.
4. Chạm đồ vật để tới ô tương tác gần nhất; đến nơi mới hiện **Xem**, **Lấy**, **Đặt**, **Nói chuyện**. Đồ liên quan nhiệm vụ có viền sáng nhẹ.
5. Cửa ở cạnh dưới phòng và nút **Ra sân** luôn nhìn thấy. Ra đúng căn nhà vừa vào, phục hồi camera làng; chỉ cho vào lại khi bé rời vùng cửa hoặc chủ động bấm Vào nhà.

Tải phòng lỗi thì giữ bé ngoài cửa và cho thử lại. Ô ra bị chặn sau khi đổi bố trí thì tìm ô đi được gần cửa, có đường về đường làng; không tìm được thì về điểm xuất phát an toàn. Ra sân được cả khi đang làm bài hoặc mất mạng; giữ bước đang làm, quà online chờ máy chủ xác nhận.

### Bố trí nội thất

Phòng mẫu dùng lưới logic 12 × 10 ô, hiển thị theo phối cảnh chéo hiện có. Kệ sách và bàn học ở tường sau, giỏ đồ bên trái, bàn nhỏ bên phải, thảm ở giữa, cửa ra ở cạnh dưới. Chừa lối chính rộng hai ô từ cửa vào giữa phòng và một ô đứng trước mỗi đồ vật tương tác.

Bàn, kệ, tủ chặn theo chân đồ vật; thảm không chặn. Xếp lớp theo vị trí chân để nhân vật đi trước/sau đồ đúng hình. Trang trí chỉ đặt tại vị trí định sẵn, không chiếm cửa hoặc ô nhiệm vụ. Ánh xạ ba vị trí `left/middle/right` đã lưu thành ba vị trí trưng bày trong Nhà của bé, giữ ID đồ và điều kiện mở khóa cũ.

### Nhiệm vụ trong nhà

Mỗi nhà có một nhiệm vụ giới thiệu khoảng 3–5 phút: **Nhận việc → Tìm và thao tác → Kiểm tra, nhận quà**. Chỉ ghim một mục tiêu ngắn, ví dụ “Tìm 3 quyển sách”. Hoàn thành bước nào thì đồ vật đổi trạng thái ngay: sách xuất hiện trên kệ, bát lên bàn, bình lên giá. Rời nhà giữa chừng rồi quay lại vẫn làm tiếp.

Ví dụ Nhà của bé: tới bàn học nhận việc; lấy sách trong giỏ rồi mang tới kệ; lấy bút đặt vào hộp trên bàn; quay lại bàn để kiểm tra. HUD hiển thị món đang mang và nơi cần đặt. Đặt sai thì giữ đồ và hiện gợi ý, không trừ sao. Nhóm tuổi nhỏ dùng hình và giọng đọc; nhóm lớn thêm đọc từ, đếm và sắp thứ tự theo hồ sơ hiện có.

Quà nhà là bộ sưu tập riêng, không tự cộng sao hoặc cấp hành trình 100 cấp. Bản đầu mở cả năm nhà, độ khó theo nhóm tuổi. Chỉ nhận quà lần đầu; chơi lại ghi lượt luyện. Muốn gắn sao/cấp sau này cần bổ sung quy tắc xác thực server trước khi bật.

### Dữ liệu và tích hợp dự kiến

- Cấu hình nhà gồm `houseId`, `exteriorObjectId`, cửa tương đối với ngoại thất, ô tiếp cận, `interiorId`, điểm xuất hiện và nhiệm vụ. Cửa đi theo vị trí/kích thước nhà khi admin chỉnh CMS; không gắn tọa độ tuyệt đối vào ảnh.
- Nội thất có lưới đi, vật cản, ô tương tác và cửa thoát riêng. Đổi cảnh phải hủy đường đi cũ, xóa trạng thái joystick, khóa thao tác cho tới khi đặt nhân vật xong.
- Lưu theo học sinh và nhiệm vụ: phiên bản, bước hoàn thành, vật đang mang, lựa chọn đã đặt, trạng thái nhận quà. Server kiểm tra quyền hồ sơ, thứ tự bước và cấp quà một lần; tải lại hoặc gửi lại không nhân đôi quà. Giữ tiến độ chưa đồng bộ để gửi lại.
- Phòng bạn bè dùng nội thất riêng của từng bé trong bản đầu. Thông điệp vị trí có ngữ cảnh làng/nhà để người ngoài không thấy nhân vật trong phòng chạy trên đường làng. Trở ra dùng đúng phiên bản bản đồ của phòng.
- Tái sử dụng bộ trang trí từ `RoomDecor.ts` và `LearningUpgrades.ts`; thêm cấu hình nhà và điều khiển nội thất riêng. Không suy ra hoàn thành nhiệm vụ từ lịch sử báo cáo giới hạn 200 sự kiện.

### Thực hiện và nghiệm thu

Làm Nhà của bé trước: cửa thật, nội thất đi lại được, nhiệm vụ dọn bàn và lưu tiếp tục. Sau đó mở Nhà Cô Tấm, Xưởng Gốm, Nhà Bác Nông Dân và Nhà sách. Mỗi nhà cần ngoại thất, nền nội thất không có nhân vật, đồ vật tách lớp và trạng thái trước/sau nhiệm vụ.

Kiểm tra bản Web Cocos thật trên desktop 1600 × 900 và mobile ngang 844 × 390: đi tới cửa; không xuyên tường/đồ; vào/ra đúng sau khi CMS đổi vị trí và kích thước nhà; thoát giữa nhiệm vụ; tải lại giữ bước và vật đang mang; cách ly hai hồ sơ; không nhận quà trùng; mất mạng hoặc lỗi tải không gây kẹt; vị trí trong phòng bạn bè đúng ngữ cảnh; nút Ra sân, joystick và xếp lớp hoạt động đúng.

## Chốt rà soát — 17/10/2026

Bản sửa điều hướng và nâng tương thích CMS đã được rà soát lại; TypeScript client, 65 nhóm logic, 6 bài mạng/khởi động, 26 API, 11 bài server và build API/server đạt. Test dùng `tsx` cần chạy ngoài sandbox Windows do lỗi `uv_os_get_passwd ENOMEM`. Fixture MySQL tự bỏ qua khi chưa có `MYSQL_TEST_URL` trỏ tới cơ sở dữ liệu riêng có tên kết thúc bằng `_test`.

Phạm vi hành trình 100 cấp và hồ sơ học sinh đã hoàn tất theo các release/QA ghi bên dưới. Các hạng mục mở rộng còn lại: bộ vật phẩm riêng theo từng cấp và lưu lịch sử báo cáo vượt giới hạn 200 sự kiện. Đây là phần mở rộng chưa triển khai; không tính là đã hoàn thành trong lần chốt này. Kết quả QA VPS bên dưới thuộc lần triển khai 16/10, không phải lần xác minh trực tiếp mới ngày 17/10.

## Sửa điều hướng — VPS 16/10/2026

NPC có điểm xuất phát bị vật cản che (Chị Mai trong bố trí đóng gói dự phòng) giữ nguyên vị trí đã lưu và đứng yên, không tạo tuyến tuần tra xuyên vật cản. Muốn NPC đi lại cần chỉnh vị trí hoặc vật cản qua admin và kiểm tra trước xuất bản. Bản đồ công bố trên VPS đã có vị trí Chị Mai hợp lệ `(43,25)` và được giữ nguyên. Điểm tiếp cận đồ vật được làm tròn về ô lưới, sửa trường hợp con gà đặt ở tọa độ lẻ không thể điều hướng tới.

Kiểm tra local: `test:client` đạt 65 nhóm logic và 6 bài mạng/khởi động; `check:client` và `server:build` đạt. Cập nhật kiểm thử theo cache contentVersion và footprint của bố trí hiện hành. `test:server` đạt 11/11 sau khi chạy ngoài sandbox (lỗi `uv_os_get_passwd ENOMEM` chỉ xảy ra trong sandbox Windows). Build Web Cocos 3.8.8 đạt. QA bản build thật bằng `node apps/game-client/tests/navigation-layout-web.cjs` đạt desktop 1600×900 và mobile ngang 844×390: Chị Mai đứng yên khi spawn bị chặn, tiếp cận con gà tọa độ lẻ qua ô lưới hợp lệ; không có page error. API và hồ sơ QA tạm riêng, không dùng dữ liệu thật; ảnh/báo cáo ở `apps/game-client/temp/navigation-layout-qa/`. Đã triển khai đồng bộ Web/API/rooms trong release `navigation-fix-35eb627f-20261016`, contentVersion `35eb627f`. Overlay 15 file SHA-256 `8d7947419bef72d6de305607d2ef9faee78ba80e760c8fe5237f6531b60bb07a`; checksum từng file đã đối chiếu trước kích hoạt. Backup `/opt/lang-tri-thuc/backups/database-20261016T092156Z.sql` phục hồi thử trùng khớp. CMS nâng tương thích theo cặp phiên bản đã biết, giữ NPC đã duyệt, bản nháp và lịch sử; 26 API test đạt, một fixture MySQL bỏ qua. Hai API MySQL healthy, bản đồ công bố giữ nguyên; QA HTTPS/quyền truy cập và signed WebSocket/câu trả lời hành trình/lưu MySQL đạt. Giữ release `reward-art-936d016-20261016` để rollback ứng dụng.

## Hình ảnh phòng riêng và cây thưởng — 16/10/2026

Bộ bảy asset mới gồm chậu cây, bình gốm, kệ sách, đèn lồng, cúp, cây thưởng và phông phòng gỗ. Ảnh tải khi cần, cây xếp lớp cùng nhân vật; giữ nguyên đồ đã chọn và điều kiện mở khóa. Chi tiết ảnh, prompt và kiểm tra tại [REWARD_ART_PASS](REWARD_ART_PASS.md).

## Chín nâng cấp game — VPS 16/10/2026

Release `upgrades-3065cfd-20261016`, source `3065cfd`: xuất bản bản đồ/NPC trực tiếp, xem trước/cảnh báo/khôi phục, bài luyện theo tuổi và kỹ năng, hướng dẫn người mới, báo cáo tuần, cây thưởng theo tiến độ, hội thoại NPC, joystick lớn và phòng riêng có đồ trang trí. Chi tiết cách sử dụng, giới hạn lịch sử và kiểm tra tại [GAME_UPGRADES_2026_10](GAME_UPGRADES_2026_10.md).

## Cô Giáo Lan hiển thị trước sân trường — VPS 15/10/2026

Release `teacher-depth-a2c06c8-20261015`, source `a2c06c8`: sửa mốc xếp lớp của ảnh trường có sân phía trước, tránh che cô giáo trên tuyến đi. Kiểm tra toàn tuyến và các điểm nội suy, desktop/mobile đạt. Chi tiết tại [TEACHER_LAN_REFERENCE](TEACHER_LAN_REFERENCE.md).

## Áp dụng bản đồ đã lưu — VPS 15/10/2026

Đã nhập đủ 23 vật thể từ bố trí revision 3 đã lưu trên VPS vào game và server. Release `applied-layout-501aa6a-20261015`, source `501aa6a`, contentVersion `0d971c1a`. Kiểm tra Cocos đối chiếu vị trí/kích thước từng node đạt; admin phân biệt bố trí đã áp dụng với bản nháp chờ áp dụng. Chi tiết tại [ADMIN_SCENE_LAYOUT](ADMIN_SCENE_LAYOUT.md).

## Lưu tất cả vị trí NPC — VPS 15/10/2026

Release `npc-batch-c10b260-20261015`, source `c10b260`: ghi chú bố trí vật thể/NPC không bắt buộc; có thể đổi nhiều NPC và chọn **Lưu tất cả vị trí NPC**. Chuyển lựa chọn giữ các thay đổi; lưu trong một giao dịch và kiểm tra phiên chỉnh sửa cũ. Kiểm tra lưu/tải lại hai NPC, ghi chú trống và HTTPS desktop/mobile đạt. Chi tiết tại [ADMIN_SCENE_LAYOUT](ADMIN_SCENE_LAYOUT.md).

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
