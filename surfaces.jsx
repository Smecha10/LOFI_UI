/* OpenClaw scene — pixel-art canvas room + UI atmosphere */
const { useState, useEffect, useRef, useMemo } = React;

function pad(n){ return String(n).padStart(2,'0'); }

function useTick(ms=1000){
  const [t, setT] = useState(Date.now());
  useEffect(()=>{ const i = setInterval(()=>setT(Date.now()), ms); return ()=>clearInterval(i); }, [ms]);
  return t;
}

// higher-resolution tick for animation (60fps-ish)
function useAnimTick(){
  const [t, setT] = useState(performance.now());
  useEffect(()=>{
    let raf;
    const loop = () => { setT(performance.now()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

function hourGrade(h) {
  const table = [
    { h:0,  tint:'#1a1b3a', aa:0.42, warmth: 0.0,  bright: .75 },
    { h:5,  tint:'#3a2d4e', aa:0.30, warmth: 0.1,  bright: .82 },
    { h:7,  tint:'#a8d8d0', aa:0.22, warmth: 0.3,  bright: 1.02},
    { h:12, tint:'#fde5b8', aa:0.14, warmth: 0.6,  bright: 1.1 },
    { h:17, tint:'#f29d7d', aa:0.22, warmth: 0.85, bright: 1.0 },
    { h:19, tint:'#7b4d73', aa:0.30, warmth: 0.6,  bright: .88 },
    { h:21, tint:'#2a1e4a', aa:0.40, warmth: 0.25, bright: .78 },
  ];
  let a = table[0], b = table[table.length-1];
  for (let i=0;i<table.length-1;i++){
    if (h >= table[i].h && h < table[i+1].h){ a = table[i]; b = table[i+1]; break; }
  }
  if (h >= table[table.length-1].h){ a = table[table.length-1]; b = {...table[0], h: 24}; }
  const t = (h - a.h) / Math.max(0.0001, (b.h - a.h));
  const mixHex = (c1, c2) => {
    const p = (c)=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const [r1,g1,bl1]=p(c1),[r2,g2,bl2]=p(c2);
    const mx=(x,y)=>Math.round(x+(y-x)*t);
    return `#${pad(mx(r1,r2).toString(16))}${pad(mx(g1,g2).toString(16))}${pad(mx(bl1,bl2).toString(16))}`;
  };
  return {
    tint: mixHex(a.tint, b.tint),
    aa: a.aa + (b.aa-a.aa)*t,
    warmth: a.warmth + (b.warmth-a.warmth)*t,
    bright: a.bright + (b.bright-a.bright)*t,
  };
}

function lerpCol(a, b, t){
  const p = c => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
  const [r1,g1,bl1] = p(a), [r2,g2,bl2] = p(b);
  const mx = (x,y) => Math.round(x + (y-x)*t);
  return `#${pad(mx(r1,r2).toString(16))}${pad(mx(g1,g2).toString(16))}${pad(mx(bl1,bl2).toString(16))}`;
}

/* =========================================================
   PIXEL ROOM — 480x270 canvas scaled to viewport
   ========================================================= */
const RW = 480, RH = 270;

function PixelRoom({ hour, lampOn, catAlert, activity, now, logLines, piStats }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const grade = hourGrade(hour);
    const isNight = hour < 6 || hour >= 19;
    const isDusk = hour >= 17 && hour < 19;

    // ---- palette (shifted by time) ----
    const P = {
      wall:       isNight ? '#3a2544' : isDusk ? '#7a4a5c' : '#b88572',
      wallD:      isNight ? '#2a1838' : isDusk ? '#5a3445' : '#8a5a48',
      wallH:      isNight ? '#4a3158' : isDusk ? '#8a5668' : '#cd9a85',
      wallTrim:   isNight ? '#1e1028' : '#3a1e18',
      floor:      isNight ? '#3a2a2e' : '#5e3e36',
      floorD:     isNight ? '#2a1e22' : '#442a24',
      floorH:     isNight ? '#4a3a3e' : '#764e44',
      sky1:       isNight ? '#0e0a28' : isDusk ? '#d4836a' : '#a8c8e8',
      sky2:       isNight ? '#201548' : isDusk ? '#6a4478' : '#f0c898',
      sky3:       isNight ? '#4a2868' : isDusk ? '#3a2048' : '#ffe0b0',
      star:       '#fff4c8',
      city:       isNight ? '#14102a' : '#3a2a3e',
      cityD:      isNight ? '#0a0820' : '#2a1c30',
      cityLit:    '#ffd070',
      cityLitB:   '#8ac5ff',
      frame:      '#1a0e08',
      desk:       '#5a3620',
      deskD:      '#3a200f',
      deskH:      '#7a4a30',
      monitor:    '#0e0a12',
      monitorH:   '#2a2228',
      screen:     '#050d18',
      screenLit:  '#5fe8b0',
      screenDim:  '#2a7a5a',
      screenBlue: '#8ac5ff',
      screenAmber:'#ffba55',
      skin:       '#8a5a3a',
      skinD:      '#5e3a24',
      skinH:      '#a0704a',
      hair:       '#1a0f08',
      hairD:      '#0a0604',
      shirt:      '#3a5264',
      shirtD:     '#24384a',
      shirtH:     '#5a7488',
      cans:       '#1a1018',
      cansA:      '#ff7755',
      catBody:    '#e8b368',
      catBodyD:   '#b07840',
      catBodyS:   '#8a5828', // stripes
      catWhite:   '#faead0',
      catPink:    '#f28fa8',
      plant:      '#3a7048',
      plantD:     '#224028',
      plantH:     '#5a9260',
      pot:        '#8a5438',
      potD:       '#5a3420',
      lamp:       lampOn ? '#ffd080' : '#6a4a38',
      chair:      '#2a1410',
      chairD:     '#180806',
      chairH:     '#4a2a1e',
      light:      '#ffd890',
      lightA:     '#ff9a6a',
      lightB:     '#9accff',
      lightC:     '#ff7aa8',
      stringW:    '#1a0a18',
      pi:         '#2d6b49',
      piD:        '#1a4030',
      oled:       '#050510',
      oledLit:    '#8ac5ff',
      oledGreen:  '#5fe8b0',
      oledAmber:  '#ffba55',
      kbBase:     '#1a1820',
      kbKey:      '#3a3844',
      kbKeyLit:   '#ffaa6a',
      mug:        '#f0d8c0',
      mugD:       '#5a4438',
      mugA:       '#c94040',
      steam:      '#ffffff',
      poster1Bg:  '#e85a4f',
      poster1Fg:  '#1a0e08',
      poster2Bg:  '#2a3e5a',
      poster2Fg:  '#ffd070',
    };

    // helpers
    const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x|0, y|0, w|0, h|0); };
    const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x|0, y|0, 1, 1); };

    // pixel-text rendering (tiny 3x5 font) for monitor + OLED
    const FONT = {
      ' ':[0,0,0,0,0], '0':[7,5,5,5,7],'1':[2,6,2,2,7],'2':[7,1,7,4,7],'3':[7,1,3,1,7],'4':[5,5,7,1,1],
      '5':[7,4,7,1,7],'6':[7,4,7,5,7],'7':[7,1,1,1,1],'8':[7,5,7,5,7],'9':[7,5,7,1,7],
      'A':[7,5,7,5,5],'B':[6,5,7,5,6],'C':[7,4,4,4,7],'D':[6,5,5,5,6],'E':[7,4,7,4,7],
      'F':[7,4,7,4,4],'G':[7,4,5,5,7],'H':[5,5,7,5,5],'I':[7,2,2,2,7],'J':[1,1,1,5,7],
      'K':[5,5,6,5,5],'L':[4,4,4,4,7],'M':[5,7,7,5,5],'N':[5,7,7,7,5],'O':[7,5,5,5,7],
      'P':[7,5,7,4,4],'Q':[7,5,5,7,3],'R':[6,5,7,6,5],'S':[7,4,7,1,7],'T':[7,2,2,2,2],
      'U':[5,5,5,5,7],'V':[5,5,5,7,2],'W':[5,5,7,7,5],'X':[5,5,2,5,5],'Y':[5,5,7,2,2],
      'Z':[7,1,2,4,7],
      ':':[0,2,0,2,0],'.':[0,0,0,0,2],'/':[1,1,2,4,4],'-':[0,0,7,0,0],'%':[5,1,2,4,5],
      '>':[4,2,1,2,4],'<':[1,2,4,2,1],'[':[3,2,2,2,3],']':[6,2,2,2,6],
      '+':[0,2,7,2,0],'|':[2,2,2,2,2],'@':[2,7,7,4,3],'#':[5,7,5,7,5],'_':[0,0,0,0,7],
      '(':[1,2,2,2,1],')':[4,2,2,2,4],'?':[6,1,2,0,2],'!':[2,2,2,0,2],
    };
    const drawText = (str, x, y, c) => {
      let cx = x;
      for (const ch of str.toUpperCase()){
        if (ch === '\n'){ /* handled by caller */ continue; }
        const rows = FONT[ch] || FONT[' '];
        for (let r = 0; r < 5; r++){
          const b = rows[r];
          for (let bx = 0; bx < 3; bx++){
            if (b & (1 << (2 - bx))) px(cx + bx, y + r, c);
          }
        }
        cx += 4;
      }
    };

    // ===== clear / back wall =====
    rect(0, 0, RW, RH, P.wall);
    // wall seam / baseboard shadow later

    // ===== window (center-left) =====
    const winX = 40, winY = 42, winW = 176, winH = 116;
    rect(winX - 5, winY - 5, winW + 10, winH + 10, P.frame);
    rect(winX - 5, winY - 5, winW + 10, 2, P.wallH);

    // sky gradient
    const bands = 18;
    for (let i = 0; i < bands; i++){
      const t = i / (bands - 1);
      const col = t < 0.5
        ? lerpCol(P.sky1, P.sky2, t * 2)
        : lerpCol(P.sky2, P.sky3, (t - 0.5) * 2);
      rect(winX, winY + Math.round(i * winH / bands), winW, Math.ceil(winH / bands) + 1, col);
    }

    // stars (night/dusk)
    if (isNight || isDusk) {
      const starSeed = [[14,8],[32,14],[58,10],[82,18],[98,8],[122,16],[144,6],[160,22],[48,30],[74,36],[112,30],[138,42],[22,22],[170,14],[90,42]];
      for (const [sx, sy] of starSeed) {
        const k = (sx * 13 + sy * 7);
        const tw = 0.5 + 0.5 * Math.sin(now / 600 + k * 0.1);
        if (tw > 0.35) px(winX + sx, winY + sy, P.star);
        if (tw > 0.75) {
          px(winX + sx - 1, winY + sy, P.star);
          px(winX + sx + 1, winY + sy, P.star);
        }
      }
    }
    // moon
    if (isNight){
      const mx = winX + 132, my = winY + 20;
      rect(mx, my, 14, 14, '#f4e8c0');
      rect(mx + 1, my + 1, 12, 12, '#fff4d0');
      rect(mx + 4, my + 3, 2, 2, '#e0d0a0');
      rect(mx + 8, my + 8, 2, 2, '#e0d0a0');
      rect(mx + 3, my + 9, 2, 1, '#e0d0a0');
    }

    // city skyline
    const baseY = winY + winH - 18;
    const buildings = [
      { x: 0,   w: 22, h: 40, c: P.city },
      { x: 20,  w: 18, h: 32, c: P.cityD },
      { x: 36,  w: 28, h: 48, c: P.city },
      { x: 62,  w: 20, h: 28, c: P.cityD },
      { x: 80,  w: 26, h: 44, c: P.city },
      { x: 104, w: 14, h: 24, c: P.cityD },
      { x: 116, w: 30, h: 54, c: P.city },
      { x: 144, w: 18, h: 34, c: P.cityD },
      { x: 160, w: 16, h: 24, c: P.city },
    ];
    for (const b of buildings){
      rect(winX + b.x, baseY - b.h, b.w, b.h + 20, b.c);
      // window grid
      for (let wy = 3; wy < b.h - 2; wy += 4){
        for (let wx = 2; wx < b.w - 2; wx += 3){
          const k = (b.x + wx * 7) * 11 + wy * 13;
          const lit = (isNight || isDusk) ? (k % 4 < 2) : (k % 9 === 0);
          if (lit){
            const bl = (k % 7 === 0) ? P.cityLitB : P.cityLit;
            px(winX + b.x + wx, baseY - b.h + wy, bl);
          }
        }
      }
      // rooftop antenna/water tank on taller ones
      if (b.h > 40 && (b.x % 7) === 0){
        rect(winX + b.x + b.w/2 - 1, baseY - b.h - 4, 2, 4, P.cityD);
      }
    }

    // muntins — cross (4-pane)
    rect(winX, winY + Math.floor(winH / 2) - 2, winW, 3, P.frame);
    rect(winX + Math.floor(winW / 2) - 1, winY, 3, winH, P.frame);
    // inner highlights
    rect(winX + 1, winY + 1, winW - 2, 1, 'rgba(255,255,255,.15)');
    // sill
    rect(winX - 8, winY + winH, winW + 16, 5, P.wallH);
    rect(winX - 8, winY + winH + 5, winW + 16, 2, P.wallD);

    // ===== string lights across top — clean catenary, 18 bulbs =====
    const stringY = 18;
    const stringX0 = 16, stringX1 = RW - 16;
    const sagAt = (x) => {
      const t = (x - stringX0) / (stringX1 - stringX0);
      return 5 * Math.sin(t * Math.PI);
    };
    for (let x = stringX0; x <= stringX1; x++) px(x, stringY + sagAt(x), P.stringW);
    const bulbCount = 22;
    const bulbCols = [P.light, P.lightA, P.lightB, P.lightC];
    for (let i = 0; i < bulbCount; i++){
      const x = Math.round(stringX0 + ((i + 0.5) / bulbCount) * (stringX1 - stringX0));
      const y = Math.round(stringY + sagAt(x));
      const col = bulbCols[i % bulbCols.length];
      px(x, y, P.stringW); // hanger
      // 3x3 bulb with 2x2 glow core
      rect(x - 1, y + 1, 3, 2, col);
      px(x, y + 3, col);
      const tw = (Math.floor(now / 280) + i * 3) % 5;
      if (tw < 2) px(x, y + 1, '#ffffff');
    }

    // (posters removed per direction)

    // (corkboard moved to top-right wall next to bookshelf area — drawn below)

    // (old shelf + cat moved into bookshelf furniture below)

    // ===== floor =====
    rect(0, 216, RW, 54, P.floor);
    rect(0, 216, RW, 2, P.floorD);
    rect(0, 218, RW, 1, P.floorH);
    for (let x = 0; x < RW; x += 32) rect(x, 220, 1, 50, P.floorD);
    rect(0, 214, RW, 2, P.wallTrim);

    // ===== desk (shorter, left side of room) =====
    const deskY = 172, deskThick = 10;
    const deskX = 24, deskW = 240; // ends around x=264
    rect(deskX, deskY, deskW, deskThick, P.desk);
    rect(deskX, deskY, deskW, 2, P.deskH);
    rect(deskX, deskY + deskThick - 2, deskW, 2, P.deskD);
    // desk legs
    rect(deskX + 6, deskY + deskThick, 6, 44, P.deskD);
    rect(deskX + deskW - 12, deskY + deskThick, 6, 44, P.deskD);
    rect(deskX + 4, deskY + deskThick, deskW - 8, 2, P.deskD);

    // ===== FREESTANDING BOOKSHELF on right side of room =====
    const bsX = 330, bsY = 60, bsW = 120, bsH = 156; // floor at 216; bottom = 216
    // outer carcass
    rect(bsX - 4, bsY - 4, bsW + 8, bsH + 8, P.deskD);
    rect(bsX, bsY, bsW, bsH, P.desk);
    rect(bsX, bsY, bsW, 3, P.deskH);
    rect(bsX, bsY + bsH - 3, bsW, 3, P.deskD);
    // inner back panel
    const bsInX = bsX + 4, bsInW = bsW - 8;
    rect(bsInX, bsY + 3, bsInW, bsH - 6, '#2a1a12');
    // shelves (4 shelves → 5 rows)
    const rows = 5;
    const rowH = (bsH - 6) / rows;
    for (let r = 1; r < rows; r++){
      const sy = bsY + 3 + Math.round(r * rowH);
      rect(bsInX, sy - 1, bsInW, 2, P.deskH);
      rect(bsInX, sy + 1, bsInW, 1, P.deskD);
    }
    // vertical side supports
    rect(bsX + 2, bsY + 3, 2, bsH - 6, P.deskD);
    rect(bsX + bsW - 4, bsY + 3, 2, bsH - 6, P.deskD);
    // book colors per row
    const bookCols = ['#a85c48','#c08858','#5c8ca0','#d0a858','#8c4860','#48806c','#a85c48','#c08858','#b06a48','#6a8ca0'];
    const rowItems = [
      { type:'books', count: 8 },
      { type:'cat' },
      { type:'books', count: 9 },
      { type:'knick' }, // plant + tchotchkes
      { type:'books', count: 10 },
    ];
    for (let r = 0; r < rows; r++){
      const shelfTop = bsY + 3 + Math.round(r * rowH);
      const shelfBot = bsY + 3 + Math.round((r + 1) * rowH) - 2;
      const itm = rowItems[r];
      if (itm.type === 'books'){
        let bx = bsInX + 2;
        for (let b = 0; b < itm.count; b++){
          const bw = 3 + ((b * 13 + r * 7) % 4);
          const bh = 12 + ((b * 11 + r * 5) % 8);
          if (bx + bw > bsInX + bsInW - 2) break;
          const c = bookCols[(b + r * 3) % bookCols.length];
          rect(bx, shelfBot - bh, bw, bh, c);
          rect(bx, shelfBot - bh, bw, 1, '#000');
          rect(bx + 1, shelfBot - bh + 2, bw - 2, 1, 'rgba(255,255,255,.2)');
          rect(bx + 1, shelfBot - 3, bw - 2, 1, 'rgba(255,255,255,.15)');
          bx += bw + 1;
        }
      } else if (itm.type === 'cat'){
        // cat sleeps/animates on this shelf
        drawCat(ctx, bsInX + 8, shelfBot - 16, P, catAlert, now);
        // a couple of leaning books as companions
        rect(bsInX + bsInW - 28, shelfBot - 18, 4, 18, '#5c8ca0');
        rect(bsInX + bsInW - 23, shelfBot - 14, 4, 14, '#d0a858');
        rect(bsInX + bsInW - 18, shelfBot - 20, 5, 20, '#8c4860');
      } else if (itm.type === 'knick'){
        // potted plant
        drawPlant(ctx, bsInX + 4, shelfBot - 22, P, 0.8);
        // framed photo
        rect(bsInX + 30, shelfBot - 16, 18, 14, P.frame);
        rect(bsInX + 31, shelfBot - 15, 16, 12, '#6a8ca0');
        rect(bsInX + 34, shelfBot - 12, 3, 3, P.skin); // face blur
        rect(bsInX + 40, shelfBot - 12, 3, 3, P.skinH);
        // trinket
        rect(bsInX + bsInW - 20, shelfBot - 10, 6, 10, '#e89658');
        rect(bsInX + bsInW - 20, shelfBot - 10, 6, 2, '#ffba55');
      }
    }

    // ===== corkboard — on wall BETWEEN window (ends x=216) and bookshelf (starts x=330) =====
    const ckX = 230, ckY = 60, ckW = 94, ckH = 96;
    rect(ckX - 3, ckY - 3, ckW + 6, ckH + 6, P.frame);
    rect(ckX, ckY, ckW, ckH, '#b08858');
    for (let i = 0; i < 40; i++){
      const sx = (i * 37) % ckW;
      const sy = (i * 53) % ckH;
      px(ckX + sx, ckY + sy, '#8a6840');
    }
    const stickies = [
      { x: 3,  y: 3,  w: 18, h: 20, c: '#ffe88a', lc:'#2a1e12' },
      { x: 24, y: 5,  w: 20, h: 18, c: '#ffb38a', lc:'#2a1e12' },
      { x: 48, y: 3,  w: 18, h: 22, c: '#8ae8c8', lc:'#0e2a1e' },
      { x: 70, y: 6,  w: 20, h: 18, c: '#d8a8ff', lc:'#2a1e3e' },
      { x: 5,  y: 28, w: 22, h: 20, c: '#ffb38a', lc:'#2a1e12' },
      { x: 30, y: 30, w: 18, h: 18, c: '#ffe88a', lc:'#2a1e12' },
      { x: 52, y: 30, w: 20, h: 20, c: '#a8d8ff', lc:'#1a2030' },
      { x: 76, y: 28, w: 14, h: 22, c: '#d8a8ff', lc:'#2a1e3e' },
      { x: 4,  y: 54, w: 20, h: 18, c: '#8ae8c8', lc:'#0e2a1e' },
      { x: 28, y: 56, w: 22, h: 20, c: '#ffe88a', lc:'#2a1e12' },
      { x: 54, y: 56, w: 18, h: 20, c: '#ffb38a', lc:'#2a1e12' },
      { x: 74, y: 58, w: 16, h: 18, c: '#d8a8ff', lc:'#2a1e3e' },
      { x: 10, y: 78, w: 22, h: 14, c: '#a8d8ff', lc:'#1a2030' },
      { x: 40, y: 80, w: 18, h: 12, c: '#ffe88a', lc:'#2a1e12' },
      { x: 62, y: 78, w: 24, h: 14, c: '#8ae8c8', lc:'#0e2a1e' },
    ];
    // red string crossing stickies (conspiracy board!)
    ctx.strokeStyle = '#c83040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ckX + 12, ckY + 12);
    ctx.lineTo(ckX + 34, ckY + 14);
    ctx.lineTo(ckX + 58, ckY + 12);
    ctx.lineTo(ckX + 80, ckY + 15);
    ctx.lineTo(ckX + 62, ckY + 40);
    ctx.lineTo(ckX + 14, ckY + 37);
    ctx.lineTo(ckX + 38, ckY + 65);
    ctx.lineTo(ckX + 82, ckY + 66);
    ctx.stroke();
    for (const s of stickies){
      rect(ckX + s.x, ckY + s.y, s.w, s.h, s.c);
      rect(ckX + s.x, ckY + s.y, s.w, 1, 'rgba(0,0,0,.12)');
      rect(ckX + s.x + 2, ckY + s.y + 3, s.w - 4, 1, s.lc);
      rect(ckX + s.x + 2, ckY + s.y + 6, s.w - 6, 1, s.lc);
      rect(ckX + s.x + 2, ckY + s.y + 9, s.w - 5, 1, s.lc);
      px(ckX + s.x + s.w/2, ckY + s.y + 1, '#e04040');
    }

    // ===== monitor on RIGHT side of desk (so Terrence faces it; keyboard is to his LEFT) =====
    // desk: x 24..264. monitor right side of desk.
    const monX = 174, monY = deskY - 58, monW = 84, monH = 56;
    rect(monX - 3, monY - 3, monW + 6, monH + 6, P.frame);
    rect(monX - 3, monY - 3, monW + 6, 2, P.monitorH);
    rect(monX, monY, monW, monH, P.monitor);
    const scrX = monX + 4, scrY = monY + 4, scrW = monW - 8, scrH = monH - 8;
    rect(scrX, scrY, scrW, scrH, P.screen);
    rect(scrX, scrY, scrW, 6, '#1a2230');
    rect(scrX + 2, scrY + 2, 2, 2, '#ff5555');
    rect(scrX + 6, scrY + 2, 2, 2, '#ffaa55');
    rect(scrX + 10, scrY + 2, 2, 2, '#55cc77');
    drawText('TERRENCE@PI5', scrX + 18, scrY + 1, P.screenDim);
    // terminal text — rolling log lines, with word-wrap clipped to screen
    const lineH = 6;
    const charW = 4;
    const charsPerLine = Math.max(4, Math.floor((scrW - 6) / charW));
    const maxLines = Math.max(1, Math.floor((scrH - 10) / lineH));
    // wrap: for each log line, word-wrap onto multiple rows, then tail to maxLines
    const wrapped = [];
    for (const line of logLines){
      const words = line.text.split(' ');
      let cur = '';
      for (const w of words){
        if ((cur + (cur?' ':'') + w).length > charsPerLine){
          if (cur) wrapped.push({ type: line.type, text: cur });
          cur = w.length > charsPerLine ? w.slice(0, charsPerLine) : w;
        } else {
          cur = cur ? cur + ' ' + w : w;
        }
      }
      if (cur) wrapped.push({ type: line.type, text: cur });
    }
    const visible = wrapped.slice(-maxLines);
    for (let i = 0; i < visible.length; i++){
      const line = visible[i];
      const y = scrY + 8 + i * lineH;
      const c = line.type === 'ok' ? P.screenLit : line.type === 'warn' ? P.screenAmber : line.type === 'info' ? P.screenBlue : P.screenDim;
      drawText(line.text, scrX + 2, y, c);
    }
    if ((Math.floor(now / 400) % 2) === 0 && visible.length < maxLines){
      const y = scrY + 8 + visible.length * lineH;
      rect(scrX + 2, y, 3, 4, P.screenLit);
    }
    const scanY = scrY + ((Math.floor(now / 30)) % scrH);
    rect(scrX, scanY, scrW, 1, 'rgba(255,255,255,.08)');
    rect(monX + monW/2 - 6, monY + monH, 12, 5, P.frame);
    rect(monX + monW/2 - 14, monY + monH + 5, 28, 3, P.frame);
    rect(monX + monW/2 - 14, monY + monH + 5, 28, 1, P.monitorH);
    const glow = ctx.createRadialGradient(monX + monW/2, monY + monH/2, 4, monX + monW/2, monY + monH/2, 80);
    glow.addColorStop(0, 'rgba(95, 232, 176, 0.22)');
    glow.addColorStop(1, 'rgba(95, 232, 176, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(monX - 40, monY - 30, monW + 80, monH + 60);

    // ===== BIGGER Raspberry Pi with OLED on FAR LEFT of desk =====
    const piX = 30, piY = deskY - 26, piW = 44, piH = 24;
    rect(piX - 1, piY - 1, piW + 2, piH + 2, P.piD);
    rect(piX, piY, piW, piH, P.pi);
    // larger OLED (30 x 18)
    const oledX = piX + 3, oledY = piY + 3, oledW = 26, oledH = 18;
    rect(oledX, oledY, oledW, oledH, P.oled);
    rect(oledX, oledY, oledW, 1, '#1a2030');
    // OLED content — now fits readable stats with text wrapping to stay inside
    const stat = piStats || { cpu: 32, mem: 48, temp: 54, net: 'ok' };
    drawText('PI5 LINUX', oledX + 1, oledY + 1, P.oledGreen);
    drawText(`CPU ${pad(stat.cpu)}%`, oledX + 1, oledY + 7, P.oledLit);
    drawText(`MEM ${pad(stat.mem)}%`, oledX + 1, oledY + 13, P.oledAmber);
    // bar graph on right half of oled
    for (let bi = 0; bi < 5; bi++){
      const barH = 1 + ((Math.floor(now/200) + bi * 7) % 5);
      rect(oledX + 17 + bi * 2, oledY + 12 - barH, 1, barH, P.oledAmber);
    }
    drawText(`${pad(stat.temp)}C`, oledX + 17, oledY + 13, P.oledGreen);
    // leds on pi
    const ledBlink = Math.floor(now / 220) % 4;
    rect(piX + piW - 6, piY + 3, 2, 2, ledBlink === 0 ? '#ffba55' : '#6a3820');
    rect(piX + piW - 6, piY + 8, 2, 2, '#4fe07a');
    rect(piX + piW - 6, piY + 13, 2, 2, ledBlink === 2 ? '#4fe07a' : '#204020');
    rect(piX + piW - 6, piY + 18, 2, 2, '#4fe07a');
    // ethernet cable trailing off edge
    rect(piX - 4, piY + piH - 4, 5, 2, '#3a3840');
    rect(piX - 10, piY + piH - 3, 6, 2, '#3a3840');

    // ===== keyboard — on LEFT side of desk, in front of where Terrence sits =====
    const kbX = 82, kbY = deskY - 4, kbW = 72, kbH = 6;
    rect(kbX, kbY, kbW, kbH, P.kbBase);
    rect(kbX, kbY, kbW, 1, '#2a2830');
    rect(kbX, kbY + kbH - 1, kbW, 1, '#0a0810');
    const activeKeys = Math.floor(activity * 6) + 1;
    for (let i = 0; i < 14; i++){
      const keyX = kbX + 2 + i * 5;
      const roll = (Math.floor(now / 80 + i * 1.7)) % 12;
      const lit = roll < activeKeys;
      rect(keyX, kbY + 2, 4, 3, lit ? P.kbKeyLit : P.kbKey);
      if (lit) px(keyX + 1, kbY + 2, '#ffffff');
    }
    // mouse to the right of keyboard
    rect(kbX + kbW + 6, kbY + 1, 8, 6, '#2a2830');
    rect(kbX + kbW + 6, kbY + 1, 8, 1, '#3a3840');
    rect(kbX + kbW + 9, kbY + 2, 2, 1, P.screenLit);

    // ===== mug — moved to right-back corner of desk, behind keyboard, beside monitor =====
    const mgX = 158, mgY = deskY - 14;
    rect(mgX, mgY, 10, 12, P.mug);
    rect(mgX, mgY, 10, 1, P.mugD);
    rect(mgX + 9, mgY + 3, 3, 5, P.mug);
    rect(mgX + 11, mgY + 4, 1, 3, P.mugD);
    rect(mgX + 1, mgY + 3, 8, 3, P.mugA);
    drawText('OC', mgX + 2, mgY + 7, P.mugD);
    const stY = Math.floor(now / 180) % 8;
    px(mgX + 2, mgY - 2 - stY, 'rgba(255,255,255,.5)');
    px(mgX + 4, mgY - 4 - stY, 'rgba(255,255,255,.3)');
    px(mgX + 6, mgY - 3 - stY, 'rgba(255,255,255,.4)');

    // ===== lamp — near right edge of desk, softer radial ambient =====
    const lampBaseY = deskY;
    const lampX = 244;
    rect(lampX + 5, lampBaseY - 2, 14, 2, P.frame);
    rect(lampX + 7, lampBaseY - 4, 10, 2, P.frame);
    rect(lampX + 10, lampBaseY - 22, 4, 18, P.frame);
    const lampY = lampBaseY - 30;
    rect(lampX + 3, lampY, 18, 8, P.lamp);
    rect(lampX + 3, lampY, 18, 2, lampOn ? '#ffe0a0' : '#4a3224');
    rect(lampX + 3, lampY + 6, 18, 2, P.frame);
    if (lampOn){
      // soft, large radial glow — not clipped tight to a square
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const cx = lampX + 12, cy = lampY + 6;
      const lg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 120);
      lg.addColorStop(0, 'rgba(255, 210, 140, 0.55)');
      lg.addColorStop(0.3, 'rgba(255, 200, 120, 0.22)');
      lg.addColorStop(0.6, 'rgba(255, 180, 100, 0.08)');
      lg.addColorStop(1, 'rgba(255, 180, 100, 0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, RW, RH); // fill whole canvas so there's no square boundary
      ctx.restore();
      rect(lampX + 10, lampY + 6, 4, 3, '#fff4d0');
    }
    rect(lampX + 8, lampBaseY - 3, 2, 1, lampOn ? '#7cd992' : '#ff6b6b');

    // ===== Terrence — seated between keyboard (left) and monitor (right), viewed from BACK-LEFT =====
    // chair on floor (y=216). Anchor = seat front-floor point.
    // keyboard is to his LEFT → his left arm reaches more forward; monitor to his right means
    // he's angled slightly rightward. We draw him with head turned toward monitor.
    drawTerrence(ctx, 130, 212, P, activity, now);

    // ===== floor plants — BIG monstera on left, small on right =====
    drawBigPlant(ctx, 0, 148, P, now);
    drawPlant(ctx, RW - 30, 188, P, 1.0);

    // ===== rug =====
    for (let y = 226; y < 266; y++){
      const rel = (y - 226);
      const stripe = Math.floor(rel / 3) % 2;
      const c = stripe ? '#5a6e8c' : '#3a4e6c';
      rect(90, y, 280, 1, c);
    }
    // rug fringe
    for (let x = 90; x < 370; x += 3){
      rect(x, 225, 2, 1, '#24384c');
      rect(x, 266, 2, 1, '#24384c');
    }
    // rug pattern
    rect(210, 236, 40, 20, '#24384c');
    rect(214, 240, 32, 12, '#5a6e8c');
    rect(220, 244, 20, 4, '#24384c');

    // (door removed per direction)

    // ===== overall time grade wash =====
    ctx.globalAlpha = grade.aa * 0.5;
    ctx.fillStyle = grade.tint;
    ctx.fillRect(0, 0, RW, RH);
    ctx.globalAlpha = 1;

    // vignette
    const vig = ctx.createRadialGradient(RW/2, RH/2, RH*0.45, RW/2, RH/2, RH*0.95);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, RW, RH);

  }, [hour, lampOn, catAlert, activity, now, logLines, piStats]);

  return <canvas ref={canvasRef} width={RW} height={RH} className="pixel-room"/>;
}

