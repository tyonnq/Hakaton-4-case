'use strict';


function render(){
 ({intro:scrIntro,map:scrMap,lab:scrLab,labgame:scrLabGame,level:scrLevel,result:scrResult,enc:scrEnc,guide:scrGuide}[S.screen]||scrMap)();
}

app.addEventListener('click',event=>{
 const button=event.target.closest('#back');
 if(button&&app.contains(button))go(button.dataset.to);
});
window.addEventListener('error',e=>{const a=document.getElementById('app');
 if(a&&!a.innerHTML.trim())a.innerHTML='<div class="panel">⚠️ Ошибка: '+(e.message||'неизвестно')+'</div>';});

render();
