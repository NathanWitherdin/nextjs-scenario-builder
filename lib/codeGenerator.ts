// src/lib/codeGenerator.ts
import { Scenario, Message } from "./types";

export function generateCourtroomHTML(config: Scenario): string {
  const data = JSON.stringify(config);

  const icons = {
    interruption:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
          <circle cx='12' cy='12' r='10' fill='#9ca3af'/>
          <path d='M7 12h10' stroke='#fff' stroke-width='2' stroke-linecap='round'/>
        </svg>`
      ),
    criticalInitial:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
          <circle cx='12' cy='12' r='10' fill='#f59e0b'/>
          <path d='M12 7v6' stroke='#fff' stroke-width='2' stroke-linecap='round'/>
          <circle cx='12' cy='16' r='1.4' fill='#fff'/>
        </svg>`
      ),
    criticalUrgent:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
          <circle cx='12' cy='12' r='10' fill='#ef4444'/>
          <path d='M12 7v6' stroke='#fff' stroke-width='2' stroke-linecap='round'/>
          <circle cx='12' cy='16' r='1.4' fill='#fff'/>
        </svg>`
      ),
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Courtroom Scenario</title>
<style>
  :root { color-scheme: light; }
  html, body { margin:0; padding:0; height:100%; background:#111; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial; }
  .wrapper { position:relative; width:100%; height:100vh; overflow:hidden; background:#111; max-width:1200px; margin:0 auto; }
  .background { position:absolute; inset:0; background-size:cover; background-position:center; }
  .scrim { position:absolute; inset:0; background: linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,.35)); }

  /* Timer (responsive) */
  .timerBox { position:absolute; top:clamp(8px, 3vh, 24px); left:50%; transform:translateX(-50%); display:flex; gap:10px; align-items:center; background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.15); padding:8px 12px; border-radius:12px; color:#fff; }
  .timer { font-family: ui-monospace, Menlo, Monaco, Consolas, "Courier New", monospace; font-size:clamp(18px, 2.6vw, 28px); font-weight:800; letter-spacing:1px; background:#000; padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,.15); box-shadow: inset 0 0 0 2px rgba(255,255,255,.03); }
  .timerControls { display:flex; gap:6px; }
  .tbtn { border:0; border-radius:8px; padding:6px 10px; font-weight:700; cursor:pointer; background:#f1f1f1; color:#111; font-size:clamp(12px, 1.6vw, 14px); }
  .tbtn.p { background:#22c55e; color:#fff; }
  .tbtn.w { background:#eab308; color:#111; }
  .tbtn.d { background:#ef4444; color:#fff; }

  /* Centered task panel — responsive around a 420×350 baseline */
  .taskPanel {
    position:absolute;
    top:55%;
    left:50%;
    transform:translate(-50%,-50%);
    width:clamp(420px, 48vw, 560px);
    height:clamp(300px, 42vh, 400px);
    display:flex; flex-direction:column; gap:10px;
    background:rgba(255,255,255,.92);
    border:1px solid rgba(0,0,0,.06);
    border-radius:12px; padding:12px;
    box-shadow:0 10px 30px rgba(0,0,0,.18);
    z-index:3;
  }
  .taskHeader { font-weight:800; margin-bottom:4px; color:#111; }
  .taskList { overflow:auto; }
  .taskCard { background:#fff; border:1px solid rgba(0,0,0,.06); border-left:4px solid #22c55e; border-radius:10px; padding:10px 12px; box-shadow:0 6px 18px rgba(0,0,0,.12); display:flex; flex-direction:column; gap:8px; margin-bottom:10px; }
  .taskText { color:#111; font-weight:600; font-size:clamp(13px, 1.6vw, 14px); }
  .answerInput { width:100%; box-sizing:border-box; border-radius:8px; border:1px solid #ddd; padding:8px 10px; font-size:clamp(12px,1.6vw,14px); resize:vertical; }
  .taskActions { display:flex; gap:8px; justify-content:flex-end; }
  .btn { border:0; border-radius:8px; padding:8px 12px; font-weight:600; font-size:clamp(12px,1.6vw,13px); cursor:pointer; }
  .skipBtn { background:#f1f1f1; color:#111; }
  .resolveBtn { background:#22c55e; color:#fff; }
  .doneTag { align-self:flex-start; font-size:12px; padding:2px 8px; border-radius:999px; background:#e2fee7; color:#166534; border:1px solid #b7f7c2; }

  /* Dock (responsive icons) */
  .dock { position:absolute; right:clamp(10px, 2vw, 16px); bottom:clamp(10px, 2vw, 16px); display:flex; flex-direction:column-reverse; gap:10px; }
  .notif { position:relative; }
  .iconBtn { width:clamp(44px, 6vh, 56px); height:clamp(44px, 6vh, 56px); padding:0; border:0; border-radius:50%; background:rgba(255,255,255,.92); box-shadow:0 6px 18px rgba(0,0,0,.25); display:grid; place-items:center; cursor:pointer; }
  .iconImg { width:clamp(24px, 3.2vh, 30px); height:clamp(24px, 3.2vh, 30px); object-fit:contain; }
  .bubble { position:absolute; right:0; bottom:calc(clamp(44px, 6vh, 56px) + 8px); max-width:min(320px, 92vw); background:#fff; color:#111; border-radius:12px; padding:12px 12px 10px; box-shadow:0 14px 40px rgba(0,0,0,.28); border:1px solid rgba(0,0,0,.06); display:none; z-index:2; }
  .notif.open .bubble { display:block; }
  .bubbleHeader { display:flex; align-items:baseline; gap:8px; font-weight:700; margin-bottom:6px; }
  .countdown { font-size:clamp(11px,1.4vw,12px); opacity:.8; }
  .bubbleText { font-size:clamp(12px,1.6vw,14px); line-height:1.3; margin:6px 0 10px 0; color:#222; }
  .actions { display:flex; gap:8px; justify-content:flex-end; }
  .dismiss { background:#f1f1f1; color:#111; }
  .resolve { background:#0ea5e9; color:#fff; }
  .exit    { background:#ef4444; color:#fff; }
  .normal { border-left:4px solid #9ca3af; }
  .critical { border-left:4px solid #f59e0b; }
  .urgent   { border-left:4px solid #ef4444; }

  /* Court / End (responsive widths) */
  .court { position:absolute; inset:0; display:none; align-items:center; justify-content:center; z-index:5; color:#fff; text-align:center; }
  .court.visible { display:flex; }
  .courtBg { position:absolute; inset:0; background-size:cover; background-position:center; filter:brightness(.65); }
  .courtCard { position:relative; max-width:min(760px, 92vw); background:rgba(0,0,0,.5); border:1px solid rgba(255,255,255,.2); border-radius:16px; padding:24px; box-shadow:0 18px 60px rgba(0,0,0,.45); }
  .courtIcon { font-size:44px; margin-bottom:10px; }
  .courtTitle { font-size:clamp(18px, 2.4vw, 24px); font-weight:800; margin-bottom:8px; }
  .courtText { font-size:clamp(14px, 1.8vw, 16px); margin-bottom:12px; opacity:.95; }
  .courtActions { display:flex; gap:10px; justify-content:center; }
  .returnBtn { background:#22c55e; color:#fff; }
  .endBtn { background:#ef4444; color:#fff; }

  .end { position:absolute; inset:0; display:none; align-items:center; justify-content:center; z-index:6; background:rgba(0,0,0,.86); color:#fff; text-align:left; padding:20px; }
  .end.visible { display:flex; }
  .endCard { width:min(820px, 96vw); background:rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.2); border-radius:16px; padding:20px; }
  .endTitle { font-size:clamp(18px, 2.2vw, 22px); font-weight:800; margin-bottom:10px; }
  .endList { line-height:1.8; }
</style>
</head>
<body>
<div id="app" class="wrapper">
  <div class="background" id="bg"></div>
  <div class="scrim"></div>

  <div class="timerBox">
    <div class="timer" id="timer">00:00</div>
    <div class="timerControls">
      <button class="tbtn p" id="startBtn">Start</button>
      <button class="tbtn w" id="stopBtn">Stop</button>
      <button class="tbtn d" id="resetBtn">Reset</button>
    </div>
  </div>

  <section class="taskPanel" aria-label="Tasks">
    <div class="taskHeader">Tasks</div>
    <div class="taskList" id="taskList"></div>
  </section>

  <div class="dock" id="dock"></div>

  <div class="court" id="court" role="dialog" aria-modal="true">
    <div class="courtBg" id="courtBg"></div>
    <div class="courtCard">
      <div class="courtIcon">⚖️</div>
      <div class="courtTitle" id="courtTitle">Courtroom Verdict</div>
      <div class="courtText" id="courtText"></div>
      <div class="courtActions" id="courtActions"></div>
    </div>
  </div>

  <div class="end" id="end">
    <div class="endCard">
      <div class="endTitle">Session Summary</div>
      <div class="endList" id="endList"></div>
    </div>
  </div>
</div>

<script>
(function(){
  const CONFIG = ${data};
  const ICONS = ${JSON.stringify(icons)};
  const DEFAULT_COURT_BG = "/backgrounds/courtroom-bg.png";

  const NEXT_ITEM_INTERVAL_MS = 30000;
  const STAGE_MS = 120000;

  const qs = (s, el=document)=>el.querySelector(s);
  const elBG = qs('#bg');
  const elTimer = qs('#timer');
  const startBtn = qs('#startBtn');
  const stopBtn = qs('#stopBtn');
  const resetBtn = qs('#resetBtn');
  const elTaskList = qs('#taskList');
  const elDock = qs('#dock');
  const elCourt = qs('#court');
  const elCourtBg = qs('#courtBg');
  const elCourtTitle = qs('#courtTitle');
  const elCourtText = qs('#courtText');
  const elCourtActions = qs('#courtActions');
  const elEnd = qs('#end');
  const elEndList = qs('#endList');

  if (CONFIG.backgroundUrl) {
    elBG.style.backgroundImage = 'url(\"' + (CONFIG.backgroundUrlDataUri || CONFIG.backgroundUrl).replace(/"/g,'\\"') + '\")';
  }

  // Timer
  const totalSeconds = Math.max(1, Math.round((CONFIG.timerMinutes || 5) * 60));
  let secondsLeft = totalSeconds;
  let running = false;
  let timerInt = null;

  function renderTimer(){
    const mm = String(Math.floor(secondsLeft/60)).padStart(2,'0');
    const ss = String(secondsLeft%60).padStart(2,'0');
    elTimer.textContent = mm + ':' + ss;
  }
  renderTimer();

  startBtn.addEventListener('click', ()=>{ if(!running){ running=true; timerInt=setInterval(()=>{ if(secondsLeft>0){ secondsLeft--; renderTimer(); } },1000);} });
  stopBtn.addEventListener('click', ()=>{ running=false; if(timerInt){ clearInterval(timerInt); timerInt=null; } });
  resetBtn.addEventListener('click', ()=>{ running=false; if(timerInt){ clearInterval(timerInt); timerInt=null; } secondsLeft = totalSeconds; renderTimer(); });

  function court(msg){
    const outcome = (msg && msg.courtOutcome) || null;
    elCourtTitle.textContent = outcome?.title || "Courtroom Verdict";
    elCourtText.textContent  = outcome?.text  || CONFIG.punishmentText || "Case lost in court.";
    elCourtBg.style.backgroundImage = 'url(\"' + (outcome?.backgroundUrl || DEFAULT_COURT_BG).replace(/"/g,'\\"') + '\")';
    elCourtActions.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = outcome?.canReturn ? 'returnBtn' : 'endBtn';
    btn.textContent = outcome?.canReturn ? 'Return to game' : 'End';
    btn.addEventListener('click', ()=> {
      if(outcome?.canReturn){ elCourt.classList.remove('visible'); }
      else { elCourt.classList.remove('visible'); elEnd.classList.add('visible'); renderEnd(); }
    });
    elCourtActions.appendChild(btn);
    elCourt.classList.add('visible');
    stopBtn.click();
  }

  // Messages/Pool
  const tasks = (CONFIG.messages||[]).filter(m=>m.category==='task').map(m=>({ id:uid(), msg:m, draft:'', status:'pending' }));
  const pool = (CONFIG.messages||[]).filter(m=>m.category!=='task').map(m=>({
    id:uid(), key:keyFor(m), msg:m, isOpen:false, stage:'initial', stageDeadlineAt:null, inTask:false, taskDraft:''
  }));
  const dock = [];
  const delayed = new Map();

  const stats = { taskAttempted:0, taskCompleted:0, criticalNotified:0, criticalCompleted:0, criticalFailed:0, minorFails:0, majorFails:0 };

  function renderTasks(){
    elTaskList.innerHTML = '';
    tasks.forEach(t=>{
      const card = h('div','taskCard');
      card.appendChild(h('div','taskText', t.msg.text||''));
      if (t.status==='done'){
        card.appendChild(h('span','doneTag','Resolved'));
      } else {
        const input = h('textarea','answerInput'); input.rows=4; input.placeholder='Type your answer…'; input.value=t.draft;
        input.addEventListener('input', e=>{ t.draft=e.target.value; });
        const actions = h('div','taskActions');

        if ((CONFIG.rules||{}).allowSkipNormals !== false){
          const skip = h('button','btn skipBtn','Skip');
          skip.addEventListener('click', ()=>{ const idx = tasks.findIndex(x=>x.id===t.id); if (idx>=0){ tasks.splice(idx,1); renderTasks(); }});
          actions.appendChild(skip);
        }

        const resolve = h('button','btn resolveBtn','Resolve');
        resolve.addEventListener('click', ()=>{
          stats.taskAttempted++;
          const exp = normalize(t.msg.answer||'');
          if (exp && normalize(t.draft)===exp){ t.status='done'; stats.taskCompleted++; const idx=tasks.findIndex(x=>x.id===t.id); if(idx>=0) tasks.splice(idx,1); renderTasks(); }
        });
        actions.appendChild(resolve);
        card.appendChild(input);
        card.appendChild(actions);
      }
      elTaskList.appendChild(card);
    });
  }
  renderTasks();

  function renderDock(){
    elDock.innerHTML = '';
    dock.forEach(d=>{
      const root = h('div','notif' + (d.isOpen?' open':''));
      const btn = h('button','iconBtn');
      const img = h('img','iconImg'); img.alt='';
      img.src = d.msg.category==='critical'
        ? (d.stage==='urgent' ? ICONS.criticalUrgent : ICONS.criticalInitial)
        : ICONS.interruption;
      btn.appendChild(img);
      btn.addEventListener('click',()=>{ d.isOpen=!d.isOpen; renderDock(); });
      root.appendChild(btn);

      const bubble = h('div','bubble ' + (d.msg.category==='critical'?'critical ':'normal ') + (d.stage==='urgent'?'urgent ':''));
      const header = h('div','bubbleHeader');
      const title = h('strong','', d.msg.category==='critical' ? ('Critical ('+(d.msg.severity||'')+')') : 'Interruption');
      header.appendChild(title);
      if (d.msg.category==='critical' && d.stageDeadlineAt && !d.inTask) {
        const cd = h('span','countdown',' T-'+ Math.max(0, Math.ceil((d.stageDeadlineAt - Date.now())/1000)) +'s ' + (d.stage==='initial'?'to urgent':'to court'));
        header.appendChild(cd);
      }
      bubble.appendChild(header);
      bubble.appendChild(h('div','bubbleText', d.msg.text||''));

      const actions = h('div','actions');

      if (d.msg.category!=='critical'){
        const dismiss = h('button','btn dismiss','Dismiss');
        dismiss.addEventListener('click', ()=>{ const idx = dock.findIndex(x=>x.id===d.id); if (idx>=0){ dock.splice(idx,1); renderDock(); }});
        actions.appendChild(dismiss);
      } else if (!d.inTask) {
        const resolve = h('button','btn resolve','Resolve');
        resolve.addEventListener('click', ()=>{ d.inTask = true; d.isOpen = true; renderDock(); });
        const dismiss = h('button','btn dismiss','Dismiss');
        dismiss.addEventListener('click', ()=>{
          const idx = dock.findIndex(x=>x.id===d.id);
          if (idx>=0){
            const stage = dock[idx].stage;
            const msg = dock[idx].msg;
            const keyU = dock[idx].key + '|urgent';
            dock.splice(idx,1);
            if (stage==='initial'){
              if (!delayed.has(keyU)) delayed.set(keyU, { kind:'urgent', at: Date.now()+STAGE_MS, msg });
            } else {
              court(msg);
            }
            renderDock();
          }
        });
        actions.appendChild(resolve);
        actions.appendChild(dismiss);
      } else {
        const input = h('textarea','answerInput'); input.rows=5; input.placeholder='Type your answer…'; input.value=d.taskDraft||'';
        input.addEventListener('input', e=>{ d.taskDraft = e.target.value; });
        const complete = h('button','btn resolve','Complete');
        complete.addEventListener('click', ()=>{
          const exp = normalize(d.msg.answer||'');
          if (exp && normalize(d.taskDraft)===exp){
            const idx = dock.findIndex(x=>x.id===d.id);
            if (idx>=0){
              delayed.delete(d.key + '|urgent');
              delayed.delete(d.key + '|court');
              dock.splice(idx,1);
              stats.criticalCompleted++;
              renderDock();
            }
          }
        });
        const exit = h('button','btn exit','Exit');
        exit.addEventListener('click', ()=>{ court(d.msg); });
        actions.appendChild(complete);
        actions.appendChild(exit);
        bubble.appendChild(input);
      }

      bubble.appendChild(actions);
      root.appendChild(bubble);
      elDock.appendChild(root);
    });
  }

  // Engine
  let lastItemAt = 0;
  const engineInt = setInterval(()=>{
    const t = Date.now();

    // Stage transitions
    for (let i=dock.length-1;i>=0;i--){
      const it = dock[i];
      if (it.msg.category==='critical' && !it.inTask && it.stageDeadlineAt && t >= it.stageDeadlineAt) {
        if (it.stage === 'initial') {
          it.stage = 'urgent';
          it.stageDeadlineAt = t + STAGE_MS;
        } else if (it.stage === 'urgent') {
          court(it.msg); return;
        }
      }
    }

    // Release delayed
    if (delayed.size){
      const remove = [];
      delayed.forEach((v,k)=>{
        if (t >= v.at){
          if (v.kind === 'urgent'){
            const present = dock.some(x=>x.key===keyFor(v.msg) && x.stage==='urgent');
            if (!present){
              dock.push({ id: uid(), key: keyFor(v.msg), msg: v.msg, isOpen:false, stage:'urgent', stageDeadlineAt: t + STAGE_MS, inTask:false, taskDraft:'' });
              stats.criticalNotified++;
            }
          } else { court(v.msg); return; }
          remove.push(k);
        }
      });
      remove.forEach(k=>delayed.delete(k));
    }

    // Schedule next
    if (t - lastItemAt >= NEXT_ITEM_INTERVAL_MS && pool.length > 0) {
      const next = pool.shift();
      if (next.msg.category==='critical'){
        next.stage = 'initial';
        next.stageDeadlineAt = t + STAGE_MS;
        stats.criticalNotified++;
      }
      dock.push(next);
      lastItemAt = t;
    }

    renderDock();
  }, 400);

  // End screen
  function renderEnd(){
    elEndList.innerHTML = '';
    const line = (text)=>{ const d=document.createElement('div'); d.textContent=text; return d; };
    elEndList.appendChild(line('Tasks — Attempted: ' + stats.taskAttempted + ', Completed: ' + stats.taskCompleted));
    elEndList.appendChild(line('Criticals — Notified: ' + stats.criticalNotified + ', Completed: ' + stats.criticalCompleted + ', Failed: ' + stats.criticalFailed));
    elEndList.appendChild(line('Fails — Minor: ' + stats.minorFails + ', Major: ' + stats.majorFails));
  }

  // Utils
  function h(tag, cls, text){ const el=document.createElement(tag); if(cls) el.className=cls; if(text!=null) el.textContent=text; return el; }
  function normalize(s){ return String(s||'').trim().toLowerCase(); }
  function uid(){ return Math.random().toString(36).slice(2,10); }
  function keyFor(m){ return (m.id || m.text) + '|' + (m.severity || ''); }
})();
</script>
</body>
</html>`;
}
