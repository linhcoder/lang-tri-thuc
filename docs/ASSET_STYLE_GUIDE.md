# Asset Style Guide

## Hướng mỹ thuật

2.5D isometric 2:1, tươi sáng, silhouette rõ, đầu nhân vật lớn vừa phải, mặt thân thiện. Làng hư cấu lấy cảm hứng đồng bằng Bắc Bộ; vật liệu mái ngói, gỗ, tre, đất, nước. Không trộn kiến trúc/đồ nghi lễ vùng miền rồi gọi là đại diện cả Việt Nam. Nhìn từ camera cố định, không phối cảnh xa gần kiểu 3D.

Palette đề xuất: cỏ xanh ấm, đất nâu sáng, mái ngói đỏ đất, nước xanh lam vừa; UI kem + xanh đậm. Tránh chớp sáng nhanh, tương phản cực gắt, effect che instruction. Vật tương tác dùng icon/outline bên cạnh màu, không dựa màu duy nhất.

## Asset hiện có

`assets/resources/village/`: child, tiles, temple, house, banyan, banana, farmer, rice PNG alpha; `.meta` được Cocos tạo. Prompt/provenance ở [ART.md](../apps/game-client/ART.md). Đây là asset AI cho prototype, chưa qua review văn hóa/animation và không có bằng chứng đồng nhất pixel giữa mọi frame. Không tự coi ảnh đình/nhà là phục dựng di tích thật.

Child sheet 8 cột × 3 hàng; thứ tự E, NE, N, NW, W, SW, S, SE; hàng idle, walk A, walk B. Tile atlas 3 × 2; logical diamond 64 × 32, ô hiện tại có grass/road/rice/pond/courtyard/flower grass. Source atlas lớn hơn logical tile và được canvas resize khi tạo chunk.

## Quy chuẩn sản xuất

| Loại | Quy chuẩn đích | QA |
| --- | --- | --- |
| Tile | logical 64 × 32, seamless edge, alpha đúng diamond | 40 × 40 không khe/halo, đúng grid |
| Character | 8 hướng, chân cùng baseline, pivot chân; idle/walk/wave/cheer | Không đổi identity/scale, không cắt chân, không trượt |
| NPC | silhouette/portrait riêng, hit area đúng chân + thân | Tên không chồng, tương tác không qua tường |
| Nhà/cây | foot anchor/occlusion, collision footprint riêng trong data | Đi quanh cả bốn phía, y-sort đúng |
| UI | scale theo CSS pixels, chữ có dấu, icon dễ hiểu | 390 × 844 và 844 × 390, nút ≥44 CSS px |
| Audio | voice Việt review, phụ đề matching, license/provenance | Nghe lại/tắt tiếng, thiếu audio có fallback |

NPC mới chưa có art dùng placeholder render thật và nhãn rõ, không tạo file prefab/scene giả. Không cần tạo mới PNG cho M0/M1.

## Import, atlas và ngân sách

Giữ UUID `.meta`; thay PNG đúng file chỉ khi chủ động update asset và kiểm import. SpriteFrames runtime hiện được slice thủ công nên không trim atlas làm đổi tọa độ mà thiếu migration. Các ảnh standalone hiện không batch thành một atlas; tối ưu sau profiling, không hứa atlas đã có.

Đích Low: texture tier vừa đủ kích thước hiển thị, hạn chế >2048 mỗi chiều, hỗ trợ WebGL/mobile kiểm thực tế; chọn compression theo alpha/platform và visual QA. Chốt ngân sách tải/bộ nhớ ở M2 sau đo network + GPU, không dùng tổng byte source làm bandwidth. Khu mới dùng asset manifest + bundle, prefetch khu tiếp theo sau gameplay ready, cleanup owner rõ.

## Naming và provenance

ID ổn định `npc.ong-do`, `world.dinh`, `ui.quest`, file kebab-case; manifest ghi path/uuid/version/author-or-generation/source/license/reviewState/bundle/size. AI output ghi tool + prompt + ngày + edits; quyền sử dụng không suy ra chỉ từ có URL. Tranh Đông Hồ cần license của bản cụ thể và review; gọi bản mô phỏng là “minh họa lấy cảm hứng”, không gắn tên tranh cổ khi hình không đúng.

Checklist trước thêm asset: render được → alpha/crop → hướng/pivot → chữ/biểu tượng → văn hóa/giấy phép → collision/depth → size/batch → mobile. Không thay source/meta/config ngoài phạm vi milestone.
