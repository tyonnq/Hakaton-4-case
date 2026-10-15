'use strict';

/* ================= UI ================= */
const app=document.getElementById('app');
const $=s=>document.querySelector(s);
const S={screen:'intro',levelId:null,sel:null,sim:null,guideBack:'map',guideFilter:'all',guideQ:'',peek:false,lastSlot:null};
function go(s){
 sfx.stop();
 if(S.screen==='labgame'&&s!=='labgame'){MG.token=null;MG.view=null;}
 S.screen=s;window.scrollTo(0,0);render();
}
function topbar(title){
 let to='map';
 if(S.screen==='result')to='level';
 else if(S.screen==='guide')to=S.guideBack||'map';
 else if(S.screen==='labgame')to='lab';
 const name={level:'Экипировка',lab:'Лаборатория',labgame:'Лаборатория',map:'Карта'}[to]||'Карта';
 const show=S.screen!=='intro'&&S.screen!=='map';
 return '<header class="top">'+(show?'<button class="btn ghost" id="back" data-to="'+to+'">← '+name+'</button>':'<span style="width:8px"></span>')
 +'<b style="flex:1">'+title+'</b><span class="chip" id="xpChip">⭐ '+P.xp+'</span></header>';
}
function statChips(it){
 const c=[];
 if((it.warm||0)>=20)c.push('🔥 очень тёплая');
 else if((it.warm||0)>=8)c.push('🌤 тёплая');
 else if((it.warm||0)>=1)c.push('🍃 чуть греет');
 if(it.wick>=8)c.push('💦 убирает пот');
 if(it.breath===0)c.push('🥵 не дышит');
 else if(it.breath>=8)c.push('🌬 хорошо дышит');
 if(it.wp===3)c.push('☔️ от ливня');
 else if(it.wp===2)c.push('🌧 от дождя');
 else if(it.wp===1)c.push('🌫 от мороси');
 if(it.freeze)c.push('❄️ не дубеет');
 if(it.wind)c.push('💨 от ветра');
 if(it.sun)c.push('☀️ от солнца');
 return c.map(x=>'<span class="chip">'+x+'</span>').join('');
}
function missionProgressHTML(){
 const completed=LEVELS.filter(level=>(P.best[level.id]||0)>=62).length;
 return '<section class="panel"><div class="mission-kicker">Глобальный климатический патруль</div><h2>'+(completed===4?'Все задания выполнены! 🎉':'Помоги людям одеться по погоде')+'</h2>'
  +'<p class="hint">'+completed+'/4 миссии выполнены. Изучи ткани, выбери персонажа и собери экипировку для его задачи.</p>'
  +'<progress value="'+completed+'" max="4" aria-label="Выполненные климатические миссии"></progress>'
  +'<div class="mission-track">'+LEVELS.map(level=>'<span class="mission-stop '+((P.best[level.id]||0)>=62?'completed':'')+'">'+((P.best[level.id]||0)>=62?'✓':'📍')+' '+level.name+'</span>').join('')+'</div></section>';
}
function agentRadioHTML(preview,person){
 if(!preview)return '<div class="radio"><b>📻 '+person+' на связи</b><p>Выбери базовый слой. Я сразу скажу, удобно ли мне в этой одежде!</p></div>';
 const message=preview.bonus?'👍 Идеальный баланс! Эта экипировка подходит для моей задачи.':preview.pass?'👍 Можно отправляться! Посмотри, можно ли ещё улучшить комфорт.':preview.emotion==='hot'?'🥵 Жарко! Попробуй снять лишний слой и выбрать дышащую ткань.':preview.bars.warm<60?'🥶 Я замерзаю! Проверь тёплый слой, куртку и аксессуары.':preview.bars.dry<62?'💦 Я промокаю! Проверь защиту от дождя и способность ткани выпускать пот.':'☀️ Мне нужна защита! Проверь головной убор и одежду от солнца.';
 return '<div class="radio" aria-live="polite"><div class="radio-heading"><b>📻 '+person+' на связи</b><span class="chip">Комфорт '+grade(preview.avg)+'</span></div><p>'+message+'</p>'
  +'<div class="live-meters">'+[['Тепло',preview.bars.warm,'#ffb454'],['Сухость',preview.bars.dry,'#6ec3ff'],['Здоровье',preview.bars.health,'#43d9a3']].map(([label,value,color])=>'<div><span>'+label+' '+value+'%</span><div class="meter"><i style="width:'+value+'%;background:'+color+'"></i></div></div>').join('')+'</div></div>';
}
const bar=(label,v,col)=>'<div class="barT"><span>'+label+'</span><b>'+v+'</b></div><div class="bar"><i data-w="'+v+'" style="background:'+col+'"></i></div>';
function artCardHTML(id){const a=ARTS.find(x=>x.id===id);
 return '<div class="artcard"><div style="font-size:34px">'+a.icon+'</div><div><b>🎉 Новая находка: '+a.name+'</b><div class="note">'+a.txt+'</div></div></div>';}

