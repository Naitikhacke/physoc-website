const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const green="#59ff9a",red="#ff3b46";

$(".menu-toggle")?.addEventListener("click",()=>$(".nav-links").classList.toggle("open"));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("visible");animateCounts(e.target);}
}),{threshold:.16});
$$(".reveal").forEach(el=>io.observe(el));

function animateCounts(root){
  $$("[data-count]",root).forEach(el=>{
    if(el.dataset.done)return;el.dataset.done=1;
    const target=+el.dataset.count;let n=0;
    const tick=()=>{n+=Math.max(1,Math.ceil(target/44));el.textContent=Math.min(n,target);if(n<target)requestAnimationFrame(tick)};
    tick();
  });
}

function fit(canvas){
  const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();
  canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);
  const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w:r.width,h:r.height};
}

function scopeHero(){
  const c=$("#scopeHero");if(!c)return;let mx=.5,my=.5,t=0;
  c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height;});
  function draw(){
    const {ctx,w,h}=fit(c);t+=.025;ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#030607";ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="rgba(89,255,154,.13)";ctx.lineWidth=1;
    for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
    for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    for(let pass=0;pass<3;pass++){
      ctx.beginPath();ctx.lineWidth=pass?2:8;ctx.strokeStyle=pass===0?"rgba(89,255,154,.08)":pass===1?green:"rgba(255,59,70,.75)";
      for(let x=0;x<w;x++){
        const amp=60+my*150, freq=.014+mx*.035;
        const y=h*.52+Math.sin(x*freq+t*7)*amp*Math.sin(x*.003+t)+Math.sin(x*.045-t*2)*22;
        x?ctx.lineTo(x,y+pass*18):ctx.moveTo(x,y);
      }
      ctx.stroke();
    }
    ctx.fillStyle="rgba(89,255,154,.75)";
    for(let i=0;i<80;i++)ctx.fillRect((i*97+t*240)%w,(Math.sin(i+t)*.5+.5)*h,2,2);
    requestAnimationFrame(draw);
  }draw();
}

function miniSims(){
  $$(".mini-sim").forEach(c=>{
    let t=0,drag=null,charge={x:.35,y:.55};
    c.addEventListener("pointerdown",e=>{drag=e;c.setPointerCapture(e.pointerId)});
    c.addEventListener("pointermove",e=>{if(c.dataset.sim==="field"){const r=c.getBoundingClientRect();charge={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}});
    function draw(){
      const {ctx,w,h}=fit(c),kind=c.dataset.sim,control=$(`[data-control="${kind}"]`);t+=.03;ctx.clearRect(0,0,w,h);ctx.fillStyle="#020606";ctx.fillRect(0,0,w,h);ctx.strokeStyle="rgba(89,255,154,.18)";
      for(let x=0;x<w;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
      const val=+(control?.value||5);
      if(kind==="waves"){
        ctx.lineWidth=2;
        for(let row=0;row<45;row++){ctx.beginPath();for(let x=0;x<w;x+=4){const y=row*h/45+Math.sin(x*.04+t*2+row*.45)*val;ctx[x?"lineTo":"moveTo"](x,y)}ctx.strokeStyle=row%2?green:red;ctx.globalAlpha=.45;ctx.stroke()}ctx.globalAlpha=1;
      }else if(kind==="projectile"){
        const ang=val*Math.PI/180,v=92,g=70;ctx.strokeStyle=green;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<120;i++){const tt=i/22,x=24+Math.cos(ang)*v*tt,y=h-24-(Math.sin(ang)*v*tt-.5*g*tt*tt);if(y>h)break;ctx[i?"lineTo":"moveTo"](x,y)}ctx.stroke();ctx.fillStyle=red;const tt=(t*1.4)%2.4;ctx.beginPath();ctx.arc(24+Math.cos(ang)*v*tt,h-24-(Math.sin(ang)*v*tt-.5*g*tt*tt),7,0,7);ctx.fill();
      }else{
        for(let y=22;y<h;y+=26)for(let x=22;x<w;x+=26){const dx=x-charge.x*w,dy=y-charge.y*h,m=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle=m<90?red:green;ctx.globalAlpha=Math.min(1,90/m);ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.lineTo(3,-4);ctx.moveTo(8,0);ctx.lineTo(3,4);ctx.stroke();ctx.restore()}ctx.globalAlpha=1;ctx.fillStyle=red;ctx.beginPath();ctx.arc(charge.x*w,charge.y*h,10+val,0,7);ctx.fill();
      }
      requestAnimationFrame(draw);
    }draw();
  });
}

function arc(){
  const c=$("#arcCanvas");if(!c)return;let t=0;
  function draw(){const {ctx,w,h}=fit(c);t+=.05;ctx.clearRect(0,0,w,h);ctx.strokeStyle=green;ctx.lineWidth=2;for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(0,h*(.25+i*.08));for(let x=0;x<w;x+=28){ctx.lineTo(x,h*(.25+i*.08)+Math.sin(x*.04+t+i)*22+(Math.random()-.5)*12)}ctx.stroke()}requestAnimationFrame(draw)}draw();
}

