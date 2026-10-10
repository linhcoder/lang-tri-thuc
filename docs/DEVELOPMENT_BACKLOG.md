# Phần còn phát triển — 10/10/2026

Bản hiện tại là prototype tám chương đã có staging. Tỷ lệ người/cảnh đã sửa; cảnh làng có zoom 60–180% bằng nút, wheel và pinch. Các mục sau chưa có đầy đủ, không tính là đã hoàn thành chỉ vì có tên trong menu hoặc registry.

| Mức ưu tiên | Phần còn lại | Hiện có / giới hạn |
| --- | --- | --- |
| Tiếp theo | NPC đi lại, idle/gesture riêng và tương tác môi trường | NPC là sprite tĩnh; giếng, cầu, trâu/gà/vịt và vườn rau phần lớn là cảnh trang trí. Cầu chưa bắc qua ao để đi được |
| Tiếp theo | Art/animation và thao tác trực quan sâu hơn cho mini game | 12 bộ luật solo, minh họa Graphics và nút; kéo thả đèn đã có. Ghép tranh là ô trượt, câu cá là quan sát/thả; chưa art riêng, tô tranh tự do hoặc mô phỏng đầy đủ |
| Tiếp theo | Multiplayer cần QA/polish từng trò | Phòng riêng, đồng bộ làng, emote, vé, shared game state tối đa 4 participant và authoritative validation đã có. Chưa nghiệm thu đồng chơi đầy đủ cả 12 trò hoặc soak WAN dài |
| Sau gameplay | Bản đồ tổng quan trực quan, UI làng gọn hơn trên mobile | Đã có menu 10 khu, portal, camera theo người và zoom. Chưa minimap với vị trí NPC/bạn, camera kéo tự do; HUD landscape vẫn cần thêm polish |
| Sau gameplay | Lễ hội theo lịch, nhiệm vụ phụ/mùa và bộ sưu tập phong phú | Luyện/lễ hội mở sau tám sao, chơi quanh năm; chưa lịch mùa riêng. Luyện không giữ checkpoint giữa trò |
| Khi cần mở rộng | Công cụ biên tập sâu | Sửa chương/quest title/câu hỏi/NPC/asset và review đã có. Chưa editor quest graph, luật/board mini game tùy ý; hai NPC chương 1 giữ cấu hình cố định |
| Khi tăng tải | Backend nhiều instance | MySQL-compatible snapshot JSON single-row, transaction/locking và backup đã có. Chưa schema chuẩn hóa, Redis presence/room coordination hoặc benchmark production đa instance |

NPC AI và lịch xuất hiện là tùy chọn trong master prompt, không phải chức năng đang chạy. Không bổ sung AI hội thoại tự do khi chưa có phương án kiểm duyệt phù hợp trẻ.

## Gate phát hành cần người/thiết bị

- Biên tập sư phạm, tiếng Việt, văn hóa và nguồn/license art; nội dung còn draft.
- Thử trẻ có giám sát ở ba nhóm tuổi, điện thoại Android/iOS và Intel HD/UHD thật; xác nhận giọng Việt, touch, tải lạnh, RAM và phiên dài.
- Soak mạng, lịch backup/retention và kiểm tra phục hồi định kỳ trước beta công khai. aaPanel staging/HTTPS/WebSocket và restore drill đã chạy; Docker tùy chọn chưa kiểm thử.

Chi tiết yêu cầu gốc và giới hạn: [COMPLETION_CHECKLIST](COMPLETION_CHECKLIST.md). Bằng chứng chạy: [QA-REPORT](../apps/game-client/QA-REPORT.md).
