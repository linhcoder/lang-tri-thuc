# Bác Nông Dân theo ảnh tham khảo — 15/10/2026

Asset mới được tạo bằng OpenAI built-in `image_gen` từ ảnh người dùng cung cấp. Giữ nét mặt, kính chữ nhật, tóc ngắn và áo khoác họa tiết xanh/hồng, quần jeans, giày xám trong ảnh; chuyển sang phong cách NPC vẽ tay của game. Không lưu ảnh gốc vào bộ asset.

- Atlas: `apps/game-client/assets/resources/village/farmer-reference-v1.png`, PNG RGBA 1774×887, nền trong suốt.
- Prompt đầy đủ: [farmer-reference-v1.prompt.json](farmer-reference-v1.prompt.json).
- 8 cột: E, NE, N, NW, W, SW, S, SE. Ba hàng: đứng, bước đi, vẫy chào.

Registry giữ ID `character.farmer`, trỏ sang atlas mới. Hình ban đầu lấy ô đứng hướng nam. Các khung runtime cắt theo dải alpha đã đo: 8–295, 306–574, 583–872; dùng toàn bộ bề rộng ô để không đổi tỷ lệ giữa các hướng. `VillageArt.farmerFrame` cung cấp 24 frame riêng; chuyển động và vẫy chào của Bác Nông Dân dùng atlas này, không lật ảnh và không quay lại hàng farmer trong atlas NPC chung. Các đường đi và tương tác nhiệm vụ tiếp tục dùng dữ liệu hiện có, contentVersion `d92c670c`.

TypeScript, toàn bộ test client và build Cocos đạt. QA Cocos xác nhận 24 frame riêng, 8 hướng đứng/vẫy chào đúng atlas, scale ngang dương, hình trong game trên 1440×900 và 844×390, page errors rỗng. Đã xem ảnh mobile và bản tổng hợp 24 frame. Báo cáo/ảnh local ignored: `apps/game-client/temp/farmer-reference-qa/`.

Thông tin release VPS và QA HTTPS được ghi sau khi phát hành.
