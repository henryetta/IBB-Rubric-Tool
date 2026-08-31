// ibb_shared.js — shared constants, Supabase client, and helper functions
// Included by both index.html (respondents) and admin.html (researcher)

const ITEMS = [
  {code:'DFE1', text:'The consequences of this behaviour are farther in time and place from the moment I perform it.', barrier:'DFE'},
  {code:'DFE2', text:'The effects of this behaviour are difficult to see immediately.', barrier:'DFE'},
  {code:'DFE3', text:'Performing this behaviour once seems unlikely to make a noticeable difference.', barrier:'DFE'},
  {code:'DFE4', text:'It is difficult to connect this behaviour with its eventual consequences.', barrier:'DFE'},
  {code:'DFE5', text:'The consequences of this behaviour rarely come to mind when I decide how to act.', barrier:'DFE'},
  {code:'LKA1', text:'I am uncertain about how to perform this behaviour correctly.', barrier:'LKA'},
  {code:'LKA2', text:'I am uncertain about what actions this behaviour requires.', barrier:'LKA'},
  {code:'LKA3', text:'I am uncertain about the situations in which this behaviour should be performed.', barrier:'LKA'},
  {code:'LKA4', text:'I lack information about the consequences of performing or not performing this behaviour.', barrier:'LKA'},
  {code:'LKA5', text:'The information or guidance available about this behaviour is difficult to understand.', barrier:'LKA'},
  {code:'POI1', text:'Performing this behaviour requires too much effort.', barrier:'POI'},
  {code:'POI2', text:'Performing this behaviour is inconvenient within my normal routine.', barrier:'POI'},
  {code:'POI3', text:'Performing this behaviour takes more time than I would prefer.', barrier:'POI'},
  {code:'POI4', text:'The actions required to perform this behaviour are troublesome.', barrier:'POI'},
  {code:'POI5', text:'It is difficult to perform this behaviour in the situations where it is needed.', barrier:'POI'},
];
const ATTENTION_ITEMS = [
  {code:'ATTN1', text:'This is an attention check. Please select "Agree" for this item.', target:4},
  {code:'ATTN2', text:'This is an attention check. Please select "Disagree" for this item.', target:2},
];
const SCALE = [
  {v:1, l:'Strongly\ndisagree'}, {v:2, l:'Disagree'}, {v:3, l:'Neither agree\nnor disagree'},
  {v:4, l:'Agree'}, {v:5, l:'Strongly\nagree'}
];
const BARRIER_COLOR = {DFE:'#B4573F', LKA:'#C08A2E', POI:'#3E8E86'};

const SUPABASE_URL = 'https://alrlqydlnlwpcajtilkb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscmxxeWRsbmx3cGNhanRpbGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNjM2MjAsImV4cCI6MjEwMzYzOTYyMH0.CzplaeyQfuyaNTln8BmRLtlOvAwfCCk9eYqMI5QFFZY';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function computeProfile(responses){
  const sums = {DFE:0, LKA:0, POI:0};
  ITEMS.forEach(it => sums[it.barrier] += responses[it.code]);
  return { DFE: sums.DFE/5, LKA: sums.LKA/5, POI: sums.POI/5 };
}
function computeAttention(responses){
  const results = ATTENTION_ITEMS.map(a => ({ code:a.code, passed: responses[a.code] === a.target }));
  return { results, failCount: results.filter(r=>!r.passed).length };
}
function mean(arr){ return arr.reduce((a,b)=>a+b,0)/arr.length; }
function stdev(arr){
  if(arr.length<2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s,v)=>s+(v-m)*(v-m),0)/(arr.length-1));
}
function domainAggregate(respondents){
  const out = {};
  ['DFE','LKA','POI'].forEach(b=>{
    const vals = respondents.map(r=>r.profile[b]);
    out[b] = { mean: vals.length?mean(vals):0, sd: stdev(vals), n: vals.length };
  });
  return out;
}

function radarSVG(profile, size=260){
  const cx=size/2, cy=size/2, maxR=size*0.36, minR=size*0.06;
  const angles = {DFE:-90, LKA:30, POI:150};
  const toPt = (val, angleDeg) => {
    const r = minR + (maxR-minR) * ((val-1)/4);
    const rad = angleDeg*Math.PI/180;
    return [cx + r*Math.cos(rad), cy + r*Math.sin(rad)];
  };
  const gridRings = [1,2,3,4,5].map(v=>{
    const pts = ['DFE','LKA','POI'].map(b=>toPt(v,angles[b]).join(',')).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#DDE2E9" stroke-width="1"/>`;
  }).join('');
  const axisLines = ['DFE','LKA','POI'].map(b=>{
    const [x,y] = toPt(5, angles[b]);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#DDE2E9" stroke-width="1"/>`;
  }).join('');
  const dataPts = ['DFE','LKA','POI'].map(b=>toPt(profile[b], angles[b]).join(',')).join(' ');
  const labels = ['DFE','LKA','POI'].map(b=>{
    const [x,y] = toPt(5.9, angles[b]);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="IBM Plex Mono, monospace" font-size="13" font-weight="600" fill="${BARRIER_COLOR[b]}">${b}</text>`;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${gridRings}${axisLines}
    <polygon points="${dataPts}" fill="#3B5BA5" fill-opacity="0.22" stroke="#3B5BA5" stroke-width="2"/>
    ${labels}
  </svg>`;
}

// Data access — used by both pages
async function fetchDomainMeta(){
  const { data, error } = await sb.from('domains').select('*').order('created_at');
  if(error) throw error;
  const domains = {};
  data.forEach(d => { domains[d.name] = { scenario: d.scenario, behaviour: d.behaviour }; });
  return domains;
}
async function saveRespondentRemote(domainName, prolificId, profile, attention, durationSeconds, surveyStartedAt){
  const { data, error } = await sb.rpc('submit_respondent', {
    p_domain_name: domainName,
    p_prolific_id: prolificId,
    p_dfe: profile.DFE, p_lka: profile.LKA, p_poi: profile.POI,
    p_attention_failed: attention.failCount, p_attention_total: ATTENTION_ITEMS.length,
    p_started_at: new Date(surveyStartedAt).toISOString(),
    p_duration_seconds: durationSeconds
  });
  if(error) throw error;
  return data; // the respondent_code
}