/* ==== sprite helpers ==== */
// Terrence — seated 3/4 back view. Anchor (x,y) = floor point under seat.
// Desk surface runs at y-level where keyboard sits; his hands rest on it.
function drawTerrence(ctx, x, y, P, activity, now){
  const R = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect((x+dx)|0, (y+dy)|0, w|0, h|0); };

  // === legs / lap (visible below desk, he's seated) ===
  // thighs on the seat, pointing toward desk (forward/left)
  R(-12, -4, 22, 6, P.shirtD);          // lap shadow
  R(-14, 2, 10, 10, '#2a1810');         // left thigh (jeans)
  R(-2, 2, 12, 10, '#2a1810');          // right thigh
  R(-14, 2, 24, 1, '#3a2418');          // highlight
  R(-14, 11, 24, 1, '#180808');         // crease
  // calves dangling
  R(-12, 12, 6, 10, '#1e120a');
  R(0, 12, 6, 10, '#1e120a');
  // shoes
  R(-14, 20, 8, 3, P.chairD);
  R(-2, 20, 8, 3, P.chairD);

  // === chair ===
  // seat
  R(-16, 0, 30, 5, P.chair);
  R(-16, 0, 30, 1, P.chairH);
  R(-16, 4, 30, 1, P.chairD);
  // seat base post
  R(-3, 12, 6, 8, P.chairD);
  // 5-star base
  R(-14, 20, 28, 2, P.chairD);
  R(-10, 22, 20, 1, '#0a0404');
  // wheels
  R(-13, 22, 3, 2, P.chair);
  R(-2, 22, 3, 2, P.chair);
  R(9, 22, 3, 2, P.chair);
  // chair back (tall)
  R(-14, -42, 28, 42, P.chair);
  R(-14, -42, 28, 2, P.chairH);
  R(-14, -2, 28, 2, P.chairD);
  R(-16, -38, 2, 36, P.chairD);
  R(14, -38, 2, 36, P.chairD);
  // lumbar cushion
  R(-10, -28, 20, 10, P.chairH);
  R(-10, -28, 20, 1, '#5a3a2a');

  // === torso (hoodie) — in front of chair back ===
  R(-11, -24, 22, 22, P.shirt);
  R(-11, -24, 22, 2, P.shirtH);
  R(-11, -4, 22, 2, P.shirtD);
  R(-12, -22, 1, 18, P.shirtD);
  R(11, -22, 1, 18, P.shirtH);
  // hood lump at shoulders
  R(-13, -26, 26, 4, P.shirtD);
  R(-13, -26, 26, 1, '#1a2530');
  // drawstring
  R(-1, -18, 1, 5, '#1a2530');
  R(1, -17, 1, 4, '#1a2530');

  // === arms reaching forward to the keyboard ===
  // Keyboard is at roughly y=deskY-4, which is y+0 here if we set anchor right
  // But anchor is floor-under-seat. Desk is ABOVE his thighs. So arms extend up+forward.
  const phase = Math.floor(now / (120 - activity * 70)) % 2;
  const leftLift = phase === 0 ? 1 : 0;
  const rightLift = phase === 1 ? 1 : 0;

  // shoulders at y=-22, hands at desk level y=-6
  // left (viewer-left) arm — upper
  R(-14, -20 + leftLift, 5, 7, P.shirtD);
  // forearm angled toward keyboard
  R(-13, -13 + leftLift, 7, 4, P.shirtD);
  // hand on keys (lit by keyboard)
  R(-7, -10 + leftLift, 4, 3, P.skin);
  R(-7, -10 + leftLift, 4, 1, P.skinH);

  // right arm
  R(9, -20 + rightLift, 5, 7, P.shirtD);
  R(6, -13 + rightLift, 7, 4, P.shirtD);
  R(3, -10 + rightLift, 4, 3, P.skin);
  R(3, -10 + rightLift, 4, 1, P.skinH);

  // === neck ===
  R(-4, -28, 8, 4, P.skin);
  R(-4, -28, 8, 1, P.skinD);

  // === head (3/4 back-right view) ===
  R(-7, -40, 16, 14, P.skin);
  R(-7, -40, 16, 2, P.skinD);
  R(-8, -38, 1, 10, P.skinD);
  R(9, -38, 1, 10, P.skinH);
  R(-7, -28, 16, 2, P.skinD); // jawline shadow

  // ear (viewer-right)
  R(9, -34, 2, 5, P.skinD);

  // hair — short dark, rounded top
  R(-8, -44, 18, 6, P.hair);
  R(-8, -44, 18, 2, P.hairD);
  R(-8, -44, 2, 10, P.hair); // sideburn left
  R(8, -44, 2, 10, P.hair);  // sideburn right
  // fade edge
  R(-8, -34, 1, 4, P.hairD);
  R(9, -34, 1, 4, P.hairD);
  // hair texture dots
  R(-4, -43, 1, 1, P.hairD);
  R(0, -43, 1, 1, P.hairD);
  R(4, -43, 1, 1, P.hairD);
  R(-2, -41, 1, 1, P.hairD);
  R(2, -41, 1, 1, P.hairD);

  // headphones over hair
  R(-9, -46, 20, 3, P.cans);
  R(-9, -46, 20, 1, '#2a1a24');
  // right cup (near viewer)
  R(9, -38, 4, 7, P.cans);
  R(10, -37, 2, 5, P.cansA);
  R(10, -37, 2, 1, '#ffbb88');
  // left cup (far sliver)
  R(-9, -38, 2, 7, P.cans);

  // face hint — cheek + tip of nose on turning side
  R(8, -33, 2, 2, P.skinD);
  R(10, -31, 1, 1, P.skin);
  // faint glasses glint off monitor
  if ((Math.floor(now/800) % 4) !== 0) R(9, -35, 1, 1, P.screenLit);

  // occasional head bob while typing
  const bob = Math.floor(now / 1200) % 6 === 0 && activity > 0.2 ? 1 : 0;
  if (bob) R(-9, -46, 20, 1, '#3a2a34');
}

