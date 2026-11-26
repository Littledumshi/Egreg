const $=s=>document.querySelector(s),L=k=>JSON.parse(localStorage.getItem('yg14_'+k)||'null'),S=(k,v)=>localStorage.setItem('yg14_'+k,JSON.stringify(v));
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
let users=L('u')||[],posts=L('p')||[],ban=L('ban')||[],reps=L('reports')||[],tab='dash',q='';
const me=users.find(u=>u.username===L('sess'));
const save=()=>{S('u',users);S('p',posts);S('ban',ban);S('reports',reps)};
const T=[['dash','bi-speedometer2','داشبورد'],['users','bi-people','کاربران'],['posts','bi-file-text','پست‌ها'],['reps','bi-flag','گزارش‌ها']];
const nm=n=>{const x=users.find(y=>y.username===n);return esc(x?x.name:n)};
const tm=t=>{const d=(Date.now()-new Date(t))/1e3;return d<3600?fa(~~(d/60))+' دقیقه پیش':d<86400?fa(~~(d/3600))+' ساعت پیش':fa(~~(d/86400))+' روز پیش'};
function draw(){const m=users.filter(u=>!u.isAdmin),op=reps.filter(r=>r.status==='open');
$('#side').innerHTML='<h2><i class="bi bi-shield-fill-check"></i>پنل ایگرگ</h2>'+T.map(([k,i,n])=>`<button data-t="${k}" class="${tab===k?'on':''}"><i class="bi ${i}"></i>${n}${k==='reps'&&op.length?`<span class="pill">${fa(op.length)}</span>`:''}</button>`).join('')+'<a href="index.html"><i class="bi bi-arrow-right"></i>بازگشت به ایگرگ</a>';
let h;
if(tab==='dash')h=`<h1>داشبورد</h1><div class="cards">${[['کاربران',m.length],['پست‌ها',posts.length],['پرمیوم',m.filter(u=>u.premium).length],['گزارش باز',op.length]].map(([n,v])=>`<div class="card"><b>${fa(v)}</b><span class="mut">${n}</span></div>`).join('')}</div>`;
else if(tab==='reps')h='<h1>گزارش‌ها</h1><br>'+(reps.length?reps.map(r=>`<div class="card"><div class="acts"><span class="pill" style="margin:0">${r.status==='open'?'باز':'بسته'}</span><span class="mut">${tm(r.time)}</span></div><p class="quote">${esc(r.content||'')}</p><div class="mut">دلیل: ${esc(r.reason)} · گزارش‌دهنده: @${esc(r.reporter)} · گزارش‌شده: @${esc(r.reportedUser||'')}</div>${r.status==='open'?`<div class="acts" style="margin-top:10px"><button class="sm d" data-a="rban" data-i="${r.id}">مسدودسازی کاربر</button><button class="sm d" data-a="rdel" data-i="${r.id}">حذف پست</button><button class="sm" data-a="rno" data-i="${r.id}">رد گزارش</button></div>`:''}</div>`).join(''):'<div class="empty">گزارشی ثبت نشده.</div>');
else h=`<h1>${tab==='users'?'کاربران':'پست‌ها'}</h1><input id="aq" placeholder="جستجو..." value="${esc(q)}" style="max-width:320px;margin:12px 0"><div id="tbl"></div>`;
$('#pg').innerHTML=h;fill()}
function fill(){const t=$('#tbl');if(!t)return;let r;
if(tab==='users'){r=users.filter(u=>!u.isAdmin&&(u.name+u.username).toLowerCase().includes(q)).map(u=>{const b=ban.includes(u.username);return`<tr><td>${esc(u.name)}<br><span class="mut">@${esc(u.username)}</span></td><td>${b?'<span class="pill" style="margin:0">مسدود</span>':'فعال'} ${u.premium?'<i class="bi bi-star-fill b-g"></i>':''} ${u.verified?'<i class="bi bi-patch-check-fill b-v"></i>':''}</td><td>${fa(posts.filter(p=>p.username===u.username).length)}</td><td class="acts"><button class="sm" data-a="prem" data-i="${u.username}">${u.premium?'لغو پرمیوم':'پرمیوم'}</button><button class="sm" data-a="ver" data-i="${u.username}">${u.verified?'لغو تیک':'تیک آبی'}</button><button class="sm d" data-a="ban" data-i="${u.username}">${b?'رفع مسدودی':'مسدود'}</button></td></tr>`}).join('');
r=`<table><tr><th>کاربر</th><th>وضعیت</th><th>پست</th><th>عملیات</th></tr>${r||'<tr><td colspan="4" class="empty">کاربری پیدا نشد.</td></tr>'}</table>`}
else r=`<table><tr><th>نویسنده</th><th>متن</th><th>لایک</th><th></th></tr>${posts.filter(p=>(p.text+p.username).toLowerCase().includes(q)).map(p=>`<tr><td>${nm(p.username)}</td><td>${esc(p.text.slice(0,80))}</td><td>${fa(p.likes.length)}</td><td><button class="sm d" data-a="delp" data-i="${p.id}">حذف</button></td></tr>`).join('')||'<tr><td colspan="4" class="empty">پستی پیدا نشد.</td></tr>'}</table>`;
t.innerHTML=r}
const toggleBan=n=>{const k=ban.indexOf(n);k<0?ban.push(n):ban.splice(k,1)};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a],[data-t]');if(!b)return;
if(b.dataset.t){tab=b.dataset.t;q='';return draw()}
const{a,i}=b.dataset,u=users.find(x=>x.username===i),r=a[0]==='r'?reps.find(x=>x.id==i):null;
if(a==='prem'){u.premium=!u.premium;u.premiumDate=Date.now()}
else if(a==='ver')u.verified=!u.verified;
else if(a==='ban')toggleBan(i);
else if(a==='delp')posts=posts.filter(p=>p.id!=i);
else if(r){r.status='closed';if(a==='rban'&&!ban.includes(r.reportedUser))ban.push(r.reportedUser);if(a==='rdel')posts=posts.filter(p=>p.id!=r.targetId)}
save();draw()});
document.addEventListener('input',e=>{if(e.target.id==='aq'){q=e.target.value.toLowerCase();fill()}});
if(me&&me.isAdmin){$('#ad').hidden=false;draw()}else $('#deny').hidden=false;
