/** One short, optional cue; a single context is reused and disposed with the scene. */
export class UiClickSound {
 private audio?:AudioContext;
 play(){if(typeof window==='undefined'||!window.AudioContext)return;try{this.audio??=new AudioContext();const audio=this.audio;void audio.resume().then(()=>{if(audio.state!=='running')return;const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(620,audio.currentTime);gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.045);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.05);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}).catch(()=>{});}catch{}}
 dispose(){void this.audio?.close().catch(()=>{});this.audio=undefined;}
}
