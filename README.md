# Làng Tri Thức

Dự án game giáo dục Web Multiplayer 2.5D Isometric dành cho trẻ em Việt Nam từ mầm non đến tiểu học.

## Công nghệ

- Cocos Creator 3.8.x + TypeScript
- Colyseus Multiplayer
- Node.js + Colyseus (server multiplayer)
- PostgreSQL + Redis (giai đoạn sau)

## Mục tiêu

Xây dựng thế giới làng quê Việt Nam, nơi trẻ có thể khám phá, tương tác NPC, học tập và tham gia các mini game dân gian cùng bạn bè.

## Trạng thái

Prototype có bản đồ 40 × 40, sprite tám hướng, NPC, nhiệm vụ thu hoạch lúa, bài đếm/cộng hạt gạo, bài luyện rải hạt Ô ăn quan và multiplayer tối đa 16 người/phòng.

Luồng mặc định hiện là **Chương 1: Ngày Về Làng** — chào Ông Đồ, trồng năm cây, học đếm và nhận sao đầu. Demo thu hoạch/rải hạt cũ được giữ tại `?demo=1`. Xem [M2](docs/MILESTONE_M2.md) để biết save migration và giới hạn kiểm thử.

## Chạy bản web

Yêu cầu Node.js 22+ và Cocos Creator 3.8.8.

```powershell
npm ci
npm run web:build
```

Trong hai terminal riêng:

```powershell
npm run server
```

```powershell
npm run web
```

Mở `http://127.0.0.1:8080/` để chơi offline; thêm `?server=http://127.0.0.1:2567` để vào làng online. Mở hai cửa sổ browser để thấy nhau. Không có tài khoản/chat; tên bạn chơi được tạo tự động. Tiến độ học tập lưu riêng trên máy.

Nếu Cocos cài ở vị trí khác, đặt `COCOS_CREATOR` hoặc chạy `node tools/build-web.cjs <đường-dẫn-CocosCreator.exe>`.

## Kiểm thử

```powershell
npm run check:client
npm run test:client
npm run server:build
npm run test:server
npm run test:web
npm run test:m2
```

`test:web` cần bản build và hai server cục bộ đang chạy như trên. Nó tự tìm Chrome/Edge có sẵn; có thể đặt `CHROME_EXECUTABLE` hoặc cài Chromium bằng `npx playwright install chromium`. Kiểm tra kiểu client cần mở project hoặc build một lần để Cocos tạo `temp/declarations`.

Chi tiết: [hướng dẫn prototype](apps/game-client/MILESTONE-01A.md), [luồng học tập và multiplayer](apps/game-client/PLAYABLE-VILLAGE.md), [nguồn art và prompt](apps/game-client/ART.md).

Thiết kế game và lộ trình theo master prompt: [audit M0/M1](docs/AUDIT_M0.md), [cốt truyện tám chương](docs/STORY_BIBLE.md), [kế hoạch triển khai](docs/IMPLEMENTATION_PLAN.md). Các chương và tính năng đích trong tài liệu chưa đồng nghĩa đã triển khai trong prototype.