function drawCat(ctx, x, y, P, alert, now){
  const R = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect((x+dx)|0, (y+dy)|0, w|0, h|0); };

  // cat cycles through actions over time: sleeping, stretching, alert-look, grooming
  // ~one action per 8 seconds
  const action = alert ? 'alert' : ['sleep', 'sleep', 'stretch', 'groom', 'sleep', 'look'][Math.floor(now / 6000) % 6];

  // curled body
  R(0, 6, 26, 9, P.catBody);
  R(0, 6, 26, 1, P.catBodyD);
  R(0, 14, 26, 1, P.catBodyD);
  // stripes
  R(4, 7, 2, 7, P.catBodyS);
  R(10, 7, 2, 7, P.catBodyS);
  R(16, 7, 2, 7, P.catBodyS);
  // white chest
  R(3, 10, 6, 4, P.catWhite);
  // paws tucked
  R(2, 13, 2, 2, P.catWhite);
  R(7, 13, 2, 2, P.catWhite);

  // head
  let headDX = 19, headDY = 2;
  let earLift = 0;
  if (action === 'stretch'){
    // head extends forward, body slightly raised
    headDX = 23; headDY = 4;
  } else if (action === 'look' || action === 'alert'){
    headDX = 19; headDY = 0;
    earLift = 1;
  } else if (action === 'groom'){
    // tucks head down licking
    headDX = 18; headDY = 6;
  }
  R(headDX, headDY, 9, 8, P.catBody);
  R(headDX, headDY, 9, 1, P.catBodyD);
  R(headDX, headDY + 7, 9, 1, P.catBodyD);
  // ears
  R(headDX + 1, headDY - 2 - earLift, 2, 2 + earLift, P.catBody);
  R(headDX + 6, headDY - 2 - earLift, 2, 2 + earLift, P.catBody);
  R(headDX + 1, headDY - 1, 2, 1, '#ff9cb8'); // inner ear
  R(headDX + 6, headDY - 1, 2, 1, '#ff9cb8');
  // face stripe
  R(headDX + 4, headDY + 1, 1, 3, P.catBodyS);

  // eyes
  const blink = Math.floor(now / 180) % 40 === 0;
  const eyesOpen = action !== 'sleep' && action !== 'groom' && !blink;
  if (eyesOpen){
    const pupilOffset = action === 'look' ? 1 : 0;
    R(headDX + 2 + pupilOffset, headDY + 3, 1, 2, action === 'alert' ? '#ff6b6b' : '#1a0e08');
    R(headDX + 6 + pupilOffset, headDY + 3, 1, 2, action === 'alert' ? '#ff6b6b' : '#1a0e08');
    // highlights
    if (action !== 'alert') R(headDX + 2 + pupilOffset, headDY + 3, 1, 1, '#f4d070');
  } else {
    // closed (line)
    R(headDX + 2, headDY + 4, 2, 1, P.catBodyD);
    R(headDX + 6, headDY + 4, 2, 1, P.catBodyD);
  }
  // nose + mouth
  R(headDX + 4, headDY + 5, 1, 1, P.catPink);
  R(headDX + 3, headDY + 6, 1, 1, P.catBodyD);
  R(headDX + 5, headDY + 6, 1, 1, P.catBodyD);

  // tail — swish amplitude depends on action
  let swish = 0;
  if (action === 'alert') swish = (Math.floor(now / 100) % 4);
  else if (action === 'look' || action === 'stretch') swish = (Math.floor(now / 400) % 3);
  else swish = (Math.floor(now / 900) % 2);
  R(-4 - swish, 6, 4, 3, P.catBody);
  R(-7 - swish, 4, 3, 3, P.catBody);
  R(-9 - swish * 2, 2, 3, 3, P.catBody);
  R(-9 - swish * 2, 2, 3, 1, P.catBodyD);

  // action decorations
  if (action === 'sleep'){
    // Z Z z
    const zY = Math.floor(now / 600) % 3;
    if (zY !== 2){
      drawSmall(ctx, 'Z', x - 2, y - 8 - zY * 2, P.catWhite);
      drawSmall(ctx, 'Z', x + 3, y - 11 - zY * 2, P.catWhite);
    }
  } else if (action === 'alert'){
    R(x - (x|0) + 8, 0, 1, 1, '#ff6b6b'); // placeholder; use absolute
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(x + 8, y - 8, 2, 1);
    ctx.fillRect(x + 8, y - 6, 2, 3);
  } else if (action === 'groom'){
    // little sparkle
    const sp = Math.floor(now / 300) % 2;
    ctx.fillStyle = '#fff4c8';
    if (sp) ctx.fillRect(x + headDX + 10, y + headDY + 2, 1, 1);
  }
}

