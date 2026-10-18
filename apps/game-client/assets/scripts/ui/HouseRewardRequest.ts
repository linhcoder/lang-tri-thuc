/** Claims are idempotent on the server. Retry one transient failure, never a
 * rejected proof, expired session or rate limit. Keep manual retry afterwards. */
export async function requestHouseReward<T>(claim:()=>Promise<T>,onRetry:()=>void,wait:(ms:number)=>Promise<void>=ms=>new Promise(resolve=>setTimeout(resolve,ms))):Promise<T>{
 try{return await claim();}
 catch(error){
  const status=(error as {status?:number})?.status;
  if(status!==undefined&&![408,500,502,503,504].includes(status))throw error;
  onRetry();await wait(700);return claim();
 }
}
