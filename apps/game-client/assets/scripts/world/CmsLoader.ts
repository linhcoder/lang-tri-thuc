import {CmsManifest,validCmsManifest} from './CmsContent';
import {contentVersion} from './ContentVersion';
export interface CmsStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
export async function loadCms(fetchManifest:()=>Promise<unknown>,storage?:CmsStorage,preview=false):Promise<CmsManifest|null>{
 const key='lang-tri-thuc.cms.staging.'+contentVersion();
 try{const value=await fetchManifest();if(!validCmsManifest(value))throw Error('Invalid CMS manifest');if(!preview)try{storage?.setItem(key,JSON.stringify(value));}catch{}return value;}catch{
  if(preview)return null;try{const value=JSON.parse(storage?.getItem(key)??'null');return validCmsManifest(value)?value:null;}catch{return null;}
 }
}
export function cmsApiUrl():string {return ['localhost','127.0.0.1'].includes(location.hostname)?'http://127.0.0.1:33000':location.origin+'/api';}
