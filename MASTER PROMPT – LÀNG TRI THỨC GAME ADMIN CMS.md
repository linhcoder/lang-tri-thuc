# MASTER PROMPT – LÀNG TRI THỨC GAME ADMIN CMS

## 1. Vai trò và mục tiêu

Bạn là Senior Full-stack Engineer, Game Tools Engineer, UI/UX Designer và Software Architect.

Nhiệm vụ: Xây dựng hệ thống quản trị **Làng Tri Thức – Game Admin CMS** hoàn chỉnh, tích hợp với game Cocos Creator 3.x + TypeScript hiện tại.

Hệ thống phải có 9 phân hệ:

1. Dashboard – Tổng quan
2. World Editor – Chỉnh sửa bản đồ
3. NPC Manager – Quản lý nhân vật
4. Asset Library – Quản lý tài nguyên
5. Quest Builder – Quản lý nhiệm vụ
6. Learning CMS – Quản lý nội dung học tập
7. Daily Events – Quản lý sự kiện
8. Game Preview – Xem trước game
9. Publish Manager – Quản lý phiên bản và xuất bản

**Yêu cầu quan trọng:** Đây phải là ứng dụng hoạt động thực tế, không chỉ là giao diện demo.

## 2. Kiểm tra dự án hiện có

Trước khi lập trình:

- Đọc cấu trúc repository, README, package.json, các scene, prefab và asset.
- Kiểm tra hệ thống NPC, nhiệm vụ, bản đồ và dữ liệu hiện tại.
- Xác định cách tích hợp Admin với game mà không phá vỡ chức năng cũ.
- Giữ nguyên các UUID, asset và scene hiện có.
- Tạo `docs/IMPLEMENTATION_PLAN.md` mô tả kế hoạch và các rủi ro.
- Nếu repository đã có backend hoặc Admin, tái sử dụng thay vì tạo trùng.

## 3. Công nghệ

Nếu chưa có hệ thống tương đương, sử dụng:

- Frontend: React, TypeScript, Vite
- UI: Tailwind CSS, shadcn/ui, Lucide Icons
- World Editor: PixiJS, viewport pan/zoom
- Backend: Node.js, Fastify, TypeScript
- Database: MySQL, Prisma
- Validation: Zod
- Authentication: JWT, RBAC
- Asset Storage: Local storage với abstraction cho S3/CDN
- Game: Cocos Creator 3.x + TypeScript
- Deployment: Docker Compose, nginx/aaPanel

Tổ chức thư mục rõ ràng, tách Admin, API, shared schemas và game content SDK.

## 4. Thiết kế giao diện

Dựa trên ảnh mockup Full Admin Làng Tri Thức được cung cấp.

Phong cách:

- Sidebar xanh navy đậm.
- Nội dung nền sáng, thẻ bo góc.
- Màu xanh dương cho thao tác chính, xanh lá cho xuất bản.
- Giao diện hoàn toàn bằng tiếng Việt.
- Icon Lucide nhất quán.
- Asset và NPC hiển thị thumbnail thực tế.
- Desktop-first, hỗ trợ màn hình 1366px trở lên.
- Form chỉnh sửa rộng, rõ ràng, hỗ trợ tìm kiếm và lọc.

Layout World Editor:

- Bên trái: thư viện đối tượng, layer và công cụ.
- Chính giữa: bản đồ isometric tương tác.
- Bên phải: bảng Inspector.
- Trên cùng: chọn bản đồ, undo/redo, lưu, xem trước, xuất bản.

## 5. Dashboard

Xây dựng dashboard có:

- Tổng người chơi và người chơi hoạt động.
- Số NPC, nhiệm vụ, asset, bài học.
- Biểu đồ hoạt động theo ngày.
- Thống kê hoàn thành nhiệm vụ.
- Hoạt động quản trị gần đây.
- Phiên bản đang phát hành.
- Cảnh báo asset thiếu, nhiệm vụ lỗi, dữ liệu chưa xuất bản.

Dữ liệu lấy từ API thực. Không hiển thị số liệu giả trong production.

## 6. World Editor

Đây là phân hệ ưu tiên cao nhất.

Chức năng:

- Hiển thị bản đồ làng từ asset và dữ liệu game hiện tại.
- Pan, zoom, chọn, kéo thả đối tượng.
- Thêm cây cối, nhà cửa, công trình, NPC, vật phẩm, trigger.
- Chỉnh tọa độ X/Y/Z, scale, rotation, layer.
- Snap to grid.
- Multi-select, copy, paste, duplicate, delete.
- Undo/redo.
- Bật/tắt/khóa layer.
- Hiển thị vùng va chạm, vùng có thể di chuyển.
- Cấu hình điểm spawn và vị trí tương tác.
- Tìm kiếm đối tượng theo ID/tên.
- Lưu bản nháp, kiểm tra thay đổi và xuất bản.

