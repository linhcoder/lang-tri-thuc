/** One short, optional cue; a single context is reused and disposed with the scene. */
export class UiClickSound {
 private audio?:AudioContext;
 play(kind:'click'|'correct'|'wrong'='click'){if(typeof window==='undefined'||!window.AudioContext)return;try{this.audio??=new AudioContext();const audio=this.audio;void audio.resume().then(()=>{if(audio.state!=='running')return;const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(kind==='correct'?880:kind==='wrong'?260:620,audio.currentTime);gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+(kind==='click'?.045:.16));oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+(kind==='click'?.05:.18));oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}).catch(()=>{});}catch{}}
 dispose(){void this.audio?.close().catch(()=>{});this.audio=undefined;}
}
