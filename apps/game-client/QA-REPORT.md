# Kết quả nghiệm thu bản playable

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
