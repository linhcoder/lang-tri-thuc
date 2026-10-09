# Child Safety — yêu cầu thiết kế và gate phát hành

Đây là thiết kế an toàn sản phẩm, không phải tư vấn pháp lý hoặc chứng nhận tuân thủ. Prototype đã có account phụ huynh, authentication/authorization, phòng riêng, block/report và giao diện admin xử lý báo cáo. Chưa có quy trình moderation vận hành được nghiệm thu; chưa mở public beta online cho trẻ trước khi các gate bên dưới được nghiệm thu.

## Hiện trạng và khoảng trống

Không chat text/voice, không microphone, không tên thật; tên remote được server sinh. Game chính mặc định offline; online cần vé phụ huynh được server kiểm tra. PrivateFriendRoom/MiniGameRoom có lời mời hết hạn, block/report, approved emote và kiểm tra lại quyền hồ sơ. Demo `?demo=1&server=...` giữ room development; server chỉ đăng ký room này trên loopback hoặc khi bật `ALLOW_DEV_ROOMS=1`. Không bật cờ đó trên môi trường cho trẻ. Cần nghiệm thu vận hành báo cáo, retention, nội dung và thiết bị trước khi gọi multiplayer an toàn hoàn chỉnh.

## Policy giao tiếp và phòng

- Không chat tự do/voice/ảnh/file/link, không nhập tên thật hoặc thông tin liên hệ.
- Emote/câu duyệt dùng ID như `hello`, `thanks`, `your-turn`, `need-help`, `bye`; server whitelist ID và cooldown. Không nhận text tùy ý trong packet rồi “lọc sau”.
- Parent opt-in trước online; mặc định private friend room, invite hết hạn/có thể thu hồi, quyền join/lock/kick server kiểm tra. Không coi biết room ID là được quyền vào.
- Trẻ luôn có nút rời phòng, ẩn người chơi, chặn và báo cáo biểu tượng dễ hiểu. Block phải ảnh hưởng nhận event/render và tránh ghép lại, không chỉ đổi màu avatar.
- NPC là fallback để chơi một mình; không ép kết bạn/người lạ hoặc chia sẻ mã để nhận sao. Không công khai danh sách trẻ online.

## Phụ huynh và dữ liệu

M3 vùng phụ huynh local cho ageBand, âm thanh, online-off mặc định, xem/xóa tiến độ; gate local chỉ chống chạm nhầm, không là xác thực danh tính. M8 account người lớn/auth và authorization riêng, child profiles tối thiểu. Không lưu ngày sinh chính xác, trường/lớp/địa chỉ/GPS/ảnh/voice. Không thu telemetry hành vi quảng cáo hoặc bán dữ liệu; không loot box/cá cược/pay-to-win.

M8 phải thiết kế retention cụ thể cho progress/report/security log, quyền truy cập và xóa/export; dữ liệu nhạy cảm không nằm trong query URL/log/asset. Invite token không log rõ, secrets chỉ server. Nhà cung cấp analytics/crash cần review dữ liệu trước tích hợp. Hiện chưa có analytics service.

## Báo cáo và moderation

Report gửi reason enum, room/session pseudonym, timestamp và event IDs tối thiểu; không yêu cầu trẻ mô tả bằng free text. Phụ huynh có kênh hỗ trợ riêng ngoài vùng chơi. Admin role/audit, queue, người chịu trách nhiệm, quy trình escalation và thời gian phản hồi phải được chốt trước online beta. Không dùng AI tự động làm quyết định an toàn cuối cùng; mọi NPC AI/chatbot cần một milestone riêng và kiểm duyệt trước, không triển khai trong lộ trình đầu.

## Nội dung và trải nghiệm

Không bạo lực/đáng sợ, shame, áp lực streak, thông báo gây tội lỗi, leaderboard năng lực trẻ. Cho nghỉ/pause, lời gợi ý tích cực, không phạt vì dùng trợ giúp. Lễ hội/truyện kể ghi là hư cấu khi phù hợp. Không hướng dẫn trẻ tự dùng lửa/dao/công cụ, xuống nước hoặc tiếp cận động vật lạ. Audio có tắt tiếng, phụ đề, không effect chớp mạnh.

## Threat model và acceptance

| Rủi ro | Kiểm soát cần có | Test trước release |
| --- | --- | --- |
| Người lạ vào phòng | Server parent/room authorization, invite expiry/revoke | Invalid/expired/reused token, join room locked |
| Payload text/URL | Approved ID-only schema | Text fields/unknown enum bị từ chối |
| Spam/emote gây phiền | Token bucket packet/join + cooldown + block | Burst/sustained flood, server vẫn đáp ứng |
| Client sửa reward | Server action/result/reward ledger | Fake total/replay event không cấp thêm |
| Lộ profile | Server ownership/access checks, pseudonym | Truy cập childId khác bị từ chối |
| Lạm dụng report/admin | Minimal data, role/audit, queue ownership | Unauthorized view/mutation blocked |
| Offline bị chặn bởi online | Local fallback và NPC | Mất server/network vẫn hoàn thành bài |

Trước M8/legal beta cần người có chuyên môn review yêu cầu luật trẻ em/consent theo thị trường triển khai; chưa đưa ra kết luận tuân thủ pháp luật trong M0. Trước M9 test trẻ: phụ huynh đồng ý, người giám sát, không thu hình/voice mặc định, dừng ngay khi trẻ muốn nghỉ. Chưa thực hiện nghiên cứu với trẻ trong môi trường này.
