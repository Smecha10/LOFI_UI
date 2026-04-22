/* OpenClaw surfaces — full-page panels that slide up over the room */
window.Surfaces = {};

function SurfWrap({ open, onClose, title, sub, children }){
  return (
    <div className={`surface ${open?'open':''}`}>
      <header>
        <div>
          <h2>{title}</h2>
          {sub && <div className="sub">{sub}</div>}
        </div>
        <button className="back" onClick={onClose}>← Back to room</button>
      </header>
      <div className="body">{children}</div>
    </div>
  );
}

/* -- Personas -- */
window.Surfaces.personas = function PersonasSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Personas" sub="identity · accounts · rotation">
      <div className="card" style={{marginBottom:14}}>
        <h3>Active Persona</h3>
        <div className="row" style={{marginTop:8}}>
          <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#e89658,#b5564f)',display:'grid',placeItems:'center',color:'#fff',fontSize:20,fontWeight:700}}>T</div>
          <div>
            <div style={{fontWeight:700,fontSize:16}}>{DATA.persona}</div>
            <div className="muted" style={{fontSize:12}}>primary · 4 platforms linked</div>
          </div>
        </div>
      </div>
      <h3 style={{margin:'0 0 10px',fontFamily:"'DM Serif Display',serif"}}>Social Accounts</h3>
      <div className="grid g2">
        {DATA.accounts_active.map(a=>(
          <div className="card" key={a.k}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span style={{fontWeight:700,textTransform:'capitalize'}}>{a.k}</span>
              <span className={`tag ${a.live?'g':'r'}`}>{a.live?'live':'off'}</span>
            </div>
            <div className="mono" style={{fontSize:11,marginTop:4,color:'var(--mute)'}}>{a.h}</div>
            <div className="mono" style={{fontSize:10,marginTop:2,color:'var(--mute)'}}>{a.email}</div>
            <div style={{fontSize:11,marginTop:4}}>last: {a.last}</div>
          </div>
        ))}
      </div>
      <h3 style={{margin:'18px 0 10px',fontFamily:"'DM Serif Display',serif"}}>Blog Accounts</h3>
      <div className="grid g3">
        {DATA.accounts_blog.map(a=>(
          <div className="card" key={a.k}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span style={{fontWeight:600,textTransform:'capitalize'}}>{a.k}</span>
              <span className={`tag ${a.live?'g':'r'}`}>{a.live?'live':'off'}</span>
            </div>
            <div className="mono" style={{fontSize:10,marginTop:3,color:'var(--mute)'}}>{a.h}</div>
            <div style={{fontSize:11,marginTop:4}}>last: {a.last}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{marginTop:14}}>
        <h3>Skipped Platforms</h3>
        <div className="row" style={{gap:6,marginTop:6}}>
          {DATA.accounts_skipped.map(s=>(<span className="tag r" key={s}>{s}</span>))}
        </div>
        <div className="muted" style={{fontSize:11,marginTop:6}}>these platforms are excluded by persona rules</div>
      </div>
    </SurfWrap>
  );
};

