const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const moduleValue={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../assets/scripts/ui/HouseRewardRequest.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:moduleValue,exports:moduleValue.exports,setTimeout});
const {requestHouseReward}=moduleValue.exports;
test('an acknowledged server claim with a lost response can be retried without duplicating the reward',async()=>{
 let calls=0,retry=0;const receipts=new Set(),delays=[];
 const received=await requestHouseReward(async()=>{receipts.add('tidy-mat');if(++calls===1)throw new TypeError('Network lost');return [...receipts];},()=>retry++,async ms=>delays.push(ms));
 assert.deepEqual(received,['tidy-mat']);assert.equal(receipts.size,1);assert.equal(calls,2);assert.equal(retry,1);assert.deepEqual(delays,[700]);
});
test('invalid proof, changed age, expired sessions and rate limits are never automatically retried',async()=>{
 for(const status of [400,401,403,409,422,429]){let calls=0;const error=Object.assign(new Error('Rejected'),{status});await assert.rejects(()=>requestHouseReward(async()=>{calls++;throw error;},()=>assert.fail('retry UI'),async()=>assert.fail('retry wait')),e=>e===error);assert.equal(calls,1);}
});
test('transient failures have a strict one-retry bound and return failure for manual retry',async()=>{
 for(const status of [undefined,408,500,502,503,504]){let calls=0;const error=Object.assign(new Error('Unavailable'),{status});await assert.rejects(()=>requestHouseReward(async()=>{calls++;throw error;},()=>{},async()=>{}),e=>e===error);assert.equal(calls,2);}
});
