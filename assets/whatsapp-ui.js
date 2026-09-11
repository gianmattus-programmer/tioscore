(()=>{
  const root=document.querySelector('.ts-wa');
  if(!root)return;
  const trigger=root.querySelector('.ts-wa-trigger');
  const topButton=root.querySelector('.ts-wa-top');
  const close=root.querySelector('.ts-wa-close');
  const panel=root.querySelector('.ts-wa-panel');
  const backdrop=root.querySelector('.ts-wa-backdrop');
  const action=root.querySelector('.ts-wa-action');
  const preview=root.querySelector('.ts-wa-preview span');
  const choices=[...root.querySelectorAll('[data-wa-message]')];
  const mobileQuery=window.matchMedia('(max-width: 767px)');
  const phone='51949771751';
  const defaultMessage='Hola, Tío Score. Quisiera orientación sobre mi score o situación crediticia.';
  let selectedMessage=defaultMessage;
  let scrollTimer=null;

  const waUrl=message=>`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  function setMessage(message,source){
    selectedMessage=message||defaultMessage;
    if(preview)preview.textContent=selectedMessage;
    if(action)action.href=waUrl(selectedMessage);
    choices.forEach(el=>el.classList.toggle('is-selected',el===source));
  }

  function setOpen(open){
    root.classList.toggle('is-open',open);
    trigger.setAttribute('aria-expanded',String(open));
    panel?.setAttribute('aria-hidden',String(!open));
    document.documentElement.classList.toggle('ts-wa-lock',open);
    document.body.classList.toggle('ts-wa-lock',open);
    if(open)root.classList.remove('is-scrolling');
  }

  trigger.addEventListener('click',()=>setOpen(!root.classList.contains('is-open')));
  close?.addEventListener('click',()=>{setOpen(false);trigger.focus();});
  backdrop?.addEventListener('click',()=>setOpen(false));
  document.addEventListener('click',e=>{if(!mobileQuery.matches&&!root.contains(e.target))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('is-open')){setOpen(false);trigger.focus();}});

  choices.forEach(choice=>choice.addEventListener('click',()=>setMessage(choice.getAttribute('data-wa-message')||defaultMessage,choice)));

  const updateTopButton=()=>root.classList.toggle('has-scrolled',window.scrollY>120);
  topButton?.addEventListener('click',()=>{
    setOpen(false);
    window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  updateTopButton();

  // Desktop: se oculta durante cualquier desplazamiento y reaparece al detenerse.
  window.addEventListener('scroll',()=>{
    updateTopButton();
    if(mobileQuery.matches)return;
    setOpen(false);
    root.classList.add('is-scrolling');
    clearTimeout(scrollTimer);
    scrollTimer=setTimeout(()=>root.classList.remove('is-scrolling'),420);
  },{passive:true});

  mobileQuery.addEventListener?.('change',()=>{
    root.classList.remove('is-scrolling');
    setOpen(false);
  });

  setMessage(defaultMessage,null);
})();

