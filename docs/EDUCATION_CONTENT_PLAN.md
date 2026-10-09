# Education Content Plan

## Danh mục triển khai — 10/10/2026

Danh mục gồm 90 câu: ba nhóm tuổi × mười kỹ năng × ba lượt. 9–11 có nhân, chia, toán lời văn; 6–8 có ghép vần; chương 4 dùng lesson language với ID quest cũ. Admin cho sửa prompt, ba lựa chọn, đáp án, hint, nguồn HTTPS; kiểm tra đồng nhất age/skill/ID và chuyển về draft sau mỗi lần sửa.

Câu địa lý tổng hợp 9–11 sử dụng thông tin Hà Nội là thủ đô từ [Cổng thông tin Hà Nội](https://hanoi.gov.vn/dia-ly-dia-hinh/gioi-thieu-tong-quan-va-khai-quat-ve-dia-li-thanh-pho-ha-noi-4241009114844999.htm), và vị trí khu trung tâm Hoàng thành Thăng Long tại Hà Nội từ [UNESCO](https://whc.unesco.org/en/list/1328/). Nguồn được đính kèm câu hỏi; toàn bộ câu vẫn draft, cần người biên tập xác nhận cách diễn đạt phù hợp tuổi.
Đây là kế hoạch nội dung và tiêu chí biên tập, chưa là chương trình giáo dục được chứng nhận. M0 không thêm câu hỏi văn hóa/lịch sử mới vào runtime.

## Ma trận nội dung

| Nhóm | Kỹ năng | Ví dụ mẫu tự soạn | Gợi ý | Chương |
| --- | --- | --- | --- | --- |
| 3–5 | Đếm tương ứng một–một | Hình 3 cây, chọn 3 trong 2/3/4 | Sáng lần lượt từng cây và đọc số | 1/6 |
| 3–5 | Màu/hình, phân loại | Chọn hình tròn cùng mẫu | So sánh hình, không chỉ màu | 3/7 |
| 3–5 | Chữ/âm | Nghe âm đọc đã duyệt, chọn chữ mẫu | Hiện cả hình và chữ, nghe lại | 4 |
| 6–8 | Cộng/trừ trong 20, tăng dần theo bài | Có 3 củ, thêm 2, chọn 5 | Gộp hai nhóm trực quan | 3/4 |
| 6–8 | Ghép vần | Ghép một tiếng từ bộ âm/vần đã duyệt | Đọc từng phần, xem hình | 4 |
| 6–8 | Từ Anh | Ghép hình cat/dog với audio đã duyệt | Đọc chậm lại, không dùng mic | 4 |
| 9–11 | Nhân/chia, lời văn | 3 giỏ, mỗi giỏ 4 quả, chọn 12 | Nhóm các quả thành ba cụm | 3/6 |
| 9–11 | Logic/khoa học | Sắp ba bước theo bài đã duyệt | Giải thích mối quan hệ, không đoán mò | 5/6/8 |
| 9–11 | Văn hóa/lịch sử/địa lý | Chỉ sau nguồn và người biên tập | Link thông tin cho phụ huynh, lời trẻ ngắn | 5/8 |

Phạm vi số là lựa chọn thiết kế, chưa khẳng định chuẩn chương trình theo từng lớp. Dùng dấu tiếng Việt, từ cụ thể; tránh câu phủ định kép. Câu có tranh không đòi trẻ phân biệt chỉ từ sắc độ. Thứ tự đáp án phải có seed/state và xáo trộn hợp lý; không để đáp án đúng luôn ở giữa như prototype.

## Bài M2: Trồng Lúa – Học Đếm

Learning objective: ghép một cây với một ô trồng, đếm từ 1 đến 5, nhận số tương ứng. Mỗi cây có ID riêng; chạm lại không tạo cây/số mới. Cho nghe “một…năm”; hoàn thành trồng rồi ba round chọn số. Hiển thị rõ số đã trồng. Sai giữ cây, chỉ gợi ý; không trừ sao hoặc ép làm lại từ đầu. Với trẻ lớn thêm bài gom nhóm sau completion, không biến thành gate vượt khả năng trẻ nhỏ.

Đây là mô hình học đếm, không mô phỏng đầy đủ gieo mạ/cấy/chăm/thu hoạch. Câu “trồng bằng chạm ô sáng” mô tả game. Không trình bày vòng đời lúa diễn ra trong vài giây như thực tế.

## Cấu trúc và đánh giá

Question có ID ổn định, contentVersion, ageBand, skill, prompt/text/audio, choices, evaluator enum, expectedValue, hint, explanation, sourceIds và reviewStatus. Một câu đúng hoàn thành một objective; duplicate event không tăng lần nữa. Evaluation không nhận expectedValue do client tự gửi trong online release.

Tiến bộ gồm nội dung đã thử, đã hoàn thành, số lần dùng gợi ý; lưu tối thiểu, phụ huynh xem bằng mô tả. Không công khai bảng điểm trẻ, không suy đoán IQ/năng lực. Độ khó điều chỉnh có nút chọn lại, không bí mật tăng khi trẻ chơi tốt. Không thưởng thêm vì tránh gợi ý.

## Quy trình nội dung

1. Tác giả soạn prompt, đáp án, gợi ý, giải thích; gắn fact source hoặc đánh dấu bài toán tự soạn/hư cấu.
2. Người biên tập tiếng Việt/giáo dục kiểm tra đáp án, độ tuổi, độ dài, ảnh/audio, biến thể ngôn ngữ.
3. Người hiểu văn hóa kiểm nội dung phong tục/nghề/lịch sử; giấy phép asset và audio được ghi.
4. Trạng thái `draft → reviewed → approved`; chỉ approved vào release bundle. AI tạo nội dung chỉ là draft.
5. QA kiểm reference, ID/version, đáp án, hiển thị và nghe; thử với phụ huynh/giáo viên, sau đó trẻ có giám sát và đồng ý phù hợp.

Một mình agent có thể kiểm toán học và nguồn, không được tự ghi “đã được giáo viên duyệt”. Những hội thoại ở Story Bible là draft tự soạn, cần review trước beta.

## Nguồn văn hóa khởi đầu

| Fact/source | Dùng cho | Giới hạn |
| --- | --- | --- |
| [UNESCO — Tugging rituals and games](https://ich.unesco.org/en/RL/tugging-rituals-and-games-01080) | Bối cảnh cộng đồng của kéo co | Không chuyển nghi lễ thành luật game duy nhất; tránh gắn chung cho mọi làng |
| [UNESCO — Craft of making Đông Hồ Folk woodblock printings](https://ich.unesco.org/en/USL/craft-of-making-ong-h-folk-woodblock-printings-01737) | Xác nhận thực hành khắc/in gỗ Đông Hồ | Không chứng minh giấy phép từng tranh hoặc chi tiết tạo màu |

Đã tra cứu nguồn trên trong M0 ngày 09/10/2026. Ô ăn quan, nhảy sạp, trồng lúa, Trung Thu, bánh chưng và lịch sử/địa lý cần source riêng trước publish; chưa có bộ fact đã duyệt cho chúng. Không chép lời bài hát/truyện hiện đại hay scan tranh từ web vào asset mà thiếu quyền.

## Acceptance nội dung

M2: tất cả số 1–5 đúng, ba câu có đáp án duy nhất, gợi ý hiển thị/đọc lại, không mất progress khi sai, nút nghỉ hoạt động. M3: data validator chặn nội dung draft và reference thiếu. M6+: kiểm từng question pack theo nhóm tuổi; không coi việc load JSON thành công là nội dung đúng.
