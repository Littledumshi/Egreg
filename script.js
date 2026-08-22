const F=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const ADMIN='admin',APASS='admin1234';
let isLogin=true,cur=null,viewPId=null,prevTab='home',fMode='all',vUser=null,chatWith=null,pfTab='posts';

// LOAD SETTINGS
let settings=JSON.parse(localStorage.getItem('yg14_settings')||JSON.stringify({
  accent:'#1d9bf0',theme:'dark',fontSize:15,
  privacy:{isPrivate:false,showOnline:true,showLikes:true,dmFrom:'all',readReceipt:true},
  notifs:{like:true,comment:true,repost:true,follow:true,dm:true}
}));

let posts=JSON.parse(localStorage.getItem('yg14_p')||'[]');
let users=JSON.parse(localStorage.getItem('yg14_u')||'[]');
let notifs=JSON.parse(localStorage.getItem('yg14_n')||'[]');
let dms=JSON.parse(localStorage.getItem('yg14_d')||'{}');
let bms=JSON.parse(localStorage.getItem('yg14_b')||'{}');
let banned=JSON.parse(localStorage.getItem('yg14_ban')||'[]');

if(!users.find(u=>u.username===ADMIN))users.push({username:ADMIN,password:APASS,name:'ادمین ایگرگ',bio:'مدیر شبکه اجتماعی ایگرگ 🛡️',location:'تهران، ایران',website:'',avatar:'',banner:'',following:[],followers:[],isAdmin:true,verified:true,premium:false});

const svAll=()=>{
  localStorage.setItem('yg14_p',JSON.stringify(posts));
  localStorage.setItem('yg14_u',JSON.stringify(users));
  localStorage.setItem('yg14_n',JSON.stringify(notifs));
  localStorage.setItem('yg14_d',JSON.stringify(dms));
  localStorage.setItem('yg14_b',JSON.stringify(bms));
  localStorage.setItem('yg14_ban',JSON.stringify(banned));
  localStorage.setItem('yg14_settings',JSON.stringify(settings))};
svAll();

// THEMES
const THEMES={
  dark:{bg:'#000',bg2:'#0a0a0a',bg3:'#111',bg4:'#1a1a1a',text:'#e7e9ea',text2:'#71767b',text3:'#3f4144',border:'#2f3336',bgBlur:'rgba(0,0,0,0.85)'},
  dim:{bg:'#15202b',bg2:'#1e2732',bg3:'#273340',bg4:'#2f3b47',text:'#f7f9f9',text2:'#8899a6',text3:'#556677',border:'#38444d',bgBlur:'rgba(21,32,43,0.85)'},
  blue:{bg:'#0d1b2e',bg2:'#112240',bg3:'#1a2f50',bg4:'#1d3556',text:'#ccd6f6',text2:'#8892b0',text3:'#4a5568',border:'#1d3556',bgBlur:'rgba(13,27,46,0.85)'},
  amoled:{bg:'#000000',bg2:'#050505',bg3:'#0a0a0a',bg4:'#111111',text:'#ffffff',text2:'#888888',text3:'#444444',border:'#1a1a1a',bgBlur:'rgba(0,0,0,0.9)'}};

function applyTheme(t){
  const th=THEMES[t]||THEMES.dark;
  const r=document.documentElement.style;
  r.setProperty('--bg',th.bg);r.setProperty('--bg2',th.bg2);r.setProperty('--bg3',th.bg3);r.setProperty('--bg4',th.bg4);
  r.setProperty('--text',th.text);r.setProperty('--text2',th.text2);r.setProperty('--text3',th.text3);
  r.setProperty('--border',th.border);r.setProperty('--bg-blur',th.bgBlur)}

function applyAllSettings(){
  const r=document.documentElement.style;
  r.setProperty('--accent',settings.accent||'#1d9bf0');
  r.setProperty('--font-size',(settings.fontSize||15)+'px');
  r.setProperty('--red','#f91880');r.setProperty('--green','#00ba7c');
  r.setProperty('--gold','#FFB800');r.setProperty('--gold-bg','rgba(255,184,0,0.1)');
  r.setProperty('--red-bg','rgba(249,24,128,0.12)');r.setProperty('--green-bg','rgba(0,186,124,0.12)');
  applyTheme(settings.theme||'dark')}
applyAllSettings();

const COLORS=['#1d9bf0','#7c4dff','#e91e8c','#00897b','#ff6d00','#c62828','#1565c0'];
const gc=u=>{if(u===ADMIN)return'#ff7043';const i=users.findIndex(x=>x.username===u);return COLORS[Math.abs(i)%COLORS.length]};
const isPrem=u=>{const x=users.find(q=>q.username===u);return x&&x.premium};
const isVer=u=>{const x=users.find(q=>q.username===u);return x&&x.verified};
const isBan=u=>banned.includes(u);
const isFlw=(a,b)=>{const u=users.find(x=>x.username===a);return u&&(u.following||[]).includes(b)};
const dmK=(a,b)=>[a,b].sort().join('__');
const isBmed=id=>cur&&(bms[cur.username]||[]).includes(id);
const pmx=()=>cur&&isPrem(cur.username)?1000:280;
const TABS=['home','search','notif','dm','chat','bm','profile','post','fl-list','settings'];

const VB=`<span class="badge-v" title="تیک آبی"><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M10.5 6L9.5 4.73L9.7 3.12L8.13 2.73L7.28 1.38L6 1.93L4.72 1.38L3.87 2.73L2.3 3.12L2.5 4.73L1.5 6L2.5 7.27L2.3 8.88L3.87 9.27L4.72 10.62L6 10.07L7.28 10.62L8.13 9.27L9.7 8.88L9.5 7.27L10.5 6Z" fill="white" stroke="white" stroke-width="0.5"/><path d="M4.5 6L5.5 7L7.5 5" stroke="var(--accent)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const GB=`<span class="badge-g" title="پرمیوم"><svg width="11" height="11" viewBox="0 0 20 20" fill="#fff"><path d="M10 1L12.39 7.26L19 8.27L14.5 12.64L15.78 19L10 15.77L4.22 19L5.5 12.64L1 8.27L7.61 7.26L10 1Z"/></svg></span>`;
const AB=`<span class="badge-a" title="ادمین"><svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"/></svg></span>`;
function vBadges(u){const usr=users.find(x=>x.username===u);if(!usr)return'';let b='';if(usr.isAdmin)b+=AB;if(usr.verified)b+=VB;if(usr.premium)b+=GB;return b}

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',2500)}
function openM(id){document.getElementById(id).classList.add('open')}
function closeM(id){document.getElementById(id).classList.remove('open')}

