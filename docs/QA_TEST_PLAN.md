# QA Test Plan

Gói rà soát trước beta từ source đang ship: chạy `node tools/export-beta-review.cjs`, mở `temp/beta-review/index.html`; dữ liệu đi kèm `review.json`. Có 90 câu hỏi/đáp án/gợi ý/nguồn, tám chương, sáu NPC truyện, 58 asset và chín ca thiết bị thật. Script kiểm cấu trúc/ID/file asset và tính lại chín đáp án toán; không tự xác nhận sư phạm, văn hóa, license hoặc thiết bị. Bản nháp/review trên database cần xuất riêng bằng admin; gói này chỉ đọc repository. Artifact ở temp, có thể tạo lại và không đưa quyết định review vào runtime.

Kết quả kiểm tra mới nhất ở [QA-REPORT.md](../apps/game-client/QA-REPORT.md); [AUDIT_M0.md](AUDIT_M0.md) ghi baseline lịch sử. Checklist bên dưới là kế hoạch, không phải lời khẳng định đã pass toàn bộ.

Chương 1 có checklist/save migration ở [MILESTONE_M2.md](MILESTONE_M2.md); chạy `npm run test:m2` trên web server để kiểm trồng năm cây, học đếm và sao duy nhất. `test:campaign` kiểm tám chương hiện hành; `test:web` giữ nghiệm thu demo cũ bằng `?demo=1`.

## Chạy tự động

Từ root, PowerShell dùng `npm.cmd` nếu script `npm.ps1` bị execution policy chặn:

```powershell
npm ci
npm run web:build
npm run check:client
npm run test:client
npm run test:server
```

Hai terminal khác: `npm run web` (8080) và `npm run server` (2567); terminal test: `npm run test:web`. Cần Chrome/Edge hoặc Playwright Chromium; `CHROME_EXECUTABLE` tùy chọn. Cocos executable mặc định ở `C:/ProgramData/cocos/editors/Creator/3.8.8/CocosCreator.exe`, đổi bằng `COCOS_CREATOR`. Build tạo declarations mà client tsc cần. Không test bằng source override rồi báo production pass.

| Lớp | Kiểm hiện có | Phần cần bổ sung |
| --- | --- | --- |
| Pure/controller harness | Tile round-trip, A* vs BFS, collision, ownership input, camera/zoom, planting/migration, quest/save, lịch âm và network lifecycle | Các lỗi mới tìm được và hành vi phụ thuộc thiết bị |
| Server integration | Packets/teleport/pond, auth/vé phòng riêng, authoritative reward, reconnect, tải local 10/16/20 client | Benchmark production lớn và backend đa instance |
| Web build thực | Tám chương, touch/joystick/rotation, NPC patrol/hai pha tám hướng, hai client/reload online/offline, quality/dispose, UI phụ huynh xóa/đăng xuất | Soak nhiều giờ, mất mạng trên thiết bị và phiên browser dài |
| Editor GUI | Checklist thủ công | Chưa có tự động GUI đáng tin trong môi trường này |
| Hardware | AMD headless WebGL đã có số đo cũ | Intel HD/UHD và phone thật, nhiệt/30 phút |
| Nội dung | Toán thử nghiệm và nguồn nền | Review chuyên môn/giọng/biến thể văn hóa và quyền asset |

Harness `cc` chỉ kiểm logic, không chứng minh engine rendering. Browser Android giả lập không chứng minh trình duyệt/driver trên điện thoại thật. Hai client không chứng minh 16 slot ổn định.

## Editor 3.8.8 — thao tác chính xác

1. Dashboard Add/Import Project → `apps/game-client`, engine 3.8.8, mở project có sẵn. Nếu Editor giữ scene cũ chưa lưu, không save đè bản repo; reopen/reload để lấy dữ liệu mới.
2. Assets → `scenes/VillageScene.scene`. Canvas UITransform 1280 × 720, camera hiện có, component VillageBootstrap đã gắn; không thêm script lần hai, không cần prefab mới.
3. Đợi import script/PNG; Console không có lỗi compile/UUID. Runtime objects chỉ xuất hiện khi Play, không đòi có sẵn trong Hierarchy edit mode.
4. Preview in Browser, focus canvas. WASD/mũi tên/diagonal, click đi vòng ao/đình, click ngoài map không hủy route hợp lệ, tab blur không kẹt phím.
5. Click NPC → đi tới cạnh → hội thoại, Esc/Đóng; header/modal không phát lệnh world. Nhận việc → bó lúa → đổi NPC giữa đường; không giữ mục tiêu cũ. Mobile joystick takeover hủy cả route và pending interaction.
6. Flow demo ba bó → ba câu đếm → ba câu rải → badge, sai có gợi ý, reload giữ state. Không dùng demo này nghiệm thu Chương 1 năm cây.
7. Portrait/landscape, joystick và close nút chạm được; NPC không bị header che. Dùng link build online riêng để test hai browser với server chạy.

M0/M1 không yêu cầu chỉnh scene thủ công. Nếu CLI import/Preview GUI khác nhau, ghi log và tái hiện, không sửa UUID để chữa giả.

## Tiêu chí world/input M1

Một lệnh hợp lệ mới sở hữu movement; lệnh invalid không hủy lệnh đang chạy. NPC chỉ mở khi đứng gần và path đã hết; joystick/manual/reset không để pending target sống lại. Map/path/camera giữ invariant; objects depth theo chân. Không save/collect khi đang tới nơi khác. Regression fixtures phải thực hiện hành vi chuyển lệnh, không chỉ so source text.

## Nghiệm thu chương và an toàn

Mỗi chương: fresh save → intro → unlock → quest → mini game solo → reward unique → ending → replay → reload giữa bước; thử corrupt/old/newer save và storage full. Data validator chặn missing references/cycles/draft nội dung. Offline không cần server. Online: parent authorization, invite hết hạn, block/report, approved emote IDs, packet flood và reward giả; không chỉ nhìn UI khóa.

Văn hóa/giáo dục: đáp án duy nhất, tuổi phù hợp, dấu tiếng Việt/audio, source và review; nội dung hư cấu ghi rõ. Test trẻ có giám sát chỉ khi có protocol/consent và minimization; không tự tiếp cận trẻ hoặc ghi hình/voice.

## Đo hiệu năng

Ma trận đề xuất: Intel HD 4000/HD 620/UHD 620 hoặc máy tương đương sẵn có; Android RAM thấp và iPhone Safari thực tế, không coi tên máy là đã test. Record model/OS/browser/GPU/viewport/DPR/quality/network; cold/warm load, transferred bytes, time-to-interactive, FPS/p95/draw calls/JS+GPU memory khi đo được. Chạy 30 phút di chuyển/chuyển khu/rejoin để phát hiện leak và nhiệt.

Mục tiêu Low 30 FPS: p95 ≤33,3 ms, không sai collision/speed hoặc mất progress. Chốt mức MB/tải sau đo trên thiết bị mục tiêu, chưa đặt số marketing. Room load 10/16/20 client với bandwidth/event loop/patch latency và abuse; chọn maxClients sau benchmark.

## Báo cáo và gate

Ghi commit baseline, diff files, lệnh/exit/result, ảnh/log, lỗi tái hiện, phần chưa test và next milestone. Stop-ship: save loss, safety bypass, sai thưởng, nội dung sai nghiêm trọng, không hoàn thành solo, crash. Không “pass” thủ công khi môi trường không thao tác được. Sau mỗi milestone chờ xác nhận phạm vi tiếp theo; không commit/push tự động.
