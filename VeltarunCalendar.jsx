import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const MONTHS = [
  { num:1,  name:"Orvyn Soleth",   short:"Soleth",   pro:"sol-ETH",    meaning:"Awakening · the dawn of all things",        color:"#C4956A" },
  { num:2,  name:"Orvyn Muvrak",   short:"Muvrak",   pro:"MOO-vrack",  meaning:"Roots · the settling of foundations",       color:"#8B7355" },
  { num:3,  name:"Orvyn Tharvel",  short:"Tharvel",  pro:"THAR-vel",   meaning:"Motion · when momentum begins",             color:"#7A9E7E" },
  { num:4,  name:"Orvyn Quelnis",  short:"Quelnis",  pro:"KWEL-nis",   meaning:"Questions · the seeker's time",             color:"#8E9BB5" },
  { num:5,  name:"Orvyn Drevath",  short:"Drevath",  pro:"dreh-VATH",  meaning:"Discipline · the forging of self",          color:"#B5512A" },
  { num:6,  name:"Orvyn Foltier",  short:"Foltier",  pro:"FOL-teer",   meaning:"Truth · words are weighed here",            color:"#C4A35A" },
  { num:7,  name:"Orvyn Ozravyn",  short:"Ozravyn",  pro:"oz-RAH-vin", meaning:"Rest · silence as a sacred act",            color:"#6B8F9E" },
  { num:8,  name:"Orvyn Kelthuun", short:"Kelthuun", pro:"KEL-thoon",  meaning:"Wealth · abundance recognized",             color:"#A07840" },
  { num:9,  name:"Orvyn Vrezmul",  short:"Vrezmul",  pro:"VREZ-mul",   meaning:"Family · bonds are renewed",                color:"#7E6E8C" },
  { num:10, name:"Orvyn Phaelix",  short:"Phaelix",  pro:"FAY-lix",    meaning:"Legacy · what is built for others",         color:"#4A7C59" },
  { num:11, name:"Orvyn Zorvund",  short:"Zorvund",  pro:"ZOR-vund",   meaning:"Fire · courage is tested",                  color:"#C4502A" },
  { num:12, name:"Orvyn Ithqal",   short:"Ithqal",   pro:"ITH-kwahl",  meaning:"Wisdom · the harvest of experience",        color:"#9E8060" },
  { num:13, name:"Orvyn Velthos",  short:"Velthos",  pro:"VEL-thos",   meaning:"Transition · the year releases itself",     color:"#6A7A8A" },
];

const DAYS = [
  { num:1, name:"Dornev",    pro:"DOR-nev",     meaning:"Intention",  symbol:"◈", desc:"Set your week" },
  { num:2, name:"Uxvel",     pro:"UX-vel",      meaning:"Labor",      symbol:"⚒", desc:"Do the work" },
  { num:3, name:"Thrakim",   pro:"THRAK-im",    meaning:"Depth",      symbol:"↓", desc:"Go deeper" },
  { num:4, name:"Queldrove", pro:"KWEL-drohv",  meaning:"Reflection", symbol:"◉", desc:"Mid-week pause" },
  { num:5, name:"Vezmari",   pro:"vez-MAH-ree", meaning:"Connection", symbol:"⟡", desc:"Serve others" },
  { num:6, name:"Orvith",    pro:"OR-vith",     meaning:"Creation",   symbol:"✦", desc:"Build legacy" },
  { num:7, name:"Solvarun",  pro:"sol-VAR-un",  meaning:"Stillness",  symbol:"★", desc:"Sacred rest" },
];

