'use strict';

/* ================= ЦВЕТ (поворот оттенка для «раскрась одежду») ================= */
function rot(hex,deg){
 if(!deg)return hex;
 const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/2;
 let h=0,s=0;
 if(d){s=d/(1-Math.abs(2*l-1));
  if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
  h*=60;if(h<0)h+=360;}
 h=(h+deg)%360;
 const C=(1-Math.abs(2*l-1))*s,X=C*(1-Math.abs((h/60)%2-1)),m=l-C/2;
 const rgb=h<60?[C,X,0]:h<120?[X,C,0]:h<180?[0,C,X]:h<240?[0,X,C]:h<300?[X,0,C]:[C,0,X];
 return '#'+rgb.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
}
const colorCache=new Map();
let cachedHue=null;
function cc(hex){
 const hue=P.hue||0;
 if(hue!==cachedHue){colorCache.clear();cachedHue=hue;}
 if(!colorCache.has(hex))colorCache.set(hex,rot(hex,hue));
 return colorCache.get(hex);
}

/* ================= ПЕРСОНАЖ (SVG, слои одежды) ================= */
/* Координаты: голова (100,60), плечи y=100, талия y≈170, ноги до y=268 */
const AR={L:{sx:64,sy:112,hx:46,hy:186},R:{sx:136,sy:112,hx:154,hy:186}};
const pt=(s,t)=>{const a=AR[s];return[a.sx+(a.hx-a.sx)*t,a.sy+(a.hy-a.sy)*t];};
const ln=(x1,y1,x2,y2,col,w,cap)=>'<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="'+(cap||'round')+'"/>';
function limb(s,f,w,col,dk){const[a,b]=pt(s,0),[c,d]=pt(s,f);return ln(a,b,c,d,dk,w+3)+ln(a,b,c,d,col,w);}
function cuff(s,f,w,col){const[a,b]=pt(s,f-.12),[c,d]=pt(s,f);return ln(a,b,c,d,col,w);}
const both=fn=>fn('L')+fn('R');
const LS=w=>Math.min(.9,(72-w/2)/76);           /* длина длинного рукава: кисть остаётся видна */
const T=(col,dk,e,bot,r)=>'<rect x="'+(64-e)+'" y="100" width="'+(72+2*e)+'" height="'+(bot-100)+'" rx="'+(r||14)+'" fill="'+col+'" stroke="'+dk+'" stroke-width="2"/>';
const star=(x,y,r,col)=>'<path d="M'+x+' '+(y-r)+' Q'+x+' '+y+' '+(x+r)+' '+y+' Q'+x+' '+y+' '+x+' '+(y+r)+' Q'+x+' '+y+' '+(x-r)+' '+y+' Q'+x+' '+y+' '+x+' '+(y-r)+'Z" fill="'+col+'"/>';
const skinOf=e=>e==='cold'?['#d5e6f4','#b3cadf']:e==='hot'?['#ffc2a0','#f09f7c']:['#f6c8a0','#e2a679'];

