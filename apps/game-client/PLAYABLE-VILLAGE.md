# Làng Tri Thức — bản làng có thể chơi

Luồng mặc định từ M2 là [Chương 1 — Ngày Về Làng](../../docs/MILESTONE_M2.md): Ông Đồ, trồng năm cây, học đếm và sao đầu. Luồng thu hoạch/rải hạt dưới đây vẫn được giữ để thử bằng `?demo=1`; save demo không bị ghi đè khi chơi Chương 1.

## Luồng chơi

1. Chạm/click Bác Nông Dân, nhân vật tự đi tới ô tiếp cận; chọn **Cháu sẵn sàng!**.
2. Chạm ba bó lúa có vòng sáng trong ruộng. Mỗi bó chỉ tính một lần, được thu hoạch khi nhân vật tới nơi.
3. Quay về gặp bác. Làm ba câu đếm hạt gạo; có thể đổi sang cộng hai nhóm hạt trong phạm vi 1–10. Trả lời sai được hướng dẫn đếm lại, không mất điểm.
4. Làm ba câu **Ô ăn quan • luyện rải hạt**: mỗi ô nhận một hạt theo vòng được chỉ định, chọn ô nhận hạt cuối cùng. Bài tập này dạy thao tác rải hạt; không mô phỏng luật bắt quân/đối kháng của một trận đầy đủ.
5. Xem kết quả rải hạt từng câu, kể cả câu cuối; chọn **Nhận huy hiệu** để xem huy hiệu **Người bạn của làng**. Có thể chơi lại bài học; tiến độ tự lưu bằng localStorage, khôi phục khi reload. Xóa dữ liệu site sẽ xóa tiến độ.

Nhân vật/NPC/công trình/tile đã dùng PNG có alpha. Nhân vật có 24 frame: tám hướng × đứng/yêu cầu hai bước chân. Các PNG mới có `.meta` do Cocos tạo. Không cần gắn thêm component vào scene; `VillageBootstrap` đã có trên Canvas.

## Multiplayer

Chạy `npm run server` từ root, mở bản web với query `?server=http://127.0.0.1:2567`. Client dùng SDK Colyseus và room `village`; room tối đa 16 người. Người khác có màu xanh để dễ phân biệt. Vị trí được đồng bộ mỗi 50 ms, người khác được nội suy; server kiểm tra gói tin, tốc độ và collision trên cùng bản đồ.

Client dùng bản browser SDK chính thức giữ nguyên trong `resources/vendor/colyseus.txt`, được đồng bộ từ npm trước mỗi build và tải khi chọn online. Cách này giữ nguyên mã browser và ngữ nghĩa iterable của SDK, tránh transpile các dependency networking qua Cocos. TypeScript vẫn dùng type của cùng phiên bản SDK. License được chép vào bản build. Server biên dịch ESM để transport và matchmaker dùng cùng một instance Colyseus; kiểm thử production chạy trong tiến trình riêng.

Mất kết nối tự thử lại; nhân vật được hiệu chỉnh về vị trí server khi gửi bước không hợp lệ. Quests, lúa và huy hiệu là tiến độ cá nhân cục bộ, không có điểm chung hay database. Server không nhận tên thật và không có chat.

Server bind localhost mặc định. Để thử trong cùng LAN, chạy web/server với `HOST=0.0.0.0`, mở bằng địa chỉ LAN của máy và truyền endpoint LAN tương ứng. Khi host trên HTTPS, endpoint cần HTTPS/WSS. Chưa publish lên dịch vụ cloud.

## Build và tài nguyên

`npm run web:build` chạy Cocos Creator 3.8.8 với `build-web.json`, xuất vào `build/web-desktop` (Git ignore), rồi hoàn thiện HTML để game chiếm vùng browser. Build chỉ chọn các module 2D/UI/Graphics/WebGL cần thiết; không thêm physics, Spine hay DragonBones. Cấu hình engine gốc được giữ nguyên.

Terrain PNG được ghép thành 25 canvas/texture cụm 8 × 8 khi tải, rồi render bằng Sprite; không tạo 1.600 node. Cụm ngoài camera được tắt. SpriteFrame và texture cụm được giải phóng khi bootstrap bị hủy. Camera ưu tiên vùng nhìn dưới HUD để NPC không bị che.

## Kiểm thử và giới hạn

Kết quả nghiệm thu và số đo: [QA-REPORT.md](QA-REPORT.md).

- `npm run check:client`: TypeScript strict, bỏ kiểm tra bộ `.d.ts` engine bằng `skipLibCheck`.
- `npm run test:client`: 17 nhóm về tọa độ, A*, collision, input, scene, lưu tiến độ và thuật toán rải hạt.
- `npm run server:build` và `npm run test:server`: build TypeScript, hai client Colyseus đồng bộ/thoát, từ chối teleport và đi qua ao.
- `npm run test:web`: bản web Cocos thực, không thay script hay mock renderer; keyboard, thu hoạch, câu sai/đúng, huy hiệu, reload, touch/joystick, xoay màn hình, hai browser online. Ảnh và số đo nằm trong `temp/release-qa`.

Máy kiểm thử hiện tại có AMD Radeon. Không có điện thoại kết nối qua ADB; công cụ tự động hóa giao diện Windows không khởi tạo được. Build CLI đã import asset và deserialize scene bằng Cocos thật; thao tác giao diện Editor, điện thoại thật và hiệu năng Intel HD/UHD chưa được xác nhận. Mobile trong test là browser giả lập Android, không thay cho thiết bị vật lý.

## Tài liệu kỹ thuật tham khảo

Build theo [Cocos Creator CLI 3.8](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-in-command-line.html). Client/server tích hợp theo [Colyseus SDK TypeScript](https://docs.colyseus.io/getting-started/typescript) và [WebSocket transport](https://docs.colyseus.io/server/transport/ws), với phiên bản khóa trong `package-lock.json`.
