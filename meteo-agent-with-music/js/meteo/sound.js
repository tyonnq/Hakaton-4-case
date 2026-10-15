'use strict';


const SFX_DIR='sounds';
const SFX_FOLDERS={cold:'холод',hot:'жар',win:'победа',sad:'хныкание',click:'кликание',mini:'миниигра'};
const SFX_EXT=['mp3','ogg','wav','m4a'];
const SFX_MAX=20;
const SFX_VOLUME={cold:.8,hot:.8,win:.8,sad:.8,click:.5,mini:.5};
const SFX_VOICE=['cold','hot','win','sad'];   
const SFX_OFF_KEY='meteo_sound_off';

const sfx={
 lib:{},muted:false,voice:null,lastEmotion:null,lastMini:0,lastUrl:{},loopGroup:null,loopToken:0,


 async load(group){
  const folder=encodeURIComponent(SFX_FOLDERS[group]),found=[];
  for(let i=1;i<=SFX_MAX;i++){
   const url=await sfx.find(SFX_DIR+'/'+folder+'/'+i);
   if(!url)break;found.push(url);
  }
  sfx.lib[group]=found;
 },
 find(base){
  return new Promise(resolve=>{
   let k=0;
   const next=()=>{
    if(k>=SFX_EXT.length)return resolve(null);
    const url=base+'.'+SFX_EXT[k++],audio=new Audio();
    let done=false;
    const finish=ok=>{if(done)return;done=true;clearTimeout(timer);ok?resolve(url):next();};
    const timer=setTimeout(()=>finish(false),4000);
    audio.addEventListener('loadedmetadata',()=>finish(true));
    audio.addEventListener('error',()=>finish(false));
    audio.preload='auto';audio.src=url;
   };
   next();
  });
 },
 play(group){
  if(sfx.muted)return;
  const files=sfx.lib[group];if(!files||!files.length)return;
  let url=files[Math.floor(Math.random()*files.length)];
  if(files.length>1&&url===sfx.lastUrl[group])url=files[(files.indexOf(url)+1)%files.length];
  sfx.lastUrl[group]=url;
  if(SFX_VOICE.includes(group))sfx.pauseVoice();
  const audio=new Audio(url);audio.volume=SFX_VOLUME[group]??.6;
  if(SFX_VOICE.includes(group))sfx.voice=audio;
  const p=audio.play();if(p&&p.catch)p.catch(()=>{});
 },

 mini(){
  const now=Date.now();if(now-sfx.lastMini<150)return;
  sfx.lastMini=now;sfx.play('mini');
 },

 startLoop(group){
  sfx.stopLoop();
  sfx.loopGroup=group;
  if(sfx.muted)return;
  const files=sfx.lib[group];if(!files||!files.length)return;
  const token=++sfx.loopToken;
  const next=()=>{
   if(token!==sfx.loopToken)return;
   let url=files[Math.floor(Math.random()*files.length)];
   if(files.length>1&&url===sfx.lastUrl[group])url=files[(files.indexOf(url)+1)%files.length];
   sfx.lastUrl[group]=url;
   const audio=new Audio(url);audio.volume=SFX_VOLUME[group]??.6;
   audio.loop=files.length===1;
   audio.addEventListener('ended',next);
   sfx.voice=audio;
   const p=audio.play();if(p&&p.catch)p.catch(()=>{});
  };
  next();
 },
 pauseVoice(){
  sfx.loopToken++;
  if(sfx.voice){try{sfx.voice.pause();}catch(e){}}
 },
 stopLoop(){sfx.pauseVoice();sfx.loopGroup=null;},

 stop(){sfx.stopLoop();sfx.lastEmotion=null;},
 
 result(R){
  if(R.pass){sfx.stopLoop();return sfx.play('win');}
  sfx.startLoop(R.emotion==='cold'?'cold':R.emotion==='hot'?'hot':'sad');
 },

 preview(emotion){
  if(emotion===sfx.lastEmotion)return;
  sfx.lastEmotion=emotion;
  const group={cold:'cold',hot:'hot',sad:'sad'}[emotion];
  group?sfx.startLoop(group):sfx.stopLoop();
 },
 setMuted(value){
  sfx.muted=value;
  try{localStorage.setItem(SFX_OFF_KEY,value?'1':'0');}catch(e){}
  const button=document.getElementById('sfxToggle');
  if(button){button.textContent=value?'🔇':'🔊';button.title=value?'Включить звук':'Выключить звук';}
  if(value)sfx.pauseVoice();
  else if(sfx.loopGroup)sfx.startLoop(sfx.loopGroup);
 }
};

(function initSound(){
 try{sfx.muted=localStorage.getItem(SFX_OFF_KEY)==='1';}catch(e){}
 const button=document.createElement('button');
 button.id='sfxToggle';button.type='button';button.setAttribute('aria-label','Звук');
 button.style.cssText='position:fixed;left:14px;bottom:calc(18px+env(safe-area-inset-bottom, 0px));z-index:50;width:46px;height:46px;border-radius:50%;'
  +'border:1px solid var(--line);background:var(--panel2);color:var(--ink);font-size:20px;cursor:pointer;box-shadow:var(--sh)';
 button.onclick=()=>{sfx.setMuted(!sfx.muted);if(!sfx.muted)sfx.play('click');};
 document.body.appendChild(button);
 sfx.setMuted(sfx.muted);

 document.addEventListener('click',event=>{
  const target=event.target.closest('button,.card,.lvl,select');
  if(!target||target.disabled||target.id==='sfxToggle'||target.id==='launch')return;
  sfx.play('click');
 },true);
 Object.keys(SFX_FOLDERS).forEach(group=>sfx.load(group));
})();



const MUSIC_OFF_KEY='meteo_music_off';
const bgMusic=new Audio('sounds/music/background.mp3');
bgMusic.loop=true;
bgMusic.volume=0.2;
bgMusic.preload='none';
let musicOff=false;
try{musicOff=localStorage.getItem(MUSIC_OFF_KEY)==='1';}catch(e){}
function startMusic(){
 if(musicOff||!bgMusic.paused)return;
 bgMusic.play().catch(()=>{});
}
function updateMusicButton(){
 const b=document.getElementById('musicToggle');
 if(b){b.textContent=musicOff?'🎵̸':'🎵';b.title=musicOff?'Включить музыку':'Выключить музыку';b.setAttribute('aria-label',b.title);}
}
(function initMusic(){
 const b=document.createElement('button');
 b.id='musicToggle';b.type='button';
 b.style.cssText='position:fixed;left:68px;bottom:calc(18px+env(safe-area-inset-bottom, 0px));z-index:50;width:46px;height:46px;border-radius:50%;border:1px solid var(--line);background:var(--panel2);color:var(--ink);font-size:20px;cursor:pointer;box-shadow:var(--sh)';
 b.onclick=()=>{
  musicOff=!musicOff;
  try{localStorage.setItem(MUSIC_OFF_KEY,musicOff?'1':'0');}catch(e){}
  if(musicOff)bgMusic.pause();else startMusic();
  updateMusicButton();
 };
 document.body.appendChild(b);updateMusicButton();
 document.addEventListener('pointerdown',startMusic,{passive:true});
 document.addEventListener('keydown',startMusic);
})();
