# Hình ảnh phòng riêng và cây thưởng — 16/10/2026

Tạo mới bảy asset bằng **built-in image_gen**, thay hình khối minh họa trước đây. Phong cách tranh game làng Việt, gỗ màu mật ong, gốm và hoa lá tông ấm. Các ảnh được sao chép nguyên bản, giữ kênh alpha của sáu sprite. Phông phòng có nền kín.

Tệp nằm trong `apps/game-client/assets/resources/village/`:

- `reward-plant-v1.png`: chậu hoa nhài bằng đất nung.
- `reward-pottery-v1.png`: bình gốm men xanh trắng họa tiết sen.
- `reward-books-v1.png`: kệ gỗ và sách bìa vải.
- `reward-lantern-v1.png`: đèn lồng đỏ trên giá gỗ.
- `reward-trophy-v1.png`: cúp sách và sao vàng.
- `reward-tree-v1.png`: cây thưởng tán xanh, hoa vàng và gốc có cỏ.
- `reward-room-v1.png`: phòng gỗ, nền gạch và ba bệ trưng bày.

Toàn bộ prompt cuối cùng tại [reward-art-v1.final-prompts.json](reward-art-v1.final-prompts.json). Asset đăng ký với ID `reward.*` trong VisualAssets và manifest thiết kế.

Ảnh phòng và đồ chỉ tải khi mở phòng/chọn đồ; cây tải khi đạt mốc thưởng. Dùng chung bộ nhớ đệm và vòng đời texture của VillageArt. Cây là các node riêng trong nhóm xếp lớp nhân vật, không thêm va chạm. Lưu đồ, điều kiện mở khóa, số sao và vị trí bản đồ không đổi.

Kiểm tra bằng TypeScript và bản build Cocos thật: năm món đồ, phông phòng, năm cây thưởng, desktop và mobile; không có lỗi JavaScript. Fixture hình ảnh dùng một chiến dịch hoàn thành hợp lệ trong API cục bộ riêng, không cấp thưởng cho người dùng thật. Chạy `npm run test:reward-art`. Ảnh kiểm tra trong `apps/game-client/temp/reward-art-qa/`.