// tiny inline char draw for Z etc
function drawSmall(ctx, ch, x, y, c){
  if (ch === 'Z'){
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 3, 1);
    ctx.fillRect(x + 2, y + 1, 1, 1);
    ctx.fillRect(x + 1, y + 2, 1, 1);
    ctx.fillRect(x, y + 3, 3, 1);
  }
}

// Big monstera floor plant — stands on floor, tall, swaying leaves
function drawBigPlant(ctx, x, y, P, now){
  const R = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect((x+dx)|0, (y+dy)|0, w|0, h|0); };
  const sway = Math.sin(now / 1800) * 1;
  // large terracotta pot
  R(4, 52, 44, 22, P.pot);
  R(4, 52, 44, 3, '#a86848');
  R(4, 52, 44, 1, '#c88858');
  R(4, 70, 44, 4, P.potD);
  R(2, 48, 48, 5, P.pot);
  R(2, 48, 48, 1, '#a86848');
  // dirt line
  R(6, 53, 40, 2, '#3a2010');
  // main trunk
  R(22, 34, 4, 20, P.plantD);
  R(23, 34, 1, 20, P.plant);
  // big monstera leaves — split leaf shapes
  // leaf 1 — top center
  const s1 = sway;
  R(18 + s1, 2, 16, 14, P.plant);
  R(18 + s1, 2, 16, 2, P.plantH);
  R(20 + s1, 4, 12, 10, P.plant);
  // splits
  R(22 + s1, 6, 2, 6, P.plantD);
  R(28 + s1, 8, 2, 6, P.plantD);
  R(18 + s1, 14, 16, 2, P.plantD);
  R(26 + s1, 1, 2, 4, P.plantD); // stem
  // leaf 2 — upper left (droops left)
  const s2 = -sway;
  R(2 + s2, 12, 18, 12, P.plant);
  R(2 + s2, 12, 18, 2, P.plantH);
  R(5 + s2, 14, 14, 8, P.plant);
  R(6 + s2, 16, 2, 5, P.plantD);
  R(12 + s2, 16, 2, 5, P.plantD);
  R(2 + s2, 22, 18, 2, P.plantD);
  // leaf 3 — upper right (droops right)
  const s3 = sway;
  R(32 + s3, 10, 18, 14, P.plant);
  R(32 + s3, 10, 18, 2, P.plantH);
  R(34 + s3, 12, 14, 10, P.plant);
  R(38 + s3, 14, 2, 6, P.plantD);
  R(44 + s3, 14, 2, 6, P.plantD);
  R(32 + s3, 22, 18, 2, P.plantD);
  // leaf 4 — mid left
  const s4 = -sway * 0.7;
  R(0 + s4, 26, 16, 12, P.plant);
  R(0 + s4, 26, 16, 2, P.plantH);
  R(4 + s4, 36, 12, 2, P.plantD);
  R(4 + s4, 30, 2, 6, P.plantD);
  R(10 + s4, 30, 2, 6, P.plantD);
  // leaf 5 — mid right
  const s5 = sway * 0.7;
  R(30 + s5, 28, 18, 12, P.plant);
  R(30 + s5, 28, 18, 2, P.plantH);
  R(34 + s5, 38, 12, 2, P.plantD);
  R(36 + s5, 32, 2, 6, P.plantD);
  R(42 + s5, 32, 2, 6, P.plantD);
  // leaf 6 — lower front, draping over pot
  R(14, 40, 20, 14, P.plant);
  R(14, 40, 20, 2, P.plantH);
  R(16, 42, 16, 10, P.plant);
  R(20, 44, 2, 7, P.plantD);
  R(26, 44, 2, 7, P.plantD);
  R(14, 52, 20, 2, P.plantD);
}

