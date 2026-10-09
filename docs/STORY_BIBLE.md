# Bí Mật Cây Đa Tri Thức — Story Bible

Thiết kế 0.1. Toàn bộ ngôi làng, phép sáng của cây, NPC và hội thoại bên dưới là sáng tác hư cấu cho game. Chương 1 đã có slice [M2](MILESTONE_M2.md); chương 2–8 vẫn là thiết kế. Không dùng lời NPC hư cấu làm chứng cứ lịch sử.

## Quy ước và giọng kể

Chương `ch01`…`ch08`; main quest `q.chNN.slug`; dialogue `d.chNN.npc.slug`; sao `reward.star.chNN`. Reward sao chỉ cấp khi completion lần đầu. Ông Đồ là người hướng dẫn hiền hậu, không phải nhân vật lịch sử. Cô Tấm, Chú Cuội, Chị Hằng là nhân vật lấy cảm hứng truyện dân gian, giới thiệu là trong chuyện kể. Bác Nông Dân, Cô Giáo Lan, Bà Bán Hàng, Nghệ Nhân Gốm, Tí và Na là dân làng hư cấu.

NPC dùng câu ngắn, lời mời thay mệnh lệnh; trẻ có thể chọn “Để cháu thử” hoặc “Cháu muốn nghỉ”. Sai: “Mình cùng thử lại nhé”; không nói trẻ kém, lười, làm hỏng làng. Cây sáng trở lại nhờ học hỏi và chia sẻ; không dùng cảm giác tội lỗi để giữ trẻ chơi.

## Chương 1 — Ngày Về Làng (`ch01`)

- Intro: Bé về làng, Ông Đồ mời ghé cây đa. Một ngôi sao trên tán cây chưa sáng.
- Mở: hồ sơ local mới hoặc chọn bắt đầu; không cần online. Khu: Cổng Làng → Cây Đa → Nông Trại.
- NPC: `ong-do`, `bac-nong-dan`. Mini game: `mg.rice-count`.
- `q.ch01.greet`: đi tới Ông Đồ, nghe/đọc lời chào, chọn đáp lại. Ghi flag `ch01.greeted`.
- `q.ch01.plant`: sau greet, nhận việc và trồng vào 5 ô riêng; mỗi ô chỉ tăng progress một lần. Bắt đầu ở 0/5, gợi ý ô gần nhất.
- `q.ch01.count`: sau plant, đếm cây 1–5 bằng hình và câu hỏi được duyệt; câu sai không xóa cây. Trả lời đủ ba câu, có nhắc đọc số.
- `q.ch01.return`: về Ông Đồ, kể lại đã trồng và đếm; cấp `reward.star.ch01`, badge `badge.first-helper`, completion `ch01.complete`.
- Mục tiêu: di chuyển, chào hỏi, tương ứng một–một khi đếm, biết nhờ giúp đỡ. Trồng trong game là thao tác giản lược, không hướng dẫn nông nghiệp chính xác.
- Kết: một nhánh cây sáng; Ông Đồ mời đến Sân Đình. Save cả ô đã trồng, round hiện tại, quest state và receipt thưởng.
- `d.ch01.ong-do.intro`: “Chào cháu, mừng cháu về làng! Cây đa giữ những câu chuyện của làng mình.” → “Cháu muốn khám phá!” mở quest; “Cháu nghỉ một chút” đóng, không mất progress.
- `d.ch01.bac-nong-dan.plant`: “Mình trồng năm cây lúa nhé. Cháu chạm từng ô sáng, bác sẽ đếm cùng cháu.” → start lesson / nhắc lại / nghỉ.
- `d.ch01.ong-do.end`: “Cháu đã giúp bác và học đếm. Ngôi sao đầu tiên sáng rồi!” → nhận thưởng một lần / xem cây.

M2 triển khai luồng Chương 1 riêng (năm cây trồng), không đổi tên demo thu hoạch ba bó thành Chương 1. Demo cũ giữ ở `?demo=1`, raw save/huy hiệu được giữ theo [migration M2](MILESTONE_M2.md).

## Chương 2 — Sân Đình Rộn Rã (`ch02`)

