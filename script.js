const $=s=>document.querySelector(s),L=k=>JSON.parse(localStorage.getItem('yg14_'+k)||'null'),S=(k,v)=>localStorage.setItem('yg14_'+k,JSON.stringify(v));
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
let users=L('u')||[],posts=L('p')||[],bm=L('b')||{},ban=L('ban')||[],reps=L('reports')||[];
let me,route='home',tgt,ex='',reg=false,open,edit=false,draft='';
if(!users.some(u=>u.username==='admin'))users.push({username:'Egreg',password:'NNN1N7',name:'ادمین ایگرگ',bio:'مدیر ایگرگ',avatar:'',following:[],followers:[],isAdmin:true,verified:true,premium:false,joined:Date.now()});
const save=()=>{S('u',users);S('p',posts);S('b',bm);S('ban',ban);S('reports',reps)};
save();
const U=n=>users.find(u=>u.username===n),max=()=>me.premium?1000:280;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)};
const tm=t=>{const d=(Date.now()-new Date(t))/1e3;return d<60?'الان':d<3600?fa(~~(d/60))+' دقیقه':d<86400?fa(~~(d/3600))+' ساعت':fa(~~(d/86400))+' روز'};
const tags=s=>s.replace(/#([\u0600-\u06FF\w]+)/g,'<a class="tag" data-a="tag" data-i="$1">#$1</a>');
const av=(n,c='')=>{const u=U(n);if(!u)return`<span class="av ${c}">?</span>`;const h=[...n].reduce((a,x)=>a+x.charCodeAt(0),0)*47%360;return`<span class="av ${c} ${u.premium?'pr':u.verified?'vr':''}" style="background:${u.avatar?'none':`hsl(${h} 50% 40%)`}">${u.avatar?`<img src="${u.avatar}" alt="">`:esc(u.name[0]||'?')}</span>`};
const bd=n=>{const u=U(n)||{};return(u.isAdmin?'<i class="bi bi-shield-fill-check b-a" title="ادمین"></i>':'')+(u.verified?'<i class="bi bi-patch-check-fill b-v" title="تأییدشده"></i>':'')+(u.premium?'<i class="bi bi-star-fill b-g" title="پرمیوم"></i>':'')};
const post=p=>{const l=p.likes.includes(me.username),b=(bm[me.username]||[]).includes(p.id),own=p.username===me.username||me.isAdmin,u=U(p.username);
return`<article class="post"><a data-a="user" data-i="${p.username}">${av(p.username)}</a><div class="pb"><div class="pm"><b>${esc(u?u.name:p.username)}</b>${bd(p.username)}<span class="mut">@${p.username} · ${tm(p.time)}</span></div><p class="pt">${tags(esc(p.text))}</p><div class="pa"><button data-a="cmt" data-i="${p.id}" title="کامنت"><i class="bi bi-chat"></i>${fa(p.comments.length)}</button><button data-a="like" data-i="${p.id}" class="${l?'r':''}" title="لایک"><i class="bi bi-heart${l?'-fill':''}"></i>${fa(p.likes.length)}</button><button data-a="bm" data-i="${p.id}" class="${b?'g':''}" title="ذخیره"><i class="bi bi-bookmark${b?'-fill':''}"></i></button><button data-a="share" data-i="${p.id}" title="کپی لینک"><i class="bi bi-link-45deg"></i></button>${own?`<button data-a="del" data-i="${p.id}" title="حذف"><i class="bi bi-trash"></i></button>`:`<button data-a="rep" data-i="${p.id}" title="گزارش"><i class="bi bi-flag"></i></button>`}</div>${open===p.id?`<div class="cm">${p.comments.map(c=>`<div><b>${esc(U(c.username)?.name||c.username)}</b> <span class="mut">${tm(c.time)}</span><br>${esc(c.text)}</div>`).join('')}<form data-f="${p.id}"><input placeholder="کامنتت رو بنویس" maxlength="200"><button class="btn">ارسال</button></form></div>`:''}</div></article>`};
const list=a=>a.length?a.map(post).join(''):'<div class="empty">اینجا هنوز چیزی نیست.</div>';
function res(q){q=q.trim().toLowerCase();let h='';
if(!q){const c={};posts.forEach(p=>(p.text.match(/#[\u0600-\u06FF\w]+/g)||[]).forEach(x=>c[x]=(c[x]||0)+1));const t=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8);
h=t.length?'<div class="sec">داغ‌ترین هشتگ‌ها</div>'+t.map(([k,n])=>`<a class="tr" data-a="tag" data-i="${esc(k.slice(1))}"><b>${esc(k)}</b><br><span class="mut">${fa(n)} پست</span></a>`).join(''):'<div class="empty">هنوز هشتگی نیست. یه پست با # بنویس.</div>'}
else{const us=users.filter(u=>(u.name+u.username).toLowerCase().includes(q.replace('@',''))),ps=posts.filter(p=>p.text.toLowerCase().includes(q));
h=us.map(u=>`<a class="ur" data-a="user" data-i="${u.username}">${av(u.username)}<div><b>${esc(u.name)}</b>${bd(u.username)}<br><span class="mut">@${u.username}</span></div></a>`).join('')+(ps.length||!us.length?list(ps):'')}
$('#res').innerHTML=h}
function render(){
document.querySelectorAll('.nav [data-r]').forEach(b=>b.classList.toggle('on',b.dataset.r===route));
const own=me.username;let t,h;
if(route==='home'){t='خانه';h=`<div class="compose">${av(own)}<div><textarea id="tx" placeholder="چه خبر؟ از #هشتگ استفاده کن" maxlength="${max()}">${esc(draft)}</textarea><div class="cf"><span id="cc" class="mut">${fa(draft.length)}/${fa(max())}</span><button class="btn" data-a="post">پست</button></div></div></div>${list(posts)}`}
else if(route==='explore'){t='کاوش';h=`<div style="padding:12px 16px"><input id="q" placeholder="جستجوی کاربر، پست یا #هشتگ" value="${esc(ex)}"></div><div id="res"></div>`}
else if(route==='bm'){t='ذخیره‌شده‌ها';h=list(posts.filter(p=>(bm[own]||[]).includes(p.id)))}
else{const u=U(tgt||own),m=u.username===own,f=(me.following||[]).includes(u.username);t=u.name;
h=`<div class="prof">${av(u.username,'lg')}<div><b style="font-size:20px">${esc(u.name)}</b> ${bd(u.username)}</div><span class="mut">@${u.username}</span>`+
(edit&&m?`<input id="en" value="${esc(u.name)}" maxlength="30"><textarea id="eb" maxlength="160" placeholder="بایو">${esc(u.bio||'')}</textarea><label class="btn o">انتخاب عکس پروفایل<input id="ef" type="file" accept="image/*" hidden></label><button class="btn" data-a="saveP">ذخیره</button>`:`<p>${esc(u.bio||'')}</p>`)+
`<div class="mut"><b>${fa(posts.filter(p=>p.username===u.username).length)}</b> پست · <b>${fa((u.followers||[]).length)}</b> فالوور · <b>${fa((u.following||[]).length)}</b> دنبال‌شده</div>`+
(m?(edit?'':'<button class="btn o" data-a="editP">ویرایش پروفایل</button>'):`<button class="btn ${f?'o':''}" data-a="follow" data-i="${u.username}">${f?'دنبال‌شده':'دنبال کن'}</button>`)+`</div>`+list(posts.filter(p=>p.username===u.username))}
$('#title').textContent=t;$('#view').innerHTML=h;if(route==='explore')res(ex)}
function start(x){me=x;$('#auth').hidden=true;$('#app').hidden=false;$('#adm').hidden=!me.isAdmin;route='home';render()}
function auth(){const u=$('#au').value.trim().replace(/[^\w]/g,''),pw=$('#ap').value,n=$('#an').value.trim(),er=$('#er');
if(!u||pw.length<6)return er.textContent='نام کاربری و رمز (حداقل ۶ کاراکتر) رو وارد کن.';
if(ban.includes(u))return er.textContent='این حساب مسدود شده است.';
let x=U(u);
if(reg){if(x)return er.textContent='این نام کاربری قبلاً گرفته شده.';if(!n)return er.textContent='نام نمایشی رو وارد کن.';x={username:u,password:pw,name:n,bio:'',avatar:'',following:[],followers:[],isAdmin:false,verified:false,premium:false,joined:Date.now()};users.push(x);save()}
else if(!x||x.password!==pw)return er.textContent='نام کاربری یا رمز اشتباهه.';
S('sess',u);start(x)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a],[data-r]');if(!b)return;const{a,i,r}=b.dataset,id=+i,p=posts.find(x=>x.id===id);
if(r){route=r;tgt=null;ex='';edit=false;return render()}
if(a==='mode'){reg=!reg;$('#an').hidden=!reg;$('#ab').textContent=reg?'ساخت حساب':'ورود';b.textContent=reg?'حساب داری؟ وارد شو':'حساب نداری؟ ثبت‌نام کن';$('#er').textContent='';return}
if(a==='out'){localStorage.removeItem('yg14_sess');return location.reload()}
if(a==='user'){route='profile';tgt=i;edit=false}
else if(a==='tag'){route='explore';ex='#'+i}
else if(a==='post'){const t=draft.trim();if(!t)return;posts.unshift({id:Date.now(),username:me.username,text:t,time:Date.now(),likes:[],comments:[]});draft=''}
else if(a==='like')p.likes.includes(me.username)?p.likes=p.likes.filter(x=>x!==me.username):p.likes.push(me.username);
else if(a==='cmt')open=open===id?null:id;
else if(a==='bm'){const k=bm[me.username]=bm[me.username]||[],j=k.indexOf(id);j<0?k.push(id):k.splice(j,1)}
else if(a==='share'){navigator.clipboard&&navigator.clipboard.writeText(location.href.split('#')[0]+'#post-'+id);return toast('لینک پست کپی شد')}
else if(a==='del'){if(!confirm('این پست حذف بشه؟'))return;posts=posts.filter(x=>x.id!==id)}
else if(a==='rep'){const why=prompt('دلیل گزارش؟','محتوای نامناسب');if(!why)return;reps.unshift({id:Date.now(),type:'post',targetId:id,reason:why,reporter:me.username,reportedUser:p.username,content:p.text.slice(0,100),time:Date.now(),status:'open'});save();return toast('گزارش ثبت شد. ممنون!')}
else if(a==='editP')edit=true;
else if(a==='saveP'){me.name=$('#en').value.trim()||me.name;me.bio=$('#eb').value.trim();edit=false;toast('پروفایل ذخیره شد')}
else if(a==='follow'){const t=U(i),k=(me.following=me.following||[]).indexOf(i);t.followers=t.followers||[];if(k<0){me.following.push(i);t.followers.push(me.username)}else{me.following.splice(k,1);t.followers=t.followers.filter(x=>x!==me.username)}}
save();render()});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;if(f.id==='af')return auth();
const t=f.querySelector('input').value.trim(),p=posts.find(x=>x.id==f.dataset.f);if(!t||!p)return;p.comments.push({username:me.username,text:t,time:Date.now()});save();render()});
document.addEventListener('input',e=>{const t=e.target;if(t.id==='tx'){draft=t.value;$('#cc').textContent=fa(draft.length)+'/'+fa(max())}if(t.id==='q'){ex=t.value;res(ex)}});
document.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(e.target.id!=='ef'||!f)return;
const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,256/Math.max(i.width,i.height));c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);
me.name=$('#en').value.trim()||me.name;me.bio=$('#eb').value;me.avatar=c.toDataURL('image/jpeg',.8);save();render();toast('عکس پروفایل عوض شد')};i.src=r.result};r.readAsDataURL(f)});
const s=L('sess');if(s&&U(s)&&!ban.includes(s))start(U(s));
