
'use strict';
/* ================= СОХРАНЕНИЯ ================= */
const KEY='meteo_agent_v2';
const DEF={xp:0,best:{},art:[],lab:false,hue:0,gender:'boy',print:'none'};
const DRESS_PRINTS=[['none','Без принта'],['stripes','Полоски'],['dots','Горошек'],['stars','Звёзды']];
let P;
function loadProgress(){
 let data;try{data=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){data={}}
 if(!data||typeof data!=='object'||Array.isArray(data))data={};
 const best={};
 if(data.best&&typeof data.best==='object'&&!Array.isArray(data.best)){
  for(const level of LEVELS){const score=data.best[level.id];
   if(Number.isFinite(score)&&score>=0)best[level.id]=Math.min(100,Math.round(score));}
 }
 const art=Array.isArray(data.art)?[...new Set(data.art.filter(id=>ARTS.some(item=>item.id===id)))]:[];
 for(const id of legendaryFor(art)){if(!art.includes(id))art.push(id);}
 const lab=data.lab===true||art.includes('pore');
 if(lab&&!art.includes('pore'))art.push('pore');
 return {xp:Number.isFinite(data.xp)&&data.xp>=0?Math.floor(data.xp):0,best,art,lab,
  hue:Number.isFinite(data.hue)?Math.max(0,Math.min(360,data.hue)):0,
  gender:data.gender==='girl'?'girl':'boy',print:DRESS_PRINTS.some(([id])=>id===data.print)?data.print:'none'};
}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};

