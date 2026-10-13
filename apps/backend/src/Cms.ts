import type {FastifyInstance,FastifyRequest} from 'fastify';
import type {Repository,ParentRecord} from './Store';
import {createHash} from 'node:crypto';
import {cmsErrors,cmsAssets,cmsQuests,emptyCms,CmsState,CmsManifest} from '../../game-client/assets/scripts/world/CmsContent';
import {contentVersion} from '../../game-client/assets/scripts/world/ContentVersion';

const input=(extra:Record<string,unknown>)=>({bodyLimit:524288,schema:{body:{type:'object',additionalProperties:false,required:['revision','note',...Object.keys(extra)],properties:{revision:{type:'integer',minimum:0},note:{type:'string',minLength:12,maxLength:500},...extra}}}});
const fail=(message:string,statusCode=400)=>{throw Object.assign(Error(message),{statusCode});};
export function registerCms(app:FastifyInstance,store:Repository,auth:(req:FastifyRequest,admin?:boolean)=>Promise<ParentRecord>){
 const state=(d:any):CmsState=>{
  const s:CmsState=d.cms??(d.cms=emptyCms()),active=s.releases.find(r=>r.id===s.active),baseVersion=contentVersion();
  // Known navigation correction: retain approved NPC content and immutable history.
  // Unknown or newly obstructed manifests require manual review rather than rebasing.
  if(active?.manifest.baseVersion==='785f4e7e'&&baseVersion!==active.manifest.baseVersion&&cmsErrors(active.manifest.npcs).length===0){
   const npcs=structuredClone(active.manifest.npcs),version=createHash('sha256').update(JSON.stringify({baseVersion,npcs})).digest('hex');
   if(!s.releases.some(r=>r.id===version)){if(s.releases.length>=50)fail('CMS release limit reached during navigation upgrade',409);s.releases.push({id:version,created:Date.now(),note:'Navigation footprint compatibility upgrade; NPC content unchanged',manifest:{schema:1,baseVersion,version,npcs}});}
   s.active=version;s.revision++;d.audit.push({actor:'system',action:'cms.navigation.upgrade',entity:version,created:Date.now()});
  }
  return s;
 };
 const body=(req:FastifyRequest,s:CmsState)=>{const b=req.body as any;if(!b||!Number.isInteger(b.revision)||b.revision!==s.revision)fail('CMS revision conflict; reload before saving',409);if(typeof b.note!=='string'||b.note.trim().length<12||b.note.length>500)fail('CMS note must contain 12–500 characters');return b;};
 app.get('/content/staging',async(_req,reply)=>{reply.header('Cache-Control','no-store');return store.transaction(d=>{const s=state(d);return s.releases.find(r=>r.id===s.active)?.manifest??{schema:1,baseVersion:contentVersion(),version:'00000000',npcs:[]};});});
 app.get('/admin/cms',async req=>{await auth(req,true);return store.transaction(d=>({...state(d),baseVersion:contentVersion(),assets:cmsAssets(),quests:cmsQuests(),errors:cmsErrors(state(d).npcs)}));});
 app.put('/admin/cms/draft',input({npcs:{type:'array',maxItems:40,items:{type:'object'}}}),async req=>{const actor=await auth(req,true);return store.transaction(d=>{const s=state(d),b=body(req,s),errors=cmsErrors(b.npcs);if(errors.length)fail(errors.join(' '));s.npcs=structuredClone(b.npcs);s.revision++;s.status='draft';s.note=b.note.trim();d.audit.push({actor:actor.id,action:'cms.draft',entity:String(s.revision),created:Date.now()});return s;});});
 app.put('/admin/cms/review',input({status:{type:'string',enum:['draft','reviewed','approved']}}),async req=>{const actor=await auth(req,true);return store.transaction(d=>{const s=state(d),b=body(req,s);if(!['draft','reviewed','approved'].includes(b.status))fail('Invalid review status');if(b.status==='approved'&&s.status!=='reviewed')fail('Review before approval',409);const errors=cmsErrors(s.npcs);if(errors.length)fail(errors.join(' '));s.status=b.status;s.note=b.note.trim();s.revision++;d.audit.push({actor:actor.id,action:'cms.'+s.status,entity:String(s.revision),created:Date.now()});return s;});});
 app.post('/admin/cms/publish',input({baseVersion:{type:'string',pattern:'^[a-f0-9]{8}$'}}),async req=>{const actor=await auth(req,true);return store.transaction(d=>{const s=state(d),b=body(req,s);if(s.status!=='approved')fail('Approve before publishing',409);if(b.baseVersion!==contentVersion())fail('Base version changed',409);const errors=cmsErrors(s.npcs);if(errors.length)fail(errors.join(' '));const version=createHash('sha256').update(JSON.stringify({baseVersion:contentVersion(),npcs:s.npcs})).digest('hex');const manifest:CmsManifest={schema:1,baseVersion:contentVersion(),version,npcs:structuredClone(s.npcs)};let release=s.releases.find(r=>r.id===version);if(!release){if(s.releases.length>=50)fail('Release limit reached',409);release={id:version,manifest,created:Date.now(),note:b.note.trim()};s.releases.push(release);}s.active=version;s.revision++;d.audit.push({actor:actor.id,action:'cms.publish.staging',entity:version,created:Date.now()});return release;});});
 app.post('/admin/cms/rollback',input({id:{type:'string',pattern:'^[a-f0-9]{64}$'}}),async req=>{const actor=await auth(req,true);return store.transaction(d=>{const s=state(d),b=body(req,s),release=s.releases.find(r=>r.id===b.id);if(!release)fail('Release not found',404);if(release!.manifest.baseVersion!==contentVersion()||cmsErrors(release!.manifest.npcs).length)fail('Release incompatible with game',409);s.active=release!.id;s.revision++;d.audit.push({actor:actor.id,action:'cms.rollback.staging',entity:s.active,created:Date.now()});return {active:s.active,revision:s.revision};});});
 app.get('/admin/cms/preview',async req=>{await auth(req,true);return store.transaction(d=>{const s=state(d);return {schema:1,baseVersion:contentVersion(),version:createHash('sha256').update(JSON.stringify(s.npcs)).digest('hex'),npcs:s.npcs};});});
}
