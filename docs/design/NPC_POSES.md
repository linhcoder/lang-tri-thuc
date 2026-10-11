# Khung đi và chào NPC

`npc-poses-v1.png` là atlas RGBA 768 × 2048, 24 khung: ba cột và tám hàng. Hàng lần lượt là Ông Đồ, Bác Nông Dân, Cô Tấm, Bà Bán Hàng, Tí và Na, Cô Giáo Lan, Nghệ Nhân Gốm, Chị Hằng và Chú Cuội. Hai cột đầu là hai nhịp đi, cột cuối chào. Khi nghỉ dùng hình gốc. Đổi hướng trái/phải bằng mirror; chưa tám góc nhìn độc lập.

Nguồn: OpenAI built-in imagegen, ngày 11/10/2026, dùng `reference-npcs-v1.png` của dự án làm tham chiếu, sau đó yêu cầu bỏ nền thành alpha. Không dùng bộ art tải từ bên thứ ba. Asset còn chờ người làm art duyệt trước beta.

Prompt tạo: atlas 3 cột × 8 hàng, giữ đúng khuôn mặt/trang phục và đạo cụ của tám NPC, hai nhịp đi và một khung chào, toàn thân, nền alpha, không chữ/khung/cảnh nền, phong cách hoạt hình tranh truyện giống tham chiếu. Prompt bỏ nền: giữ nguyên toàn bộ 24 tư thế, vị trí/kích thước/đạo cụ; bỏ nền nâu/xanh thành alpha thật, không tạo checkerboard hay bóng nền.

Creator giữ atlas nguyên; `npcPoseFrames` tính chung một vùng crop alpha cho ba cột mỗi NPC để hạn chế nhảy chân. Ranh giới hàng giữa người bán hàng và hai bé là y=1040 để không cắt bàn chân; các mốc khác 256, 512, 768, 1280, 1536, 1792. Khung được cache và giải phóng theo VillageArt. Nếu chưa tải được atlas, NPC tiếp tục dùng hình gốc và animation bằng code.

## Atlas tám hướng — 11/10/2026

`npc-directions-v1.png` bổ sung 64 khung RGBA 2048 × 2048: tám hàng cùng thứ tự NPC ở trên, tám cột theo direction8: đông, đông bắc, bắc, tây bắc, tây, tây nam, nam, đông nam. Mỗi ô 256 × 256, chân căn y=240; hướng sau/lưng là hình quay thật. Không mirror atlas này. Khi NPC đi hoặc đứng nghỉ, client lấy khung theo hướng patrol; NPC chương 1 đứng mặc định hướng nam. Khi chào, dùng khung chào trong atlas 24 tư thế cũ.

Nguồn: built-in imagegen, tham chiếu atlas cũ; prompt đầy đủ tại [npc-directions-v1.prompt.txt](npc-directions-v1.prompt.txt). Ảnh sinh có nhiễu alpha và nhóm nhân vật vượt cột. Người dùng cho phép làm sạch bằng script ngày 11/10/2026: `tools/normalize-npc-atlas.py` bỏ nhiễu gần trong suốt/chroma đỏ, gom hình theo thành phần alpha, giữ một tỷ lệ chung mỗi hàng rồi căn giữa/chân. File sinh gốc giữ riêng; không ghi đè atlas cũ. Runtime dùng SpriteFrame cố định, không đọc pixel mỗi frame; dispose giải phóng cả hai bộ khung. Nếu atlas tám hướng không tải được, giữ fallback cũ.

Tám góc nhìn đã có; chuyển động bước chân/nhún vẫn bằng code, chưa có chu kỳ đi nhiều khung cho mỗi hướng. Asset là candidate cần người làm art duyệt độ nhất quán, đạo cụ và hai nhóm nhân vật trước beta.