function drawPlant(ctx, x, y, P, scale){
  const s = scale || 1;
  const R = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect((x + dx * s)|0, (y + dy * s)|0, Math.max(1, (w * s)|0), Math.max(1, (h * s)|0)); };
  // pot
  R(2, 16, 14, 8, P.pot);
  R(2, 16, 14, 2, P.potD);
  R(1, 14, 16, 2, P.pot);
  R(1, 14, 16, 1, '#6a3820');
  // leaves
  R(5, 4, 3, 12, P.plant);
  R(8, 0, 4, 16, P.plant);
  R(12, 3, 3, 13, P.plant);
  R(2, 8, 3, 8, P.plant);
  R(15, 6, 2, 10, P.plant);
  // highlights
  R(8, 0, 2, 2, P.plantH);
  R(5, 4, 1, 4, P.plantH);
  R(12, 3, 1, 5, P.plantH);
  // dark underside
  R(5, 14, 3, 2, P.plantD);
  R(9, 14, 3, 2, P.plantD);
  R(13, 14, 2, 2, P.plantD);
}

/* =========================================================
   Overlays & interactive UI
   ========================================================= */
function Clock({ now }) {
  const d = new Date(now);
  const h = d.getHours(), m = d.getMinutes();
  return (
    <div className="clock-hud">
      <div className="clock-time">{pad(h)}<span className="blink">:</span>{pad(m)}</div>
      <div className="clock-sub">terrence · uptime 8d 14h</div>
    </div>
  );
}