/* -- Composer -- */
window.Surfaces.composer = function ComposerSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Composer" sub="drafts · queue · scheduled posts">
      <div className="grid g2" style={{marginBottom:14}}>
        <div className="card" style={{background:'linear-gradient(135deg, #fff9ef, #ffe9cf)'}}>
          <div style={{fontSize:28,fontWeight:700,fontFamily:"'DM Serif Display',serif"}}>{DATA.drafts.filter(d=>d.status==='pending').length}</div>
          <div className="muted" style={{fontSize:12}}>pending approval</div>
        </div>
        <div className="card" style={{background:'linear-gradient(135deg, #fff9ef, #d9f2df)'}}>
          <div style={{fontSize:28,fontWeight:700,fontFamily:"'DM Serif Display',serif"}}>{DATA.drafts.filter(d=>d.status==='posted').length}</div>
          <div className="muted" style={{fontSize:12}}>posted this week</div>
        </div>
      </div>
      <table className="std">
        <thead><tr><th>id</th><th>platform</th><th>status</th><th>time</th><th>preview</th></tr></thead>
        <tbody>
          {DATA.drafts.map(d=>(
            <tr key={d.id}>
              <td className="mono" style={{fontSize:11}}>{d.id}</td>
              <td><span className="tag">{d.platform}</span></td>
              <td><span className={`tag ${d.status==='posted'?'g':d.status==='rejected'?'r':'a'}`}>{d.status}</span></td>
              <td className="mono" style={{fontSize:11}}>{d.ts}</td>
              <td style={{maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12}}>{d.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SurfWrap>
  );
};

/* -- Blog Studio -- */
window.Surfaces.blog = function BlogSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Blog Studio" sub="long-form · cross-post · analytics">
      <div className="grid g3" style={{marginBottom:14}}>
        {DATA.accounts_blog.filter(a=>a.live).map(a=>(
          <div className="card" key={a.k}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span style={{fontWeight:700,textTransform:'capitalize'}}>{a.k}</span>
              <span className="tag g">live</span>
            </div>
            <div className="mono" style={{fontSize:10,marginTop:4,color:'var(--mute)'}}>{a.h}</div>
            <div style={{fontSize:11,marginTop:6}}>last post: {a.last}</div>
            <button className="btn ghost" style={{marginTop:8,width:'100%',fontSize:11}}>new draft →</button>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Recent Blog Drafts</h3>
        {DATA.drafts.filter(d=>['devto','medium','substack','wordpress'].includes(d.platform)).map(d=>(
          <div key={d.id} style={{padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,.06)',fontSize:12}}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span style={{fontWeight:600}}>{d.text.slice(0,50)}…</span>
              <span className={`tag ${d.status==='posted'?'g':d.status==='rejected'?'r':'a'}`}>{d.status}</span>
            </div>
            <div className="mono muted" style={{fontSize:10,marginTop:2}}>{d.platform} · {d.ts}</div>
          </div>
        ))}
      </div>
    </SurfWrap>
  );
};

/* -- Media -- */
window.Surfaces.media = function MediaSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Media" sub="image-gen · video-gen · flux · wan">
      <div className="grid g2" style={{marginBottom:14}}>
        <div className="card">
          <h3>Image-Gen <span className="tag g">ready</span></h3>
          <div className="muted" style={{fontSize:12,marginTop:4}}>flux-schnell · 1024²</div>
          <div className="mono" style={{fontSize:11,marginTop:8}}>model: flux-dev/schnell</div>
          <div className="mono" style={{fontSize:11}}>host: lamachina</div>
          <div className="mono" style={{fontSize:11}}>vram: 14GB free</div>
          <button className="btn amber" style={{marginTop:10,width:'100%'}}>generate image</button>
        </div>
        <div className="card">
          <h3>Video-Gen <span className="tag a">locked</span></h3>
          <div className="muted" style={{fontSize:12,marginTop:4}}>wan-2.2 · idle</div>
          <div className="mono" style={{fontSize:11,marginTop:8}}>model: wan-2.2-t2v</div>
          <div className="mono" style={{fontSize:11}}>host: lamachina</div>
          <div className="mono" style={{fontSize:11}}>requires: img-gen idle</div>
          <button className="btn ghost" style={{marginTop:10,width:'100%'}}>queue video</button>
        </div>
      </div>
      <div className="card">
        <h3>Runtime Rule</h3>
        <div style={{padding:'8px 10px',background:'rgba(0,0,0,.04)',borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace",marginTop:6}}>
          ⚠ image-gen and video-gen must never run concurrently (16GB VRAM)
        </div>
      </div>
    </SurfWrap>
  );
};

/* -- Inbox -- */
window.Surfaces.inbox = function InboxSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Inbox" sub="agentmail · 6 aliases · auto-capture">
      <div className="card" style={{marginBottom:14,background:'linear-gradient(135deg,#fff9ef,#dfeaff)'}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <h3 style={{margin:0}}>AgentMail</h3>
          <span className="tag g">polling</span>
        </div>
        <div className="mono" style={{fontSize:11,marginTop:6,color:'var(--mute)'}}>6 aliases active · twalker+[service]@agentmail.to</div>
      </div>
      <table className="std">
        <thead><tr><th>from</th><th>subject</th><th>alias</th><th>time</th><th>code</th></tr></thead>
        <tbody>
          {DATA.inbox_threads.map((t,i)=>(
            <tr key={i} style={{fontWeight:t.unread?600:400}}>
              <td style={{fontSize:11}}>{t.from}</td>
              <td style={{fontSize:12,maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.sub}</td>
              <td><span className="tag">{t.alias}</span></td>
              <td className="mono" style={{fontSize:11}}>{t.when}</td>
              <td>{t.code ? <span className="tag b" style={{fontFamily:"'JetBrains Mono',monospace"}}>{t.code}</span> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SurfWrap>
  );
};

/* -- Memory -- */
window.Surfaces.memory = function MemorySurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Memory" sub="~/memory · raw → wiki → output">
      <div className="grid g3">
        {Object.entries(DATA.memory_tree).map(([dir, files])=>(
          <div className="card" key={dir}>
            <h3 style={{textTransform:'uppercase',letterSpacing:'.06em'}}>~/{dir}</h3>
            <div className="tree" style={{marginTop:6}}>
              <ul style={{paddingLeft:0}}>
                {files.map(f=>(<li key={f} style={{fontSize:12,padding:'3px 0',cursor:'pointer'}}>{f}</li>))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{marginTop:14}}>
        <h3>RAG Index</h3>
        <div className="row" style={{gap:20,marginTop:8}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,fontFamily:"'DM Serif Display',serif"}}>2.4m</div>
            <div className="muted" style={{fontSize:11}}>vectors indexed</div>
          </div>
          <div>
            <div style={{fontSize:22,fontWeight:700,fontFamily:"'DM Serif Display',serif"}}>3</div>
            <div className="muted" style={{fontSize:11}}>memory tiers</div>
          </div>
          <div>
            <div style={{fontSize:22,fontWeight:700,fontFamily:"'DM Serif Display',serif"}}>0</div>
            <div className="muted" style={{fontSize:11}}>orphan drafts</div>
          </div>
        </div>
      </div>
    </SurfWrap>
  );
};

/* -- Skills -- */
window.Surfaces.skills = function SkillsSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Skills" sub="15 installed · modular agent capabilities">
      <div className="grid g3">
        {DATA.skills.map(s=>{
          const I = Ic[s.icon];
          return (
            <div className="card" key={s.id} style={{position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,right:0,width:60,height:60,background:`radial-gradient(circle at top right, ${s.tint}22, transparent)`,borderRadius:'0 12px 0 0'}}/>
              <div className="row" style={{marginBottom:6}}>
                <div style={{width:28,height:28,borderRadius:8,background:s.tint,display:'grid',placeItems:'center',color:'#fff'}}>
                  {I && <I/>}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                  <div className="mono" style={{fontSize:10,color:'var(--mute)'}}>{s.id}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:'var(--ink-2)'}}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </SurfWrap>
  );
};

/* -- Health -- */
window.Surfaces.health = function HealthSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Health" sub="cron · uptime · alerts">
      <div className="grid g2" style={{marginBottom:14}}>
        <div className="card" style={{background:'linear-gradient(135deg,#d9f2df,#fff9ef)'}}>
          <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--mute)',marginBottom:4}}>system uptime</div>
          <div style={{fontSize:28,fontWeight:700,fontFamily:"'DM Serif Display',serif",color:'#2f6b3e'}}>8d 14h</div>
        </div>
        <div className="card" style={{background:'linear-gradient(135deg,#dfeaff,#fff9ef)'}}>
          <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--mute)',marginBottom:4}}>cron jobs</div>
          <div style={{fontSize:28,fontWeight:700,fontFamily:"'DM Serif Display',serif",color:'#3b4a7a'}}>{DATA.cron.length} ok</div>
        </div>
      </div>
      <h3 style={{fontFamily:"'DM Serif Display',serif",margin:'0 0 10px'}}>Cron Schedule</h3>
      <table className="std">
        <thead><tr><th>job</th><th>schedule</th><th>last</th><th>output</th></tr></thead>
        <tbody>
          {DATA.cron.map((c,i)=>(
            <tr key={i}>
              <td className="mono" style={{fontWeight:600,fontSize:11}}>{c.name}</td>
              <td className="mono" style={{fontSize:11}}>{c.at}</td>
              <td><span className={`tag ${c.last==='ok'?'g':'r'}`}>{c.last}</span></td>
              <td style={{fontSize:12,color:'var(--ink-2)',maxWidth:300}}>{c.out}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{fontFamily:"'DM Serif Display',serif",margin:'18px 0 10px'}}>Runtime Rules</h3>
      <div className="card">
        {DATA.rules.map((r,i)=>(
          <div key={i} style={{padding:'6px 0',borderBottom:i<DATA.rules.length-1?'1px solid rgba(0,0,0,.06)':'0',fontSize:12,display:'flex',gap:8,alignItems:'baseline'}}>
            <span style={{color:'var(--amber)',fontWeight:700}}>§{i+1}</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
      <h3 style={{fontFamily:"'DM Serif Display',serif",margin:'18px 0 10px'}}>Action Log</h3>
      <div className="card" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:1.6}}>
        {DATA.actions_log.map((a,i)=>(<div key={i} style={{opacity:1-i*0.06}}>{a}</div>))}
      </div>
    </SurfWrap>
  );
};

/* -- Pipelines -- */
window.Surfaces.pipelines = function PipelinesSurface({ open, onClose }){
  const stages = ['new','researched','contacted','replied','meeting','proposal','closed'];
  return (
    <SurfWrap open={open} onClose={onClose} title="Pipelines" sub="leads · CRM · conversion funnel">
      <div className="kanban">
        {stages.map(st=>(
          <div className="col" key={st}>
            <h4><span>{st}</span><span className="tag">{(DATA.leads[st]||[]).length}</span></h4>
            {(DATA.leads[st]||[]).map((l,i)=>(
              <div className="kcard" key={i}>
                <div className="n">{l.n}</div>
                <div className="m">{l.m}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </SurfWrap>
  );
};

/* -- Proposals -- */
window.Surfaces.proposals = function ProposalsSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Proposals" sub="packages · pricing · client assignments">
      <div className="grid g2">
        {DATA.proposals.map((p,i)=>(
          <div className="card" key={i} style={{position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,right:0,width:80,height:80,background:p.status==='won'?'radial-gradient(circle at top right,rgba(111,224,149,.2),transparent)':p.status==='sent'?'radial-gradient(circle at top right,rgba(232,150,88,.2),transparent)':'none'}}/>
            <div className="row" style={{justifyContent:'space-between',marginBottom:6}}>
              <h3 style={{margin:0}}>{p.t}</h3>
              <span className={`tag ${p.status==='won'?'g':p.status==='sent'?'a':''}`}>{p.status}</span>
            </div>
            <div style={{fontSize:24,fontWeight:700,fontFamily:"'DM Serif Display',serif",color:'var(--amber)'}}>{p.p}</div>
            <div className="muted" style={{fontSize:12,marginTop:4}}>{p.d}</div>
            <div style={{marginTop:8}}>
              {p.clients.map(c=>(<span className="tag b" key={c} style={{marginRight:4}}>{c}</span>))}
            </div>
          </div>
        ))}
      </div>
    </SurfWrap>
  );
};

/* -- SEO -- */
window.Surfaces.seo = function SEOSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="SEO" sub="keywords · intent · opportunity scoring">
      <table className="std">
        <thead><tr><th>keyword</th><th>volume</th><th>difficulty</th><th>intent</th><th>opportunity</th></tr></thead>
        <tbody>
          {DATA.seo_kw.map((k,i)=>(
            <tr key={i}>
              <td style={{fontWeight:600}}>{k.k}</td>
              <td className="mono" style={{fontSize:12}}>{k.vol}</td>
              <td>
                <div className="bar" style={{width:80}}>
                  <span style={{width:`${k.diff}%`,background:k.diff<20?'#6fe095':k.diff<30?'var(--amber)':'#ff6b6b'}}/>
                </div>
              </td>
              <td><span className={`tag ${k.intent==='buy'?'g':k.intent==='eval'?'a':'b'}`}>{k.intent}</span></td>
              <td style={{fontSize:14,fontWeight:700,color:k.diff<20?'#2f6b3e':'var(--ink)'}}>{k.diff<20?'★★★':k.diff<30?'★★':'★'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SurfWrap>
  );
};

/* -- Workshop -- */
window.Surfaces.workshop = function WorkshopSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Workshop" sub="vite servers · live previews · ui prototypes">
      <div className="grid g2">
        {DATA.vite.map(v=>(
          <div className="card" key={v.n}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <h3 style={{margin:0}}>{v.n}</h3>
              <span className={`tag ${v.up?'g':'r'}`}>{v.up?'up':'down'}</span>
            </div>
            <div className="mono" style={{fontSize:11,marginTop:6,color:'var(--mute)'}}>:{v.port}</div>
            <div className="mono" style={{fontSize:10,marginTop:2,color:'var(--mute)'}}>{v.url}</div>
            <button className={`btn ${v.up?'amber':'ghost'}`} style={{marginTop:10,width:'100%',fontSize:11}}>{v.up?'open preview ↗':'restart server'}</button>
          </div>
        ))}
      </div>
    </SurfWrap>
  );
};

/* -- GitHub -- */
window.Surfaces.github = function GitHubSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="GitHub" sub="repos · PRs · activity">
      <div className="card" style={{marginBottom:14}}>
        <h3>Open Pull Requests</h3>
        <div className="mono" style={{fontSize:11,marginTop:4,color:'var(--mute)'}}>gh pr list --state open (4 results)</div>
        <div style={{marginTop:10}}>
          {['#184 fix: rag index on stale persona','#182 feat: wan-2.2 integration','#180 chore: cleanup /tmp/wan-tmp weekly','#179 docs: update skill manifest'].map((pr,i)=>(
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,.06)',fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontWeight:600}}>{pr}</span>
              <span className="tag a">open</span>
            </div>
          ))}
        </div>
      </div>
    </SurfWrap>
  );
};

/* -- Hardware -- */
window.Surfaces.hardware = function HardwareSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Hardware" sub="pi5 · oled · gpu host · tailscale">
      <div className="grid g2">
        <div className="card" style={{background:'linear-gradient(135deg,#d9f2df,#fff9ef)'}}>
          <h3>Raspberry Pi 5</h3>
          <div className="mono" style={{fontSize:11,marginTop:6,lineHeight:1.8}}>
            <div>{DATA.hardware.pi}</div>
            <div>OLED: {DATA.hardware.oled}</div>
            <div>Tailscale: {DATA.hardware.tailscale_ip}</div>
          </div>
        </div>
        <div className="card" style={{background:'linear-gradient(135deg,#dfeaff,#fff9ef)'}}>
          <h3>GPU Host</h3>
          <div className="mono" style={{fontSize:11,marginTop:6,lineHeight:1.8}}>
            <div>{DATA.hardware.gpu_host}</div>
            <div>VRAM: 16GB</div>
            <div>Status: online</div>
          </div>
        </div>
      </div>
    </SurfWrap>
  );
};

/* -- Sessions -- */
window.Surfaces.sessions = function SessionsSurface({ open, onClose }){
  return (
    <SurfWrap open={open} onClose={onClose} title="Sessions" sub="browser · vnc · active tabs">
      <div className="card" style={{marginBottom:14}}>
        <h3>Chromium · VNC :5901</h3>
        <div className="muted" style={{fontSize:12,marginTop:4}}>headless browser for agent web automation</div>
        <div style={{marginTop:10,padding:16,background:'#0a0e18',borderRadius:8,color:'#7bd7a4',fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:1.6}}>
          <div style={{color:'#aaf5c5'}}>$ chromium --headless --no-sandbox</div>
          <div style={{opacity:.6}}>DevTools listening on ws://127.0.0.1:9222</div>
          <div>Active tabs: 3</div>
          <div style={{opacity:.6}}>  [0] linkedin.com/feed</div>
          <div style={{opacity:.6}}>  [1] devto.com/settings</div>
          <div style={{opacity:.6}}>  [2] reddit.com/r/selfhosted</div>
        </div>
      </div>
    </SurfWrap>
  );
};

/* -- Approvals -- */
window.Surfaces.approvals = function ApprovalsSurface({ open, onClose }){
  const items = [
    { action:'Post to Threads', detail:'d_4192 · "Shipped a cozy-room dashboard…"', risk:'low' },
    { action:'Post to LinkedIn', detail:'d_4191 · "Spent three weeks teaching…"', risk:'med' },
    { action:'Post to Reddit', detail:'d_4190 · "[r/selfhosted] Running an AI-agent…"', risk:'low' },
    { action:'DM Kestrel Coop', detail:'lead-followup · reply to schedule call', risk:'med' },
    { action:'Send Proposal', detail:'proposal-gen · growth pkg $1200 → Goldenrod.io', risk:'high' },
    { action:'Email Windrose', detail:'agentmail · confirm Fri 10 AM meeting', risk:'low' },
    { action:'GitHub PR Merge', detail:'#184 · fix rag index on stale persona', risk:'low' },
    { action:'Update Persona', detail:'terrence-walker · add medium bio', risk:'low' },
    { action:'SEO Publish', detail:'blog-post → devto · "Writing an agent that…"', risk:'med' },
  ];
  return (
    <SurfWrap open={open} onClose={onClose} title="Approvals" sub="pending outbound actions · telegram gate">
      <div className="card" style={{marginBottom:14,background:'linear-gradient(135deg,#ffe1df,#fff9ef)'}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <h3 style={{margin:0}}>Telegram Approval Queue</h3>
          <span className="tag r">{items.length} pending</span>
        </div>
        <div className="muted" style={{fontSize:12,marginTop:4}}>all outbound communications require your approval via Telegram</div>
      </div>
      <table className="std">
        <thead><tr><th>action</th><th>detail</th><th>risk</th><th>controls</th></tr></thead>
        <tbody>
          {items.map((it,i)=>(
            <tr key={i}>
              <td style={{fontWeight:600,fontSize:12}}>{it.action}</td>
              <td className="mono" style={{fontSize:11,color:'var(--ink-2)',maxWidth:260}}>{it.detail}</td>
              <td><span className={`tag ${it.risk==='low'?'g':it.risk==='med'?'a':'r'}`}>{it.risk}</span></td>
              <td>
                <div className="row" style={{gap:4}}>
                  <button className="btn" style={{fontSize:10,padding:'4px 8px',background:'#2f6b3e'}}>approve</button>
                  <button className="btn ghost" style={{fontSize:10,padding:'4px 8px'}}>reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SurfWrap>
  );
};
