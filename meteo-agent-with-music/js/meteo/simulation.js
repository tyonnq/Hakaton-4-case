'use strict';

/* ================= ФОРМУЛЫ ================= */
function windChill(t,v){if(t>=14||v<2)return t;const p=Math.pow(v,0.16);return Math.round(13.12+0.6215*t-11.37*p+0.3965*t*p);}
function grade(g){return g>=92?'S':g>=78?'A':g>=62?'B':g>=45?'C':'D';}
function precipLabel(p,temp){
 if(temp<=0)return['☀️ без осадков','🌨 снег','🌨 снегопад','❄️ сильный снегопад'][p];
 return['☀️ без осадков','🌦 морось','🌧 дождь','⛈ сильный ливень'][p];
}
function rankOf(x){return x>=430?'🌟 Легенда погоды':x>=320?'🏆 Мастер погоды':x>=200?'🥇 Старший агент':x>=90?'🥈 Агент':'🥉 Юный стажёр';}

/* ================= СИМУЛЯЦИЯ ================= */
function simulate(L,sel){
 const c=L.cond,b=ITEMS[sel.base],m=ITEMS[sel.mid],o=ITEMS[sel.outer];
 const acc=sel.acc.map(k=>ITEMS[k]);
 const msgs=[];let bad=0;
 const note=(t,isBad)=>{msgs.push(t);if(isBad)bad++;};
 let health=100,dry=100,warm=100,hot=0;
 const eff=windChill(c.temp,c.wind)-(o.wind?0:Math.min(10,c.wind*0.7));
 const W=(b.warm||0)+(m.warm||0)+(o.warm||0)+acc.reduce((s,a)=>s+(a.warm||0),0);
 const need=Math.round(Math.max(0,(18-eff)*1.25));
 const slack=28+(2-c.exertion)*8;
 if(W<need){warm=Math.max(0,100-(need-W)*2.5);
  note('🥶 Одежды мало! Агент мёрзнет. Нужен тёплый слой!',true);}
 else if(W>need+slack){hot=W-(need+slack);warm=Math.max(30,100-hot*6);
  note('🥵 Слишком много одежды! Агент взмок и устал.',true);}
 else note('🌡 Тепло — в самый раз!');
 if(eff<=-25&&!sel.acc.includes('a_hatW')){warm=Math.max(0,warm-8);health-=15;
  note('🧠 Голова мёрзнет! В такой мороз без шапки нельзя!',true);}
 const br=Math.min(b.breath??10,m.breath??10,o.breath??10);
 const needBr=[6,7,9][c.exertion];
 const sweat=br<needBr-1?'strong':(br<needBr?'mild':null);
 if(sweat==='strong'){dry-=35;health-=20;hot+=8;warm=Math.max(30,warm-hot*6);
  note(o.breath===0?'🧴 Баня! Плёночный дождевик не выпускает пот — внутри всё мокрое.':'🧴 Одежда не дышит: пот остался на теле!',true);}
 else if(sweat==='mild'){dry-=12;note('💧 Агент немного вспотел.',true);}
 else note('🌬 Пот выходит наружу — кожа сухая!');
 const umbOK=sel.acc.includes('a_umb')&&c.wind<7;
 if(sel.acc.includes('a_umb')&&!umbOK){dry-=15;health-=5;
  note('💨 Ветер вывернул зонт наизнанку!',true);}
 const outerWet=c.precip>0&&Math.max(o.wp||0,umbOK?2:0)<c.precip;
 if(outerWet){dry-=65;health-=15;note(c.temp<=0?'🌨 Снег попал под одежду! Защита от осадков недостаточна.':'💧 Дождь протёк! Одежда стала мокрой.',true);}
 else if(c.precip>0)note(c.temp<=0?'❄️ Снег остался снаружи — под одеждой сухо!':'☔️ Дождь остался снаружи — под одеждой сухо!');
 const bt=b.tags||[];
 if(bt.includes('хлопок')&&(sweat||outerWet||(c.humidity>80&&c.exertion>0))){dry-=25;warm=Math.max(0,warm-20);health-=10;
  note('👕 Хлопок намок и стал холодным, как лёд! Возьми шерсть или термобельё.',true);}
 else if(bt.includes('хлопок')&&c.temp<=-15){dry-=15;warm=Math.max(0,warm-20);health-=10;
  note('🧊 Хлопок на теле в мороз превращается в лёд!',true);}
 if(o.wp>=3&&o.freeze===0&&eff<=-25){dry-=15;warm=Math.max(0,warm-15);health-=10;
  note('🧊 Тонкая куртка замёрзла и задубела! Нужна тёплая зимняя.',true);}
 if(c.temp>=35&&bt.includes('синтетика')){health-=15;dry-=10;
  note('🥵 Синтетика в жару — как в пакетике! Нужна свободная льняная одежда.',true);}
 if(c.temp>=30&&o.wp>=3){hot+=5;warm=Math.max(30,warm-45);dry-=20;
  note('♨️ Плёнка в жару — это парник! Нужно что-нибудь продуваемое.',true);}
 if(c.temp>=25&&bt.includes('шерсть')){dry-=10;health-=10;warm=Math.max(30,warm-10);
  note('🐑 Тёплая шерсть в жару — слишком жарко!',true);}
 if(c.uv>=8){
  const covered=(b.sun||0)>0||(o.sun||0)>0;
  const head=acc.some(a=>(a.sun||0)>=2);
  if(covered)note('👒 Одежда-тень — лучший друг в пустыне!');
  else{health-=c.uv>=10?60:30;note('☀️ Ай! Агент обгорел на солнце! Нужно закрыть плечи.',true);}
  if(!head){health-=15;note('👒 Голове нужна шляпа с полями!',true);}
 }
 if(eff<=-40&&(need-W)>=15){health-=60;note('🚑 Совсем замёрз! Ещё чуть-чуть — и беда!',true);}
 if(c.temp>=35&&hot>0){health-=Math.min(40,Math.round(hot*6));note('🏥 Очень жарко! Сними лишнее!',true);}
 dry=Math.max(0,Math.min(100,dry));health=Math.max(0,Math.min(100,health));
 let avg=Math.round((warm+dry+health)/3);
 if(warm<40)avg=Math.min(avg,45);
 if(dry<45)avg=Math.min(avg,50);
 if(health<60)avg=Math.min(avg,55);
 if(bad===0)note('✅ Всё отлично! Агент очень доволен!');
 let emotion=hot>=5?'hot':((warm<55||health<45)?'cold':(avg<70?'sad':'happy'));
 if(o===ITEMS.o_raincoat&&emotion!=='hot'&&emotion!=='cold')emotion='sad';
 const g=grade(avg);
 const bonus=bad===0?25:0;
 return{bars:{warm:Math.round(warm),dry:Math.round(dry),health:Math.round(health)},avg,rating:g,
  pass:avg>=62,xp:{S:75,A:75,B:50,C:25,D:10}[g]+bonus,bonus,verdict:VERDICT[g],msgs,emotion};
}