function ThoughtBubble({ skill, pos, onOpen }){
  const I = Ic[skill.icon];
  const [off, setOff] = useState({x:0, y:0});
  const [drag, setDrag] = useState(false);
  const moved = useRef(false);

  const onDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    const p = e.touches ? e.touches[0] : e;
    const start = { px: p.clientX, py: p.clientY, ox: off.x, oy: off.y };
    moved.current = false;
    setDrag(true);
    const onMove = (ev) => {
      const pp = ev.touches ? ev.touches[0] : ev;
      const dx = pp.clientX - start.px;
      const dy = pp.clientY - start.py;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
      setOff({ x: start.ox + dx, y: start.oy + dy });
    };
    const onUp = () => {
      setDrag(false);
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
  const onClick = () => { if (!moved.current) onOpen(skill); };

  return (
    <div
      className={`bubble ${drag?'dragging':''}`}
      style={{
        left:`${pos.x}%`, top:`${pos.y}%`,
        '--fd': `${5+pos.d}s`, animationDelay:`${pos.delay}s`,
        transform: `translate(${off.x}px, ${off.y}px)`,
      }}
      onMouseDown={onDown}
      onTouchStart={onDown}
      onClick={onClick}
    >
      <span className="ico" style={{ background: skill.tint }}><I/></span>
      <span>{skill.name}</span>
      <span className="meta">{skill.id}</span>
      <div className="expand">
        <h4>{skill.name}</h4>
        <div className="row"><span>status</span><b style={{color:'#6fe095'}}>running</b></div>
        <div className="row"><span>detail</span><b>{skill.desc}</b></div>
        <div className="row"><span>started</span><b>{Math.floor(pos.delay*7)}s ago</b></div>
        <div className="bar"><span style={{ width: `${30+((pos.delay*17)%60)}%`, background: skill.tint }}/></div>
        <div className="click">▸ open {skill.id} dashboard</div>
      </div>
    </div>
  );
}

function InactiveShelf({ inactive, onOpen }){
  return (
    <div className="inactive-shelf">
      <div className="shelf-label">skills · shelf</div>
      {inactive.map(s=>{
        const I = Ic[s.icon];
        return (
          <button className="chip-sm" key={s.id} onClick={()=>onOpen(s)} title={s.desc}>
            <span className="chip-ico" style={{background: s.tint}}><I/></span>
            <span>{s.id}</span>
          </button>
        );
      })}
    </div>
  );
}

function Motes(){
  const motes = useMemo(()=>Array.from({length:18}).map(()=>({
    x: Math.random()*100, y: Math.random()*100,
    s: 1 + Math.random()*2, d: 8 + Math.random()*10,
    delay: -Math.random()*14, op: 0.3 + Math.random()*0.5,
  })),[]);
  return (
    <div className="motes" aria-hidden>
      {motes.map((m,i)=>(
        <span key={i} style={{
          left:`${m.x}%`, top:`${m.y}%`, width:`${m.s}px`, height:`${m.s}px`,
          opacity:m.op, animationDuration:`${m.d}s`, animationDelay:`${m.delay}s`
        }}/>
      ))}
    </div>
  );
}

/* Log feed & pi stats — driven by activity */
function useLogFeed(activeSkills){
  const [lines, setLines] = useState([]);
  useEffect(() => {
    const seed = [
      { type:'dim', text:'[boot] openclaw v0.6 online' },
      { type:'info', text:'[net] telegram webhook ok' },
      { type:'ok', text:'[cron] 06:00 scrape ok' },
      { type:'dim', text:'[mem] rag index 2.4m vecs' },
    ];
    setLines(seed);
    const pool = [
      { type:'ok', text:'[ok] vault sync 24/24' },
      { type:'ok', text:'[ok] lead-followup sent' },
      { type:'info', text:'[lamachina] flux-dev lat 8.2s' },
      { type:'info', text:'[agentmail] 2 inbound' },
      { type:'dim', text:'[gh] pull #184 rebased' },
      { type:'ok', text:'[seo] crawl windrose.io' },
      { type:'warn', text:'[warn] rate limit x/4 api' },
      { type:'info', text:'[rag] embed 124 notes' },
      { type:'ok', text:'[ok] proposal-gen draft ready' },
      { type:'dim', text:'[sess] browser tab 03' },
      { type:'info', text:'[comfy] wan-2.2 queued' },
      { type:'dim', text:'[tail] nginx 200 ok' },
      { type:'ok', text:'[ok] persona embed v3' },
      { type:'info', text:'[sched] next cron 30s' },
    ];
    const iv = setInterval(() => {
      if (activeSkills === 0) return;
      const p = pool[Math.floor(Math.random() * pool.length)];
      setLines(l => [...l.slice(-20), p]);
    }, Math.max(400, 1600 - activeSkills * 150));
    return () => clearInterval(iv);
  }, [activeSkills]);
  return lines;
}

function usePiStats(activeSkills, lampOn){
  const [s, setS] = useState({ cpu: 22, mem: 48, temp: 52, net: 'ok' });
  useEffect(() => {
    const iv = setInterval(() => {
      setS(prev => {
        const tgtCpu = 18 + activeSkills * 8 + (Math.random() * 10 - 5);
        const tgtMem = 42 + activeSkills * 4 + (Math.random() * 6 - 3);
        const tgtTemp = 48 + activeSkills * 2.5 + (lampOn ? 3 : 0) + (Math.random() * 3);
        return {
          cpu: Math.max(8, Math.min(99, Math.round(prev.cpu * 0.6 + tgtCpu * 0.4))),
          mem: Math.max(20, Math.min(95, Math.round(prev.mem * 0.7 + tgtMem * 0.3))),
          temp: Math.max(40, Math.min(78, Math.round(prev.temp * 0.7 + tgtTemp * 0.3))),
          net: 'ok',
        };
      });
    }, 700);
    return () => clearInterval(iv);
  }, [activeSkills, lampOn]);
  return s;
}

function Scene({ tweaks, activeSkillIds, onOpenSkill, onOpenRoute, now }){
  const animNow = useAnimTick();
  const d = new Date(now);
  const h = tweaks.hourOverride >= 0 ? tweaks.hourOverride : d.getHours();

  // activity = 0..1, based on how many skills are active
  const activity = Math.min(1, activeSkillIds.length / 8);
  const logLines = useLogFeed(activeSkillIds.length);
  const piStats = usePiStats(activeSkillIds.length, tweaks.lamacinaOnline);

  // skill bubbles float around the WHOLE room, not just above the desk
  const positions = [
    { x: 12, y:  8, d: 2.4, delay: 0.1 },
    { x: 32, y: 22, d: 3.1, delay: 0.7 },
    { x: 58, y: 10, d: 2.6, delay: 1.3 },
    { x: 80, y: 20, d: 3.3, delay: 1.9 },
    { x: 18, y: 44, d: 2.9, delay: 2.5 },
    { x: 72, y: 44, d: 3.0, delay: 3.1 },
    { x: 42, y: 56, d: 2.7, delay: 3.7 },
    { x: 86, y: 62, d: 3.4, delay: 4.3 },
  ];

  const active = DATA.skills.filter(s => activeSkillIds.includes(s.id)).slice(0, positions.length);
  const inactive = DATA.skills.filter(s => !activeSkillIds.includes(s.id));

  return (
    <div className="scene">
      <div className="pixel-frame">
        <PixelRoom
          hour={h + d.getMinutes()/60}
          lampOn={tweaks.lamacinaOnline}
          catAlert={!tweaks.cronAllOk}
          activity={activity}
          now={animNow}
          logLines={logLines}
          piStats={piStats}
        />
      </div>

      <Motes/>
      <Clock now={now}/>

      {!tweaks.cronAllOk && (
        <div className="cat-alert" title="cron failed — tail twitching">
          <span className="cat-alert-dot"/>
          <span>cron!</span>
        </div>
      )}

      <InactiveShelf inactive={inactive} onOpen={onOpenSkill}/>

      <div className="bubbles">
        {active.map((s, i) => (
          <ThoughtBubble key={s.id} skill={s} pos={positions[i]} onOpen={onOpenSkill}/>
        ))}
      </div>

      {tweaks.pendingApprovals > 0 && (
        <button className="envelope" onClick={()=>onOpenRoute('approvals')} title="outbound actions awaiting telegram approval">
          <span className="count">{tweaks.pendingApprovals}</span>
          <span className="env-label">approvals</span>
        </button>
      )}

      <div className="vhs"/>
      <div className="grain" style={{opacity: tweaks.grainIntensity}}/>
    </div>
  );
}

window.Scene = Scene;
window.useTick = useTick;
