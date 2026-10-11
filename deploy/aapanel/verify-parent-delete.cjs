// Verify destructive controls using only a newly created, disposable QA account.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{randomBytes}=require('node:crypto'),{chromium}=require('playwright');
const origin='https://ltt.vui-hoc.xyz',access=fs.readFileSync(path.resolve(__dirname,'../../temp/deploy/access.txt'),'utf8');
const preview=/^Preview password: (.+)$/m.exec(access)?.[1];assert.ok(preview);
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../tools/browser-path.cjs')(),headless:true});
 const context=await browser.newContext({httpCredentials:{username:'staging',password:preview,origin}}),page=await context.newPage();
 const errors=[],deleteHeaders=[];let token='',deleted=false;
 const alias='delete-qa-'+Date.now(),password=randomBytes(24).toString('base64url');
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',async r=>{if(r.url()===origin+'/api/sessions'&&r.status()===200)token=(await r.json()).token;});
 page.on('request',r=>{if(r.method()==='DELETE')deleteHeaders.push(r.headers()['content-type']??null);});
 try{
  await page.goto(origin);await page.getByLabel('Bí danh tài khoản').fill(alias);await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Tạo tài khoản phụ huynh',exact:true}).click();
  await page.getByRole('button',{name:'Thêm hồ sơ',exact:true}).click();await page.getByRole('heading',{name:'Bé 1',exact:true}).waitFor();
  page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Xóa hồ sơ',exact:true}).click();assert.equal(await page.getByRole('heading',{name:'Bé 1',exact:true}).count(),1);
  const profileResponse=page.waitForResponse(r=>r.request().method()==='DELETE'&&r.url().includes('/api/profiles/'));
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Xóa hồ sơ',exact:true}).click();assert.equal((await profileResponse).status(),200);await page.getByRole('heading',{name:'Bé 1',exact:true}).waitFor({state:'detached'});
  await page.getByRole('button',{name:'Thêm hồ sơ',exact:true}).click();await page.getByRole('heading',{name:'Bé 1',exact:true}).waitFor();
  const previousToken=token,logoutResponse=page.waitForResponse(r=>r.request().method()==='DELETE'&&r.url()===origin+'/api/sessions');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();assert.equal((await logoutResponse).status(),200);await page.getByRole('heading',{name:'Đăng nhập người lớn',exact:true}).waitFor();
  assert.equal((await fetch(origin+'/api/profiles',{headers:{Authorization:'Bearer '+previousToken}})).status,401);
  await page.getByLabel('Mật khẩu',{exact:true}).fill(password);await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.getByRole('heading',{name:'Bé 1',exact:true}).waitFor();
  page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Xóa tài khoản và dữ liệu',exact:true}).click();assert.equal(await page.getByRole('heading',{name:'Bé 1',exact:true}).count(),1);
  const accountResponse=page.waitForResponse(r=>r.request().method()==='DELETE'&&r.url()===origin+'/api/parents/me');
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Xóa tài khoản và dữ liệu',exact:true}).click();assert.equal((await accountResponse).status(),200);deleted=true;
  await page.getByRole('heading',{name:'Đăng nhập người lớn',exact:true}).waitFor();
  assert.equal((await fetch(origin+'/api/profiles',{headers:{Authorization:'Bearer '+token}})).status,401);
  assert.equal((await fetch(origin+'/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({alias,password})})).status,401);
  assert.deepEqual(deleteHeaders,[null,null,null]);assert.deepEqual(errors,[]);
  const report={https:true,profileDeleteCancel:true,profileDelete:true,logout:true,accountDeleteCancel:true,accountDelete:true,sessionRevoked:true,loginRevoked:true,noEmptyJsonHeader:true,qaAccountDeleted:true,errors};
  const output=path.resolve(__dirname,'../../temp/deploy/qa/parent-delete.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{if(token&&!deleted){const response=await fetch(origin+'/api/parents/me',{method:'DELETE',headers:{Authorization:'Bearer '+token}});assert.ok(response.ok,'QA cleanup failed');}await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
