/* OpenClaw app shell — brand, dock, conn lights, cmd palette, chat dock, tweaks, routing */
const { useState: uSA, useEffect: uEA, useMemo: uMA, useRef: uRA } = React;

function useTweaks(){
  const [t, setT] = uSA(window.TWEAK_DEFAULTS);
  const set = (k,v) => {
    setT(prev => ({...prev, [k]: v}));
    try { window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[k]:v}}, '*'); } catch(e){}
  };
  return [t, set];
}

function Dock({ active, onGo, pending }){
  return (
    <div className="dock-wrap">
      <div className="dock" role="navigation" aria-label="rooms">
        {DATA.routes.map(r=>{
          const I = Ic[r.icon] || Ic.home;
          const isActive = active === r.id;
          const isApprovals = r.id === 'approvals';
          return (
            <button key={r.id} className={`dock-item ${isActive?'active':''}`} onClick={()=>onGo(r.id)} title={r.name}>
              <span className="gi"><I/></span>
              <span>{r.name}</span>
              {isApprovals && pending > 0 && <span className="badge">{pending}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConnLights({ lamOnline }){
  return (
    <div className="conn" aria-label="connection lights">
      <div className="c"><span className="d"/><span>pi5</span></div>
      <div className="c"><span className={`d ${lamOnline?'':'dn'}`}/><span>lamachina</span></div>
      <div className="c"><span className="d"/><span>agentmail</span></div>
      <div className="c"><span className={`d ${lamOnline?'':'dn'}`}/><span>comfyui</span></div>
      <div className="c"><span className="d am"/><span>github</span></div>
    </div>
  );
}

function Brand(){
  return (
    <div className="brand">
      <div className="logo"><Ic.bigClaw/></div>
      <div>
        <div className="t">OpenClaw</div>
        <div className="sub">personal agent runtime · v0.6</div>
      </div>
    </div>
  );
}

function CmdPalette({ open, onClose, onGo, onOpenSkill }){
  const [q, setQ] = uSA('');
  const [sel, setSel] = uSA(0);
  const inpRef = uRA(null);
  uEA(()=>{ if (open) setTimeout(()=>inpRef.current && inpRef.current.focus(), 30); setQ(''); setSel(0); }, [open]);

  const items = uMA(()=>{
    const a = DATA.routes.map(r=>({ g:'route', n:r.name, id:r.id, kind:'route' }));
    const b = DATA.skills.map(s=>({ g:'skill', n:s.name, id:s.id, kind:'skill' }));
    const c = DATA.drafts.map(d=>({ g:'draft', n:`${d.id} · ${d.text.slice(0,40)}…`, id:'composer', kind:'route' }));
    const d = ['~/memory/output/lead-followup/windrose.md','~/memory/wiki/personas/terrence-walker.md','~/memory/raw/linkedin-scrape-2026-04-21.jsonl']
      .map(f=>({ g:'file', n:f, id:'memory', kind:'route' }));
    return [...a, ...b, ...c, ...d];
  }, []);

  const filtered = q
    ? items.filter(i => i.n.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase())).slice(0, 18)
    : items.slice(0, 18);

  uEA(()=>{
    const fn = e => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown'){ e.preventDefault(); setSel(s=>Math.min(filtered.length-1, s+1)); }
      if (e.key === 'ArrowUp'){ e.preventDefault(); setSel(s=>Math.max(0, s-1)); }
      if (e.key === 'Enter'){
        const it = filtered[sel];
        if (it){
          if (it.kind === 'route') onGo(it.id);
          else { const sk = DATA.skills.find(s=>s.id===it.id); sk && onOpenSkill(sk); }
          onClose();
        }
      }
    };
    window.addEventListener('keydown', fn);
    return ()=>window.removeEventListener('keydown', fn);
  }, [open, filtered, sel]);

  return (
    <div className={`cmd-shade ${open?'open':''}`} onClick={onClose}>
      <div className="cmd" onClick={e=>e.stopPropagation()}>
        <header>
          <Ic.search/>
          <input ref={inpRef} value={q} onChange={e=>{setQ(e.target.value); setSel(0);}} placeholder="search skills, personas, drafts, files…"/>
          <span className="kbd">⌘K</span>
        </header>
        <ul>
          {filtered.map((it,i)=>(
            <li key={it.g+it.n+i} className={i===sel?'sel':''} onMouseEnter={()=>setSel(i)} onClick={()=>{
              if (it.kind === 'route') onGo(it.id);
              else { const sk = DATA.skills.find(s=>s.id===it.id); sk && onOpenSkill(sk); }
              onClose();
            }}>
              <span className="g">{it.g}</span>
              <span className="n">{it.n}</span>
            </li>
          ))}
          {filtered.length===0 && <li className="muted" style={{cursor:'default'}}>no matches</li>}
        </ul>
      </div>
    </div>
  );
}

function ChatDock({ onCmd }){
  const [minimized, setMinimized] = uSA(false);
  const [pos, setPos] = uSA(() => {
    try {
      const saved = localStorage.getItem('openclaw_dock_pos');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return { right: 16, bottom: 80 };
  });
  uEA(()=>{ try { localStorage.setItem('openclaw_dock_pos', JSON.stringify(pos)); } catch(e){} }, [pos]);

  const [val, setVal] = uSA('');
  const [msgs, setMsgs] = uSA([
    { u:'agent', t:'morning. 3 items waiting in the approvals queue. pi temp is holding at 54C. ready when you are.' },
  ]);
  const dragRef = uRA(null);
  const dragging = uRA(false);

  const onHeaderDown = (e) => {
    // only drag from the grip, not from buttons
    if (e.target.closest('.dock-btn')) return;
    e.preventDefault();
    const p = e.touches ? e.touches[0] : e;
    const start = { px: p.clientX, py: p.clientY, right: pos.right, bottom: pos.bottom };
    dragging.current = false;
    const onMove = (ev) => {
      const pp = ev.touches ? ev.touches[0] : ev;
      const dx = pp.clientX - start.px;
      const dy = pp.clientY - start.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragging.current = true;
      const newRight = Math.max(8, Math.min(window.innerWidth - 100, start.right - dx));
      const newBottom = Math.max(8, Math.min(window.innerHeight - 60, start.bottom - dy));
      setPos({ right: newRight, bottom: newBottom });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const send = () => {
    if (!val.trim()) return;
    const v = val.trim();
    setMsgs(m=>[{u:'you', t:v}, ...m]);
    setVal('');
    const match = v.match(/^\/(\w[-\w]*)/);
    if (match){
      const cmd = match[1];
      setTimeout(()=>{
        setMsgs(m=>[{u:'agent', t:`→ routing to ${cmd} skill…`}, ...m]);
        onCmd && onCmd(cmd);
      }, 300);
    } else {
      setTimeout(()=>setMsgs(m=>[{u:'agent', t:'noted. i\'ll fold that into the next cycle.'}, ...m]), 500);
    }
  };

  if (minimized){
    return (
      <button className="chat-dock-tab"
        style={{ right: 0, top: '50%' }}
        onClick={() => setMinimized(false)}
        title="open agent · direct">
        <span className="pulse"/>
        <span className="tab-label">agent</span>
      </button>
    );
  }

  return (
    <div className="chat-dock" ref={dragRef}
         style={{ right: `${pos.right}px`, bottom: `${pos.bottom}px` }}>
      <h4 className="dock-grip" onMouseDown={onHeaderDown} onTouchStart={onHeaderDown}>
        <span className="pulse"/>
        <span>agent · direct</span>
        <span className="drag-hint" title="drag to move">⋮⋮</span>
        <button className="dock-btn" onClick={(e)=>{e.stopPropagation(); setMinimized(true);}} title="minimize to side">→</button>
      </h4>
      <div className="msgs">
        {msgs.map((m,i)=>(
          <div className="m" key={i}><div className="u">{m.u}</div><div>{m.t}</div></div>
        ))}
      </div>
      <div className="input">
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="ask · or /image-gen, /social, /vault…"/>
        <button className="send" onClick={send}><Ic.send s={14}/></button>
      </div>
      <div className="slash-hints">try /image-gen · /social · /proposal-gen · /vault</div>
    </div>
  );
}

function Tweaks({ tweaks, set, enabled, onClose }){
  return (
    <div className={`tweaks ${enabled?'on':''}`}>
      <h4>Tweaks <button onClick={onClose} className="tag" style={{cursor:'pointer'}}>close</button></h4>
      <div className="field">
        <label>hour override ({tweaks.hourOverride<0?'live':tweaks.hourOverride+':00'})</label>
        <input type="range" min="-1" max="23" step="1" value={tweaks.hourOverride} onChange={e=>set('hourOverride', +e.target.value)}/>
      </div>
      <div className="field">
        <label>grain intensity</label>
        <input type="range" min="0" max=".6" step=".02" value={tweaks.grainIntensity} onChange={e=>set('grainIntensity', +e.target.value)}/>
      </div>
      <div className="field">
        <label>active skills ({tweaks.activeSkills})</label>
        <input type="range" min="0" max="8" step="1" value={tweaks.activeSkills} onChange={e=>set('activeSkills', +e.target.value)}/>
      </div>
      <div className="field">
        <label>lamachina (gpu host)</label>
        <div className="opts">
          <button className={tweaks.lamacinaOnline?'on':''} onClick={()=>set('lamacinaOnline', true)}>online</button>
          <button className={!tweaks.lamacinaOnline?'on':''} onClick={()=>set('lamacinaOnline', false)}>down (lamp red)</button>
        </div>
      </div>
      <div className="field">
        <label>cron health</label>
        <div className="opts">
          <button className={tweaks.cronAllOk?'on':''} onClick={()=>set('cronAllOk', true)}>all ok (cat purrs)</button>
          <button className={!tweaks.cronAllOk?'on':''} onClick={()=>set('cronAllOk', false)}>one failed (tail twitches)</button>
        </div>
      </div>
      <div className="field">
        <label>pending approvals ({tweaks.pendingApprovals})</label>
        <input type="range" min="0" max="9" step="1" value={tweaks.pendingApprovals} onChange={e=>set('pendingApprovals', +e.target.value)}/>
      </div>
      <div className="field">
        <label>lofi waveform</label>
        <div className="opts">
          <button className={tweaks.showWaveform?'on':''} onClick={()=>set('showWaveform', true)}>on</button>
          <button className={!tweaks.showWaveform?'on':''} onClick={()=>set('showWaveform', false)}>off</button>
        </div>
      </div>
    </div>
  );
}

/* helper — map a skill id to a route to open */
function skillRoute(id){
  const map = {
    'vault':'memory', 'agentmail':'inbox', 'browser':'sessions',
    'linkedin-slow-browse':'personas', 'github':'github',
    'content-creator':'composer', 'lead-followup':'pipelines',
    'proposal-gen':'proposals', 'ui-architect':'workshop',
    'simplyhr-scraping-tool':'pipelines', 'openclaw-seo-tool':'seo',
    'image-gen':'media', 'video-gen':'media', 'pc-ops':'hardware',
    'ui-workshop':'workshop', 'social-accounts':'personas',
  };
  return map[id] || 'skills';
}

function App(){
  const [tweaks, setTweak] = useTweaks();
  const [route, setRoute] = uSA('home');
  const [tweaksEnabled, setTweaksEnabled] = uSA(false);
  const [cmdOpen, setCmdOpen] = uSA(false);
  const now = useTick(1000);

  // active skills = first N per tweaks
  const activeSkillIds = uMA(()=> DATA.skills.slice(0, tweaks.activeSkills).map(s=>s.id), [tweaks.activeSkills]);

  // keyboard shortcuts
  uEA(()=>{
    const fn = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); setCmdOpen(o=>!o); }
      if (e.key === 'Escape') { setRoute('home'); setCmdOpen(false); }
    };
    window.addEventListener('keydown', fn);
    return ()=>window.removeEventListener('keydown', fn);
  }, []);

  // tweaks bridge
  uEA(()=>{
    const onMsg = e => {
      const d = e.data;
      if (!d || !d.type) return;
      if (d.type === '__activate_edit_mode') setTweaksEnabled(true);
      if (d.type === '__deactivate_edit_mode') setTweaksEnabled(false);
    };
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({type:'__edit_mode_available'}, '*'); } catch(e){}
    return ()=>window.removeEventListener('message', onMsg);
  }, []);

  const openSkill = (skill) => setRoute(skillRoute(skill.id));
  const openRoute = (id) => setRoute(id);

  const SurfComp = window.Surfaces[route];

  return (
    <>
      <Scene
        tweaks={tweaks}
        activeSkillIds={activeSkillIds}
        onOpenSkill={openSkill}
        onOpenRoute={openRoute}
        now={now}
      />
      <Brand/>
      <ConnLights lamOnline={tweaks.lamacinaOnline}/>
      <ChatDock onCmd={(cmd)=>{
        const sk = DATA.skills.find(s=>s.id===cmd);
        if (sk) setRoute(skillRoute(sk.id));
        else setRoute(DATA.routes.find(r=>r.id===cmd) ? cmd : 'home');
      }}/>
      <Dock active={route} onGo={(id)=>setRoute(id)} pending={tweaks.pendingApprovals}/>

      {/* All surfaces pre-rendered but closed by default — so slide-up transitions work */}
      {DATA.routes.filter(r=>r.id!=='home').map(r=>{
        const Comp = window.Surfaces[r.id];
        if (!Comp) return null;
        return <Comp key={r.id} open={route===r.id} onClose={()=>setRoute('home')}/>;
      })}

      <CmdPalette open={cmdOpen} onClose={()=>setCmdOpen(false)} onGo={(id)=>setRoute(id)} onOpenSkill={openSkill}/>
      <Tweaks tweaks={tweaks} set={setTweak} enabled={tweaksEnabled} onClose={()=>setTweaksEnabled(false)}/>

      {/* always-on hint */}
      <div style={{position:'fixed', right:16, top:56, zIndex:48, background:'rgba(0,0,0,.35)', color:'#f5e6d3', padding:'5px 10px', borderRadius:999, fontFamily:"'JetBrains Mono',monospace", fontSize:10, backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,.08)'}}>
        press <b style={{color:'var(--peach)'}}>Ctrl+K</b> for command palette · <b style={{color:'var(--peach)'}}>Esc</b> to return to the room
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