**Lưu ý kỹ thuật:** Không chỉnh trực tiếp file scene Cocos nếu chưa xác minh an toàn. Ưu tiên lớp dữ liệu bản đồ riêng, đồng bộ qua adapter và runtime loader.

Phải có chuyển đổi tọa độ chính xác giữa Editor và Cocos.

## 7. NPC Manager

Danh sách NPC dạng card hoặc table, hỗ trợ tìm kiếm, lọc và xem trước.

Mỗi NPC có:

- ID duy nhất, tên, vai trò, mô tả.
- Portrait, sprite, animation.
- Vị trí xuất hiện, khu vực.
- Tốc độ, hướng nhìn, bán kính tương tác.
- Lịch sinh hoạt theo thời gian trong game.
- Hội thoại phân nhánh.
- Danh sách nhiệm vụ liên kết.
- Quan hệ với NPC khác.
- Điều kiện xuất hiện và trạng thái hoạt động.

Tạo Dialogue Editor dạng node graph với điều kiện, lựa chọn và biến trạng thái.

Cho phép xem trước animation và hội thoại.

NPC không được xóa cứng nếu đang được bản đồ hoặc nhiệm vụ tham chiếu.

## 8. Asset Library

Xây dựng thư viện asset tập trung.

- Upload nhiều file.
- Phân loại NPC, công trình, cây cối, vật phẩm, UI, âm thanh, hiệu ứng.
- Grid thumbnail và chế độ table.
- Tìm kiếm theo tên, tag, loại, kích thước.
- Xem trước sprite, sprite sheet, atlas và animation khi hỗ trợ.
- Lưu metadata: kích thước, định dạng, dung lượng, checksum, nguồn và giấy phép.
- Phát hiện file trùng.
- Hiển thị asset đang được sử dụng ở đâu.
- Cảnh báo asset không còn tham chiếu.
- Quản lý phiên bản và khôi phục.
- Asset Picker dùng chung cho các module.

Không tự xóa file hoặc thay đổi UUID của Cocos.

## 9. Quest Builder

Quản lý nhiệm vụ chính, phụ, hằng ngày và sự kiện.

Mỗi nhiệm vụ gồm:

- Tên, mô tả, NPC giao nhiệm vụ.
- Khu vực và điều kiện mở khóa.
- Các bước thực hiện.
- Điều kiện hoàn thành.
- Phần thưởng XP, xu ảo, vật phẩm.
- Nhiệm vụ tiếp theo.
- Trạng thái bản nháp, hoạt động, tạm dừng.

Hỗ trợ các loại bước:

- Nói chuyện với NPC.
- Đi đến địa điểm.
- Thu thập vật phẩm.
- Tương tác với công trình.
- Trả lời câu hỏi.
- Hoàn thành mini game.

Xây dựng validator kiểm tra nhiệm vụ thiếu NPC, thiếu asset, điều kiện không hợp lệ và vòng phụ thuộc.

## 10. Learning CMS

Quản lý nội dung giáo dục cho trẻ em.

Môn học:

- Toán
- Tiếng Việt
- Tiếng Anh

Hỗ trợ:

- Khối lớp, chủ đề, độ khó.
- Ngân hàng câu hỏi.
- Trắc nghiệm, điền đáp án, ghép cặp, sắp xếp, chọn hình.
- Đáp án đúng, giải thích, gợi ý.
- Hình ảnh và âm thanh minh họa.
- Import/export CSV hoặc JSON.
- Liên kết bài học với nhiệm vụ và mini game.
- Xem trước bài học.
- Theo dõi tiến độ và kết quả học tập.

Có quy trình duyệt nội dung trước khi xuất bản.

## 11. Daily Events

Quản lý:

- Điểm danh.
- Thử thách hằng ngày.
- Nhiệm vụ hằng tuần.
- Sự kiện Trung Thu.
- Sự kiện mùa gặt.
- Thi giải đố.
- Thưởng đăng nhập liên tục.

Cho phép cấu hình thời gian bắt đầu/kết thúc, quy tắc lặp lại, điều kiện tham gia và phần thưởng.

Sử dụng múi giờ Asia/Ho_Chi_Minh.

Tránh phát thưởng trùng. Không thiết kế cơ chế gây áp lực quá mức cho trẻ em.

## 12. Game Preview

Cho phép Admin xem trước nội dung trước khi phát hành.