function channelWaves(){
  $$(".channel-card canvas").forEach(c=>{let t=0;function draw(){const {ctx,w,h}=fit(c),kind=c.closest(".channel-card").dataset.wave;t+=.04;ctx.clearRect(0,0,w,h);ctx.strokeStyle=green;ctx.lineWidth=2;ctx.beginPath();for(let x=0;x<w;x++){let s=Math.sin(x*.07+t*4);if(kind==="square")s=s>0?1:-1;if(kind==="saw")s=((x*.025+t)%1)*2-1;if(kind==="pulse")s=Math.sin(x*.08+t*5)>.72?1:-.25;let y=h/2+s*h*.28;ctx[x?"lineTo":"moveTo"](x,y)}ctx.stroke();requestAnimationFrame(draw)}draw()});
}

function resources(){
  const search=$("#resourceSearch"),filters=$$(".filter"),cards=$$(".resource-card");if(!search)return;
  let active="all";function apply(){const q=search.value.toLowerCase();cards.forEach(c=>{const ok=(active==="all"||c.dataset.category===active)&&c.dataset.title.toLowerCase().includes(q);c.style.display=ok?"block":"none"})}
  search.addEventListener("input",apply);filters.forEach(b=>b.addEventListener("click",()=>{filters.forEach(x=>x.classList.remove("active"));b.classList.add("active");active=b.dataset.filter;apply()}));
}

async function loadEditableContent(){
  let data;
  try{
    const res=await fetch("/api/content",{cache:"no-store"});
    if(!res.ok)return;
    data=await res.json();
  }catch{return}
  renderDepartments(data);
  renderMembers(data);
  renderResources(data);
  renderInductions(data);
  renderContact(data);
}

function renderDepartments(data){
  const grid=$("#departmentsGrid");if(!grid||!data.departments)return;
  grid.innerHTML=data.departments.map((d,i)=>`<article class="channel-card" data-wave="${["sine","square","saw","pulse"][i%4]}"><canvas></canvas><b>${escapeHtml(d.name)}</b><p>${escapeHtml(d.description)}</p></article>`).join("");
  channelWaves();
  const work=$("#clubWorkGrid");if(work)work.innerHTML=data.departments.slice(0,3).map(d=>`<article class="spec-card"><b>${escapeHtml(d.name)}</b><span>${escapeHtml(d.tag||"Department")}</span><p>${escapeHtml(d.description)}</p></article>`).join("");
}

function renderMembers(data){
  const core=$("#coreTeamGrid");if(core&&data.coreTeam)core.innerHTML=data.coreTeam.map((m,i)=>`<article class="datasheet"><span class="mono">CORE ${String(i+1).padStart(2,"0")}</span><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.role)}</p></article>`).join("");
  const classes=$("#classMembersGrid");if(classes&&data.classMembers)classes.innerHTML=["12","11","10","9","8"].map(cls=>{
    const members=data.classMembers[cls]||[];
    const names=members.length?members.map(name=>`<li>${escapeHtml(name)}</li>`).join(""):`<li>Names to be added</li>`;
    return `<section class="class-member-block"><h3>Class ${cls}th</h3><ul>${names}</ul></section>`;
  }).join("");
}