- Intro: Tí và Na chuẩn bị một buổi chơi, cần bé cùng học luật và chia lượt.
- Mở: `ch01.complete`. Khu: Sân Đình. NPC: Tí, Na, Ông Đồ.
- `q.ch02.learn-rules`: học phiên bản Ô ăn quan được game công bố, xem một nước mẫu, chọn lượt đi hợp lệ.
- `q.ch02.play-o-an-quan`: hoàn thành một ván với NPC; thắng/thua đều hoàn thành mục tiêu tham gia, không chặn sao.
- `q.ch02.pull-together`: hoàn thành đoạn kéo co hợp tác với NPC, dùng chế độ nhịp chậm hoặc trợ giúp. Không yêu cầu bấm cực nhanh.
- `q.ch02.share`: chọn câu mời bạn/chia lượt, quay về Ông Đồ. Reward `reward.star.ch02`, `badge.fair-play`, flag `ch02.complete`.
- Mini game: Ô ăn quan và Kéo co; Nhảy sạp là side quest sau nghiệm thu, chưa bắt buộc.
- Mục tiêu: đếm, lượt chơi, phối hợp, biết chơi vui dù không thắng. Save lượt/bàn/điểm trong ván; resume quyết định NPC phải có seed/state ổn định.
- `d.ch02.ti.invite`: “Bạn chơi cùng mình nhé! Mình xem cách đi trước rồi cùng thử.” → học luật / chơi ván đã mở / nghỉ.
- `d.ch02.na.fair`: “Đến lượt bạn rồi. Mình chờ bạn nhé!” → tiếp tục; kết ván: “Cảm ơn bạn đã chơi cùng mình!”
- Kết: nhánh cây thứ hai sáng, lời mời đến chợ. Luật dân gian có biến thể; gọi rõ phiên bản game, không khẳng định duy nhất đúng.

## Chương 3 — Phiên Chợ Quê (`ch03`)

- Intro: Bà Bán Hàng nhờ bé sắp giỏ, Cô Tấm hướng dẫn cách chào hỏi.
- Mở: `ch02.complete`. Khu: Chợ Quê. NPC: Bà Bán Hàng, Cô Tấm.
- `q.ch03.sort`: phân loại 3 nhóm rau/củ theo hình đã duyệt; không phân loại kiểu đánh đố (về thực vật học khác cách gọi món ăn).
- `q.ch03.basket`: mua đủ danh sách bằng token “xu” của game; nhóm nhỏ đếm lượng, nhóm lớn cộng trừ giá. Không quảng bá xu là tiền Việt thực tế.
- `q.ch03.polite`: chọn chào/cảm ơn, đưa giỏ đúng người. Reward `reward.star.ch03`, `badge.polite-shopper`, flag `ch03.complete`.
- Mini game `mg.market`; mục tiêu phân loại, lượng, cộng trừ và giao tiếp. Save danh sách, giỏ, token, dialogue flag; không mua bằng tiền thật.
- `d.ch03.ba-ban-hang.hello`: “Chào cháu! Cháu giúp bà xếp cà rốt vào giỏ này nhé.” → xem mẫu / bắt đầu / nghỉ.
- `d.ch03.co-tam.thanks`: “Nhận đồ xong, mình nói gì nhỉ?” → “Cháu cảm ơn bà ạ” được phản hồi tích cực; lựa chọn khác có gợi ý.
- Kết: ngôi sao thứ ba sáng, mở Trường Học.

## Chương 4 — Trường Học Dưới Tán Đa (`ch04`)