function avEl(el,u){
  const user=users.find(x=>x.username===u);
  if(user&&user.avatar){el.innerHTML=`<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;el.style.background='transparent'}
  else{el.textContent=user?user.name.charAt(0):'؟';el.style.background=gc(u)}
  if(isPrem(u))el.style.boxShadow='0 0 0 2px #FFB800';
  else if(isVer(u))el.style.boxShadow='0 0 0 2px '+settings.accent;
  else el.style.boxShadow='none'}

function avHTML(u,cls=''){
  const user=users.find(x=>x.username===u);
  const bg=user&&user.avatar?'transparent':gc(u);
  const inner=user&&user.avatar?`<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:user?user.name.charAt(0):'؟';
  let ring=isPrem(u)?'box-shadow:0 0 0 2px #FFB800;':isVer(u)?`box-shadow:0 0 0 2px ${settings.accent};`:'';
  return`<div class="ava ${cls}" style="background:${bg};flex-shrink:0;${ring}">${inner}</div>`}

function extractTags(t){return(t.match(/#[\u0600-\u06FFa-zA-Z0-9_]+/g)||[]).map(x=>x.slice(1))}
function getTrends(){const c={};posts.forEach(p=>extractTags(p.text).forEach(t=>{c[t]=(c[t]||0)+1}));return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8)}
function htText(t){return t.replace(/</g,'&lt;').replace(/#([\u0600-\u06FFa-zA-Z0-9_]+)/g,'<span class="hashtag" onclick="event.stopPropagation();openHT(\'$1\')">#$1</span>')}
function tAgo(iso){const d=Math.floor((Date.now()-new Date(iso))/1000);if(d<60)return'همین الان';if(d<3600)return F(Math.floor(d/60))+'د';if(d<86400)return F(Math.floor(d/3600))+'س';return F(Math.floor(d/86400))+'ر'}

function toggleAuth(){isLogin=!isLogin;document.getElementById('asub').textContent=isLogin?'به ایگرگ خوش اومدی':'یه حساب جدید بساز';document.getElementById('abtn').textContent=isLogin?'ورود':'ثبت‌نام';document.getElementById('nfield').style.display=isLogin?'none':'block';document.getElementById('aswitch').innerHTML=isLogin?'حساب نداری؟ <span onclick="toggleAuth()">ثبت‌نام کن</span>':'حساب داری؟ <span onclick="toggleAuth()">وارد شو</span>';document.getElementById('aerr').textContent=''}

function authSubmit(){
  const u=document.getElementById('iuser').value.trim().replace(/\s/g,'');
  const p=document.getElementById('ipass').value;
  const n=document.getElementById('iname').value.trim();
  const err=document.getElementById('aerr');
  if(!u){err.textContent='نام کاربری رو وارد کن';return}
  if(p.length<6){err.textContent='رمز باید حداقل ۶ کاراکتر باشه';return}
  if(isBan(u)){err.textContent='این حساب مسدود شده';return}
  if(isLogin){const f=users.find(x=>x.username===u&&x.password===p);if(!f){err.textContent='نام کاربری یا رمز اشتباهه';return}cur=f}
  else{if(u===ADMIN){err.textContent='این نام کاربری رزرو شده';return}if(!n){err.textContent='نام نمایشی رو وارد کن';return}if(users.find(x=>x.username===u)){err.textContent='این نام کاربری گرفته شده';return}cur={username:u,password:p,name:n,bio:'',location:'',website:'',avatar:'',banner:'',following:[],followers:[],isAdmin:false,verified:false,premium:false};users.push(cur);svAll()}
  err.textContent='';showMain()}

function showMain(){
  document.getElementById('s-auth').classList.remove('active');
  document.getElementById('s-main').classList.add('active');
  ['sav','cav','cmav','chat-av'].forEach(id=>{const el=document.getElementById(id);if(el)avEl(el,cur.username)});
  goTab('home');updateND();updateDMD()}

function goTab(t){
  TABS.forEach(x=>{document.getElementById('tab-'+x).style.display='none';const b=document.getElementById('nb-'+x);if(b)b.classList.remove('active')});
  document.getElementById('tab-'+t).style.display='block';
  const b=document.getElementById('nb-'+t);if(b)b.classList.add('active');
  if(t==='home')renderFeed();
  if(t==='search'){document.getElementById('sinput').value='';renderTrends()}
  if(t==='notif'){renderNotifs();notifs.forEach(n=>{if(n.to===cur.username)n.read=true});svAll();updateND()}
  if(t==='dm')renderDML();
  if(t==='bm')renderBM();
  if(t==='profile'){vUser=cur.username;renderProfile(cur.username)}
  if(t==='post')renderPD();
  if(t==='settings')initSettings()}

function goBack(){goTab(prevTab||'home')}
function sf(m){fMode=m;document.getElementById('ft-all').className='tab'+(m==='all'?' active':'');document.getElementById('ft-fl').className='tab'+(m==='fl'?' active':'');renderFeed()}

// ===== SETTINGS FUNCTIONS =====
function goS(p){
  document.querySelectorAll('.spage').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.settings-sb-item').forEach(x=>x.classList.remove('active'));
  document.getElementById('sp-'+p).classList.add('active');
  document.getElementById('si-'+p).classList.add('active');
  if(p==='account')loadAccForm();
  if(p==='stats')loadStats();
  if(p==='premium')loadPremS();
  if(p==='privacy')loadPrivacyToggles();
  if(p==='notifset')loadNotifToggles();
  if(p==='appearance')loadAppearance()}

function initSettings(){goS('account')}

// Account
function loadAccForm(){
  const u=cur;
  const setV=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
  setV('acc-name',u.name);setV('acc-bio',u.bio);setV('acc-loc',u.location);setV('acc-web',u.website);
  const avPrev=document.getElementById('av-preview');
  if(avPrev){if(u.avatar){avPrev.innerHTML=`<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;avPrev.style.background='transparent'}else{avPrev.textContent=u.name.charAt(0);avPrev.style.background=gc(u.username)}}
  const banPrev=document.getElementById('banner-preview');
  const ph=document.getElementById('banner-placeholder');
  if(banPrev&&u.banner){if(ph)ph.style.display='none';const existing=banPrev.querySelector('img');if(!existing){const img=document.createElement('img');img.src=u.banner;img.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0';banPrev.appendChild(img)}}}

function uploadAv(input){
  if(!input.files||!input.files[0])return;
  const r=new FileReader();
  r.onload=e=>{
    const data=e.target.result;
    const el=document.getElementById('av-preview');
    if(el){el.innerHTML=`<img src="${data}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;el.style.background='transparent'}
    const idx=users.findIndex(x=>x.username===cur.username);
    users[idx].avatar=data;cur=users[idx];svAll();
    ['sav','cav','cmav'].forEach(id=>{const el=document.getElementById(id);if(el)avEl(el,cur.username)});
    toast('✅ عکس پروفایل آپلود شد')};
  r.readAsDataURL(input.files[0])}

function removeAv(){
  const idx=users.findIndex(x=>x.username===cur.username);
  users[idx].avatar='';cur=users[idx];svAll();
  const el=document.getElementById('av-preview');
  if(el){el.innerHTML=cur.name.charAt(0);el.style.background=gc(cur.username)}
  ['sav','cav','cmav'].forEach(id=>{const el=document.getElementById(id);if(el)avEl(el,cur.username)});
  toast('عکس حذف شد')}

function uploadBanner(input){
  if(!input.files||!input.files[0])return;
  const r=new FileReader();
  r.onload=e=>{
    const data=e.target.result;
    const banPrev=document.getElementById('banner-preview');
    const ph=document.getElementById('banner-placeholder');
    if(ph)ph.style.display='none';
    let img=banPrev.querySelector('img');
    if(!img){img=document.createElement('img');img.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0';banPrev.appendChild(img)}
    img.src=data;
    const idx=users.findIndex(x=>x.username===cur.username);
    users[idx].banner=data;cur=users[idx];svAll();
    toast('✅ بنر آپلود شد')};
  r.readAsDataURL(input.files[0])}

function saveAccount(){
  const name=document.getElementById('acc-name').value.trim();
  const bio=document.getElementById('acc-bio').value.trim();
  const loc=document.getElementById('acc-loc').value.trim();
  const web=document.getElementById('acc-web').value.trim();
  if(!name){toast('نام نمایشی نمیتونه خالی باشه');return}
  const idx=users.findIndex(x=>x.username===cur.username);
  users[idx].name=name;users[idx].bio=bio;users[idx].location=loc;users[idx].website=web;
  cur=users[idx];svAll();
  ['sav','cav','cmav'].forEach(id=>{const el=document.getElementById(id);if(el)avEl(el,cur.username)});
  toast('✅ تغییرات ذخیره شد')}

// Security
function changePass(){
  const cp=document.getElementById('cur-p').value;
  const np=document.getElementById('new-p').value;
  const np2=document.getElementById('new-p2').value;
  if(cp!==cur.password){toast('❌ رمز فعلی اشتباهه');return}
  if(np.length<6){toast('❌ رمز جدید باید حداقل ۶ کاراکتر باشه');return}
  if(np!==np2){toast('❌ تکرار رمز مطابقت ندارد');return}
  const idx=users.findIndex(x=>x.username===cur.username);
  users[idx].password=np;cur=users[idx];svAll();
  ['cur-p','new-p','new-p2'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  toast('✅ رمز عبور تغییر کرد')}

// Privacy - LIVE
function loadPrivacyToggles(){
  const pr=settings.privacy||{};
  const setT=(id,val)=>{const el=document.getElementById(id);if(el){if(val)el.classList.add('on');else el.classList.remove('on')}};
  setT('tgl-private',pr.isPrivate);
  setT('tgl-online',pr.showOnline!==false);
  setT('tgl-showlikes',pr.showLikes!==false);
  setT('tgl-receipt',pr.readReceipt!==false);
  const selDm=document.getElementById('sel-dm');if(selDm)selDm.value=pr.dmFrom||'all';
  const desc=document.getElementById('priv-desc');
  if(desc)desc.textContent=pr.isPrivate?'پروفایل خصوصی است':'فقط فالوورها پست‌هات رو ببینن'}

function tglPrivacy(el){
  el.classList.toggle('on');
  settings.privacy.isPrivate=el.classList.contains('on');
  svAll();
  const desc=document.getElementById('priv-desc');
  if(desc)desc.textContent=settings.privacy.isPrivate?'✅ پروفایل خصوصی است':'فقط فالوورها پست‌هات رو ببینن';
  toast(settings.privacy.isPrivate?'🔒 پروفایل خصوصی شد':'🔓 پروفایل عمومی شد')}

function tglSave(el,key){
  el.classList.toggle('on');
  settings.privacy[key]=el.classList.contains('on');
  svAll();toast('✅ ذخیره شد')}

function saveSetting(key,val){settings.privacy[key]=val;svAll()}

// Notifications - LIVE
function loadNotifToggles(){
  const n=settings.notifs||{};
  const keys=['like','comment','repost','follow','dm'];
  keys.forEach(k=>{const el=document.getElementById('ntgl-'+k);if(el){if(n[k]!==false)el.classList.add('on');else el.classList.remove('on')}});}

function tglNotif(el,key){
  el.classList.toggle('on');
  settings.notifs[key]=el.classList.contains('on');
  svAll();
  toast(settings.notifs[key]?`✅ اعلان ${key} فعال شد`:`اعلان ${key} غیرفعال شد`)}

// Appearance - LIVE
function loadAppearance(){
  const s=settings;
  // colors
  document.querySelectorAll('.c-dot').forEach(d=>d.classList.remove('sel'));
  document.querySelectorAll('.c-dot').forEach(d=>{if(d.style.background===s.accent||d.title===getColorName(s.accent))d.classList.add('sel')});
  // theme
  document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('sel'));
  const tc=document.getElementById('theme-'+s.theme);if(tc)tc.classList.add('sel');
  // font
  const fs=document.getElementById('font-slider');if(fs)fs.value=s.fontSize||15;
  updateFontLabel(s.fontSize||15)}

function getColorName(color){const map={'#1d9bf0':'آبی','#7c4dff':'بنفش','#f91880':'صورتی','#00ba7c':'سبز','#FFB800':'طلایی','#ff7043':'نارنجی','#e53935':'قرمز'};return map[color]||''}

function setAccent(color,el){
  settings.accent=color;
  document.documentElement.style.setProperty('--accent',color);
  document.querySelectorAll('.c-dot').forEach(d=>d.classList.remove('sel'));
  el.classList.add('sel');
  svAll();toast('✅ رنگ اصلی تغییر کرد')}

function changeFontSize(val){
  const size=parseInt(val);
  settings.fontSize=size;
  document.documentElement.style.setProperty('--font-size',size+'px');
  svAll();updateFontLabel(size)}

function updateFontLabel(size){
  const el=document.getElementById('font-size-label');
  const labels={13:'خیلی کوچک',14:'کوچک',15:'متوسط',16:'بزرگ',17:'خیلی بزرگ',18:'بزرگ‌تر',19:'خیلی بزرگ‌تر',20:'بزرگترین'};
  if(el)el.textContent=labels[size]||'متوسط'}

function setTheme(t,el){
  settings.theme=t;
  applyTheme(t);
  document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  svAll();toast('✅ تم تغییر کرد')}

// Premium
function loadPremS(){
  const el=document.getElementById('prem-s-content');if(!el)return;
  if(isPrem(cur.username)){
    el.innerHTML=`<div style="padding:20px 0">
<div class="s-title">اشتراک پرمیوم</div>
<div class="s-sub">مدیریت اشتراک</div>
<div class="prem-box">
<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#FFB800,#FF8C00);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
<svg width="28" height="28" viewBox="0 0 20 20" fill="#fff"><path d="M10 1L12.39 7.26L19 8.27L14.5 12.64L15.78 19L10 15.77L4.22 19L5.5 12.64L1 8.27L7.61 7.26L10 1Z"/></svg>
</div>
<div style="font-size:16px;font-weight:700;color:#FFB800;margin-bottom:4px">اشتراک پرمیوم فعاله</div>
<div style="font-size:13px;color:var(--text2)">پلن ${cur.premiumPlan==='yearly'?'سالانه':'ماهانه'}</div>
</div>
<div class="s-card">
<div class="s-row"><div class="s-row-info"><div class="s-row-label">تیک طلایی</div></div><span style="color:#FFB800;font-weight:600">✓ فعال</span></div>
<div class="s-row"><div class="s-row-info"><div class="s-row-label">۱۰۰۰ کاراکتر</div></div><span style="color:#FFB800;font-weight:600">✓ فعال</span></div>
<div class="s-row"><div class="s-row-info"><div class="s-row-label">بوکمارک نامحدود</div></div><span style="color:#FFB800;font-weight:600">✓ فعال</span></div>
</div>
<button class="s-btn-danger" onclick="cancelPrem()" style="margin-top:12px;width:100%">لغو اشتراک</button>
</div>`}
  else el.innerHTML=`<div style="padding:20px 0">
<div class="s-title">اشتراک پرمیوم</div>
<div class="s-sub">ارتقا به پرمیوم</div>
<div class="prem-box">
<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#FFB800,#FF8C00);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
<svg width="24" height="24" viewBox="0 0 20 20" fill="#fff"><path d="M10 1L12.39 7.26L19 8.27L14.5 12.64L15.78 19L10 15.77L4.22 19L5.5 12.64L1 8.27L7.61 7.26L10 1Z"/></svg>
</div>
<div style="font-size:15px;font-weight:700;color:#FFB800;margin-bottom:4px">ایگرگ پرمیوم</div>
<div style="font-size:13px;color:var(--text2);margin-bottom:14px">تیک طلایی، ۱۰۰۰ کاراکتر، بوکمارک نامحدود</div>
<button onclick="activatePrem()" style="background:linear-gradient(135deg,#FFB800,#FF8C00);color:#000;border:none;border-radius:99px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Vazirmatn',sans-serif">فعال‌سازی</button>
</div>
</div>`}

function activatePrem(){const idx=users.findIndex(x=>x.username===cur.username);users[idx].premium=true;users[idx].premiumPlan='monthly';users[idx].premiumDate=new Date().toISOString();cur=users[idx];svAll();['sav','cav','cmav'].forEach(id=>{const el=document.getElementById(id);if(el)avEl(el,cur.username)});openM('m-success');loadPremS()}
function cancelPrem(){const idx=users.findIndex(x=>x.username===cur.username);users[idx].premium=false;cur=users[idx];svAll();['sav','cav','cmav'].forEach(id=>{const el=document.getElementById(id);if(el)avEl(el,cur.username)});loadPremS();toast('اشتراک لغو شد')}

// Stats
function loadStats(){
  const pu=posts.filter(p=>p.username===cur.username);
  const tl=pu.reduce((a,p)=>a+p.likes.length,0);
  const tr=pu.reduce((a,p)=>a+(p.reposts||[]).length,0);
  const tc=pu.reduce((a,p)=>a+(p.comments||[]).length,0);
  const bmC=(bms[cur.username]||[]).length;
  const sg=document.getElementById('stats-grid');
  if(sg)sg.innerHTML=[
    {n:F(pu.length),l:'پست',c:'var(--text)'},
    {n:F((cur.followers||[]).length),l:'فالوور',c:'var(--accent)'},
    {n:F((cur.following||[]).length),l:'دنبال‌شده',c:'var(--green)'}
  ].map(d=>`<div class="stat-mini"><div class="stat-mini-num" style="color:${d.c}">${d.n}</div><div class="stat-mini-label">${d.l}</div></div>`).join('');
  const sd=document.getElementById('stats-detail');
  if(sd)sd.innerHTML=[
    {l:'لایک‌های دریافتی',v:F(tl),c:'var(--red)'},
    {l:'ریپست‌های دریافتی',v:F(tr),c:'var(--green)'},
    {l:'کامنت‌های دریافتی',v:F(tc),c:'var(--accent)'},
    {l:'بوکمارک‌های من',v:F(bmC),c:'#FFB800'}
  ].map(d=>`<div class="s-row"><div class="s-row-info"><div class="s-row-label">${d.l}</div></div><span style="font-size:16px;font-weight:700;color:${d.c}">${d.v}</span></div>`).join('')}

// Danger
function clearMyPosts(){posts=posts.filter(p=>p.username!==cur.username);svAll();toast('✅ همه پست‌هات حذف شد')}
function clearBM(){bms[cur.username]=[];svAll();toast('✅ بوکمارک‌ها پاک شد')}

// FEED & POSTS
function uCC(){const max=pmx();const l=document.getElementById('tinput').value.length;const cc=document.getElementById('cc');cc.textContent=F(l)+'/'+F(max);cc.className='cc'+(l>max*0.9?' warn':'');document.getElementById('pbtn').disabled=l===0;document.getElementById('tinput').maxLength=max}
function submitPost(){const t=document.getElementById('tinput').value.trim();if(!t||!cur)return;posts.unshift({id:Date.now(),username:cur.username,name:cur.name,text:t,time:new Date().toISOString(),likes:[],reposts:[],comments:[]});svAll();document.getElementById('tinput').value='';document.getElementById('cc').textContent='۰/'+F(pmx());document.getElementById('pbtn').disabled=true;renderFeed()}
function tglLike(id){const p=posts.find(x=>x.id===id);if(!p||!cur)return;const i=p.likes.indexOf(cur.username);if(i===-1){p.likes.push(cur.username);if(p.username!==cur.username&&settings.notifs.like!==false)notifs.unshift({id:Date.now(),to:p.username,from:cur.name,fromU:cur.username,text:cur.name+' پستت رو لایک کرد',time:new Date().toISOString(),read:false})}else p.likes.splice(i,1);svAll();if(viewPId===id)renderPD();else renderFeed();updateND()}
function tglRepost(id){const p=posts.find(x=>x.id===id);if(!p||!cur)return;const i=(p.reposts||[]).indexOf(cur.username);if(i===-1){p.reposts=p.reposts||[];p.reposts.push(cur.username);if(p.username!==cur.username&&settings.notifs.repost!==false)notifs.unshift({id:Date.now(),to:p.username,from:cur.name,fromU:cur.username,text:cur.name+' پستت رو ریپست کرد',time:new Date().toISOString(),read:false})}else p.reposts.splice(i,1);svAll();if(viewPId===id)renderPD();else renderFeed();updateND()}
function delPost(id){posts=posts.filter(x=>x.id!==id);svAll();if(viewPId===id)goTab('home');else renderFeed()}
function openPost(id){prevTab='home';viewPId=id;goTab('post')}
function submitCmt(){const t=document.getElementById('cminput').value.trim();if(!t||!cur||!viewPId)return;const p=posts.find(x=>x.id===viewPId);if(!p)return;p.comments=p.comments||[];p.comments.push({id:Date.now(),username:cur.username,name:cur.name,text:t,time:new Date().toISOString()});if(p.username!==cur.username&&settings.notifs.comment!==false)notifs.unshift({id:Date.now(),to:p.username,from:cur.name,fromU:cur.username,text:cur.name+' به پستت کامنت داد',time:new Date().toISOString(),read:false});svAll();document.getElementById('cminput').value='';renderPD();updateND()}
function updateND(){const c=notifs.filter(n=>n.to===cur?.username&&!n.read).length;const d=document.getElementById('ndot');if(d){d.textContent=F(c);d.style.display=c>0?'inline-block':'none'}}
function tglBM(id){if(!cur)return;if(!bms[cur.username])bms[cur.username]=[];const arr=bms[cur.username];const i=arr.indexOf(id);if(i===-1)arr.push(id);else arr.splice(i,1);svAll();renderFeed();toast(i===-1?'🔖 بوکمارک شد':'از بوکمارک حذف شد')}
function sharePost(id){if(navigator.clipboard)navigator.clipboard.writeText('ygrek.app/post/'+id).then(()=>toast('📋 لینک کپی شد!')).catch(()=>toast('📋 لینک کپی شد!'));else toast('📋 لینک کپی شد!')}
function renderBM(){const b=bms[cur?.username]||[];const bp=posts.filter(p=>b.includes(p.id));document.getElementById('bm-list').innerHTML=bp.length?bp.map(postHTML).join(''):'<div class="empty">🔖<br>هنوز چیزی بوکمارک نکردی!</div>'}

function postHTML(p){
  const liked=cur&&p.likes.includes(cur.username);
  const reposted=cur&&(p.reposts||[]).includes(cur.username);
  const bmed=isBmed(p.id);
  const canDel=(cur&&p.username===cur.username)||cur?.isAdmin;
  const showLikes=settings.privacy?.showLikes!==false||p.username===cur?.username;
  return`<div class="post-item" onclick="openPost(${p.id})">${avHTML(p.username)}
<div class="post-body"><div class="post-top"><div class="post-meta"><span class="pname">${p.name}</span>${vBadges(p.username)}<span class="phandle">@${p.username}</span><span style="color:var(--text2)">·</span><span class="ptime">${tAgo(p.time)}</span></div>
${canDel?`<button class="del-btn" onclick="event.stopPropagation();delPost(${p.id})"><i class="ti ti-trash" style="font-size:17px"></i></button>`:''}
</div><div class="ptext">${htText(p.text)}</div>
<div class="pactions">
<button class="pa reply" onclick="event.stopPropagation();openPost(${p.id})"><i class="ti ti-message-circle"></i>${F((p.comments||[]).length)}</button>
<button class="pa repost${reposted?' reposted':''}" onclick="event.stopPropagation();tglRepost(${p.id})"><i class="ti ti-repeat"></i>${F((p.reposts||[]).length)}</button>
<button class="pa like${liked?' liked':''}" onclick="event.stopPropagation();tglLike(${p.id})"><i class="ti ti-heart${liked?'-filled':''}"></i>${showLikes?F(p.likes.length):''}</button>
<button class="pa bm${bmed?' bmed':''}" onclick="event.stopPropagation();tglBM(${p.id})"><i class="ti ti-bookmark${bmed?'-filled':''}"></i></button>
<button class="pa" style="color:var(--text2)" onclick="event.stopPropagation();sharePost(${p.id})"><i class="ti ti-share"></i></button>
</div></div></div>`}

function renderFeed(){
  const isPrivate=u=>users.find(x=>x.username===u)?.isPrivate&&!isFlw(cur.username,u)&&u!==cur.username;
  let fp=fMode==='fl'?(cur&&cur.following&&cur.following.length?posts.filter(p=>(cur.following||[]).includes(p.username)||p.username===cur.username):null):posts;
  const f=document.getElementById('feed');
  if(fp===null){f.innerHTML='<div class="empty">هنوز کسی رو دنبال نکردی!</div>';return}
  f.innerHTML=fp.length?fp.map(postHTML).join(''):'<div class="empty">اولین پست رو بذار!</div>'}

function renderPD(){const p=posts.find(x=>x.id===viewPId);if(!p){document.getElementById('post-detail').innerHTML='';document.getElementById('post-comments').innerHTML='';return}document.getElementById('post-detail').innerHTML=postHTML(p);document.getElementById('post-comments').innerHTML=(p.comments||[]).length===0?'<div class="empty" style="padding:24px">هنوز کامنتی نیست</div>':(p.comments||[]).map(c=>`<div class="cmt-row">${avHTML(c.username,'sm')}<div><div style="display:flex;align-items:center;gap:5px"><span style="font-weight:700;font-size:14px;color:var(--text)">${c.name}</span>${vBadges(c.username)}<span style="font-size:13px;color:var(--text2)">· ${tAgo(c.time)}</span></div><div class="cmt-text">${htText(c.text)}</div></div></div>`).join('')}

function openHT(tag){const tp=posts.filter(p=>extractTags(p.text).includes(tag));TABS.forEach(x=>{document.getElementById('tab-'+x).style.display='none';const b=document.getElementById('nb-'+x);if(b)b.classList.remove('active')});const t=document.getElementById('tab-search');t.style.display='block';document.getElementById('nb-search').classList.add('active');document.getElementById('sresults').innerHTML=`<div class="scat">#${tag} · ${F(tp.length)} پست</div>`+(tp.length?tp.map(postHTML).join(''):'<div class="empty">پستی نیست</div>')}
function renderTrends(){const tr=getTrends();const el=document.getElementById('sresults');el.innerHTML=tr.length?`<div class="scat">ترندهای ایگرگ</div>`+tr.map(([tag,cnt],i)=>`<div class="trend-item" onclick="openHT('${tag}')"><div style="font-size:11px;color:var(--text3)">ترند ${F(i+1)}</div><div style="font-size:16px;font-weight:700;color:var(--text)">#${tag}</div><div style="font-size:13px;color:var(--text2)">${F(cnt)} پست</div></div>`).join(''):'<div class="empty">هنوز هشتگی نیست</div>'}
function doSearch(){const q=document.getElementById('sinput').value.trim().toLowerCase();const r=document.getElementById('sresults');if(!q){renderTrends();return}const uu=users.filter(u=>u.name.toLowerCase().includes(q)||u.username.toLowerCase().includes(q));const pp=posts.filter(p=>p.text.toLowerCase().includes(q));let html='';if(uu.length)html+=`<div class="scat">کاربران</div>`+uu.map(u=>{const iF=isFlw(cur.username,u.username);const isMe=u.username===cur.username;return`<div class="user-row" onclick="renderProfile('${u.username}');goTab('profile')">${avHTML(u.username)}<div class="user-info"><div style="display:flex;align-items:center;gap:5px"><span style="font-weight:700;font-size:15px;color:var(--text)">${u.name}</span>${vBadges(u.username)}</div><div style="font-size:14px;color:var(--text2)">@${u.username}</div></div>${!isMe?`<button class="mbtn ${iF?'uf':'f'}" onclick="event.stopPropagation();tglFollow('${u.username}')">${iF?'دنبال‌شده':'دنبال'}</button>`:''}</div>`}).join('');if(pp.length)html+=`<div class="scat">پست‌ها</div>`+pp.map(postHTML).join('');if(!uu.length&&!pp.length)html='<div class="empty">نتیجه‌ای پیدا نشد</div>';r.innerHTML=html}

function renderNotifs(){
  const myN=notifs.filter(n=>n.to===cur.username);
  document.getElementById('notif-list').innerHTML=myN.length?myN.map(n=>`<div class="notif-item" style="background:${n.read?'':'rgba(29,155,240,0.04)'}">${avHTML(n.fromU||'','sm')}<div><div style="font-size:15px;color:var(--text)">${n.text}</div><div style="font-size:12px;color:var(--text2);margin-top:2px">${tAgo(n.time)} پیش</div></div></div>`).join(''):'<div class="empty">هنوز اعلانی نداری</div>'}

// DM
function getDMC(){const c=[];Object.keys(dms).forEach(k=>{const pts=k.split('__');if(!pts.includes(cur.username))return;const other=pts.find(p=>p!==cur.username);const msgs=dms[k];if(msgs&&msgs.length)c.push({k,other,last:msgs[msgs.length-1],unread:msgs.filter(m=>m.to===cur.username&&!m.read).length})});return c.sort((a,b)=>new Date(b.last.time)-new Date(a.last.time))}
function renderDML(){const c=getDMC();const el=document.getElementById('dm-list');if(!c.length){el.innerHTML='<div class="empty">هنوز پیامی نداری!</div>';return}el.innerHTML=c.map(x=>{const u=users.find(q=>q.username===x.other);return`<div class="dm-item" onclick="openChat('${x.other}')">${avHTML(x.other)}<div class="dm-info"><div style="display:flex;align-items:center;gap:4px"><span style="font-weight:700;font-size:15px;color:var(--text)">${u?u.name:x.other}</span>${vBadges(x.other)}</div><div style="font-size:14px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(x.last.from===cur.username?'شما: ':'')+x.last.text.substring(0,40)}</div></div><div style="font-size:12px;color:var(--text2)">${tAgo(x.last.time)}</div>${x.unread?'<div style="width:8px;height:8px;background:var(--accent);border-radius:50%;flex-shrink:0"></div>':''}</div>`}).join('')}
function openChat(username){chatWith=username;const u=users.find(x=>x.username===username);document.getElementById('chat-title').textContent=u?u.name:username;const k=dmK(cur.username,username);if(dms[k])dms[k].forEach(m=>{if(m.to===cur.username)m.read=true});svAll();updateDMD();TABS.forEach(x=>{document.getElementById('tab-'+x).style.display='none';const b=document.getElementById('nb-'+x);if(b)b.classList.remove('active')});document.getElementById('tab-chat').style.display='block';document.getElementById('nb-dm').classList.add('active');renderChat()}
function renderChat(){const k=dmK(cur.username,chatWith);const msgs=dms[k]||[];const el=document.getElementById('chat-msgs');el.innerHTML=msgs.length?msgs.map(m=>{const mine=m.from===cur.username;return`<div class="msg-row${mine?' mine':''}">${!mine?avHTML(m.from,'sm'):''}<div><div class="msg-bubble">${m.text.replace(/</g,'&lt;')}</div><div class="msg-time">${tAgo(m.time)}</div></div>${mine?avHTML(m.from,'sm'):''}</div>`}).join(''):'<div class="empty" style="padding:32px">شروع مکالمه کن! 👋</div>';el.scrollTop=el.scrollHeight}
function sendMsg(){
  if(settings.privacy?.dmFrom==='none'){toast('❌ شما پیام‌های خصوصی را غیرفعال کردید');return}
  const t=document.getElementById('chat-inp').value.trim();if(!t||!chatWith||!cur)return;const k=dmK(cur.username,chatWith);if(!dms[k])dms[k]=[];dms[k].push({id:Date.now(),from:cur.username,to:chatWith,text:t,time:new Date().toISOString(),read:false});svAll();document.getElementById('chat-inp').value='';renderChat();updateDMD()}
function updateDMD(){const c=Object.keys(dms).filter(k=>k.split('__').includes(cur?.username)).reduce((s,k)=>s+(dms[k]||[]).filter(m=>m.to===cur.username&&!m.read).length,0);const d=document.getElementById('dmdot');if(d){d.textContent=F(c);d.style.display=c>0?'inline-block':'none'}}
function fillDML(){const others=users.filter(u=>u.username!==cur.username);document.getElementById('dm-ul').innerHTML=others.length?others.map(u=>`<div class="user-row" onclick="startDM('${u.username}')">${avHTML(u.username)}<div class="user-info"><div style="display:flex;align-items:center;gap:4px"><span style="font-weight:700;font-size:14px;color:var(--text)">${u.name}</span>${vBadges(u.username)}</div><div style="font-size:13px;color:var(--text2)">@${u.username}</div></div></div>`).join(''):'<div class="empty" style="padding:20px">کاربری نیست</div>'}
function filterDMU(){const q=document.getElementById('dm-si').value.toLowerCase();const f=users.filter(u=>u.username!==cur.username&&(u.name.toLowerCase().includes(q)||u.username.toLowerCase().includes(q)));document.getElementById('dm-ul').innerHTML=f.length?f.map(u=>`<div class="user-row" onclick="startDM('${u.username}')">${avHTML(u.username)}<div class="user-info"><div style="display:flex;align-items:center;gap:4px"><span style="font-weight:700;font-size:14px;color:var(--text)">${u.name}</span>${vBadges(u.username)}</div><div style="font-size:13px;color:var(--text2)">@${u.username}</div></div></div>`).join(''):'<div class="empty" style="padding:20px">پیدا نشد</div>'}
function startDM(u){closeM('m-newdm');openChat(u)}

// FOLLOW
function tglFollow(username){if(!cur||username===cur.username)return;const me=users.find(x=>x.username===cur.username);const them=users.find(x=>x.username===username);if(!me||!them)return;me.following=me.following||[];them.followers=them.followers||[];const idx=me.following.indexOf(username);if(idx===-1){me.following.push(username);them.followers.push(cur.username);if(settings.notifs?.follow!==false)notifs.unshift({id:Date.now(),to:username,from:cur.name,fromU:cur.username,text:cur.name+' شروع کرد به دنبال کردنت',time:new Date().toISOString(),read:false});updateND()}else{me.following.splice(idx,1);const fi=them.followers.indexOf(cur.username);if(fi!==-1)them.followers.splice(fi,1)}cur=me;svAll();if(vUser)renderProfile(vUser)}

// PROFILE
function showFL(uname,type){vUser=uname;const u=users.find(x=>x.username===uname);if(!u)return;const list=type==='followers'?(u.followers||[]):(u.following||[]);document.getElementById('fl-title').textContent=type==='followers'?`فالوورها (${F(list.length)})`:`دنبال‌شده‌ها (${F(list.length)})`;document.getElementById('fl-content').innerHTML=list.length?list.map(un=>{const us=users.find(x=>x.username===un);if(!us)return'';const iF=isFlw(cur.username,un);const isMe=un===cur.username;return`<div class="user-row" onclick="renderProfile('${un}');goTab('profile')">${avHTML(un)}<div style="flex:1"><div style="display:flex;align-items:center;gap:4px"><span style="font-weight:700;font-size:15px;color:var(--text)">${us.name}</span>${vBadges(un)}</div><div style="font-size:14px;color:var(--text2)">@${un}</div>${us.bio?`<div style="font-size:13px;color:var(--text2);margin-top:2px">${us.bio.substring(0,50)}</div>`:''}</div>${!isMe?`<button class="mbtn ${iF?'uf':'f'}" onclick="event.stopPropagation();tglFollow('${un}')">${iF?'دنبال‌شده':'دنبال'}</button>`:''}</div>`}).join(''):'<div class="empty">کسی اینجا نیست</div>';TABS.forEach(x=>{document.getElementById('tab-'+x).style.display='none';const b=document.getElementById('nb-'+x);if(b)b.classList.remove('active')});document.getElementById('tab-fl-list').style.display='block'}

function renderProfile(uname){
  vUser=uname;const u=users.find(x=>x.username===uname);if(!u)return;
  const pu=posts.filter(p=>p.username===uname);
  const tl=pu.reduce((a,p)=>a+p.likes.length,0);
  const isMe=uname===cur.username;
  const iF=!isMe&&isFlw(cur.username,uname);
  const bg=u.avatar?'transparent':gc(uname);
  const inner=u.avatar?`<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover">`:u.name.charAt(0);
  const avRing=isPrem(uname)?'box-shadow:0 0 0 4px #FFB800;':isVer(uname)?`box-shadow:0 0 0 4px ${settings.accent};`:'';
  const bannerBg=u.banner?'':'background:linear-gradient(135deg,#0a0a0a,#1a1a2e)';
  const bmC=(bms[uname]||[]).length;
  const isPrivate=u.isPrivate&&!isMe&&!isFlw(cur.username,uname);
  const showOnline=settings.privacy?.showOnline!==false||isMe;

  document.getElementById('profile-content').innerHTML=`
<div class="profile-banner" style="${bannerBg}" onclick="${isMe?"document.getElementById('banner-file-prof').click()":""}">
${u.banner?`<img src="${u.banner}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0">`:``}
${isPrem(uname)?'<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(255,184,0,0.1) 0%,transparent 60%)"></div>':''}
${isMe?`<div class="banner-overlay"><span><i class="ti ti-camera" style="font-size:13px"></i>تغییر بنر</span></div>`:''}
<div style="position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(to top,var(--bg),transparent)"></div>
</div>
${isMe?`<input type="file" id="banner-file-prof" accept="image/*" style="display:none" onchange="uploadBannerProf(this)">`:''}

<div class="profile-av-section">
<div class="profile-av-wrap2">
<div class="profile-av-img" style="background:${bg};${avRing}" onclick="${isMe?"document.getElementById('av-file-prof').click()":""}">
${inner}
${isMe?`<div class="av-overlay"><i class="ti ti-camera"></i></div>`:''}
</div>
${showOnline&&isMe?'<div class="online-dot"></div>':''}
${isMe?`<input type="file" id="av-file-prof" accept="image/*" style="display:none" onchange="uploadAvProf(this)">`:''}
</div>
<div class="profile-actions">
${isMe?
`<button onclick="goTab('settings')" style="background:none;border:1px solid var(--border);border-radius:99px;padding:8px 16px;font-size:14px;font-weight:700;color:var(--text);cursor:pointer;font-family:'Vazirmatn',sans-serif;display:flex;align-items:center;gap:6px"><i class="ti ti-settings" style="font-size:15px"></i>تنظیمات</button>`
:`<div style="display:flex;gap:8px;align-items:center">
<button class="btn-icon2" onclick="openChat('${uname}')" title="پیام خصوصی">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
</button>
<button class="btn-follow ${iF?'fl':'nf'}" onclick="tglFollow('${uname}')">${iF?'دنبال‌شده ✓':'+ دنبال کن'}</button>
</div>`}
</div>
</div>

<div class="profile-info">
<div class="pf-name-row"><span class="pf-name">${u.name}</span>${vBadges(uname)}${u.isAdmin?'':''}</div>
${isPrem(uname)?`
<div class="prem-badge-row" style="margin-top:8px;margin-bottom:10px">
<div class="prem-badge-ico"><svg width="16" height="16" viewBox="0 0 20 20" fill="#fff"><path d="M10 1L12.39 7.26L19 8.27L14.5 12.64L15.78 19L10 15.77L4.22 19L5.5 12.64L1 8.27L7.61 7.26L10 1Z"/></svg></div>
<div><div style="font-size:13px;font-weight:600;color:#FFB800">عضو ایگرگ پرمیوم</div><div style="font-size:12px;color:var(--text2)">پلن ${u.premiumPlan==='yearly'?'سالانه':'ماهانه'}</div></div>
</div>`:''}
<div class="pf-handle" style="margin-top:${isPrem(uname)?'0':'10px'}">@${u.username}${settings.privacy?.isPrivate&&isMe?' 🔒':''}</div>
${u.bio?`<div class="pf-bio">${u.bio.replace(/</g,'&lt;')}</div>`:''}
<div class="pf-meta">
${u.location?`<div class="pf-meta-item"><i class="ti ti-map-pin"></i><span>${u.location}</span></div>`:''}
${u.website?`<div class="pf-meta-item"><i class="ti ti-link"></i><span style="color:var(--accent)">${u.website.replace('https://','')}</span></div>`:''}
<div class="pf-meta-item"><i class="ti ti-calendar"></i><span>عضو ایگرگ</span></div>
</div>
<div class="pf-stats">
<div class="pstat" onclick="showFL('${uname}','following')"><span>${F((u.following||[]).length)}</span> دنبال‌شده</div>
<div class="pstat" onclick="showFL('${uname}','followers')"><span>${F((u.followers||[]).length)}</span> فالوور</div>
<div class="pstat"><span>${F(pu.length)}</span> پست</div>
<div class="pstat"><span style="color:var(--red)">${F(tl)}</span> لایک</div>
${isMe?`<div class="pstat" onclick="goTab('bm')"><span style="color:#FFB800">${F(bmC)}</span> 🔖</div>`:''}
</div>
</div>

<div class="pf-tabs">
<div class="pftab active" id="pft-posts" onclick="switchPFT('posts')">پست‌ها</div>
<div class="pftab" id="pft-likes" onclick="switchPFT('likes')">لایک‌ها</div>
${isMe?`<div class="pftab" id="pft-bm2" onclick="switchPFT('bm2')">بوکمارک‌ها</div>`:''}
</div>

${isPrivate?`
<div style="text-align:center;padding:40px 20px;color:var(--text2)">
<i class="ti ti-lock" style="font-size:40px;display:block;margin-bottom:12px"></i>
<div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">این حساب خصوصیه</div>
<div style="font-size:14px">برای مشاهده پست‌ها دنبال کن</div>
</div>`:
`<div id="pf-posts-sec">${pu.length?pu.map(postHTML).join(''):'<div class="empty">هنوز پستی نداره</div>'}</div>`}

${isMe?`<div style="padding:16px;display:flex;gap:10px;border-top:1px solid var(--border);margin-top:8px">
${!isPrem(uname)?`<button onclick="goS('premium');goTab('settings')" style="flex:1;background:linear-gradient(135deg,#FFB800,#FF8C00);color:#000;border:none;border-radius:99px;padding:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Vazirmatn',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px"><svg width="15" height="15" viewBox="0 0 20 20" fill="#000"><path d="M10 1L12.39 7.26L19 8.27L14.5 12.64L15.78 19L10 15.77L4.22 19L5.5 12.64L1 8.27L7.61 7.26L10 1Z"/></svg>خرید پرمیوم</button>`:``}
<button onclick="logout()" style="flex:1;background:none;border:1px solid var(--border);border-radius:99px;padding:10px;font-size:14px;color:var(--text2);cursor:pointer;font-family:'Vazirmatn',sans-serif">خروج</button>
</div>`:''}
`}

function switchPFT(tab){pfTab=tab;['posts','likes','bm2'].forEach(t=>{const el=document.getElementById('pft-'+t);if(el)el.className='pftab'+(t===tab?' active':'')});const uname=vUser;const pu=posts.filter(p=>p.username===uname);const sec=document.getElementById('pf-posts-sec');if(tab==='posts')sec.innerHTML=pu.length?pu.map(postHTML).join(''):'<div class="empty">هنوز پستی نداره</div>';else if(tab==='likes'){const lp=posts.filter(p=>p.likes.includes(uname));sec.innerHTML=lp.length?lp.map(postHTML).join(''):'<div class="empty">هنوز پستی لایک نکرده</div>'}else{const bp=posts.filter(p=>(bms[uname]||[]).includes(p.id));sec.innerHTML=bp.length?bp.map(postHTML).join(''):'<div class="empty">بوکمارک‌ها</div>'}}

function uploadAvProf(input){if(!input.files||!input.files[0])return;const r=new FileReader();r.onload=e=>{const data=e.target.result;const idx=users.findIndex(x=>x.username===cur.username);users[idx].avatar=data;cur=users[idx];svAll();['sav','cav','cmav'].forEach(id=>{const el=document.getElementById(id);if(el)avEl(el,cur.username)});renderProfile(cur.username);toast('✅ عکس پروفایل تغییر کرد')};r.readAsDataURL(input.files[0])}
function uploadBannerProf(input){if(!input.files||!input.files[0])return;const r=new FileReader();r.onload=e=>{const idx=users.findIndex(x=>x.username===cur.username);users[idx].banner=e.target.result;cur=users[idx];svAll();renderProfile(cur.username);toast('✅ بنر تغییر کرد')};r.readAsDataURL(input.files[0])}

function logout(){cur=null;document.getElementById('s-main').classList.remove('active');document.getElementById('s-auth').classList.add('active');document.getElementById('ipass').value='';document.getElementById('tinput').value=''}

document.getElementById('ipass').addEventListener('keydown',e=>{if(e.key==='Enter')authSubmit()});
document.getElementById('iuser').addEventListener('keydown',e=>{if(e.key==='Enter')authSubmit()});
