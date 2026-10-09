import { chapters } from './CampaignContent';
export interface ChapterText {id:string;title:string;intro:string;ending:string;questTitles:Record<string,string>}
/** Text editing cannot change IDs, unlock rules, answers or rewards. */
export function applyChapterText(value:unknown):boolean {
    const pack=value as {version:number;chapters:ChapterText[]};
    if(!pack||pack.version!==1||!Array.isArray(pack.chapters)||pack.chapters.length>8)return false;
    const seen=new Set<string>();
    for(const text of pack.chapters){
        if(!text||typeof text!=='object'||Array.isArray(text)||typeof text.id!=='string')return false;
        const chapter=chapters.find(c=>c.id===text.id);if(!chapter||seen.has(text.id))return false;seen.add(text.id);
        if(typeof text.title!=='string'||!text.title.trim()||text.title.length>120)return false;
        if(![text.intro,text.ending].every(t=>typeof t==='string'&&t.trim().length>0&&t.length<=800)||!text.questTitles||typeof text.questTitles!=='object'||Array.isArray(text.questTitles))return false;
        if(Object.entries(text.questTitles).some(([id,t])=>!chapter.quests.some(q=>q.id===id)||typeof t!=='string'||!t.trim()||t.length>120))return false;
    }
    for(const text of pack.chapters){const c=chapters.find(c=>c.id===text.id)!;c.title=text.title;c.intro=text.intro;c.ending=text.ending;for(const q of c.quests)if(text.questTitles[q.id])q.title=text.questTitles[q.id];}
    return true;
}