- Intro: Cô Giáo Lan tổ chức góc học, bé chọn bài phù hợp mình.
- Mở: `ch03.complete`. Khu: Trường Học/Cây Đa. NPC: Cô Giáo Lan, Na.
- `q.ch04.letters`: nhận diện chữ cho 3–5; ghép vần đã duyệt cho 6–8; đọc/logic chữ cho 9–11. Không buộc trẻ 3 tuổi đọc câu dài.
- `q.ch04.numbers`: ba câu Toán theo hồ sơ, có hình minh họa/gợi ý. Trợ giúp vẫn nhận completion.
- `q.ch04.words`: ghép ba hình với từ Anh đã duyệt và audio được kiểm tra; cho nghe lại, không chấm phát âm bằng microphone.
- `q.ch04.share`: xem sổ học, chọn bài muốn luyện lại. Reward `reward.star.ch04`, `badge.curious-learner`, flag `ch04.complete`.
- Mini game `mg.secret-letters` và bài EducationEngine. Mục tiêu học theo tuổi, không tạo kỳ thi. Save question IDs/version/attempt state; thay nội dung không đổi nghĩa ID cũ.
- `d.ch04.co-giao-lan.choice`: “Cháu muốn bắt đầu với chữ hay số? Cô có thể đọc cùng cháu.” → chọn góc học / nghe lại / nghỉ.
- Kết: sao thứ tư sáng; cô mời bé xem bàn tay nghệ nhân.

## Chương 5 — Những Bàn Tay Khéo Léo (`ch05`)

- Intro: Nghệ Nhân Gốm và Cô Tấm chuẩn bị góc nghề, không dùng công cụ nguy hiểm.
- Mở: `ch04.complete`. Khu: Làng Nghề. NPC: Nghệ Nhân Gốm, Cô Tấm.
- `q.ch05.clay`: sắp thứ tự tạo hình vật gốm bằng thao tác mô phỏng; lò nung chỉ xuất hiện trong lời giải thích có người lớn.
- `q.ch05.picture`: ghép một bản tranh Đông Hồ được duyệt/cấp quyền, xem tên và nguồn; tranh mô phỏng phải ghi là minh họa lấy cảm hứng.
- `q.ch05.tools`: ghép nghề với vật dụng qua hình; giải thích công cụ chỉ do người lớn dùng khi phù hợp.
- `q.ch05.show`: trưng bày tác phẩm local cho NPC. Reward `reward.star.ch05`, `badge.craft-friend`, flag `ch05.complete`.
- Mini game `mg.dong-ho` + activity gốm (activity không tính là trò hoàn chỉnh trong danh sách 12). Mục tiêu sắp trình tự, quan sát họa tiết, trân trọng nghề.
- `d.ch05.nghe-nhan-gom.invite`: “Đất mềm có thể thành chiếc bát. Trên màn hình, cháu thử chọn hình mình thích nhé.” → thử / xem mẫu / nghỉ.
- `d.ch05.co-tam.picture`: “Đây là hình minh họa cho bài ghép tranh. Mình cùng xem tên và nguồn của bức tranh nhé.”
- Kết: sao thứ năm sáng; nghe lời mời chăm ruộng. Save mẫu ghép/vị trí miếng và lựa chọn gốm.

## Chương 6 — Mùa Vàng Quê Em (`ch06`)

- Intro: Bác Nông Dân nhờ bé cùng quan sát cây sau vài bước chăm sóc trong game.
- Mở: `ch05.complete`. Khu: Nông Trại/Ao Làng. NPC: Bác Nông Dân, Tí.
- `q.ch06.seedlings`: sắp hình gieo/chăm/thu hoạch theo nội dung đã biên tập, không biến thời gian thực thành chờ đợi.
- `q.ch06.care`: chọn lượng nước theo hình và nhặt rác mô phỏng; không hướng dẫn phân/thuốc hóa học.
- `q.ch06.harvest`: đếm và chia nhóm sản phẩm theo tuổi.
- `q.ch06.animals`: giúp vật nuôi bằng hành động được duyệt, không khuyến khích trẻ tự tiếp cận động vật lạ. Reward `reward.star.ch06`, `badge.nature-friend`, flag `ch06.complete`.
- Mini game `mg.animal-care`, phiên bản rice-count mở rộng; fishing là tùy chọn riêng sau nghiệm thu.
- `d.ch06.bac-nong-dan.care`: “Cháu nhìn hình chiếc lá nhé. Mình chọn cách chăm cây trong bài học này.” → xem hình / gợi ý / nghỉ.
- Kết: sao thứ sáu sáng; dân làng chuẩn bị đêm hội. Save care state, harvest IDs, không có cây chết vì trẻ vắng mặt.

## Chương 7 — Hội Trăng Rằm (`ch07`)

