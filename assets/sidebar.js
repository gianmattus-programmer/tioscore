(()=>{
  const links=Array.from(document.querySelectorAll('.ts-side-nav a'));
  const targets=links.map(link=>document.getElementById(link.hash.slice(1)));
  const desktop=window.matchMedia('(min-width:1100px)');
  function syncSection(){
    if(!desktop.matches)return;
    let active=0;
    targets.forEach((target,index)=>{if(target && target.getBoundingClientRect().top<=Math.min(180,window.innerHeight*.25))active=index;});
    links.forEach((link,index)=>{if(index===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  let pending=false;
  window.addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{syncSection();pending=false;});},{passive:true});
  window.addEventListener('resize',syncSection);window.addEventListener('hashchange',syncSection);
  desktop.addEventListener('change',syncSection);syncSection();
})();

