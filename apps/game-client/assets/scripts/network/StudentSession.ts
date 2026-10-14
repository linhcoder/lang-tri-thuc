import {cmsApiUrl} from '../world/CmsLoader';
import type {AgeBand} from '../world/CampaignContent';
import {isRedStarBoy,redStarBoyPreview} from '../world/RedStarBoy';
export interface StudentProfile {id:string;label:string;age:AgeBand;gender:'male'|'female';avatar:number}
export interface StudentSession {profile:StudentProfile;token:string;revision:number;useLocalBackup:boolean;campaign:unknown;first:unknown;api:string}
const TOKEN_KEY='lang-tri-thuc.student-token.v1';
export async function studentRequest(api:string,token:string,path:string,method='GET',body?:unknown):Promise<any>{
    const response=await fetch(api+path,{method,headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(10000)});
    const value=await response.json();if(!response.ok)throw Object.assign(Error(value.message??'Chưa kết nối được máy chủ.'),{status:response.status});return value;
}
/** The game is not constructed until the API verifies ownership of a complete profile. */
export function chooseStudent(signal:AbortSignal,requestedId?:string):Promise<StudentSession>{
    const api=cmsApiUrl();let token='',importLegacy=false;try{token=sessionStorage.getItem(TOKEN_KEY)??'';}catch{}
    const splash=document.getElementById('app-splash');if(splash)splash.hidden=true;
    const overlay=document.createElement('section');overlay.id='student-gate';overlay.setAttribute('aria-label','Đăng nhập và chọn học sinh');
    const style=document.createElement('style');style.textContent=`#student-gate{position:fixed;inset:0;z-index:10020;overflow:auto;background:linear-gradient(135deg,#174b38,#6b9561);display:grid;place-items:center;padding:20px;box-sizing:border-box;font:16px system-ui;color:#294b37}#student-gate *{box-sizing:border-box}#student-gate .student-card{width:min(540px,100%);background:#fff9e8;padding:24px;border-radius:22px;box-shadow:0 15px 60px #102d3766}#student-gate h1{font-size:26px;margin:0 0 10px}#student-gate p{line-height:1.5}#student-gate label{display:block;margin:12px 0}#student-gate input,#student-gate select{display:block;width:100%;padding:11px;margin-top:5px;border:1px solid #9eae85;border-radius:9px;font:inherit}#student-gate button{min-height:44px;padding:10px 16px;margin:8px 8px 0 0;border:0;border-radius:10px;background:#286b48;color:white;font:inherit;cursor:pointer}#student-gate button:disabled{opacity:.5;cursor:wait}#student-gate .student-list button{display:block;width:100%;text-align:left}#student-gate .student-error{color:#a53728}#student-gate svg{height:110px;display:block;margin:auto}#student-gate .student-meta{color:#597347;font-size:14px}`;
    document.head.append(style);document.body.append(overlay);
    return new Promise((resolve,reject)=>{
        const cleanup=()=>{overlay.remove();style.remove();signal.removeEventListener('abort',abort);};
        const abort=()=>{cleanup();reject(Error('Đã đóng màn hình học sinh.'));};signal.addEventListener('abort',abort,{once:true});if(signal.aborted){abort();return;}
        const card=()=>{overlay.replaceChildren();const c=document.createElement('div');c.className='student-card';overlay.append(c);return c;};
        const text=(parent:HTMLElement,tag:string,value:string)=>{const node=document.createElement(tag);node.textContent=value;parent.append(node);return node;};
        const field=(parent:HTMLElement,title:string,type='text',value='')=>{const label=text(parent,'label',title),input=document.createElement('input');input.type=type;input.value=value;input.required=true;label.append(input);return input;};
        const select=(parent:HTMLElement,title:string,options:Array<[string,string]>,value='')=>{const label=text(parent,'label',title),input=document.createElement('select');for(const [key,name] of options){const option=document.createElement('option');option.value=key;option.textContent=name;input.append(option);}input.value=value;input.required=true;label.append(input);return input;};
        const button=(parent:HTMLElement,title:string,action:()=>void)=>{const b=document.createElement('button');b.type='button';b.textContent=title;b.onclick=action;parent.append(b);return b;};
        const request=(path:string,method='GET',body?:unknown)=>studentRequest(api,token,path,method,body);
        const guarded=async(parent:HTMLElement,action:()=>Promise<void>)=>{const notice=parent.querySelector('.student-error');if(notice)notice.remove();parent.querySelectorAll('button').forEach(b=>b.disabled=true);try{await action();}catch(error){if(signal.aborted)return;const e=error as Error&{status?:number};text(parent,'p',e.message).className='student-error';if(e.status===401){token='';try{sessionStorage.removeItem(TOKEN_KEY);}catch{}button(parent,'Đăng nhập lại',()=>login());}}finally{parent.querySelectorAll('button').forEach(b=>b.disabled=false);}};
        const start=async(profile:StudentProfile)=>{
            const value=await request('/profiles/'+profile.id+'/play');if(signal.aborted)return;
            const p=value.progress;let useLocalBackup=false,campaign=p.data??p.trusted?.campaign??null,first=p.chapterOne??p.trusted?.chapterOne??null;
            try{useLocalBackup=localStorage.getItem('lang-tri-thuc.cloud-revision.'+profile.id)===String(p.revision);if(importLegacy&&!campaign){campaign=JSON.parse(localStorage.getItem('lang-tri-thuc.campaign.v1')??'null');first=JSON.parse(localStorage.getItem('lang-tri-thuc.chapter-one.v2')??'null');useLocalBackup=false;}}catch{}
            cleanup();if(splash)splash.hidden=false;
            resolve({profile:value.profile,token,api,revision:p.revision,useLocalBackup,campaign,first});
        };
        const profileForm=(profile?:Partial<StudentProfile>)=>{
            const c=card();text(c,'h1',profile?'Hồ sơ của bé':'Thêm học sinh');const form=document.createElement('form');c.append(form);
            const name=field(form,'Tên hiển thị của bé','text',profile?.label??'');name.maxLength=40;name.autocomplete='off';
            const age=select(form,'Nhóm tuổi',[['3-5','3–5 tuổi'],['6-8','6–8 tuổi'],['9-11','9–11 tuổi']],profile?.age??'3-5');
            const gender=select(form,'Giới tính nhân vật',[['','Chọn nhân vật'],['male','Nam'],['female','Nữ']],profile?.gender??'');
            const appearance=select(form,'Trang phục nhân vật',[],String(profile?.avatar??0));
            const preview=document.createElementNS('http://www.w3.org/2000/svg','svg');preview.setAttribute('viewBox','0 0 100 140');form.append(preview);
            const update=()=>{
                const previous=appearance.value,ids=gender.value==='female'?[2,3,5]:[0,1,4];appearance.replaceChildren();for(const id of ids){const o=document.createElement('option');o.value=String(id);o.textContent=['Áo đỏ','Áo xanh','Áo hồng','Áo vàng','Áo lá','Áo tím'][id];appearance.append(o);}appearance.value=previous!==''&&ids.includes(Number(previous))?previous:String(ids[0]);draw();
            };
            const draw=()=>{const special=isRedStarBoy(Number(appearance.value),age.value);const redOption=appearance.querySelector('option[value="0"]');if(redOption)redOption.textContent=age.value==='6-8'?'Áo đỏ sao vàng':'Áo đỏ';if(special){preview.innerHTML=redStarBoyPreview();return;}const young=age.value==='3-5',older=age.value==='9-11',female=gender.value==='female',color=['#d95851','#528eca','#e783a2','#eabf49','#6c9d59','#a58ac3'][Number(appearance.value)];preview.innerHTML=`<ellipse cx="50" cy="130" rx="23" ry="5" fill="#31533c22"/><path d="M42 98v25m16-25v25" stroke="#42506b" stroke-width="10"/><path d="M32 67l-9 28m45-28l9 28" stroke="#f4cba1" stroke-width="8" stroke-linecap="round"/><path d="M34 64Q50 58 66 64L${female?73:67} 101H${female?27:33}Z" fill="${color}"/><ellipse cx="50" cy="${young?42:older?34:38}" rx="${young?25:older?20:23}" ry="25" fill="#392d27"/><ellipse cx="50" cy="${young?46:older?38:42}" rx="${young?21:older?17:19}" ry="21" fill="#f4cba1"/><path d="M29 42Q30 7 50 12Q73 11 72 41Q53 27 29 42" fill="#392d27"/>${female?'<ellipse cx="26" cy="47" rx="7" ry="14" fill="#392d27"/><ellipse cx="74" cy="47" rx="7" ry="14" fill="#392d27"/>':''}<circle cx="43" cy="44" r="2" fill="#392d27"/><circle cx="57" cy="44" r="2" fill="#392d27"/><path d="M44 53q6 7 12 0" stroke="#ad6552" fill="none"/>${young?'':'<path d="M36 65h28L50 81Z" fill="#d74444"/>'}`;};
            gender.onchange=update;age.onchange=draw;appearance.onchange=draw;update();if(profile?.avatar!==undefined){appearance.value=String(profile.avatar);draw();}
            text(form,'p','Tên, độ tuổi và nhân vật này sẽ được dùng trong làng.').className='student-meta';
            const submit=button(form,'Lưu và vào làng',()=>{});submit.type='submit';form.onsubmit=event=>{event.preventDefault();void guarded(c,async()=>{const data={label:name.value.trim(),age:age.value,gender:gender.value,avatar:Number(appearance.value)};if(!data.label||!data.gender)throw Error('Nhập tên và chọn giới tính nhân vật.');const saved=await request(profile?.id?'/profiles/'+profile.id:'/profiles',profile?.id?'PUT':'POST',data);await start(saved);});};button(c,'Quay lại',()=>void profiles());
        };
        const profiles=async()=>{
            const c=card();text(c,'h1','Chọn học sinh');text(c,'p','Mỗi bé có nhân vật và hành trình riêng.');
            try{if(localStorage.getItem('lang-tri-thuc.campaign.v1')||localStorage.getItem('lang-tri-thuc.chapter-one.v2')){const label=text(c,'label','Nhập tiến độ cũ trên máy vào học sinh được chọn (chỉ khi chưa có tiến độ trên tài khoản).'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=importLegacy;checkbox.style.width='auto';checkbox.onchange=()=>importLegacy=checkbox.checked;label.prepend(checkbox);}}catch{}
            await guarded(c,async()=>{const list=await request('/profiles');const rows=document.createElement('div');rows.className='student-list';c.append(rows);for(const p of list){button(rows,`${p.label} · ${p.age} tuổi${p.gender?'':' · Cần hoàn thiện hồ sơ'}`,()=>void guarded(c,async()=>{if(!p.gender){profileForm(p);return;}await start(p);}));button(rows,'Sửa hồ sơ '+p.label,()=>profileForm(p));}if(list.length<8)button(c,'Thêm học sinh',()=>profileForm());button(c,'Đăng xuất',()=>void guarded(c,async()=>{await request('/sessions','DELETE');token='';try{sessionStorage.removeItem(TOKEN_KEY);}catch{}login();}));if(requestedId&&list.some((p:StudentProfile)=>p.id===requestedId))text(c,'p','Chọn hồ sơ được mời để vào phòng cùng bạn.');});
        };
        const login=(register=false)=>{
            const c=card();text(c,'h1',register?'Tạo tài khoản phụ huynh':'Chào mừng đến Làng Tri Thức');text(c,'p','Đăng nhập để chọn học sinh và tiếp tục hành trình.');
            const form=document.createElement('form');c.append(form);const alias=field(form,'Tên tài khoản');alias.autocomplete='username';alias.maxLength=40;
            const password=field(form,register?'Mật khẩu (ít nhất 12 ký tự)':'Mật khẩu','password');password.autocomplete=register?'new-password':'current-password';password.minLength=register?12:1;password.maxLength=128;
            const submit=button(form,register?'Tạo tài khoản':'Đăng nhập',()=>{});submit.type='submit';form.onsubmit=event=>{event.preventDefault();void guarded(c,async()=>{const body={alias:alias.value.trim(),password:password.value};if(register)await request('/parents','POST',body);const value=await request('/sessions','POST',body);token=value.token;try{sessionStorage.setItem(TOKEN_KEY,token);}catch{}await profiles();});};button(c,register?'Đã có tài khoản':'Tạo tài khoản mới',()=>login(!register));alias.focus();
        };
        if(token)void profiles();else login();
    });
}
