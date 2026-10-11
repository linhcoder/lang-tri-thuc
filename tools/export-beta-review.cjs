// Export the shipped source content for human review; never approve or modify it.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),esbuild=require('esbuild'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),world=path.join(root,'apps/game-client/assets/scripts/world');
const source=`
import {applyLessonPack,shippedLessonCatalog,validQuestion} from './LessonCatalog';
import {applyChapterText} from './ContentPack';
import {applyNpcPack} from './NpcCatalog';
import {chapters} from './CampaignContent';
import {storyNpcs} from './VillageModel';
import {visualAssets} from './VisualAssets';
import lessons from '../../resources/lesson-pack.json';
import chapterPack from '../../resources/chapter-pack.json';
import npcPack from '../../resources/npc-pack.json';
if(!applyLessonPack(lessons)||!applyChapterText(chapterPack)||!applyNpcPack(npcPack))throw Error('Invalid shipped content pack');
const questions=shippedLessonCatalog();
if(questions.some(row=>!validQuestion(row.question)))throw Error('Invalid lesson');
export {questions,chapters,storyNpcs,visualAssets};`;
const code=esbuild.buildSync({stdin:{contents:source,resolveDir:world,sourcefile:'beta-review.ts',loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
const moduleData={exports:{}};new Function('module','exports','require',code)(moduleData,moduleData.exports,require);
const {questions,chapters,storyNpcs,visualAssets}=moduleData.exports;
assert.equal(questions.length,90);assert.equal(new Set(questions.map(q=>q.key)).size,90);assert.equal(chapters.length,8);
let arithmeticChecked=0;
for(const row of questions.filter(r=>r.skill==='math')){
 const match=/(\d+)\s*([+−×÷])\s*(\d+)/.exec(row.question.prompt);assert.ok(match,'Missing arithmetic expression '+row.key);
 const a=Number(match[1]),b=Number(match[3]),expected=match[2]==='+'?a+b:match[2]==='−'?a-b:match[2]==='×'?a*b:a/b;
 assert.equal(Number(row.question.choices[row.question.answer]),expected,'Wrong configured arithmetic answer '+row.key);arithmeticChecked++;
}
assert.equal(arithmeticChecked,9);
for(const asset of visualAssets)assert.ok(fs.existsSync(path.join(root,'apps/game-client',asset.path)),'Missing asset '+asset.id);
const cases=[
 ['Tải lạnh','Mở game lần đầu qua mạng di động; ghi giây tải, RAM và lỗi.'],
 ['Touch','Joystick, chạm NPC đang đi, trồng lúa, kéo đèn, pinch và kéo camera.'],
 ['Xoay màn hình','Đổi dọc/ngang khi chơi và khi mở bảng; kiểm nút không bị cắt.'],
 ['Giọng Việt','Nghe thoại/gợi ý, đổi bài khi đang đọc, bật/tắt âm thanh.'],
 ['NPC','Quan sát bước chân tám hướng, chào, dừng khi tới gần, viền và đạo cụ.'],
 ['Lưu tiến độ','Đóng/mở browser, reload, checkpoint và sao không bị cấp lặp.'],
 ['Mất mạng','Ngắt Wi-Fi/chuyển 4G, reconnect, solo fallback và đọc lại save.'],
 ['Phiên dài','Chơi 30–60 phút; ghi RAM/FPS/nhiệt/pin đầu và cuối phiên.'],
 ['Phụ huynh','Tạo hồ sơ, phòng riêng, xuất dữ liệu, hủy/xác nhận xóa trên hồ sơ thử.']
].map(([name,instructions])=>({name,instructions,status:'pending',device:'',os:'',browser:'',reviewer:'',observations:''}));
const report={version:1,sourceRevision:execFileSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),'rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),scope:'Shipped repository content; excludes database drafts and live editorial reviews',humanApproval:'pending',questions,chapters,npcs:storyNpcs,assets:visualAssets,deviceCases:cases};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const table=(headers,rows)=>'<table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(cell=>'<td>'+esc(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
const html='<!doctype html><html lang="vi"><meta charset="utf-8"><title>Nghiệm thu beta</title><style>body{font:16px system-ui;margin:24px;color:#213326}table{border-collapse:collapse;width:100%;margin-bottom:32px}th,td{border:1px solid #bbb;padding:8px;text-align:left;vertical-align:top}th{background:#e7efd9}td{white-space:pre-wrap;overflow-wrap:anywhere}@media print{thead{display:table-header-group}tr{break-inside:avoid}}</style><h1>Gói rà soát trước beta</h1><p>Source '+esc(report.sourceRevision)+'. Nội dung từ repository; bản nháp trên database cần xuất riêng qua admin. Chưa có xác nhận chuyên gia hoặc thiết bị thật. Ghi nhận kết quả trong review.json; artifact này không nhập quyết định vào game.</p><h2>90 câu hỏi</h2>'+table(['ID / tuổi / kỹ năng','Câu hỏi','Lựa chọn','Đáp án cấu hình','Gợi ý / nguồn'],questions.map(r=>[r.key+' / '+r.age+' / '+r.skill,r.question.prompt,r.question.choices.join('\n'),r.question.choices[r.question.answer],r.question.hint+'\n'+(r.question.sources??[]).join('\n')]))+'<h2>Tám chương</h2>'+table(['ID / tên','Mở đầu / kết thúc','Nhiệm vụ'],chapters.map(c=>[c.id+' / '+c.title,c.intro+'\n'+c.ending,c.quests.map(q=>q.id+' / '+q.title).join('\n')]))+'<h2>NPC truyện</h2>'+table(['ID','Dữ liệu thoại'],storyNpcs.map(n=>[n.id,JSON.stringify(n,null,2)]))+'<h2>Nguồn art</h2>'+table(['ID / file','Nguồn','Trạng thái'],visualAssets.map(a=>[a.id+'\n'+a.path,a.source,a.status]))+'<h2>Thiết bị thật — chưa chạy</h2>'+table(['Ca thử','Thao tác','Trạng thái'],cases.map(c=>[c.name,c.instructions,c.status]))+'</html>';
const output=path.join(root,'temp/beta-review');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'review.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(output,'index.html'),html);
console.log(JSON.stringify({output,questions:questions.length,arithmeticChecked,chapters:chapters.length,npcs:storyNpcs.length,assets:visualAssets.length,deviceCases:cases.length,humanApproval:'pending'}));