/* ================= SVG-ИКОНКИ ================= */
const SV=(i)=>'<svg class="ico" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-linejoin="round" stroke-linecap="round">'+i+'</svg>';
const TEE='M15 8 L21 6 Q24 11 27 6 L33 8 L43 15 L38 23 L33 20 V41 H15 V20 L10 23 L5 15 Z';
const LSL='M15 8 L21 6 Q24 11 27 6 L33 8 L44 32 L38 34 L33 20 V41 H15 V20 L10 34 L4 32 Z';
const IC={
 none:SV('<circle cx="24" cy="24" r="14" fill="none" stroke="#7f98b8" stroke-width="3"/><path d="M14 34 L34 14" stroke="#7f98b8" stroke-width="3"/>'),
 lock:SV('<rect x="11" y="21" width="26" height="19" rx="4" fill="#5d7595"/><path d="M17 21 V15 a7 7 0 0 1 14 0 V21" fill="none" stroke="#8aa3c4" stroke-width="3.5"/><circle cx="24" cy="30" r="3" fill="#1c3153"/>'),
 /* нижний слой */
 b_cotton:SV('<path d="'+TEE+'" fill="#f4f6fb" stroke="#8d9bb2" stroke-width="2"/><circle cx="24" cy="28" r="4.5" fill="#ffb454"/><path d="M19 7 Q24 15 29 7" fill="none" stroke="#6aa7e8" stroke-width="2.5"/>'),
 b_synth:SV('<path d="'+LSL+'" fill="#4f80b9" stroke="#2f5681" stroke-width="2"/><path d="M15 22 H33 M15 28 H33 M15 34 H33" stroke="#8fbbe8" stroke-width="2" opacity=".75"/><path d="M19 7 Q24 12 29 7" fill="none" stroke="#2f5681" stroke-width="2"/>'),
 b_wool:SV('<path d="'+LSL+'" fill="#dcb47e" stroke="#a67c46" stroke-width="2"/><path d="M17 16 l2 3 l2 -3 l2 3 l2 -3 l2 3 l2 -3 M17 24 l2 3 l2 -3 l2 3 l2 -3 l2 3 l2 -3 M17 32 l2 3 l2 -3 l2 3 l2 -3 l2 3 l2 -3" fill="none" stroke="#a67c46" stroke-width="1.6" opacity=".8"/>'),
 b_linen:SV('<path d="M15 8 L21 6 L24 14 L27 6 L33 8 L43 18 L39 26 L33 22 V42 H15 V22 L9 26 L5 18 Z" fill="#ece1c2" stroke="#b9a97f" stroke-width="2"/><path d="M21 6 L24 22 L27 6" fill="#d9ccaa" stroke="#b9a97f" stroke-width="1.5"/><circle cx="24" cy="28" r="1.5" fill="#b9a97f"/><circle cx="24" cy="34" r="1.5" fill="#b9a97f"/>'),
 /* тёплый слой */
 m_none:null,
 m_fleece:SV('<path d="M14 9 L20 6 H28 L34 9 L44 30 L38 33 L34 21 V41 H14 V21 L10 33 L4 30 Z" fill="#3fae9c" stroke="#237b6c" stroke-width="2"/><path d="M24 7 V41" stroke="#ffd166" stroke-width="2.5" stroke-dasharray="2 2"/><path d="M16 31 Q20 36 23 37 M32 31 Q28 36 25 37" fill="none" stroke="#237b6c" stroke-width="1.8"/>'),
 m_wool:SV('<path d="'+LSL+'" fill="#bd4b46" stroke="#7c2c29" stroke-width="2"/><rect x="19" y="5" width="10" height="6" rx="2" fill="#a23c38" stroke="#7c2c29" stroke-width="1.5"/><path d="M20 15 q3 3 0 6 q-3 3 0 6 q3 3 0 6 M28 15 q-3 3 0 6 q3 3 0 6 q-3 3 0 6" fill="none" stroke="#e08a80" stroke-width="2"/><path d="M15 38 H33" stroke="#7c2c29" stroke-width="3"/>'),
 /* верхний слой */
 o_none:null,
 o_parka:SV('<path d="M13 12 Q24 6 35 12 L44 34 L38 37 L35 25 V43 H13 V25 L10 37 L4 34 Z" fill="#ee8a2c" stroke="#a9571a" stroke-width="2"/><path d="M13 22 H35 M13 30 H35 M13 37 H35" stroke="#a9571a" stroke-width="1.6" opacity=".6"/><path d="M24 14 V43" stroke="#a9571a" stroke-width="2"/><ellipse cx="24" cy="11" rx="11" ry="5.5" fill="#f6f0e6" stroke="#cfc4b2" stroke-width="2"/>'),
 o_membrane:SV('<path d="'+LSL+'" fill="#7b5cf2" stroke="#4a33a8" stroke-width="2"/><path d="M24 7 V41" stroke="#a994ff" stroke-width="2" stroke-dasharray="2 2"/><path d="M30 22 Q34 28 30 31 Q26 28 30 22Z" fill="#fff" opacity=".9"/><path d="M17 20 Q17 24 13 24 Q17 24 17 28 Q17 24 21 24 Q17 24 17 20Z" fill="#fff" opacity=".9"/>'),
 o_softshell:SV('<path d="M14 9 L20 6 H28 L34 9 L44 31 L38 34 L34 21 V41 H14 V21 L10 34 L4 31 Z" fill="#5f9480" stroke="#37665a" stroke-width="2"/><path d="M24 7 V41" stroke="#ff8b3d" stroke-width="2.5"/><rect x="27" y="26" width="6" height="7" rx="1.5" fill="none" stroke="#37665a" stroke-width="1.6"/><path d="M15 15 H21 M15 19 H19" stroke="#fff" stroke-width="1.8" opacity=".5"/>'),
 o_raincoat:SV('<path d="M14 8 L21 6 L24 11 L27 6 L34 8 L43 36 L37 38 L34 24 V44 H14 V24 L11 38 L5 36 Z" fill="#ffd13b" stroke="#b98c10" stroke-width="2"/><circle cx="24" cy="18" r="1.8" fill="#b98c10"/><circle cx="24" cy="26" r="1.8" fill="#b98c10"/><circle cx="24" cy="34" r="1.8" fill="#b98c10"/><path d="M17 14 Q16 28 17 40" fill="none" stroke="#fff" stroke-width="2.2" opacity=".55"/>'),
 o_poncho:SV('<path d="M19 7 Q24 5 29 7 L43 30 Q44 40 42 42 Q24 47 6 42 Q4 40 5 30 Z" fill="#4ba56d" stroke="#2c7048" stroke-width="2"/><path d="M24 10 L12 42 M24 10 L24 45 M24 10 L36 42" fill="none" stroke="#2c7048" stroke-width="1.5" opacity=".5"/><path d="M7 38 Q24 44 41 38" fill="none" stroke="#2c7048" stroke-width="2.5"/>'),
 o_cloak:SV('<path d="M18 7 Q24 5 30 7 L38 16 L44 44 H4 L10 16 Z" fill="#dcc28c" stroke="#a58b55" stroke-width="2"/><path d="M10 28 Q24 33 38 28" fill="none" stroke="#7a5a2a" stroke-width="3"/><path d="M18 18 L14 42 M30 18 L34 42" fill="none" stroke="#a58b55" stroke-width="1.5" opacity=".6"/>'),
 /* аксессуары */
 a_hatW:SV('<path d="M9 30 Q8 11 24 10 Q40 11 39 30Z" fill="#d94545" stroke="#9e2a2a" stroke-width="2"/><rect x="7" y="27" width="34" height="9" rx="3" fill="#9e2a2a"/><path d="M14 28 V35 M20 28 V35 M26 28 V35 M32 28 V35" stroke="#d94545" stroke-width="1.5" opacity=".6"/><circle cx="24" cy="8" r="5" fill="#f6f1e8" stroke="#d8cfbf" stroke-width="1.5"/>'),
 a_mitt:SV('<rect x="15" y="9" width="20" height="26" rx="10" fill="#d94545" stroke="#9e2a2a" stroke-width="2"/><ellipse cx="13" cy="25" rx="4" ry="7" transform="rotate(-20 13 25)" fill="#d94545" stroke="#9e2a2a" stroke-width="2"/><rect x="14" y="33" width="22" height="9" rx="3" fill="#9e2a2a"/>'),
 a_cap:SV('<path d="M8 29 Q8 11 25 11 Q40 11 40 29 Z" fill="#3a74d6" stroke="#244a96" stroke-width="2"/><path d="M25 29 Q38 27 46 34 Q36 37 25 33Z" fill="#244a96"/><circle cx="24" cy="11" r="2" fill="#244a96"/>'),
 a_straw:SV('<ellipse cx="24" cy="31" rx="21" ry="7" fill="#e8c36a" stroke="#a98530" stroke-width="2"/><path d="M13 30 Q13 11 24 11 Q35 11 35 30 Q24 34 13 30Z" fill="#f0d083" stroke="#a98530" stroke-width="2"/><path d="M13.5 25 Q24 29 34.5 25" fill="none" stroke="#c0392b" stroke-width="3.5"/>'),
 a_turban:SV('<path d="M8 29 Q8 11 24 10 Q40 11 40 29 Q32 23 24 25 Q16 23 8 29Z" fill="#f1ede0" stroke="#b9b09a" stroke-width="2"/><path d="M14 15 L26 27 M22 12 L34 25" fill="none" stroke="#b9b09a" stroke-width="1.5" opacity=".7"/><path d="M36 23 Q44 29 40 41 Q36 35 34 29Z" fill="#f1ede0" stroke="#b9b09a" stroke-width="2"/>'),
 a_glass:SV('<rect x="5" y="18" width="16" height="12" rx="5" fill="#1b2433" stroke="#0b1018" stroke-width="2"/><rect x="27" y="18" width="16" height="12" rx="5" fill="#1b2433" stroke="#0b1018" stroke-width="2"/><path d="M21 22 Q24 20 27 22" fill="none" stroke="#0b1018" stroke-width="2"/><path d="M9 22 H12 M31 22 H34" stroke="#8aa3c4" stroke-width="1.8" opacity=".8"/>'),
 a_umb:SV('<path d="M5 25 Q6 7 24 6 Q42 7 43 25 Q38 20 33.5 25 Q29 20 24 25 Q19 20 14.5 25 Q10 20 5 25Z" fill="#e0475b" stroke="#9b2438" stroke-width="2"/><path d="M24 25 V40 Q24 44 20 44" fill="none" stroke="#3b3550" stroke-width="3"/><path d="M24 6 V3" stroke="#3b3550" stroke-width="2.5"/>'),
 /* уровни */
 l_yakutia:SV('<path d="M24 5 V43 M7.5 14.5 L40.5 33.5 M7.5 33.5 L40.5 14.5" stroke="#8fd0ff" stroke-width="3.2" fill="none"/><path d="M19 9 L24 14 L29 9 M19 39 L24 34 L29 39 M9 19 L16 19 L13 25 M39 19 L32 19 L35 25 M9 29 L16 29 L13 23 M39 29 L32 29 L35 23" stroke="#cdeeff" stroke-width="2.2" fill="none"/><circle cx="24" cy="24" r="3.5" fill="#fff"/>'),
 l_vietnam:SV('<path d="M13 28 Q7 28 7 22 Q7 16 14 16 Q16 8 25 9 Q34 10 34 18 Q41 18 41 23 Q41 28 35 28 Z" fill="#dbe9f7" stroke="#9fb8d4" stroke-width="2"/><path d="M14 33 L12 39 M22 33 L20 40 M30 33 L28 39 M38 33 L36 38" stroke="#4fb0ff" stroke-width="3"/>'),
 l_london:SV('<path d="M13 26 Q7 26 7 20 Q7 14 14 14 Q16 7 25 8 Q34 9 34 16 Q41 16 41 21 Q41 26 35 26 Z" fill="#c4c9e4" stroke="#8e94bd" stroke-width="2"/><path d="M8 34 H27 a3.5 3.5 0 1 0 -3.5 -3.5 M12 41 H33 a3.5 3.5 0 1 1 -3.5 3.5" fill="none" stroke="#e1e6ff" stroke-width="2.6"/>'),
 l_sahara:SV('<circle cx="24" cy="24" r="9.5" fill="#ffcf4d" stroke="#e59a1f" stroke-width="2"/><path d="M24 4 V10 M24 38 V44 M4 24 H10 M38 24 H44 M10 10 L14 14 M34 34 L38 38 M38 10 L34 14 M10 38 L14 34" stroke="#ffb02e" stroke-width="3"/>'),
 /* находки */
 art_merinos:SV('<circle cx="24" cy="24" r="16" fill="#f4eee2" stroke="#c9bda5" stroke-width="2"/><path d="M14 24 Q14 14 24 14 Q34 14 34 24 Q34 32 26 32 Q20 32 20 26 Q20 21 25 21" fill="none" stroke="#c9bda5" stroke-width="2.4"/>'),
 art_eptfe:SV('<path d="M24 5 L39 11 V24 Q39 36 24 43 Q9 36 9 24 V11 Z" fill="#5b8fdd" stroke="#2f5aa0" stroke-width="2"/><path d="M24 14 Q31 24 24 31 Q17 24 24 14Z" fill="#fff" opacity=".9"/>'),
 art_softshell:SV('<rect x="8" y="8" width="32" height="32" rx="8" fill="#5f9480" stroke="#37665a" stroke-width="2"/><path d="M13 20 H29 a3 3 0 1 0 -3 -3 M13 29 H33 a3 3 0 1 1 -3 3" fill="none" stroke="#fff" stroke-width="2.6"/>'),
 art_linen:SV('<path d="M24 44 V14" stroke="#b9a97f" stroke-width="2.5"/><path d="M24 14 Q18 12 17 6 Q23 7 24 14 M24 14 Q30 12 31 6 Q25 7 24 14 M24 22 Q17 20 15 14 Q22 15 24 22 M24 22 Q31 20 33 14 Q26 15 24 22 M24 30 Q17 28 15 22 Q22 23 24 30 M24 30 Q31 28 33 22 Q26 23 24 30" fill="#ece1c2" stroke="#b9a97f" stroke-width="1.8"/>'),
 art_pore:SV('<circle cx="21" cy="21" r="12" fill="#cfe3ff" stroke="#4f80b9" stroke-width="3"/><path d="M30 30 L42 42" stroke="#4f80b9" stroke-width="5"/><circle cx="17" cy="19" r="2" fill="#4f80b9"/><circle cx="24" cy="17" r="1.5" fill="#4f80b9"/><circle cx="22" cy="25" r="2" fill="#4f80b9"/>'),
 logo:SV('<circle cx="32" cy="15" r="8" fill="#ffb454" stroke="#e59a1f" stroke-width="1.5"/><path d="M32 2 V5 M44 15 H41 M41 6 L39 8 M23 6 L25 8" stroke="#ffb454" stroke-width="2"/><path d="M13 36 Q6 36 6 30 Q6 24 13 24 Q15 17 23 18 Q31 19 31 26 Q38 26 38 31 Q38 36 32 36 Z" fill="#eaf3ff" stroke="#9fb8d4" stroke-width="2"/><path d="M14 40 L12 45 M22 40 L20 45 M30 40 L28 45" stroke="#4fb0ff" stroke-width="2.6"/>')
};
IC.m_none=IC.none;IC.o_none=IC.none;
IC.m_down=SV('<path d="'+LSL+'" fill="#69a8dc" stroke="#356b9b" stroke-width="2"/><path d="M15 18 H33 M15 25 H33 M15 32 H33 M24 8 V41" stroke="#356b9b" stroke-width="2"/>');
IC.art_silk=SV('<path d="M9 9 Q24 16 39 9 V39 Q24 32 9 39Z" fill="#d99de2" stroke="#91529a" stroke-width="2"/><path d="M18 11 Q26 24 18 37 M28 11 Q20 24 28 37" fill="none" stroke="#f5d4fa" stroke-width="2"/>');
IC.art_graphene=SV('<path d="M14 8 L25 14 V27 L14 33 L3 27 V14Z M36 8 L47 14 V27 L36 33 L25 27 V14Z M25 27 L36 33 V45 H14 V33Z" fill="#31465a" stroke="#6ee0d5" stroke-width="2"/>');