- Tích hợp bản build web Cocos thực tế.
- Chọn bản đồ và phiên bản nội dung.
- Xem NPC, nhiệm vụ, asset mới.
- Kiểm tra hội thoại.
- Giả lập thời gian trong game.
- Chạy thử các điều kiện nhiệm vụ.
- Xem cảnh báo và lỗi tham chiếu.

Preview bản nháp phải tách biệt với nội dung production.

Nếu chưa có bản build game, hiển thị hướng dẫn build thay vì tạo ảnh giả làm preview.

## 13. Publish Manager

Xây dựng quy trình:

Draft → Review → Approved → Published → Archived.

Chức năng:

- Kiểm tra dữ liệu trước khi xuất bản.
- Tạo content manifest JSON theo phiên bản.
- Kiểm tra liên kết NPC, Quest, Asset, Map.
- Xem lịch sử phiên bản.
- Ghi release notes.
- Publish staging và production.
- Rollback phiên bản.
- Audit log đầy đủ.

Game tải manifest đã xuất bản từ API/CDN, cache theo phiên bản và fallback về phiên bản ổn định gần nhất khi gặp lỗi.

Thay đổi nội dung tương thích có thể cập nhật không cần build lại game; thay đổi mã nguồn hoặc schema không tương thích có thể yêu cầu build mới.

## 14. Backend và Database

Thiết kế schema cho:

users, roles, permissions, audit_logs, players, maps, map_versions, map_objects, zones, npcs, npc_schedules, dialogues, dialogue_nodes, assets, asset_versions, asset_references, quests, quest_steps, quest_dependencies, items, rewards, lessons, questions, events, event_rules, player_progress, player_inventory, releases, manifests.

Yêu cầu:

- CRUD API thực tế.
- Validation ở backend.
- Phân quyền theo vai trò.
- Soft delete với dữ liệu có tham chiếu.
- Transactions cho phát thưởng và publish.
- Optimistic locking chống ghi đè dữ liệu.
- Swagger/OpenAPI.
- Logging và xử lý lỗi thống nhất.
- Migrations và seed dữ liệu demo.

## 15. Tích hợp Cocos Creator

Xây dựng Game Content SDK bằng TypeScript.

Chức năng:

- Tải content manifest.
- Tải dữ liệu map, NPC, quest và bài học.
- Kiểm tra schema.
- Cache theo phiên bản.
- Mapping assetId với Cocos asset UUID hoặc remote URL.
- Chuyển dữ liệu thành entity/component trong game.
- Fallback khi API lỗi.

Bắt buộc chứng minh luồng:

Tạo NPC trong Admin → Chọn Asset → Đặt trên bản đồ → Gán hội thoại/nhiệm vụ → Lưu → Publish staging → Game Cocos hiển thị NPC đúng vị trí.

## 16. Bảo mật và chất lượng

- Mật khẩu hash an toàn.
- JWT và RBAC.
- Chống XSS, CSRF khi áp dụng, upload độc hại, path traversal.
- Rate limit API.
- Không commit secrets.
- Ghi audit log các thay đổi quan trọng.
- Hạn chế thu thập dữ liệu cá nhân trẻ em.
- Có unit tests, integration tests, E2E Playwright.
- TypeScript strict.
- Chạy lint, typecheck, build và tests sau mỗi giai đoạn.

## 17. Thứ tự triển khai

Phase 0: Audit repository và lập kế hoạch.

Phase 1: Admin layout, backend, database, authentication, dashboard.

Phase 2: Asset Library và NPC Manager.

Phase 3: World Editor.

Phase 4: Quest Builder, Dialogue Editor, Game Content SDK.

Phase 5: Learning CMS và Daily Events.

Phase 6: Game Preview và Publish Manager.

Phase 7: Testing, security, tối ưu và tài liệu triển khai.

Ưu tiên làm một luồng hoàn chỉnh từ Asset → NPC → World Editor → Publish → Cocos trước khi mở rộng.

## 18. Yêu cầu bàn giao

- Mã nguồn hoạt động trong repository.
- README tiếng Việt.
- `.env.example`.
- Database migrations và seed.
- Hướng dẫn chạy trên Windows/VS Code.
- Hướng dẫn build và triển khai trên aaPanel/nginx.
- API documentation.
- Kết quả lint, typecheck, tests và build.
- Danh sách chức năng hoàn thành, chưa hoàn thành, lỗi còn tồn tại.

**BẮT ĐẦU NGAY:** Kiểm tra repository hiện tại, lập kế hoạch, triển khai Phase 1 và luồng chức năng Asset → NPC → World Editor → Publish → Game. Không dừng lại ở việc viết tài liệu hoặc dựng UI tĩnh. Không tuyên bố hoàn thành nếu chưa chạy thử được.
