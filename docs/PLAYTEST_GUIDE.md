# Chơi thử và phản hồi

Phụ huynh đăng nhập trang quản lý, mở Góp ý chơi thử. Chọn Lỗi khi chơi, Độ khó / thao tác hoặc Ý tưởng; có thể chọn trò liên quan. Mô tả việc đã làm, kết quả mong đợi và chỗ bé gặp khó. Không cần thông tin riêng của trẻ. Mỗi góp ý 12–1000 ký tự, tối đa ba góp ý/phút và 100 góp ý/tài khoản; có thể rút lại góp ý không còn cần thiết.

Quản trị viên mở Phản hồi chơi thử, tìm/lọc, bấm Xử lý phản hồi. Ba trạng thái: Chờ xem, Đang xử lý, Đã xử lý. Ghi chú tối đa 500 ký tự và hiển thị cho phụ huynh gửi. Trạng thái/góp ý của phụ huynh khác chỉ được xem bằng tài khoản quản trị. Góp ý nằm trong bản xuất dữ liệu; rút lại hoặc xóa tài khoản sẽ xóa góp ý của tài khoản đó. Mục này riêng với báo cáo hành vi trong game.

## Gợi ý quan sát với bé

Thử 10–15 phút mỗi lần, có người lớn bên cạnh. Để bé tự chọn/chạm trước khi hướng dẫn; ghi lại bước phải nhờ giúp. Chú ý miếng tranh có dễ nhận ra, nút có dễ chạm, chữ/giọng có dễ hiểu và bé có muốn chơi lại. Không coi kết quả kiểm thử tự động là nghiệm thu độ khó với trẻ.

## Kiểm tra kỹ thuật lặp lại

```powershell
$env:GAME_WEB_URL='http://127.0.0.1:8080/'
$env:RENDER_SOAK_SECONDS='900'
npm.cmd run test:render-soak
$env:LOAD_SECONDS='300'
$env:LOAD_CLIENTS='50'
npm.cmd run test:load-private
```

Render soak dùng build Cocos thực, storage browser riêng và fixture đã mở các chương để luyện ghép tranh/mê cung bằng touch. Không sửa clock/render. Thay đổi viewport định kỳ, di chuyển bằng bàn phím; đo RAF, số node và JS heap sau GC. Có đo GC định kỳ nên không dùng kết quả đó để khẳng định hiệu năng mọi máy. Report ở `apps/game-client/temp/render-soak/report.json`.

Load dùng API/SQLite thử riêng ở 33110, phòng game ở 33111 và SDK/vé thật. Mỗi phòng năm client; 50 client là mười phòng, không đổi giới hạn 20 người/phòng. Có movement, probes, NPC state, reconnect và cleanup. Report ở `temp/load-private/report.json`. Đây là benchmark local/SQLite; không khẳng định tải MySQL/VPS hoặc nhiều instance. Script nhận 5–100 client (bội số năm), 30–900 giây. Ctrl+C yêu cầu dừng và cleanup.

Các gate còn lại: thử trẻ, điện thoại thật, duyệt nội dung/quyền art, render dài hơn và tải production. Backup offsite/cảnh báo tự động vẫn để sau theo lựa chọn trước.
