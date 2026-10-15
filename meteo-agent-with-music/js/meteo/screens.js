'use strict';

/* ---------- ЭКРАНЫ ---------- */
// Карточки и связи с уровнями не меняются во время игры.
const GUIDE_ITEMS=Object.entries(ITEMS).filter(([key])=>key!=='m_none'&&key!=='o_none').map(([key,it])=>{
 const places=LEVELS.filter(level=>Object.values(SUIT[level.id]).some(keys=>keys.includes(key))).map(level=>level.name);
 const tags=it.tags||[];
 return {name:it.name.toLowerCase(),filters:{
  natural:tags.some(tag=>['шерсть','хлопок','лён','пух'].includes(tag)),
  synth:tags.includes('синтетика'),tech:tags.includes('high-tech'),water:it.wp>=2,
  heat:(it.sun||0)>0||(it.breath>=9&&(it.warm||0)<=6)
 },html:'<div class="card" style="cursor:default"><span class="icon">'+(it.icon||'❔')+'</span><b>'+it.name+'</b><div class="stats">'+statChips(it)+'</div>'
  +'<div class="note">'+(it.note||'Помощник агенту.')+'</div>'
  +(places.length?'<div class="note" style="color:#7ea4cf">Где нужен: '+places.join(', ')+'</div>':'')+'</div>'};
});
function guideCardsHTML(){
 const filter=S.guideFilter||'all',query=(S.guideQ||'').trim().toLowerCase();
 const items=GUIDE_ITEMS.filter(item=>(filter==='all'||item.filters[filter])&&item.name.includes(query));
 return items.length?items.map(item=>item.html).join(''):'<p class="hint">Ничего не нашлось.</p>';
}
function updateGuideCards(){
 $('#guideCards').innerHTML=guideCardsHTML();
}
function scrIntro(){
 app.innerHTML='<section class="panel intro"><div class="logo">'+IC.logo+'</div><h1>Метео-Агент</h1>'
 +'<p class="hint" style="max-width:560px;margin:12px auto;font-size:15px">Ты — стажёр секретной организации «Глобальный климатический патруль». Климатический стабилизатор дал сбой, и погода стала непредсказуемой. Отправляйся в разные страны и помогай жителям и учёным: подбирай экипировку, чтобы они могли выполнить свои задачи!</p>'
 +'<ul class="rules"><li>🧦 <b>Нижний слой</b> — убирает пот.</li><li>🧸 <b>Тёплый слой</b> — греет.</li><li>☔️ <b>Верхний слой</b> — от дождя и ветра.</li></ul>'
 +'<button class="btn primary big" id="start">🚀 Поехали!</button></section>';
 $('#start').onclick=()=>go('map');
}
function scrMap(){
 app.innerHTML=topbar('🗺 Карта мира')
 +'<section class="panel" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="chip">'+rankOf(P.xp)+'</span><span class="chip">📦 находки '+P.art.length+'/'+ARTS.length+'</span><span style="flex:1"></span>'
 +'<button class="btn" id="goLab">🧪 Лаборатория'+(P.lab?' ✔':'')+'</button><button class="btn" id="goGuide">📚 Справочник</button><button class="btn" id="goEnc">🏆 Находки</button><button class="btn ghost" id="reset">♻️ Сброс</button></section>'
 +missionProgressHTML()+'<div class="lvls">'+LEVELS.map((L,i)=>{
   const locked=i>0&&(P.best[LEVELS[i-1].id]||0)<62;const b=P.best[L.id];
   return '<button class="lvl lv-'+L.id+(locked?' locked':'')+'" data-l="'+L.id+'" '+(locked?'disabled':'')+'>'
   +'<div class="lvlTop"><div class="lh">'+L.icon+'<b>'+L.name+'</b></div><span>'+L.sub+'</span></div><p>'+L.task+'</p>'
   +'<div class="lvlBot">'+(locked?'🔒 Сначала выполни предыдущее задание':(b?'🏅 Лучший комфорт: '+grade(b)+' ('+b+'%)':'🧥 Подбери экипировку персонажу'))+'</div></button>';
  }).join('')+'</div>'
 +'<section class="panel"><h3>Правило бутерброда 🥪</h3><p>🧦 Нижний слой (убирает пот) + 🧸 тёплый слой (греет) + ☔️ верхний слой (от дождя и ветра). Нарушишь порядок — герою будет плохо!</p></section>';
 $('#goLab').onclick=()=>go('lab');$('#goEnc').onclick=()=>go('enc');
 $('#goGuide').onclick=()=>{S.guideBack='map';go('guide');};
 $('#reset').onclick=()=>{if(confirm('Начать игру заново?')){P=JSON.parse(JSON.stringify(DEF));save();render();}};
 app.querySelectorAll('.lvl').forEach(el=>el.onclick=()=>{S.levelId=el.dataset.l;S.sel=null;go('level');});
}
function scrLab(){
 const groups=[['🌿 Природные материалы',['b_wool','b_cotton','b_linen','m_wool','m_down']],['🏭 Синтетика',['b_synth','m_fleece','o_raincoat']],['✨ High-tech: мембрана и Softshell',['o_parka','o_membrane','o_softshell','o_poncho']]];
 app.innerHTML=topbar('🧪 Лаборатория')
 +'<section class="panel"><h2>Правило трёх слоёв 🥪</h2><p>Одежда — как бутерброд!</p>'
 +'<ul class="rules"><li>🧦 <b>Нижний</b> — убирает пот.</li><li>🧸 <b>Тёплый</b> — греет.</li><li>☔️ <b>Верхний</b> — не пускает дождь и ветер.</li></ul>'
 +groups.map(g=>'<h3>'+g[0]+'</h3><div class="cards">'+g[1].map(k=>{const it=ITEMS[k];
   return '<div class="card" style="cursor:default"><span class="icon">'+it.icon+'</span><b>'+it.name+'</b><div class="stats">'+statChips(it)+'</div><div class="note">'+it.note+'</div></div>';}).join('')+'</div>').join('')+'</section>'
 +'<section class="panel"><h2>🔬 Мастерская мембран</h2><p>Три короткие проверки: мелкий дождь, тропический ливень и быстрый переход. Настрой мембрану и получи +50 XP и находку!</p><div class="row"><button class="btn primary" id="mg">🔬 Начать испытания'+(P.lab?' ✔':'')+'</button></div></section>'
 +'<section class="panel"><h2>🏷 Для родителей</h2><p>Цифры 10 000/10 000 на бирке: водостойкость / выпуск пара. Чем больше — тем надёжнее.</p></section>';
 $('#mg').onclick=()=>go('labgame');
}
function scrGuide(){
 const F=S.guideFilter||'all';
 const chips=[['all','Все'],['natural','🌿 Природные'],['synth','🏭 Изобретённые'],['tech','✨ Ткани будущего'],['water','☔️ От дождя'],['heat','🔥 Для жары']];
 app.innerHTML=topbar('📚 Справочник тканей')
 +'<section class="panel"><div class="mgui" style="margin:0 0 10px">'
 +'<input id="gq" type="text" placeholder="🔍 Напиши: шерсть, шляпа…" style="flex:1;min-width:160px;background:#0e1e33;border:1px solid var(--line);border-radius:10px;color:var(--ink);padding:9px 12px">'
 +'<select id="gf" style="font:inherit;background:#0e1e33;color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:9px">'
 +chips.map(c=>'<option value="'+c[0]+'" '+(F===c[0]?'selected':'')+'>'+c[1]+'</option>').join('')+'</select></div>'
 +'<div class="cards" id="guideCards">'+guideCardsHTML()+'</div></section>'
 +'<section class="panel"><h2>Как читать значки</h2><ul class="log" style="animation:none;opacity:1">'
 +'<li>🔥 Тепло — насколько вещь греет.</li>'
 +'<li>🌬 Дышит — выпускает пот наружу.</li>'
 +'<li>💦 Убирает пот — кожа остаётся сухой.</li>'
 +'<li>☔️ От дождя — морось, дождик или ливень.</li>'
 +'<li>☀️ От солнца — закрывает кожу от обгорания.</li></ul>'
 +'<p class="hint">🥪 Помни: 🧦 нижний (пот) + 🧸 тёплый (греет) + ☔️ верхний (дождь). Пар проходит через всё сразу — поэтому «дышит» самая <b>плохая</b> из трёх вещей.</p></section>';
 $('#gq').value=S.guideQ||'';
 $('#gq').oninput=e=>{S.guideQ=e.target.value;updateGuideCards();};
 $('#gf').onchange=e=>{S.guideFilter=e.target.value;updateGuideCards();};
}
function scrEnc(){
 app.innerHTML=topbar('🏆 Находки')+'<section class="panel"><div class="cards">'
 +ARTS.map(a=>{const un=P.art.includes(a.id);
  return '<div class="card" style="cursor:default;'+(un?'':'opacity:.55')+'"><span class="icon">'+(un?a.icon:IC.lock)+'</span><b>'+(un?a.name:'???')+'</b><div class="note">'+(un?a.txt:'Открой: '+a.how)+'</div></div>';}).join('')
 +'</div></section>';
}
function slotHTML(slot,title,keys,cur){
 return '<h3>'+title+'</h3><div class="cards">'+keys.map(k=>{const it=ITEMS[k];
  return '<button class="card '+(cur===k?'sel':'')+'" data-act="pick" data-slot="'+slot+'" data-key="'+k+'"><span class="icon">'+(it.icon||'❔')+'</span><b>'+it.name+'</b><div class="stats">'+statChips(it)+'</div>'+(it.note?'<div class="note">'+it.note+'</div>':'')+'</button>';}).join('')+'</div>';
}
function scrLevel(){
 const L=LEVELS.find(l=>l.id===S.levelId);if(!L)return go('map');
 if(!S.sel||S.sel.level!==L.id)S.sel={level:L.id,base:null,mid:'m_none',outer:'o_none',acc:[]};
 const sel=S.sel,c=L.cond,preview=sel.base?simulate(L,sel):null;
 const wetWord=c.humidity>=85?'💦 сырость, как в бане':c.humidity>=60?'💧 сыровато':'🌵 сухо';
 const windWord=c.wind>5?'💨 сильный ветер':'💨 лёгкий ветерок';
 const sunWord=c.uv>=8?'☀️ злое солнце':'☀️ ласковое солнышко';
 const exWord=['🧘 стоять на месте','🚶 идти далеко','🥾 идти очень далеко'][c.exertion];
 /* кнопки пола */
 const genderRow='<div class="gender-row">'
  +'<button class="btn '+(P.gender==='boy'?'active':'')+'" data-g="boy">👦 Персонаж 1</button>'
  +'<button class="btn '+(P.gender==='girl'?'active':'')+'" data-g="girl">👧 Персонаж 2</button></div>';
 app.innerHTML=topbar('Задание: '+L.name)+'<div class="grid2">'
 +'<section class="panel"><div class="mission-kicker">Миссия '+(LEVELS.indexOf(L)+1)+'/4 · '+L.person+'</div><h3>Задача персонажа</h3><p>'+L.task+'</p><h3>Погода</h3><div class="conds">'
 +'<span class="cond">'+(c.temp>=30?'🥵':c.temp<=0?'🥶':'🙂')+' '+c.temp+'°</span>'
 +'<span class="cond">'+windWord+'</span><span class="cond">'+wetWord+'</span>'
 +'<span class="cond">'+precipLabel(c.precip,c.temp)+'</span><span class="cond">'+sunWord+'</span>'
 +'<span class="cond">'+exWord+'</span></div>'
 +(c.temp<=0?'<p class="hint">❄️ Ветер делает мороз злее: как будто <b>'+windChill(c.temp,c.wind)+'°</b>!</p>':'')
 +'<h3>Выбери персонажа</h3>'+genderRow
 +avatarHTML(sel,preview?preview.emotion:'happy',true)+slotsHTML(sel)+agentRadioHTML(preview,L.person)+'<div class="row" style="justify-content:center;margin-top:4px"><button class="btn" id="peek">'+(S.peek?'🧥 Скрыть слои':'👁 Показать слои')+'</button></div>'
 +'<div class="style"><label for="hue">🎨 Цвет одежды</label><input type="range" id="hue" min="0" max="360" value="'+P.hue+'">'
 +'<label for="print">Принт на груди</label><select id="print">'+DRESS_PRINTS.map(([id,name])=>'<option value="'+id+'">'+name+'</option>').join('')+'</select></div></section>'
 +'<section class="panel" id="dressPanel">'
 +slotHTML('base','🧦 1 · Базовый слой — отвод пота',SUIT[L.id].base,sel.base)
 +slotHTML('mid','🧸 2 · Средний слой — сохранение тепла',SUIT[L.id].mid,sel.mid)
 +slotHTML('outer','☔️ 3 · Внешний слой — ветер и осадки',SUIT[L.id].outer,sel.outer)
 +'<h3>🎒 Аксессуары</h3><div class="cards">'+SUIT[L.id].acc.map(k=>'<button class="card '+(sel.acc.includes(k)?'sel':'')+'" data-act="acc" data-key="'+k+'"><span class="icon">'+ITEMS[k].icon+'</span><b>'+ITEMS[k].name+'</b></button>').join('')+'</div>'
 +'<button class="btn primary big" id="launch">🚀 Отправить персонажа на задание</button>'
 +'<div class="row"><button class="btn" id="openGuide">📚 Подглянуть в справочник</button></div>'
 +'<div class="err" id="valerr"></div></section></div>';
 S.lastSlot=null;
 sfx.preview(preview?preview.emotion:null);
 app.querySelectorAll('[data-act]').forEach(el=>el.onclick=()=>{
  if(el.dataset.act==='pick'){sel[el.dataset.slot]=el.dataset.key;S.lastSlot=el.dataset.slot;}
  else{const k=el.dataset.key,i=sel.acc.indexOf(k);i<0?sel.acc.push(k):sel.acc.splice(i,1);S.lastSlot=i<0?'acc:'+k:null;}
  scrLevel();
 });
 app.querySelectorAll('[data-g]').forEach(el=>el.onclick=()=>{P.gender=el.dataset.g;save();scrLevel();});
 $('#hue').oninput=e=>{P.hue=+e.target.value;
   const a=document.querySelector('.avatar');if(a)a.outerHTML=avatarHTML(sel,preview?preview.emotion:'happy',false);};
 $('#peek').onclick=()=>{S.peek=!S.peek;scrLevel();};
 $('#hue').onchange=save;
 $('#print').value=P.print;
 $('#print').onchange=e=>{P.print=e.target.value;save();scrLevel();};
 $('#openGuide').onclick=()=>{S.guideBack='level';go('guide');};
 $('#launch').onclick=launch;
}
function launch(){
 if(!S.sel.base){const e=$('#valerr');e.textContent='⚠️ Сначала выбери нижний слой!';
  const p=$('#dressPanel');p.classList.add('shake');setTimeout(()=>p&&p.classList.remove('shake'),450);return;}
 const L=LEVELS.find(l=>l.id===S.levelId);
 const R=simulate(L,S.sel);
 P.best[L.id]=Math.max(P.best[L.id]||0,R.avg);P.xp+=R.xp;R.newArts=[];
 if(R.pass&&!P.art.includes(L.art)){P.art.push(L.art);R.newArts.push(L.art);}
 for(const id of legendaryFor(P.art)){if(!P.art.includes(id)){P.art.push(id);R.newArts.push(id);}}
 save();S.sim=R;go('result');
}
function scrResult(){
 const L=LEVELS.find(l=>l.id===S.levelId),R=S.sim;if(!L||!R)return go('map');
 const idx=LEVELS.indexOf(L),next=LEVELS[idx+1];
 app.innerHTML=topbar('Отчёт: '+L.name)+'<div class="grid2">'
 +'<section class="panel" style="text-align:center"><h2>Как себя чувствует персонаж?</h2>'
 +avatarHTML(S.sel,R.emotion)
 +'<div class="verdict">'+R.verdict+'</div><div class="rating r-'+R.rating+'">'+R.rating+'</div>'
 +(R.pass?'<div class="reward-pop"><b>Задание выполнено!</b><p>'+L.success+'</p></div>':'<p class="hint">Персонаж не смог выполнить задачу с комфортом. Измени экипировку и попробуй ещё раз.</p>')
 +'<p class="hint">Лучший результат: '+P.best[L.id]+'</p></section>'
 +'<section class="panel"><h2>Шкалы</h2>'+bar('🌡 Тепло',R.bars.warm,'#ffb454')+bar('💧 Сухость',R.bars.dry,'#6ec3ff')+bar('😊 Здоровье',R.bars.health,'#43d9a3')
 +'<p class="hint">Рейтинг комфорта: <b>'+R.avg+'%</b> · ⭐ +'+R.xp+' XP'+(R.bonus?' · бонус «Идеальный баланс» +'+R.bonus:'')+'</p>'
 +'<h2>🗒 Что произошло?</h2><ul class="log">'+R.msgs.map((m,i)=>'<li style="animation-delay:'+(i*.3).toFixed(1)+'s">'+m+'</li>').join('')+'</ul>'
 +R.newArts.map(artCardHTML).join('')
 +'<div class="row"><button class="btn" id="retry">🔧 Переодеть персонажа</button><button class="btn" id="tomap">🗺 На карту</button>'
 +(R.pass&&next?'<button class="btn primary" id="next">🚀 Дальше: '+next.name+'</button>':'')+'</div></section></div>';
 requestAnimationFrame(()=>requestAnimationFrame(()=>app.querySelectorAll('.bar i').forEach(el=>el.style.width=el.dataset.w+'%')));
 sfx.result(R);
 $('#retry').onclick=()=>go('level');$('#tomap').onclick=()=>go('map');
 if($('#next'))$('#next').onclick=()=>{S.levelId=next.id;S.sel=null;go('level');};
}

