/** Versioned learning content. UI consumes IDs and illustrations, never owns answers. */
export const flowerCareContent = {
 version: 1, id: 'flower-care', title: 'Chăm hoa',
 subtitle: 'Cùng trồng hoa để làm đẹp ngôi làng nhé!',
 rounds: [
  {id:'sow',prompt:'Đầu tiên, mình đặt gì vào đất?',picture:'seed',answer:0,
   choices:[{id:'seed',label:'Hạt giống',art:5},{id:'stone',label:'Viên đá',art:6},{id:'pencil',label:'Chiếc bút',art:7}],
   hint:'Thứ nào có thể nảy mầm thành một cây nhỏ khi gặp đất và nước?',correct:'Đúng rồi! Hạt có thể nảy mầm thành cây.'},
  {id:'water',prompt:'Hạt đã vào đất. Mình dùng gì để tưới?',picture:'water',answer:0,
   choices:[{id:'water',label:'Bình tưới',art:8},{id:'book',label:'Quyển sách',art:9},{id:'ball',label:'Quả bóng',art:10}],
   hint:'Tìm đồ dùng đựng nước và giúp nước rơi nhẹ xuống đất.',correct:'Đúng rồi! Tưới nhẹ để đất đủ ẩm.'},
  {id:'protect',prompt:'Hoa đã nở. Mình chăm cây thế nào?',picture:'flower',answer:0,
   choices:[{id:'water',label:'Tưới vừa đủ',art:8},{id:'broken',label:'Bẻ cành',art:11},{id:'foot',label:'Giẫm lên hoa',art:12}],
   hint:'Cách nào giúp cây đủ ẩm, giữ cành và hoa nguyên vẹn?',correct:'Đúng rồi! Chăm nhẹ tay để hoa luôn khỏe.'},
 ]
} as const;