/* ================= ДАННЫЕ ================= */
/* icon — SVG-иконка из IC; персонаж рисуется кодом (см. avatarHTML) */
const ITEMS={
 b_cotton:{icon:IC.b_cotton,name:'Хлопковая футболка',warm:4,breath:9,wick:2,tags:['хлопок'],note:'Мягкая, но намокает и не греет. Как мокрая губка!'},
 b_synth:{icon:IC.b_synth,name:'Термобельё из полиэстера',warm:8,breath:9,wick:9,tags:['синтетика'],note:'Полиэстер отводит влагу от кожи. Базовый слой для активного движения.'},
 b_wool:{icon:IC.b_wool,name:'Шерстяное термобельё',warm:16,breath:8,wick:8,tags:['шерсть'],note:'Подарок от овечки! Греет, даже когда мокрое.'},
 b_linen:{icon:IC.b_linen,name:'Льняная рубашка',warm:2,breath:10,wick:6,sun:1,tags:['лён'],note:'Прохладная и закрывает плечи от солнышка.'},
 m_none:{icon:IC.m_none,name:'Ничего тёплого',warm:0,breath:10},
 m_fleece:{icon:IC.m_fleece,name:'Флисовая кофта',warm:22,breath:8,wick:8,tags:['синтетика'],note:'Мягкая, как плюшевый мишка. Тёплая и лёгкая!'},
 m_down:{icon:IC.m_down,name:'Пуховый утеплитель',warm:38,breath:8,wick:3,tags:['пух'],note:'Пух удерживает воздух и сохраняет тепло. Надевай под защитную куртку.'},
 m_wool:{icon:IC.m_wool,name:'Шерстяной свитер',warm:30,breath:7,wick:7,tags:['шерсть'],note:'Толстый и тёплый, как у бабушки.'},
 o_none:{icon:IC.o_none,name:'Без куртки',warm:0,breath:10,wp:0,wind:0},
 o_parka:{icon:IC.o_parka,name:'Морозостойкая мембранная парка',warm:45,breath:8,wp:3,wind:1,freeze:1,tags:['high-tech'],note:'Утеплённая мембранная защита от ветра и снега. Не дубеет на морозе.'},
 o_membrane:{icon:IC.o_membrane,name:'Лёгкая мембранная куртка',warm:6,breath:9,wp:3,wind:1,freeze:0,tags:['high-tech'],note:'Останавливает дождь и выпускает пар. Для тёплой погоды, не для сильного мороза.'},
 o_softshell:{icon:IC.o_softshell,name:'Куртка Softshell',warm:14,breath:8,wp:1,wind:1,freeze:0,tags:['high-tech'],note:'Демисезонная защита от ветра и мороси. Дышит, но не рассчитана на ливень.'},
 o_raincoat:{icon:IC.o_raincoat,name:'Плёночный дождевик',warm:3,breath:0,wp:3,wind:1,freeze:0,tags:['синтетика'],note:'От дождя спасёт, но внутри будет баня!'},
 o_poncho:{icon:IC.o_poncho,name:'Пончо-накидка',warm:4,breath:8,wp:3,wind:1,freeze:0,tags:['high-tech'],note:'Сверху дождь — стоп, а снизу гуляет ветерок!'},
 o_cloak:{icon:IC.o_cloak,name:'Свободный балахон',warm:2,breath:10,wp:0,wind:0,sun:1,tags:['лён'],note:'Тень и ветерок под тканью. Так ходят в пустыне!'},
 a_hatW:{icon:IC.a_hatW,name:'Тёплая шапка',warm:6},
 a_mitt:{icon:IC.a_mitt,name:'Варежки',warm:4},
 a_cap:{icon:IC.a_cap,name:'Кепка',warm:1,sun:1},
 a_straw:{icon:IC.a_straw,name:'Соломенная шляпа',sun:2},
 a_turban:{icon:IC.a_turban,name:'Лёгкий платок',sun:2},
 a_glass:{icon:IC.a_glass,name:'Солнечные очки',sun:1},
 a_umb:{icon:IC.a_umb,name:'Зонт'}
};
const SUIT={
 yakutia:{base:['b_cotton','b_synth','b_wool'],mid:['m_none','m_fleece','m_down','m_wool'],outer:['o_none','o_parka','o_membrane','o_raincoat'],acc:['a_hatW','a_mitt','a_cap']},
 vietnam:{base:['b_cotton','b_synth','b_wool'],mid:['m_none','m_fleece'],outer:['o_none','o_membrane','o_poncho','o_raincoat','o_parka'],acc:['a_cap']},
 london:{base:['b_cotton','b_synth'],mid:['m_none','m_fleece','m_down','m_wool'],outer:['o_none','o_softshell','o_membrane','o_raincoat'],acc:['a_umb','a_hatW','a_cap']},
 sahara:{base:['b_linen','b_cotton','b_synth'],mid:['m_none'],outer:['o_none','o_cloak','o_membrane'],acc:['a_straw','a_turban','a_cap','a_glass']}
};
const LEVELS=[
 {id:'yakutia',icon:IC.l_yakutia,name:'Якутия',person:'Фотограф',success:'Фотограф выполнил съёмку мамонтов и вернулся в тепле.',sub:'−50 °C! Очень холодно',task:'Подбери фотографу многослойную экипировку для съёмки мамонтов: шерсть, утеплитель и мембранную защиту, которая не дубеет на морозе.',cond:{temp:-50,wind:5,precip:1,humidity:45,uv:1,exertion:0},art:'merinos'},
 {id:'vietnam',icon:IC.l_vietnam,name:'Вьетнам',person:'Учёный',success:'Учёный добрался до храма, сохранив одежду сухой.',sub:'+25 °C и ливень',task:'Снаряди учёного для пути к храму в сезон муссонов. Нужна лёгкая мембрана с высокой паропроницаемостью: плёночный дождевик создаст «эффект бани».',cond:{temp:25,wind:3,precip:3,humidity:90,uv:6,exertion:2},art:'eptfe'},
 {id:'london',icon:IC.l_london,name:'Лондон',person:'Местный житель',success:'Житель завершил прогулку, не замёрзнув на ветру и в мороси.',sub:'+10 °C, ветер и морось',task:'Помоги местному жителю одеться для прогулки по туманному Лондону. Подбери демисезонную одежду и изучи защиту Softshell от ветра и мороси.',cond:{temp:10,wind:8,precip:1,humidity:75,uv:2,exertion:1},art:'softshell'},
 {id:'sahara',icon:IC.l_sahara,name:'Сахара',person:'Путешественник',success:'Путешественник дошёл до оазиса, защитившись от солнца.',sub:'+42 °C, жаркое солнце',task:'Одень путешественника для перехода через Сахару. Выбирай свободные натуральные ткани и защиту от ультрафиолета.',cond:{temp:42,wind:4,precip:0,humidity:15,uv:11,exertion:1},art:'linen'}
];
const ARTS=[
 {id:'merinos',icon:IC.art_merinos,name:'Овечья шерсть',txt:'Греет, даже когда мокрая. Чудо от овечки!',how:'Пройди «Якутию»'},
 {id:'eptfe',icon:IC.art_eptfe,name:'Мембрана',txt:'Дырочки выпускают пар, но не пускают капли. Магия!',how:'Пройди «Вьетнам»'},
 {id:'softshell',icon:IC.art_softshell,name:'Ткань от ветра',txt:'Ветер и морось снаружи, тепло внутри.',how:'Пройди «Лондон»'},
 {id:'linen',icon:IC.art_linen,name:'Лён',txt:'Прохладный, как ветерок. Спасает от жары.',how:'Пройди «Сахару»'},
 {id:'pore',icon:IC.art_pore,name:'Секрет мембраны',txt:'Капля больше дырочки — не влезет! А пар меньше — проскочит!',how:'Проведи опыт в лаборатории'},
 {id:'silk',icon:IC.art_silk,name:'Легендарный материал: шёлк',txt:'Натуральное волокно из кокона шелкопряда. Гладкое и лёгкое: свойства материала определяют его применение.',how:'Собери образцы тканей в двух странах'},
 {id:'graphene',icon:IC.art_graphene,name:'Легендарный материал: графен',txt:'Слой углерода толщиной в один атом. Материал для исследований и технологий будущего.',how:'Собери образцы тканей во всех четырёх странах'}
];
const VERDICT={S:'Идеально! Агент в восторге! 🎉',A:'Здорово! Почти идеально!',B:'Неплохо, но агент жаловался.',C:'Уф! Агент еле-еле дошёл.',D:'Ой-ой! Агента пришлось спасать!'};
function legendaryFor(art){
 const countries=LEVELS.filter(level=>art.includes(level.art)).length;
 return [...(countries>=2?['silk']:[]),...(countries>=4?['graphene']:[])];
}

P=loadProgress();