function renderResources(data){
  const grid=$("#resourcesGrid");if(!grid||!data.resources)return;
  grid.innerHTML=data.resources.map(r=>`<article class="resource-card" data-category="${escapeHtml(r.category)}" data-title="${escapeHtml(r.title)}"><span class="mono">${escapeHtml(r.category).toUpperCase()}</span><h3>${escapeHtml(r.title)}</h3><div class="meter" style="--level:${Number(r.level)||50}%"></div><p>${escapeHtml(r.description)}</p></article>`).join("");
  resources();
}

function renderInductions(data){
  if(data.inductions){
    if($("#inductionStatus"))$("#inductionStatus").textContent=data.inductions.status;
    if($("#inductionSummary"))$("#inductionSummary").textContent=data.inductions.summary;
    if($("#registrationDeadline"))$("#registrationDeadline").textContent=data.inductions.deadline||"May 19, 2026";
    if($("#registrationLink"))$("#registrationLink").href=data.inductions.registrationUrl||"https://forms.gle/cjvjZDjTxDWabmCp7";
    const steps=$("#inductionStepsGrid");
    if(steps)steps.innerHTML=(data.inductions.steps||[]).map(s=>`<article class="hazard-card"><b>${escapeHtml(s.title)}</b><span>${escapeHtml(s.tag)}</span><p>${escapeHtml(s.description)}</p></article>`).join("");
  }
  const strip=$("#competitionsStrip");
  if(strip&&data.competitions)strip.innerHTML=[...(data.departments||[]).map(d=>d.name),...(data.competitions||[]).map(c=>c.title)].map(title=>`<article>${escapeHtml(title)}</article>`).join("");
}

function renderContact(data){
  const box=$("#contactDetails");if(!box||!data.contact)return;
  const rows=[data.contact.email,data.contact.phone,data.contact.note].filter(Boolean).map(escapeHtml);
  box.innerHTML=rows.join("<br>");
}

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
}

function countdown(){
  const el=$("#countdown");if(!el)return;const target=new Date("2026-05-24T17:00:00+05:30");
  function tick(){let s=Math.max(0,Math.floor((target-new Date())/1000)),d=Math.floor(s/86400);s%=86400;let h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);s%=60;el.textContent=[d,h,m,s].map(x=>String(x).padStart(2,"0")).join(":")}tick();setInterval(tick,1000);
}

function collisions(){
  const c=$("#collisionCanvas");if(!c)return;let balls=Array.from({length:18},(_,i)=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,r:8+Math.random()*15,c:i%3?green:red}));
  c.addEventListener("pointermove",e=>balls.forEach(b=>{const dx=b.x-e.clientX,dy=b.y-e.clientY,d=Math.hypot(dx,dy);if(d<100){b.vx+=dx/d*.7;b.vy+=dy/d*.7}}));
  function draw(){const {ctx,w,h}=fit(c);ctx.clearRect(0,0,w,h);balls.forEach(b=>{b.x+=b.vx;b.y+=b.vy;b.vx*=.995;b.vy*=.995;if(b.x<b.r||b.x>w-b.r)b.vx*=-1;if(b.y<b.r||b.y>h-b.r)b.vy*=-1;b.x=Math.max(b.r,Math.min(w-b.r,b.x));b.y=Math.max(b.r,Math.min(h-b.r,b.y));ctx.strokeStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.stroke()});requestAnimationFrame(draw)}draw();
}

function contact(){
  $("#contactForm")?.addEventListener("submit",e=>{e.preventDefault();const out=$("#transmission");let i=0,msg="QUERY NOTED. PHYSOC WILL REVIEW IT.";const timer=setInterval(()=>{out.textContent=msg.slice(0,i++);if(i>msg.length)clearInterval(timer)},35)});
}

scopeHero();miniSims();arc();channelWaves();resources();countdown();collisions();contact();loadEditableContent();
