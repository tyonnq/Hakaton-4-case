'use strict';

const LAB_TRIALS=[
 {name:'Мелкий дождь',icon:'🌦',min:1.5,max:5.5,brief:'Пусть тело дышит, а дождь останется снаружи.'},
 {name:'Тропический ливень',icon:'⛈',min:2,max:4.5,brief:'Дождь усилился! Проверь защиту от воды.'},
 {name:'Быстрый переход',icon:'🥾',min:3,max:4,brief:'Агент идёт быстрее: нужно выпускать больше пара и держать дождь.'}
];
const LAB_STEAM=10,LAB_DROPS=6;
const MG={pore:8,round:0,phase:'ready',parts:[],fx:[],steam:0,sb:0,db:0,dp:0,
 done:false,flash:0,token:null,last:0,view:null};
const CW=640,CH=360,MEMY=180;
function scrLabGame(){
 MG.round=0;
 app.innerHTML=topbar('🔬 Мастерская мембран')
 +'<section class="panel lab-arena"><div class="mission-kicker">3 коротких испытания · награда +50 XP</div>'
 +'<h2>Собери мембрану для экспедиции</h2><p class="hint">Настрой размер пор и нажми «Проверить». Установка сама выпустит 10 частиц пара и 6 капель. Можно менять настройку прямо во время опыта.</p>'
 +'<div class="trial-track" id="trialTrack"></div><div class="radio" id="trialBrief"></div>'
 +'<div class="pore-control"><label for="pore">Размер пор <b id="pv">'+MG.pore.toFixed(1)+'</b></label>'
 +'<input type="range" id="pore" min="0.5" max="10" step="0.5" value="'+MG.pore+'" aria-describedby="poreHelp">'
 +'<div class="range-labels" id="poreHelp"><span>Меньше: защита от воды</span><span>Больше: легче дышать</span></div></div>'
 +'<canvas id="cv" width="640" height="360" aria-label="Пар поднимается снизу, дождь падает сверху"></canvas>'
 +'<div class="trial-goals"><div>💨 Пар вышел <b id="stS">0</b>/10<progress id="steamProgress" value="0" max="10"></progress></div>'
 +'<div>🛡 Капли отбиты <b id="stD">0</b>/6<progress id="dropProgress" value="0" max="6"></progress></div></div>'
 +'<div class="mgstats"><span>Пар застрял: <b id="stB">0</b></span><span>Протечки: <b id="stP">0</b></span></div>'
 +'<div id="mgMsg" class="lab-status" role="status" aria-live="polite"></div>'
 +'<div class="row"><button class="btn primary" id="bTest">▶ Проверить мембрану</button><button class="btn" id="mgRestart">🔄 Сначала</button><button class="btn ghost" id="mgBack">↩ В лабораторию</button></div>'
 +'<div id="labReward"></div></section>';
 const context=$('#cv').getContext('2d');
 const sky=context.createLinearGradient(0,0,0,MEMY);sky.addColorStop(0,'#1d3a5f');sky.addColorStop(1,'#274b76');
 const body=context.createLinearGradient(0,MEMY,0,CH);body.addColorStop(0,'#4a2c3c');body.addColorStop(1,'#33203f');
 MG.view={context,sky,body,steam:$('#stS'),blocked:$('#stB'),drops:$('#stD'),passed:$('#stP'),
  steamProgress:$('#steamProgress'),dropProgress:$('#dropProgress'),message:$('#mgMsg'),button:$('#bTest')};
 $('#pore').oninput=e=>{MG.pore=+e.target.value;$('#pv').textContent=MG.pore.toFixed(1);};
 $('#bTest').onclick=()=>{if(MG.phase==='passed'){MG.round++;prepareTrial();}else startTrial();};
 $('#mgRestart').onclick=()=>render();$('#mgBack').onclick=()=>go('lab');
 prepareTrial();
}
function prepareTrial(){
 // Каждый опыт получает новый токен: старые кадры больше не влияют на него.
 MG.token={};MG.last=0;MG.parts=[];MG.fx=[];MG.steam=0;MG.sb=0;MG.db=0;MG.dp=0;MG.flash=0;
 MG.phase='ready';MG.done=false;
 const trial=LAB_TRIALS[MG.round];
 $('#trialTrack').innerHTML=LAB_TRIALS.map((item,i)=>'<span class="trial-step '+(i<MG.round?'complete':i===MG.round?'current':'')+'">'+(i<MG.round?'✓':item.icon)+' '+(i+1)+'</span>').join('');
 $('#trialBrief').innerHTML='<b>'+trial.icon+' Испытание '+(MG.round+1)+'/3: '+trial.name+'</b><p>'+trial.brief+'</p>';
 MG.view.message.textContent='Настрой поры и запусти проверку. Цель: 10/10 частиц пара и 6/6 отбитых капель.';
 MG.view.button.textContent='▶ Проверить мембрану';MG.view.button.disabled=false;
 mgUpd();mgDraw();
}
function startTrial(){
 if(MG.phase==='running'||MG.done)return;
 prepareTrial();MG.phase='running';sfx.play('mini');
 MG.view.button.disabled=true;MG.view.button.textContent='⏳ Проверяем…';
 MG.view.message.textContent='Идёт проверка: пар снизу, дождь сверху. Подстрой поры, если пар застревает или вода проходит.';
 spawn('steam',LAB_STEAM);spawn('drop',LAB_DROPS);
 const token=MG.token;requestAnimationFrame(time=>mgLoop(time,token));
}
function spawn(type,count){
 if(MG.phase!=='running')return;
 for(let i=0;i<count;i++)MG.parts.push(type==='steam'
  ?{type,x:70+(i+.5)*(500/count),y:CH-25+i*8,vy:-190,r:4+Math.random()*2,ph:Math.random()*6,hit:false}
  :{type,x:70+(i+.5)*(500/count),y:-15-i*24,vy:230,r:6+Math.random()*2,hit:false,passed:false});
}
function mgUpd(){
 const view=MG.view;if(!view)return;
 view.steam.textContent=MG.steam;view.blocked.textContent=MG.sb;
 view.drops.textContent=MG.db;view.passed.textContent=MG.dp;
 view.steamProgress.value=MG.steam;view.dropProgress.value=MG.db;
}
function finishTrial(){
 const view=MG.view;
 if(MG.steam===LAB_STEAM&&MG.db===LAB_DROPS&&MG.sb===0&&MG.dp===0){
  if(MG.round<LAB_TRIALS.length-1){
   MG.phase='passed';sfx.play('win');view.message.textContent='✅ Испытание пройдено! Пар выходит, вода остаётся снаружи. Готов к следующей нагрузке?';
   view.button.textContent='→ Следующее испытание';view.button.disabled=false;
  }else{
   MG.phase='done';MG.done=true;sfx.play('win');const first=!P.lab;
   if(first){P.lab=true;if(!P.art.includes('pore'))P.art.push('pore');P.xp+=50;save();$('#xpChip').textContent='⭐ '+P.xp;}
   view.message.textContent='🎉 Все 3 испытания пройдены! Мембрана готова к экспедиции.';
   view.button.textContent='✓ Мембрана готова';$('#pore').disabled=true;
   $('#labReward').innerHTML='<div class="reward-pop"><span class="reward-stars">★★★</span><b>Мастер мембран</b><p>'+(first?'+50 XP · новая находка в коллекции':'Отличный результат! Награда уже есть в коллекции.')+'</p></div>';
   $('#trialTrack').innerHTML=LAB_TRIALS.map((_,i)=>'<span class="trial-step complete">✓ '+(i+1)+'</span>').join('');
  }
 }else{
  MG.phase='failed';sfx.play('sad');
  view.message.textContent=MG.sb&&MG.dp?'🔧 Настройка менялась слишком резко. Попробуй средний размер и держи его во время проверки.':MG.dp?'💦 Поры великоваты: вода прошла. Сделай их меньше и повтори — новая попытка начнётся без протечек.':'💨 Поры слишком маленькие: пар застрял. Увеличь размер и повтори.';
  view.button.textContent='↻ Проверить ещё раз';view.button.disabled=false;
 }
}
function mgLoop(time,token){
 if(MG.token!==token||S.screen!=='labgame'||MG.phase!=='running')return;
 const dt=MG.last?Math.min(.05,(time-MG.last)/1000):.016;MG.last=time;
 MG.flash=Math.max(0,MG.flash-dt*2);
 const trial=LAB_TRIALS[MG.round];let changed=false;
 for(const part of MG.parts){
  part.y+=part.vy*dt;
  if(part.type==='steam')part.x+=Math.sin((part.ph+=dt*5))*.5;
  if(!part.hit&&((part.type==='steam'&&part.y<=MEMY)||(part.type==='drop'&&part.y>=MEMY))){
   part.hit=true;changed=true;sfx.mini();
   if(part.type==='steam'){
    if(MG.pore>=trial.min)MG.steam++;
    else{MG.sb++;part.dead=true;MG.fx.push({t:0,x:part.x,y:MEMY,type:'puff'});}
   }else if(MG.pore<=trial.max){MG.db++;part.dead=true;MG.fx.push({t:0,x:part.x,y:MEMY,type:'splash'});}
   else{MG.dp++;MG.flash=1;part.passed=true;}
  }
  if(part.hit&&(part.y>CH+15||part.y<-30))part.dead=true;
 }
 if(changed)mgUpd();
 MG.fx.forEach(effect=>effect.t+=dt);MG.fx=MG.fx.filter(effect=>effect.t<.6);
 const complete=MG.parts.every(part=>part.hit);
 MG.parts=MG.parts.filter(part=>!part.dead);mgDraw();
 if(complete){finishTrial();return;}
 requestAnimationFrame(next=>mgLoop(next,token));
}
function mgDraw(){
 const view=MG.view;if(!view)return;const x=view.context;
 x.clearRect(0,0,CW,CH);
 x.fillStyle=view.sky;x.fillRect(0,0,CW,MEMY);x.fillStyle=view.body;x.fillRect(0,MEMY,CW,CH-MEMY);
 x.fillStyle='rgba(255,255,255,.75)';x.font='14px Manrope, sans-serif';
 x.fillText('ДОЖДЬ ↓',16,24);x.fillText('ПАР ↑',16,CH-16);
 x.fillStyle=MG.flash>0?'#ff6b6b':'#cfe3ff';x.fillRect(16,MEMY-4,CW-32,8);
 const gap=Math.max(2,MG.pore*2.2),segments=10,width=(CW-32)/segments;x.fillStyle='#0b1728';
 for(let i=0;i<segments;i++)x.fillRect(16+width*i+width/2-gap/2,MEMY-6,gap,12);
 for(const part of MG.parts){
  x.fillStyle=part.type==='steam'?(part.y<MEMY?'#ffe082':'rgba(255,255,255,.85)'):(part.passed?'#ff6b6b':'#6ec3ff');
  x.beginPath();x.arc(part.x,part.y,part.r,0,Math.PI*2);x.fill();
  if(part.type==='drop'){x.beginPath();x.moveTo(part.x-part.r*.7,part.y-part.r);x.lineTo(part.x+part.r*.7,part.y-part.r);x.lineTo(part.x,part.y-part.r*2);x.closePath();x.fill();}
 }
 for(const effect of MG.fx){const alpha=1-effect.t/.6;
  if(effect.type==='puff'){x.strokeStyle='rgba(255,255,255,'+alpha+')';x.beginPath();x.arc(effect.x,effect.y,6+effect.t*40,0,Math.PI*2);x.stroke();}
  else{x.strokeStyle='rgba(110,195,255,'+alpha+')';for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(effect.x,effect.y);x.lineTo(effect.x+k*7,effect.y-6-Math.abs(k)*4);x.stroke();}}
 }
}