- Intro: Chú Cuội và Chị Hằng xuất hiện trong một câu chuyện kể tại khu lễ hội.
- Mở: `ch06.complete`; chơi được quanh năm, không yêu cầu ngày âm lịch hay giờ đêm. Khu: Khu Lễ Hội.
- `q.ch07.lantern`: ghép hình đèn ông sao mô phỏng, nhận diện hình/màu; không dùng kéo hoặc lửa ngoài đời.
- `q.ch07.decorate`: sắp họa tiết theo mẫu hoặc tự chọn màu, không chấm vẻ đẹp của trẻ.
- `q.ch07.riddle`: ba câu đố ngắn phù hợp tuổi, có đọc/gợi ý, không dùng câu lịch sử chưa kiểm chứng.
- `q.ch07.parade`: đi theo tuyến sáng với NPC; có nút bỏ qua hoạt cảnh chuyển động. Reward `reward.star.ch07`, `badge.lantern-maker`, flag `ch07.complete`.
- Mini game `mg.star-lantern`. Gói bánh chưng là side activity Tết riêng, không ghép thành phong tục Trung Thu.
- `d.ch07.chi-hang.story`: “Trong câu chuyện đêm hội, mình cùng làm một chiếc đèn trên màn hình nhé!” → ghép đèn / nghe lại / nghỉ.
- `d.ch07.chu-cuoi.riddle`: “Mình thử câu đố này nhé. Nếu chưa biết, bạn có thể xem gợi ý.”
- Kết: bảy sao gọi bé về cây đa. Save hình đèn, round và đoạn hoạt cảnh đã xem.

## Chương 8 — Ánh Sáng Cây Đa (`ch08`)

- Intro: Ông Đồ nhắc lại bảy việc bé đã làm; nhánh cuối cần ghép các điều đã học.
- Mở: `ch07.complete`, bảy receipt sao chính hợp lệ. Khu: Cây Đa và các góc đã mở.
- `q.ch08.recall`: chọn ba thử thách tổng hợp từ nội dung đã học, theo hồ sơ; gợi ý liên kết bài cũ.
- `q.ch08.cooperate`: sắp ba mảnh ánh sáng cùng NPC hoặc bạn trong phòng riêng; NPC luôn thay được người vắng mặt, không chờ matchmaking.
- `q.ch08.restore`: về cây, xác nhận hoạt cảnh → `reward.star.ch08`, `badge.village-knowledge`, flag `ch08.complete`.
- `q.ch08.free-play`: mở luyện lại/hoạt động theo mùa, không bắt buộc daily nhiệm vụ.
- Mini game: tổ hợp bài đã nghiệm thu, không tạo trò thứ 13 chỉ để đủ chương. Mục tiêu nhớ, giải thích, hợp tác; reward không phụ thuộc tốc độ hay thắng bạn khác.
- `d.ch08.ong-do.recall`: “Cháu nhớ những việc mình đã cùng làm không? Mình mở sổ và xem lại nhé.” → xem sổ / thử thách / nghỉ.
- `d.ch08.ong-do.end`: “Những điều cháu học và chia sẻ đã làm cây sáng hơn. Cháu luôn có thể trở lại chơi cùng làng.”
- Kết: cây sáng ấm, không chớp mạnh; xem lại được. Save receipt, ending flag và unlock mùa; không xóa chương khi replay.

## Biên tập văn hóa

Mỗi fact trong bài học cần source URL, ngày kiểm tra, người biên tập và trạng thái duyệt. Kéo co có thực hành cộng đồng đa dạng; hồ sơ [UNESCO về nghi lễ và trò chơi kéo co](https://ich.unesco.org/en/RL/tugging-rituals-and-games-01080) là nguồn nền, không là luật thi đấu game. Nghề tranh Đông Hồ dùng khắc/in gỗ; tham chiếu [hồ sơ UNESCO](https://ich.unesco.org/en/USL/craft-of-making-ong-h-folk-woodblock-printings-01737). Không gọi tô màu digital là toàn bộ quy trình truyền thống. Các chi tiết nhảy sạp, Ô ăn quan, bánh chưng, Trung Thu, canh tác và lịch sử/địa lý vẫn cần nguồn/biên tập riêng trước khi publish nội dung.
