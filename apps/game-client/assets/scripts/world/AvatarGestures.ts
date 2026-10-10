/** Shared presentation vocabulary; IDs are also validated by the room server. */
export const avatarGestures=[
    {id:'hello',title:'Chào',icon:'☺',message:'Chào bạn!'},
    {id:'happy',title:'Vui mừng',icon:'☆',message:'Mình vui quá!'},
    {id:'wave',title:'Vẫy tay',icon:'✋',message:'Mình vẫy tay chào bạn!'},
    {id:'sit',title:'Ngồi',icon:'♧',message:'Mình ngồi nghỉ một chút.'},
    {id:'sad',title:'Khóc',icon:'☂',message:'Mình đang buồn.'},
    {id:'jump',title:'Nhảy',icon:'↑',message:'Mình nhảy lên nào!'},
] as const;
export type AvatarGesture=typeof avatarGestures[number]['id'];
export function isAvatarGesture(value:unknown):value is AvatarGesture{return avatarGestures.some(g=>g.id===value);}
