// Static review package. Automated checks do not approve pedagogical content or asset rights.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const world=path.resolve(__dirname,'../apps/game-client/assets/scripts/world'),{chapters,validateContent}=require(world+'/CampaignContent.ts'),{lessonQuestions,lessonSkills}=require(world+'/EducationEngine.ts'),{visualAssets}=require(world+'/VisualAssets.ts'),{assetCatalog}=require(world+'/AssetCatalog.ts'),{expansionActivities}=require(world+'/ExpansionActivities.ts');
const errors=validateContent(),questions=[],assets=[];
for(const age of ['3-5','6-8','9-11'])for(const skill of lessonSkills)for(const q of lessonQuestions(skill,age)){
 if(!q.prompt?.trim()||!q.hint?.trim()||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.choices.length||new Set(q.choices).size!==q.choices.length)errors.push('Invalid question: '+q.id);
 questions.push({age,skill,...q});
}
for(const asset of visualAssets){const file=path.resolve(__dirname,'../apps/game-client',asset.path);if(!fs.existsSync(file))errors.push('Missing asset: '+asset.id);assets.push({id:asset.id,path:asset.path,source:asset.source,status:asset.status,rightsReview:'pending'});}
const report={createdAt:new Date().toISOString(),automatedChecksPassed:!errors.length,errors,chapters:chapters.length,questions:questions.length,assets:assets.length,editorMetadata:assetCatalog(),pending:{pedagogyAndVietnamese:questions.filter(q=>q.review!=='approved').length,artProvenanceAndRights:assets.length,childrenAndRealDevices:true},publicBetaApproved:false};
const output=path.resolve(__dirname,'../temp/beta-review');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'content.json'),JSON.stringify({chapters,questions,expansionActivities,assets},null,2));console.log(JSON.stringify({automatedChecksPassed:report.automatedChecksPassed,questions:report.questions,assets:report.assets,pending:report.pending,errors},null,2));if(errors.length)process.exitCode=1;
