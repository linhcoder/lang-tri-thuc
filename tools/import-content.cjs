const fs=require('node:fs'),path=require('node:path');
const input=process.argv[2];if(!input)throw Error('Usage: node tools/import-content.cjs /path/to/admin-export.json [--draft]');
const pack=JSON.parse(fs.readFileSync(input,'utf8'));
if(pack.version!==1||!Array.isArray(pack.chapters)||pack.chapters.length!==8)throw Error('Expected eight chapter records');
if(!process.argv.includes('--draft')&&pack.chapters.some(c=>c.reviewRecord?.status!=='approved'))throw Error('Unapproved content. --draft is limited to prototype/staging.');
const output={version:1,chapters:pack.chapters.map(c=>({id:c.id,title:c.title,intro:c.intro,ending:c.ending,questTitles:Object.fromEntries(c.quests.map(q=>[q.id,q.title]))}))};
fs.writeFileSync(path.resolve(__dirname,'../apps/game-client/assets/resources/chapter-pack.json'),JSON.stringify(output,null,2)+'\n');
console.log('Chapter text imported. Rebuild with Creator. This does not approve lesson answers or cultural game rules for beta.');
