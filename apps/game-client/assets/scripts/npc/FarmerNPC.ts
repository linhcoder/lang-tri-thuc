import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;
@ccclass('FarmerNPC')
export class FarmerNPC extends Component {
    readonly npcId = 'bac-nong-dan';
    readonly displayName = 'Bác Nông Dân';
    readonly dialogue = 'Chào cháu! Đây là ruộng lúa của làng mình.\nHạt gạo cần nước, nắng và sự chăm sóc mỗi ngày.\nCháu cùng bác khám phá làng nhé!';
    /** Future quest system listens to this event without coupling it to movement/UI. */
    interact(): void { this.node.emit('npc-interact', { npcId: this.npcId }); }
}