const HOLIDAYS = [
  { name:"Founding Solev",    month:1,  day:1,  desc:"The Legacy's birthday" },
  { name:"Drevath Forging",   month:5,  day:28, desc:"Discipline celebration" },
  { name:"Vrezmul Gathering", month:9,  day:1,  desc:"Winter family gathering" },
  { name:"Phaelix Vigil",     month:10, day:14, desc:"Legacy Day; letters to the future" },
  { name:"Zorvund Trial",     month:11, day:8,  desc:"Coming-of-age ceremonies" },
  { name:"Ithqal Harvest",    month:12, day:7,  desc:"Gratitude Festival" },
  { name:"Ithqal Harvest",    month:12, day:14, desc:"Gratitude Festival" },
  { name:"Ithqal Harvest",    month:12, day:21, desc:"Gratitude Festival" },
  { name:"Ithqal Harvest",    month:12, day:28, desc:"Gratitude Festival" },
  { name:"Velthos Eve",       month:13, day:28, desc:"Last day of the year" },
];

const LIFE_AGES = [
  { name:"Soleth Age", range:"0–5 VR",   desc:"The awakening years" },
  { name:"Muvrak Age", range:"6–12 VR",  desc:"The rooting years" },
  { name:"Tharvel Age",range:"13–20 VR", desc:"The motion years" },
  { name:"Quelnis Age",range:"21–29 VR", desc:"The questioning years" },
  { name:"Drevath Age",range:"30–45 VR", desc:"The forging years" },
  { name:"Kelthuun Age",range:"46–60 VR",desc:"The wealth years" },
  { name:"Ithqal Age", range:"61–75 VR", desc:"The wisdom years" },
  { name:"Velthos Age",range:"76+ VR",   desc:"The transition years" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const ANCHOR = new Date(2011, 1, 2);

function isKrexYear(y) { return y === 0 || (y % 4) !== 3; }

function gregorianToVeltarun(date) {
  const totalDays = Math.floor((date - ANCHOR) / 86400000);
  if (totalDays < 0) return null;
  let rem = totalDays, vY = 0;
  while (true) {
    const diy = isKrexYear(vY) ? 365 : 364;
    if (rem < diy) break;
    rem -= diy; vY++;
  }
  if (isKrexYear(vY) && rem === 364) return { year:vY, month:"KX", day:1, isKrex:true };
  return { year:vY, month:Math.floor(rem/28)+1, day:(rem%28)+1, isKrex:false, dow:(rem%7)+1 };
}

function getHoliday(month, day) { return HOLIDAYS.find(h => h.month===month && h.day===day); }
function pad(n, l=2) { return String(n).padStart(l,"0"); }

// ─── PALETTE ─────────────────────────────────────────────────────────────────

const P = {
  bg:"#0F0C09", surface:"#1A1510", surfaceAlt:"#1E1812",
  border:"#2E2416", borderMid:"#3A2E1E",
  gold:"#C4956A", goldLight:"#E8C49A", goldDim:"#7A5A32",
  text:"#D4C4A8", textDim:"#7A6A54", textFaint:"#3A2E1E",
  rest:"#C4A8E8", restBg:"#1E1828",
  holiday:"#E8A84A", holidayBg:"#221808",
  today:"#8AE8A8", todayBg:"#0E1E10",
  krex:"#6AB4E8", krexBg:"#081422",
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab]           = useState("cal");
  const [year, setYear]         = useState(0);
  const [month, setMonth]       = useState(1);
  const [today, setToday]       = useState(null);
  const [selected, setSelected] = useState(null); // { day, holiday, dayObj }
  const touchStartX             = useRef(null);

  useEffect(() => {
    const t = gregorianToVeltarun(new Date());
    if (t && !t.isKrex) { setToday(t); setYear(t.year); setMonth(t.month); }
  }, []);

  // Swipe navigation on calendar
  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? nextMonth() : prevMonth(); }
    touchStartX.current = null;
  }

  function prevMonth() {
    if (month === 1) { setMonth(13); setYear(y => Math.max(0, y-1)); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 13) { setMonth(1); setYear(y => y+1); }
    else setMonth(m => m+1);
  }
  function goToday() { if (today) { setYear(today.year); setMonth(today.month); setTab("cal"); } }

  const mData = MONTHS[month-1];
  const isToday = (d) => today && !today.isKrex && today.year===year && today.month===month && today.day===d;
  const todayDayObj = today ? DAYS[(today.day-1)%7] : null;
  const vrStr = today ? `VR ${pad(today.year,4)} · ${pad(today.month)} · ${pad(today.day)}` : "";

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background:P.bg, minHeight:"100vh", fontFamily:"Georgia,serif", color:P.text,
                  display:"flex", flexDirection:"column", maxWidth:"480px", margin:"0 auto",
                  position:"relative" }}>

      {/* ── HEADER ── */}
      <div style={{ background:`linear-gradient(180deg,#1A1208,${P.bg})`,
                    borderBottom:`1px solid ${P.border}`, padding:"16px 16px 12px" }}>
        <div style={{ fontSize:"9px", letterSpacing:"4px", color:P.goldDim, textTransform:"uppercase", marginBottom:"4px" }}>
          The Sanskar Legacy
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"8px" }}>
          <div>
            <div style={{ fontSize:"22px", color:P.goldLight, letterSpacing:"1px", lineHeight:1.1 }}>
              THE VELTARUN
            </div>
            <div style={{ fontSize:"22px", color:P.goldLight, letterSpacing:"1px" }}>
              CALENDAR
            </div>
          </div>
          {today && (
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:"11px", color:P.gold, letterSpacing:"1px" }}>{vrStr}</div>
              {todayDayObj && (
                <div style={{ fontSize:"10px", color:P.textDim, marginTop:"2px" }}>
                  {todayDayObj.symbol} {todayDayObj.name}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:"72px" }}>

        {/* ══ CALENDAR TAB ══ */}
        {tab === "cal" && (
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

            {/* Month nav */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"10px 12px", background:P.surface,
                          borderBottom:`1px solid ${P.border}` }}>
              <button onClick={prevMonth} style={btnStyle}>‹</button>
              <div style={{ textAlign:"center", flex:1 }}>
                <div style={{ fontSize:"16px", color:P.goldLight, letterSpacing:"1px" }}>{mData.name}</div>
                <div style={{ fontSize:"10px", color:P.textDim, fontStyle:"italic", marginTop:"2px" }}>
                  {mData.pro} · {mData.meaning.split("·")[1]?.trim()}
                </div>
              </div>
              <button onClick={nextMonth} style={btnStyle}>›</button>
            </div>

            {/* Year row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"8px 16px", borderBottom:`1px solid ${P.border}`,
                          background:P.surfaceAlt }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <button onClick={()=>setYear(y=>Math.max(0,y-1))} style={smallBtnStyle}>−</button>
                <div style={{ fontSize:"13px", color:P.gold, letterSpacing:"2px" }}>
                  VR {pad(year,4)}
                  <span style={{ fontSize:"10px", color:P.textDim, marginLeft:"6px" }}>
                    {isKrexYear(year) ? "Krex Year" : "Standard"}
                  </span>
                </div>
                <button onClick={()=>setYear(y=>y+1)} style={smallBtnStyle}>+</button>
              </div>
              <button onClick={goToday}
                style={{ ...smallBtnStyle, fontSize:"9px", letterSpacing:"2px",
                         color:P.today, borderColor:P.today+"66", padding:"4px 10px" }}>
                TODAY
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)",
                          borderBottom:`1px solid ${P.border}`, background:P.surface }}>
              {DAYS.map(d => (
                <div key={d.num} style={{ textAlign:"center", padding:"8px 2px 6px",
                  fontSize:"9px", letterSpacing:"1px", textTransform:"uppercase",
                  color: d.num===7 ? P.rest : P.goldDim }}>
                  {d.name.slice(0,3)}
                  <div style={{ fontSize:"8px", marginTop:"2px", opacity:0.7 }}>{d.symbol}</div>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {[[1,2,3,4,5,6,7],[8,9,10,11,12,13,14],[15,16,17,18,19,20,21],[22,23,24,25,26,27,28]].map((week,wi) => (
              <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)",
                                     borderBottom:`1px solid ${P.border}` }}>
                {week.map(d => {
                  const isRest = d%7===0;
                  const isTod  = isToday(d);
                  const hol    = getHoliday(month, d);
                  const isSel  = selected?.day === d;
                  return (
                    <div key={d}
                      onClick={() => setSelected(isSel ? null : { day:d, holiday:hol, dayObj:DAYS[(d-1)%7] })}
                      style={{
                        background: isTod ? P.todayBg : hol ? P.holidayBg : isRest ? P.restBg : "transparent",
                        borderRight:`1px solid ${P.border}`,
                        padding:"6px 4px", minHeight:"52px",
                        cursor:"pointer", position:"relative",
                        outline: isSel ? `1px solid ${P.gold}` : "none",
                        transition:"background 0.15s",
                      }}>
                      {/* Day number */}
                      <div style={{ fontSize:"16px", lineHeight:1,
                        color: isTod ? P.today : isRest ? P.rest : P.text,
                        fontWeight: isTod ? "bold" : "normal" }}>{d}</div>
                      {/* Day name abbrev */}
                      <div style={{ fontSize:"7px", color: isRest ? P.rest : P.textDim,
                                    letterSpacing:"0.5px", marginTop:"2px" }}>
                        {DAYS[(d-1)%7].name.slice(0,3)}
                      </div>
                      {/* Holiday dot */}
                      {hol && (
                        <div style={{ position:"absolute", bottom:"4px", right:"4px",
                                      width:"5px", height:"5px", borderRadius:"50%",
                                      background:P.holiday }} />
                      )}
                      {/* Today indicator */}
                      {isTod && (
                        <div style={{ position:"absolute", top:"2px", right:"3px",
                                      fontSize:"6px", color:P.today, letterSpacing:"0.5px" }}>▲</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Krex day */}
            {month===13 && isKrexYear(year) && (
              <div style={{ margin:"12px", background:P.krexBg,
                            border:`1px solid ${P.krex}44`, borderRadius:"4px", padding:"14px" }}>
                <div style={{ fontSize:"10px", letterSpacing:"3px", color:P.krex,
                              textTransform:"uppercase", marginBottom:"4px" }}>
                  Krex Solev · VR {pad(year,4)} / KX / 01
                </div>
                <div style={{ fontSize:"11px", color:P.textDim, fontStyle:"italic", lineHeight:1.5 }}>
                  The day between years. Not part of any Orvyn or Droven.
                  Sacred family assembly & covenant renewal.
                </div>
              </div>
            )}

            {/* Selected day detail */}
            {selected && (
              <div style={{ margin:"12px", background:P.surfaceAlt,
                            border:`1px solid ${P.borderMid}`, borderRadius:"4px", padding:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:"11px", color:P.goldDim, letterSpacing:"2px",
                                  textTransform:"uppercase", marginBottom:"4px" }}>
                      VR {pad(year,4)} · {pad(month)} · {pad(selected.day)}
                    </div>
                    <div style={{ fontSize:"20px", color:P.goldLight }}>
                      {selected.dayObj.symbol} {selected.dayObj.name}
                    </div>
                    <div style={{ fontSize:"12px", color:P.textDim, fontStyle:"italic", marginTop:"2px" }}>
                      {selected.dayObj.meaning} · {selected.dayObj.desc}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    style={{ background:"none", border:"none", color:P.textDim,
                             fontSize:"18px", cursor:"pointer", padding:"0 4px" }}>×</button>
                </div>
                {selected.holiday && (
                  <div style={{ marginTop:"10px", paddingTop:"10px",
                                borderTop:`1px solid ${P.border}` }}>
                    <div style={{ fontSize:"10px", color:P.holiday,
                                  textTransform:"uppercase", letterSpacing:"2px", marginBottom:"2px" }}>
                      ● {selected.holiday.name}
                    </div>
                    <div style={{ fontSize:"11px", color:P.textDim, fontStyle:"italic" }}>
                      {selected.holiday.desc}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ MONTHS TAB ══ */}
        {tab === "months" && (
          <div style={{ padding:"12px" }}>
            <SectionTitle>The Thirteen Orvyni</SectionTitle>
            {MONTHS.map(m => (
              <div key={m.num}
                onClick={() => { setMonth(m.num); if(today) setYear(today.year); setTab("cal"); }}
                style={{ background:P.surfaceAlt, border:`1px solid ${P.border}`,
                         borderRadius:"4px", padding:"12px 14px", marginBottom:"6px",
                         borderLeft: today && !today.isKrex && today.month===m.num
                           ? `3px solid ${m.color}` : `3px solid transparent`,
                         cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:"9px", color:P.textDim, letterSpacing:"2px",
                                  textTransform:"uppercase", marginBottom:"3px" }}>
                      Month {pad(m.num)} · {m.pro}
                    </div>
                    <div style={{ fontSize:"15px", color:P.goldLight }}>{m.name}</div>
                    <div style={{ fontSize:"11px", color:P.textDim, fontStyle:"italic", marginTop:"3px" }}>
                      {m.meaning}
                    </div>
                  </div>
                  <div style={{ width:"10px", height:"10px", borderRadius:"50%",
                                background:m.color, flexShrink:0, marginTop:"4px" }} />
                </div>
              </div>
            ))}
            <QuoteBox
              text="Thirteen is the number of wholeness. Twelve is the world's number — of the ordinary. Thirteen is one beyond ordinary."
              attr="Sanskar Singh · VR 0000"
            />
          </div>
        )}

        {/* ══ DAYS TAB ══ */}
        {tab === "days" && (
          <div style={{ padding:"12px" }}>
            <SectionTitle>The Seven Solevi</SectionTitle>
            {DAYS.map(d => (
              <div key={d.num} style={{ display:"flex", gap:"12px", alignItems:"flex-start",
                                        padding:"12px 14px", marginBottom:"6px",
                                        background:P.surfaceAlt,
                                        border:`1px solid ${d.num===7 ? P.rest+"44" : P.border}`,
                                        borderRadius:"4px",
                                        borderLeft: d.num===7
                                          ? `3px solid ${P.rest}`
                                          : today && todayDayObj?.name===d.name
                                          ? `3px solid ${P.today}`
                                          : `3px solid transparent` }}>
                <div style={{ fontSize:"22px", color:d.num===7?P.rest:P.gold,
                              lineHeight:1, flexShrink:0, width:"28px", textAlign:"center" }}>
                  {d.symbol}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"15px", color:d.num===7?P.rest:P.goldLight }}>{d.name}</div>
                  <div style={{ fontSize:"10px", color:P.textDim, fontStyle:"italic",
                                letterSpacing:"1px", marginTop:"2px" }}>{d.pro}</div>
                  <div style={{ display:"flex", gap:"12px", marginTop:"6px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"11px", color:P.text }}>{d.meaning}</span>
                    <span style={{ fontSize:"11px", color:P.goldDim, fontStyle:"italic" }}>{d.desc}</span>
                  </div>
                </div>
              </div>
            ))}
            <QuoteBox
              text="Day 01 of any month is always Dornev. Day 07 is always Solvarun. The calendar teaches the values by simply being used."
              attr="Sanskar Singh · VR 0000"
            />
          </div>
        )}

        {/* ══ HOLIDAYS TAB ══ */}
        {tab === "hols" && (
          <div style={{ padding:"12px" }}>
            <SectionTitle>Legacy Holidays</SectionTitle>
            {[...new Map(HOLIDAYS.map(h=>[`${h.month}-${h.name}`,h])).values()].map((h,i) => (
              <div key={i} style={{ background:P.holidayBg,
                                    border:`1px solid ${P.holiday}44`,
                                    borderRadius:"4px", padding:"12px 14px", marginBottom:"6px",
                                    borderLeft:`3px solid ${P.holiday}` }}>
                <div style={{ fontSize:"9px", color:P.holiday, letterSpacing:"2px",
                              textTransform:"uppercase", marginBottom:"3px" }}>
                  Month {pad(h.month)} · Day {pad(h.day)}
                </div>
                <div style={{ fontSize:"14px", color:P.goldLight }}>{h.name}</div>
                <div style={{ fontSize:"11px", color:P.textDim, fontStyle:"italic", marginTop:"3px" }}>
                  {h.desc}
                </div>
              </div>
            ))}

            <SectionTitle style={{ marginTop:"24px" }}>Cycle of Life</SectionTitle>
            {LIFE_AGES.map((a,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px",
                                    padding:"10px 14px", marginBottom:"4px",
                                    background:P.surfaceAlt,
                                    border:`1px solid ${P.border}`, borderRadius:"4px" }}>
                <div style={{ width:"70px", fontSize:"10px", color:P.gold,
                              letterSpacing:"1px", flexShrink:0 }}>{a.range}</div>
                <div>
                  <div style={{ fontSize:"13px", color:P.goldLight }}>{a.name}</div>
                  <div style={{ fontSize:"11px", color:P.textDim, fontStyle:"italic" }}>{a.desc}</div>
                </div>
              </div>
            ))}

            <QuoteBox
              text="Count your Solevi. Cherish your Solvarun. Dread no Velthos, for every ending is a Soleth waiting to happen."
              attr="Sanskar Singh · VR 0000 / 01 / 01"
            />
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
                    width:"100%", maxWidth:"480px",
                    background:P.surface, borderTop:`1px solid ${P.borderMid}`,
                    display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                    zIndex:100 }}>
        {[
          { id:"cal",    label:"Calendar", icon:"▦" },
          { id:"months", label:"Months",   icon:"◌" },
          { id:"days",   label:"Days",     icon:"◈" },
          { id:"hols",   label:"Holidays", icon:"★" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background:"none", border:"none", cursor:"pointer",
                     padding:"10px 4px 12px", display:"flex", flexDirection:"column",
                     alignItems:"center", gap:"3px",
                     color: tab===t.id ? P.goldLight : P.textDim,
                     borderTop: tab===t.id ? `2px solid ${P.gold}` : "2px solid transparent",
                     fontFamily:"Georgia,serif", transition:"color 0.15s" }}>
            <span style={{ fontSize:"16px" }}>{t.icon}</span>
            <span style={{ fontSize:"9px", letterSpacing:"1px", textTransform:"uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

// ─── TINY HELPERS ────────────────────────────────────────────────────────────

const P2 = { bg:"#0F0C09", surface:"#1A1510", surfaceAlt:"#1E1812", border:"#2E2416",
             gold:"#C4956A", goldLight:"#E8C49A", goldDim:"#7A5A32",
             text:"#D4C4A8", textDim:"#7A6A54", textFaint:"#3A2E1E" };

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize:"10px", letterSpacing:"3px", color:P2.goldDim,
                  textTransform:"uppercase", marginBottom:"12px", marginTop:"4px",
                  paddingBottom:"8px", borderBottom:`1px solid ${P2.border}` }}>
      {children}
    </div>
  );
}

function QuoteBox({ text, attr }) {
  return (
    <div style={{ borderLeft:`2px solid ${P2.goldDim}`, paddingLeft:"14px",
                  margin:"24px 0 8px", color:P2.textDim, fontStyle:"italic",
                  lineHeight:1.6, fontSize:"12px" }}>
      <div>{text}</div>
      <div style={{ marginTop:"8px", fontSize:"9px", letterSpacing:"2px",
                    color:P2.textFaint, fontStyle:"normal", textTransform:"uppercase" }}>
        — {attr}
      </div>
    </div>
  );
}

const btnStyle = {
  background:"none", border:`1px solid #3A2E1E`, color:"#C4956A",
  padding:"6px 14px", cursor:"pointer", fontSize:"20px", borderRadius:"2px",
  fontFamily:"Georgia,serif", lineHeight:1,
};

const smallBtnStyle = {
  background:"none", border:`1px solid #3A2E1E`, color:"#C4956A",
  padding:"3px 10px", cursor:"pointer", fontSize:"14px", borderRadius:"2px",
  fontFamily:"Georgia,serif",
};
