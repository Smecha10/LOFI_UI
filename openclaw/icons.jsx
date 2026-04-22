/* OpenClaw icons — tiny glyphs built from simple shapes, not copyrighted marks */
const Ic = {};
const S = ({children, s=16, ...p}) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>;

Ic.vault      = ()=> <S><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9V7M12 17v-2M9 12H7M17 12h-2"/></S>;
Ic.agentmail  = ()=> <S><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></S>;
Ic.browser    = ()=> <S><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></S>;
Ic.linkedin   = ()=> <S><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7"/></S>;
Ic.github     = ()=> <S><path d="M9 19c-4 1-4-2-6-3m12 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0019 4.77 5.07 5.07 0 0018.91 1S17.73.65 15 2.48a13.38 13.38 0 00-7 0C5.27.65 4.09 1 4.09 1A5.07 5.07 0 004 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 008 18.13V22"/></S>;
Ic.content    = ()=> <S><path d="M3 4h18M3 12h12M3 20h18M18 16l4 4-4 4"/><path d="M15 12l7-7"/></S>;
Ic.lead       = ()=> <S><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1M16 11l2 2 4-4"/></S>;
Ic.proposal   = ()=> <S><path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></S>;
Ic.architect  = ()=> <S><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="12" height="6" rx="1"/><path d="M17 14h4v6h-4z"/></S>;
Ic.scraper    = ()=> <S><path d="M3 7h18M3 12h18M3 17h11"/><circle cx="18" cy="18" r="3"/><path d="M20 20l2 2"/></S>;
Ic.seo        = ()=> <S><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6M11 8v6"/></S>;
Ic.image      = ()=> <S><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></S>;
Ic.video      = ()=> <S><rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 9l5-3v12l-5-3"/></S>;
Ic.pcops      = ()=> <S><rect x="2" y="5" width="20" height="12" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="7" cy="11" r="1"/><circle cx="11" cy="11" r="1"/></S>;
Ic.workshop   = ()=> <S><path d="M14 7l-1.5-1.5a4 4 0 00-5.5 5.5L3 15v6h6l4-4a4 4 0 005.5-5.5L17 10"/></S>;
Ic.social     = ()=> <S><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h6M6 9v6M18 9v6M9 18h6"/></S>;
Ic.home       = ()=> <S><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z"/></S>;
Ic.personas   = ()=> <S><circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 20a6 6 0 0112 0M12 20a6 6 0 0110 0"/></S>;
Ic.composer   = ()=> <S><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></S>;
Ic.blog       = ()=> <S><path d="M2 5h20v14H2z"/><path d="M2 9h20M6 13h4M6 16h8M14 13h4"/></S>;
Ic.media      = ()=> <S><rect x="3" y="4" width="18" height="12" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M3 20h18"/></S>;
Ic.inbox      = ()=> <S><path d="M3 13l3-8h12l3 8"/><path d="M3 13v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 13h5l2 3h4l2-3h5"/></S>;
Ic.memory     = ()=> <S><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M16 4v16M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4"/></S>;
Ic.skills     = ()=> <S><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="15" width="7" height="6" rx="1"/><rect x="14" y="15" width="7" height="6" rx="1"/></S>;
Ic.health     = ()=> <S><path d="M3 12h4l2-8 4 16 2-8h6"/></S>;
Ic.pipeline   = ()=> <S><rect x="2" y="4" width="5" height="16" rx="1"/><rect x="9" y="4" width="5" height="10" rx="1"/><rect x="16" y="4" width="6" height="13" rx="1"/></S>;
Ic.sessions   = ()=> <S><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></S>;
Ic.approval   = ()=> <S><path d="M5 12l4 4 10-10"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h10"/></S>;
Ic.hardware   = ()=> <S><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8"/><path d="M8 2v2M12 2v2M16 2v2M8 20v2M12 20v2M16 20v2M2 8h2M2 12h2M2 16h2M20 8h2M20 12h2M20 16h2"/></S>;
Ic.terminal   = ()=> <S><path d="M4 17l6-6-6-6M12 19h8"/></S>;
Ic.cpu        = ()=> <S><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></S>;
Ic.bolt       = ()=> <S><path d="M13 2L4 14h8l-1 8 9-12h-8z"/></S>;
Ic.search     = ()=> <S><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></S>;
Ic.send       = ()=> <S><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></S>;

Ic.bigClaw    = ()=> (
  <svg viewBox="0 0 40 40" width="22" height="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d="M8 30c-2-4-2-10 2-14s10-6 16-4"/>
    <path d="M30 8l6 2-2 6"/>
    <path d="M24 16l6 2-2 6"/>
    <circle cx="12" cy="28" r="2"/>
  </svg>
);

window.Ic = Ic;