/* --- нижний слой --- */
function layerBase(k,SK){
 if(!k)return T('#dfe8f4','#b2c0d4',-3,166,12)+'<path d="M86 100 Q100 120 114 100 Z" fill="'+SK+'"/><path d="M86 100 Q100 120 114 100" fill="none" stroke="#b2c0d4" stroke-width="2"/>';
 if(k==='b_cotton'){const c='#f4f6fb',d='#aab6c9';
  return T(c,d,0,172,13)+both(s=>limb(s,.36,21,c,d))
   +'<path d="M85 100 Q100 118 115 100 Z" fill="'+SK+'"/><path d="M85 100 Q100 118 115 100" fill="none" stroke="'+cc('#6aa7e8')+'" stroke-width="3.5"/>'
   +'<circle cx="100" cy="144" r="9" fill="'+cc('#ffb454')+'"/><circle cx="97" cy="141" r="3" fill="#fff" opacity=".6"/>';}
 if(k==='b_synth'){const c=cc('#4f80b9'),d=cc('#2f5681'),l=cc('#8fbbe8');
  return T(c,d,-1,174,13)+both(s=>limb(s,LS(17),17,c,d))
   +'<rect x="89" y="91" width="22" height="15" rx="6" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +[120,140,160].map(y=>'<line x1="67" y1="'+y+'" x2="133" y2="'+y+'" stroke="'+l+'" stroke-width="3" opacity=".55"/>').join('')
   +both(s=>cuff(s,LS(17),14,d));}
 if(k==='b_wool'){const c=cc('#dcb47e'),d=cc('#a67c46');let kn='';
  for(let y=110;y<=166;y+=9)for(let x=72;x<=124;x+=9)kn+='<path d="M'+x+' '+y+' l3.5 4 l3.5 -4" fill="none" stroke="'+d+'" stroke-width="1.4" opacity=".6"/>';
  return T(c,d,-1,174,13)+both(s=>limb(s,LS(17),17,c,d))+kn
   +'<rect x="89" y="90" width="22" height="16" rx="6" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +both(s=>cuff(s,LS(17),14,d));}
 if(k==='b_linen'){const c=cc('#ece1c2'),d=cc('#b9a97f');
  return T(c,d,3,182,12)+both(s=>limb(s,.74,22,c,d))
   +'<path d="M86 100 L100 132 L114 100 Z" fill="'+SK+'"/>'
   +'<path d="M84 98 L100 128 L94 100 Z" fill="'+c+'" stroke="'+d+'" stroke-width="1.5"/><path d="M116 98 L100 128 L106 100 Z" fill="'+c+'" stroke="'+d+'" stroke-width="1.5"/>'
   +[144,158,172].map(y=>'<circle cx="100" cy="'+y+'" r="2" fill="'+d+'"/>').join('')
   +'<line x1="100" y1="130" x2="100" y2="182" stroke="'+d+'" stroke-width="1" opacity=".6"/>';}
 return '';
}
/* --- тёплый слой --- */
function layerMid(k){
 if(k==='m_down'){const c=cc('#69a8dc'),d=cc('#356b9b');
  return T(c,d,8,188,16)+both(s=>limb(s,LS(27),27,c,d))
   +[118,138,158,178].map(y=>'<path d="M56 '+y+' Q100 '+(y+5)+' 144 '+y+'" fill="none" stroke="'+d+'" stroke-width="2"/>').join('')
   +'<line x1="100" y1="100" x2="100" y2="188" stroke="'+d+'" stroke-width="3"/>';}
 if(k==='m_fleece'){const c=cc('#3fae9c'),d=cc('#237b6c'),a=cc('#ffd166');
  return T(c,d,5,178,14)+both(s=>limb(s,LS(22),22,c,d))+both(s=>cuff(s,LS(22),19,d))
   +'<rect x="88" y="90" width="24" height="16" rx="6" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +'<line x1="100" y1="94" x2="100" y2="178" stroke="'+a+'" stroke-width="3" stroke-dasharray="2 2"/>'
   +'<path d="M72 150 Q80 162 90 166 M128 150 Q120 162 110 166" fill="none" stroke="'+d+'" stroke-width="2"/>';}
 if(k==='m_wool'){const c=cc('#bd4b46'),d=cc('#7c2c29'),l=cc('#d77d73');let cab='';
  [84,100,116].forEach(x=>{let p='M'+x+' 108';for(let i=0;i<6;i++)p+=' q'+(i%2?-5:5)+' 5 0 10';
   cab+='<path d="'+p+'" fill="none" stroke="'+l+'" stroke-width="2.2" opacity=".75"/>';});
  return T(c,d,6,184,14)+cab
   +'<rect x="58" y="172" width="84" height="12" rx="5" fill="'+d+'"/>'
   +[66,74,82,90,98,106,114,122,130].map(x=>'<line x1="'+x+'" y1="174" x2="'+x+'" y2="182" stroke="'+l+'" stroke-width="1" opacity=".5"/>').join('')
   +both(s=>limb(s,LS(23),23,c,d))+both(s=>cuff(s,LS(23),20,d))
   +'<rect x="86" y="88" width="28" height="18" rx="7" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +[94,99,104].map(y=>'<line x1="88" y1="'+y+'" x2="112" y2="'+y+'" stroke="'+d+'" stroke-width="1" opacity=".6"/>').join('');}
 return '';
}
/* --- верхний слой --- */
function layerOuter(k){
 if(k==='o_parka'){const c=cc('#ee8a2c'),d=cc('#a9571a'),f='#f6f0e6';let fur='';
  for(let a=0;a<360;a+=30)fur+='<circle cx="'+(100+33*Math.cos(a*Math.PI/180)).toFixed(1)+'" cy="'+(100+13*Math.sin(a*Math.PI/180)).toFixed(1)+'" r="5" fill="'+f+'"/>';
  return '<ellipse cx="100" cy="94" rx="42" ry="26" fill="'+cc('#cc6f1f')+'" stroke="'+d+'" stroke-width="2"/>'
   +T(c,d,14,214,18)
   +[128,152,176,198].map(y=>'<path d="M52 '+y+' Q100 '+(y+6)+' 148 '+y+'" fill="none" stroke="'+d+'" stroke-width="2" opacity=".55"/>').join('')
   +both(s=>limb(s,LS(31),31,c,d))+both(s=>cuff(s,LS(31),25,d))
   +'<line x1="100" y1="112" x2="100" y2="214" stroke="'+d+'" stroke-width="3"/>'
   +'<path d="M66 170 L84 176 M134 170 L116 176" fill="none" stroke="'+d+'" stroke-width="2.5" stroke-linecap="round"/>'
   +fur+'<ellipse cx="100" cy="100" rx="33" ry="13" fill="'+f+'" stroke="#cfc4b2" stroke-width="2"/>';}
 if(k==='o_membrane'){const c=cc('#7b5cf2'),d=cc('#4a33a8'),l=cc('#a994ff');
  return '<ellipse cx="100" cy="94" rx="34" ry="19" fill="'+l+'" stroke="'+d+'" stroke-width="2"/>'
   +T(c,d,8,190,16)+both(s=>limb(s,LS(26),26,c,d))+both(s=>cuff(s,LS(26),22,d))
   +'<rect x="86" y="90" width="28" height="16" rx="7" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +'<line x1="100" y1="106" x2="100" y2="190" stroke="'+l+'" stroke-width="2.5" stroke-dasharray="3 3"/>'
   +star(78,128,7,'#fff')+star(122,150,6,'#fff')+star(84,168,5,'#fff')
   +'<path d="M0 -9 Q8 2 0 8 Q-8 2 0 -9Z" transform="translate(118,126)" fill="#fff" opacity=".9"/>'
   +'<path d="M68 110 L73 110 L68 176 L63 176Z" fill="#fff" opacity=".18"/>';}
 if(k==='o_softshell'){const c=cc('#5f9480'),d=cc('#37665a'),a=cc('#ff8b3d');
  return T(c,d,6,182,14)
   +'<path d="M58 106 Q58 100 70 100 L130 100 Q142 100 142 106 L142 118 Q100 126 58 118Z" fill="'+d+'" opacity=".45"/>'
   +both(s=>limb(s,LS(24),24,c,d))+both(s=>cuff(s,LS(24),20,d))
   +'<rect x="88" y="90" width="24" height="16" rx="6" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +'<line x1="100" y1="96" x2="100" y2="182" stroke="'+a+'" stroke-width="3"/><circle cx="100" cy="112" r="3.5" fill="'+a+'"/>'
   +'<rect x="110" y="132" width="18" height="18" rx="3" fill="none" stroke="'+d+'" stroke-width="2"/><path d="M110 138 H128" stroke="'+d+'" stroke-width="2"/>'
   +'<path d="M70 150 H84 M70 156 H80" stroke="#fff" stroke-width="2.5" opacity=".4" stroke-linecap="round"/>';}
 if(k==='o_raincoat'){const c=cc('#ffd13b'),d=cc('#b98c10');
  return '<ellipse cx="100" cy="94" rx="36" ry="20" fill="'+cc('#e8b923')+'" stroke="'+d+'" stroke-width="2"/>'
   +T(c,d,9,208,16)+both(s=>limb(s,LS(27),27,c,d))+both(s=>cuff(s,LS(27),23,d))
   +'<path d="M82 98 L100 122 L92 100Z" fill="'+c+'" stroke="'+d+'" stroke-width="2"/><path d="M118 98 L100 122 L108 100Z" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +[130,152,174,196].map(y=>'<circle cx="100" cy="'+y+'" r="3.2" fill="'+d+'"/>').join('')
   +'<path d="M62 108 Q58 160 62 200 L72 200 Q68 160 72 108Z" fill="#fff" opacity=".32"/>';}
 if(k==='o_poncho'){const c=cc('#4ba56d'),d=cc('#2c7048');
  return '<ellipse cx="100" cy="94" rx="34" ry="19" fill="'+cc('#3a8a58')+'" stroke="'+d+'" stroke-width="2"/>'
   +'<path d="M86 98 Q100 92 114 98 L154 122 Q166 160 160 204 Q100 218 40 204 Q34 160 46 122 Z" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +[52,72,92,108,128,148].map(x=>'<path d="M100 104 L'+x+' 208" fill="none" stroke="'+d+'" stroke-width="1.5" opacity=".35"/>').join('')
   +'<path d="M44 196 Q100 212 158 196" fill="none" stroke="'+d+'" stroke-width="4"/>'
   +'<rect x="88" y="90" width="24" height="13" rx="5" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>';}
 if(k==='o_cloak'){const c=cc('#dcc28c'),d=cc('#a58b55');
  return '<ellipse cx="100" cy="94" rx="34" ry="19" fill="'+cc('#c9ad74')+'" stroke="'+d+'" stroke-width="2"/>'
   +'<path d="M84 98 Q100 94 116 98 L150 122 Q162 190 170 238 Q100 252 30 238 Q38 190 50 122 Z" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +both(s=>limb(s,LS(34),34,c,d))
   +'<path d="M70 130 L58 232 M130 130 L142 232 M100 170 L100 244" fill="none" stroke="'+d+'" stroke-width="1.5" opacity=".45"/>'
   +'<path d="M62 160 Q100 172 138 160" fill="none" stroke="'+cc('#7a5a2a')+'" stroke-width="6"/>'
   +'<path d="M96 168 Q94 184 98 190 M104 168 Q106 184 102 190" fill="none" stroke="'+cc('#7a5a2a')+'" stroke-width="3"/>'
   +'<path d="M86 100 Q100 116 114 100" fill="none" stroke="'+d+'" stroke-width="2"/>';}
 return '';
}

/* --- голова и лицо --- */
function faceSVG(e){
 const dk='#2a2433',br='#6b5a6e';
 const eye=x=>'<g class="blink"><ellipse cx="'+x+'" cy="62" rx="4.3" ry="5.4" fill="'+dk+'"/><circle cx="'+(x+1.5)+'" cy="60" r="1.7" fill="#fff"/></g>';
 const nose='<path d="M98 69 Q100 71.5 102 69" fill="none" stroke="#c98b63" stroke-width="1.6" stroke-linecap="round"/>';
 const cheeks=(col,o,r)=>'<circle cx="80" cy="73" r="'+r+'" fill="'+col+'" opacity="'+o+'"/><circle cx="120" cy="73" r="'+r+'" fill="'+col+'" opacity="'+o+'"/>';
 if(e==='cold')return '<path d="M82 57 L92 62 L82 67 M118 57 L108 62 L118 67" fill="none" stroke="'+dk+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
  +'<path d="M83 50 L93 52 M117 50 L107 52" stroke="'+br+'" stroke-width="2.2" stroke-linecap="round"/>'
  +nose+'<circle cx="100" cy="68" r="3.2" fill="#ff8a8a"/>'+cheeks('#7fb9ee',.55,5.5)
  +'<rect x="90" y="75" width="20" height="9" rx="3" fill="#fff" stroke="#8a2b3a" stroke-width="2"/><path d="M95 75 V84 M100 75 V84 M105 75 V84" stroke="#8a2b3a" stroke-width="1.2"/>';
 if(e==='hot')return '<ellipse cx="88" cy="63" rx="4.3" ry="2.6" fill="'+dk+'"/><ellipse cx="112" cy="63" rx="4.3" ry="2.6" fill="'+dk+'"/>'
  +'<path d="M81 52 L94 56 M119 52 L106 56" stroke="'+br+'" stroke-width="2.2" stroke-linecap="round"/>'
  +nose+cheeks('#ff5f5f',.55,6.5)
  +'<path d="M91 74 Q100 84 109 74 Z" fill="#8a2b3a"/><ellipse cx="100" cy="80.5" rx="4.5" ry="3.2" fill="#ff8aa0"/>'
  +'<g class="sweat"><path d="M70 40 Q75 48 70 53 Q65 48 70 40Z" fill="#7cc8ff"/></g>'
  +'<g class="sweat" style="animation-delay:.7s"><path d="M130 48 Q135 56 130 61 Q125 56 130 48Z" fill="#7cc8ff"/></g>';
 if(e==='sad')return eye(88)+eye(112)
  +'<path d="M81 54 L94 49 M119 54 L106 49" stroke="'+br+'" stroke-width="2.4" stroke-linecap="round"/>'
  +nose+cheeks('#ff9aa8',.3,5)
  +'<path d="M91 79 Q100 71 109 79" fill="none" stroke="#8a2b3a" stroke-width="2.8" stroke-linecap="round"/>'
  +'<path d="M84 69 Q87 74 84 77 Q81 74 84 69Z" fill="#7cc8ff"/>';
 return eye(88)+eye(112)
  +'<path d="M82 53 Q88 50 94 53 M106 53 Q112 50 118 53" fill="none" stroke="'+br+'" stroke-width="2.2" stroke-linecap="round"/>'
  +nose+cheeks('#ff9aa8',.5,5.5)
  +'<path d="M90 73 Q100 87 110 73 Z" fill="#8a2b3a"/><path d="M94 80 Q100 84 106 80 Q100 77 94 80Z" fill="#ff8aa0"/>';
}
function headSVG(e,girl,SK,SKD){
 const hair=girl?'#6b3a2a':'#4d3322';
 let o='<circle cx="71" cy="63" r="5.5" fill="'+SK+'" stroke="'+SKD+'" stroke-width="1.5"/><circle cx="129" cy="63" r="5.5" fill="'+SK+'" stroke="'+SKD+'" stroke-width="1.5"/>'
  +'<ellipse cx="100" cy="60" rx="29" ry="31" fill="'+SK+'" stroke="'+SKD+'" stroke-width="2"/>';
 if(girl)o+='<path d="M70 60 Q64 26 100 24 Q136 26 130 60 Q128 44 116 40 Q104 48 88 40 Q74 46 70 60Z" fill="'+hair+'"/>'
  +'<path d="M70 58 Q64 80 72 100 Q79 82 76 60Z" fill="'+hair+'"/><path d="M130 58 Q136 80 128 100 Q121 82 124 60Z" fill="'+hair+'"/>'
  +'<circle cx="76" cy="44" r="5" fill="'+cc('#ff6fa5')+'"/><circle cx="76" cy="44" r="2" fill="#fff" opacity=".7"/>';
 else o+='<path d="M70 58 Q64 24 100 22 Q136 24 130 58 Q126 42 110 40 Q98 46 86 40 Q74 44 70 58Z" fill="'+hair+'"/><path d="M92 26 Q102 12 112 26Z" fill="'+hair+'"/>';
 return o+faceSVG(e);
}
function snowflake(x,y,r,delay){
 return '<g class="snow" style="animation-delay:'+delay+'s"><path d="M'+(x-r)+' '+y+' H'+(x+r)+' M'+(x-r/2)+' '+(y-r*.87)+' L'+(x+r/2)+' '+(y+r*.87)+' M'+(x-r/2)+' '+(y+r*.87)+' L'+(x+r/2)+' '+(y-r*.87)+'" stroke="#bfe6ff" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>';
}

/* --- аксессуары --- */
const ACC_ORDER=['a_turban','a_hatW','a_cap','a_straw','a_glass','a_mitt','a_umb'];
function accSVG(k,SK){
 if(k==='a_hatW'){const c=cc('#d94545'),d=cc('#9e2a2a');
  return '<path d="M67 50 Q66 18 100 17 Q134 18 133 50 Z" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +'<rect x="64" y="42" width="72" height="16" rx="7" fill="'+d+'"/>'
   +[72,82,92,102,112,122].map(x=>'<line x1="'+x+'" y1="44" x2="'+x+'" y2="56" stroke="'+c+'" stroke-width="1.5" opacity=".5"/>').join('')
   +'<circle cx="100" cy="14" r="9" fill="#f6f1e8" stroke="#d8cfbf" stroke-width="1.5"/>';}
 if(k==='a_cap'){const c=cc('#3a74d6'),d=cc('#244a96');
  return '<path d="M69 48 Q70 22 100 21 Q130 22 131 48 Z" fill="'+c+'" stroke="'+d+'" stroke-width="2"/>'
   +'<path d="M66 46 Q100 40 134 46 Q136 54 100 57 Q64 54 66 46Z" fill="'+d+'"/><circle cx="100" cy="21" r="3" fill="'+d+'"/>';}
 if(k==='a_straw')return '<ellipse cx="100" cy="42" rx="64" ry="13" fill="#e8c36a" stroke="#a98530" stroke-width="2"/>'
   +'<path d="M72 42 Q72 14 100 14 Q128 14 128 42 Q100 50 72 42Z" fill="#f0d083" stroke="#a98530" stroke-width="2"/>'
   +'<path d="M72.5 34 Q100 42 127.5 34" fill="none" stroke="'+cc('#c0392b')+'" stroke-width="6"/>';
 if(k==='a_turban')return '<path d="M67 52 Q68 20 100 20 Q132 20 133 52 Q116 40 100 43 Q84 40 67 52Z" fill="#f1ede0" stroke="#b9b09a" stroke-width="2"/>'
   +'<path d="M76 30 L100 46 M92 24 L120 44" fill="none" stroke="#b9b09a" stroke-width="1.5" opacity=".7"/>'
   +'<path d="M128 46 Q142 58 136 86 Q128 72 124 56Z" fill="#f1ede0" stroke="#b9b09a" stroke-width="2"/>';
 if(k==='a_glass')return '<rect x="76" y="54" width="22" height="16" rx="7" fill="#1b2433" stroke="#0b1018" stroke-width="2"/><rect x="102" y="54" width="22" height="16" rx="7" fill="#1b2433" stroke="#0b1018" stroke-width="2"/>'
   +'<path d="M98 60 Q100 58 102 60 M76 58 L70 56 M124 58 L130 56" fill="none" stroke="#0b1018" stroke-width="2"/><path d="M81 58 H86 M107 58 H112" stroke="#8aa3c4" stroke-width="2" opacity=".8" stroke-linecap="round"/>';
 if(k==='a_mitt'){const c=cc('#d94545'),d=cc('#9e2a2a');
  return both(s=>{const a=AR[s],sg=s==='L'?-1:1;
   return '<ellipse cx="'+(a.hx-sg*8)+'" cy="'+(a.hy+3)+'" rx="5" ry="7" fill="'+c+'" stroke="'+d+'" stroke-width="1.5" transform="rotate('+(sg*20)+' '+(a.hx-sg*8)+' '+(a.hy+3)+')"/>'
    +'<ellipse cx="'+a.hx+'" cy="'+(a.hy+6)+'" rx="10.5" ry="12" fill="'+c+'" stroke="'+d+'" stroke-width="1.8"/>'
    +'<rect x="'+(a.hx-10)+'" y="'+(a.hy-7)+'" width="20" height="7" rx="3" fill="'+d+'"/>';});}
 if(k==='a_umb'){const c=cc('#e0475b'),d=cc('#9b2438');
  return '<line x1="154" y1="196" x2="118" y2="20" stroke="#3b3550" stroke-width="3.5" stroke-linecap="round"/>'
   +'<path d="M48 24 Q50 -30 118 -34 Q186 -30 188 24 Q170 10 153 24 Q136 10 118 24 Q100 10 83 24 Q66 10 48 24Z" fill="'+c+'" stroke="'+d+'" stroke-width="2.5" stroke-linejoin="round"/>'
   +[83,100,118,136,153].map(x=>'<path d="M118 -34 Q'+((x+118)/2)+' -6 '+x+' 24" fill="none" stroke="'+d+'" stroke-width="1.5" opacity=".6"/>').join('')
   +'<circle cx="118" cy="-36" r="3" fill="#3b3550"/><circle cx="154" cy="194" r="9" fill="'+SK+'"/>';}
 return '';
}

/* --- сборка аватара --- */
function fabricPatternSVG(){
 const shapes={stripes:'<path d="M0 4 H16 M0 12 H16" stroke="#fff" stroke-width="3"/>',
  dots:'<circle cx="4" cy="4" r="2.5" fill="#fff"/><circle cx="12" cy="12" r="2.5" fill="#fff"/>',
  stars:star(8,8,5,'#fff')};
 return shapes[P.print]?'<defs><pattern id="fabricPattern" width="16" height="16" patternUnits="userSpaceOnUse">'+shapes[P.print]+'</pattern></defs>':'';
}
function avatarHTML(sel,emotion,anim){
 emotion=emotion||'happy';
 const girl=P.gender==='girl',sk=skinOf(emotion),SK=sk[0],SKD=sk[1],last=anim?(S.lastSlot||null):null;
 const pattern=fabricPatternSVG();
 const G=(cls,key,inner)=>inner?'<g class="gl gl-'+cls+(last===key?' drop':'')+'">'+inner
  +(pattern&&cls!=='acc'?'<rect x="72" y="116" width="56" height="48" rx="8" fill="url(#fabricPattern)" opacity=".45"/>':'')+'</g>':'';
 let s='<div class="avatar em-'+emotion+(S.peek?' peek':'')+'"><svg class="fig-svg" viewBox="0 0 200 312" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Агент">'
  +pattern+'<ellipse cx="100" cy="305" rx="58" ry="7" fill="rgba(0,0,0,.3)"/><g transform="translate(0,36)">';
 if(girl)s+='<path d="M68 48 Q60 100 72 124 L128 124 Q140 100 132 48 Z" fill="#6b3a2a"/>';
 s+='<rect x="72" y="166" width="27" height="86" rx="10" fill="#3b4a6c" stroke="#27324d" stroke-width="2"/><rect x="101" y="166" width="27" height="86" rx="10" fill="#3b4a6c" stroke="#27324d" stroke-width="2"/>'
  +'<rect x="66" y="244" width="34" height="24" rx="9" fill="#6a4630" stroke="#3a2418" stroke-width="2"/><rect x="100" y="244" width="34" height="24" rx="9" fill="#6a4630" stroke="#3a2418" stroke-width="2"/>'
  +'<rect x="66" y="261" width="34" height="7" rx="3.5" fill="#2c1c12"/><rect x="100" y="261" width="34" height="7" rx="3.5" fill="#2c1c12"/>'
  +'<rect x="91" y="88" width="18" height="18" rx="6" fill="'+SKD+'"/>'+both(side=>limb(side,1,15,SK,SKD));
 s+=G('base','base',layerBase(sel.base,SK))+G('mid','mid',layerMid(sel.mid))+G('outer','outer',layerOuter(sel.outer));
 s+=both(side=>{const a=AR[side];return '<circle cx="'+a.hx+'" cy="'+(a.hy+4)+'" r="8.5" fill="'+SK+'" stroke="'+SKD+'" stroke-width="1.5"/>';});
 s+=headSVG(emotion,girl,SK,SKD);
 ACC_ORDER.forEach(k=>{if(sel.acc.includes(k))s+=G('acc','acc:'+k,accSVG(k,SK));});
 s+='</g>';
 if(emotion==='cold')s+=snowflake(26,70,7,0)+snowflake(176,56,6,.5)+snowflake(172,150,8,1);
 return s+'</svg></div>';
}
/* плашки «что надето» под персонажем */
function slotsHTML(sel){
 return '<div class="slots">'+[['base','Нижний'],['mid','Тёплый'],['outer','Верхний']].map(x=>{
  const it=sel[x[0]]?ITEMS[sel[x[0]]]:null;
  return '<div class="slot">'+(it&&it.icon?it.icon:IC.none)+x[1]+'</div>';}).join('')+'</div>';
}

