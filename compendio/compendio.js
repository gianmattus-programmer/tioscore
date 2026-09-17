(function(){
  const imgs=[...document.querySelectorAll('[data-module-image]')];
  imgs.forEach(img=>{const n=Number(img.dataset.moduleImage);if(window.TS_MODULE_IMAGES&&window.TS_MODULE_IMAGES[n])img.src=window.TS_MODULE_IMAGES[n];});
  const sections=[...document.querySelectorAll('.module-section')];
  const navLinks=[...document.querySelectorAll('.side-nav a')];
  const search=document.getElementById('topicSearch');
  const clear=document.getElementById('clearSearch');
  const count=document.getElementById('resultCount');
  const empty=document.getElementById('emptyState');
  const progress=document.getElementById('progress');
  const norm=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
  function syncNav(){
    let current=1;const marker=window.scrollY+Math.min(190,innerHeight*.24);
    sections.forEach(s=>{if(s.offsetTop<=marker)current=Number(s.dataset.module);});
    navLinks.forEach(a=>{if(Number(a.dataset.navModule)===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.width=Math.min(100,Math.max(0,scrollY/max*100))+'%';
  }
  let raf=0;addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{syncNav();raf=0;})},{passive:true});addEventListener('resize',syncNav);syncNav();
  document.querySelectorAll('[data-toggle-module]').forEach(btn=>btn.addEventListener('click',()=>{const n=btn.dataset.toggleModule;const panel=document.getElementById('topics-'+n);const collapsed=panel.classList.toggle('is-collapsed');btn.setAttribute('aria-expanded',String(!collapsed));btn.querySelector('span').textContent=collapsed?'Ver 10 fichas':'Ocultar fichas';}));
  document.getElementById('expandAll').addEventListener('click',()=>{const collapsed=sections.some(s=>s.querySelector('.topics-panel').classList.contains('is-collapsed'));sections.forEach(s=>{const p=s.querySelector('.topics-panel');p.classList.toggle('is-collapsed',!collapsed);const b=s.querySelector('.toggle-topics');b.setAttribute('aria-expanded',String(collapsed));b.querySelector('span').textContent=collapsed?'Ocultar fichas':'Ver 10 fichas';});document.getElementById('expandAll').lastChild.textContent=collapsed?' Contraer todo':' Expandir todo';});
  function filter(){const q=norm(search.value);let visible=0;sections.forEach(sec=>{const secMatch=!!q&&norm(sec.dataset.title).includes(q);let topicMatches=0;sec.querySelectorAll('.topic-item').forEach(item=>{const hit=!q||secMatch||norm(item.textContent).includes(q);item.classList.toggle('no-match',!hit&&!!q);item.classList.toggle('match',!!q&&!secMatch&&hit);if(hit)topicMatches++;});const show=!q||secMatch||topicMatches>0;sec.classList.toggle('is-hidden',!show);if(show&&q){sec.querySelector('.topics-panel').classList.remove('is-collapsed');sec.querySelector('.toggle-topics').setAttribute('aria-expanded','true');sec.querySelector('.toggle-topics span').textContent='Ocultar fichas';}visible+=q?(secMatch?10:topicMatches):10;});count.textContent=visible+' de 100 fichas';empty.classList.toggle('show',visible===0);clear.hidden=!search.value;}
  search.addEventListener('input',filter);clear.addEventListener('click',()=>{search.value='';filter();search.focus();});document.querySelectorAll('[data-jump-search]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('buscar').scrollIntoView({behavior:'smooth'});setTimeout(()=>search.focus(),350);}));
  async function readyImages(){await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true})})));}
  async function doPrint(module){await readyImages();if(module)document.body.dataset.printModule=module;window.print();setTimeout(()=>delete document.body.dataset.printModule,400);}
  document.querySelectorAll('[data-print-all]').forEach(b=>b.addEventListener('click',()=>doPrint()));document.querySelectorAll('[data-print-module]').forEach(b=>b.addEventListener('click',()=>doPrint(b.dataset.printModule)));addEventListener('afterprint',()=>delete document.body.dataset.printModule);
})();
