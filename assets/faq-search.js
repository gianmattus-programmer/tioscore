(()=>{
  const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\binfocor[dt]\b|\binfocorp\b|\binfocor\b/g,'infocorp').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  const stop=new Set('a al algo ante con como cual cuando de del el ella en es esta estoy este fue hay la las le lo los me mi mis muy no o para pero por porque que se si sin son su sus tengo tu un una unas unos y ya puedo quiero saber estoy estar'.split(' '));
  const aliases={deudas:'deuda',debo:'deuda',debiendo:'deuda',pague:'pagar',pagado:'pagar',pago:'pagar',pagando:'pagar',pagos:'pagar',cancelada:'pagar',cancelar:'pagar',prestamo:'credito',prestamos:'credito',creditos:'credito',puntaje:'score',puntos:'score',tarjetas:'tarjeta',atrasos:'atraso',atrasado:'atraso',moroso:'atraso',mora:'atraso',reportado:'infocorp',reportada:'infocorp',equifax:'infocorp'};
  const tokens=text=>[...new Set(normalize(text).split(' ').filter(t=>t.length>1&&!stop.has(t)).map(t=>aliases[t]||t))];
  function near(a,b){if(a===b)return true;if(Math.min(a.length,b.length)<5||Math.abs(a.length-b.length)>1)return false;let i=0,j=0,edits=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++edits>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++;}return edits+(i<a.length||j<b.length?1:0)<=1;}
  const intents=[
    [/infocorp/,['J','H','V']],
    [/(ya|termine|acabo de) (pague|pagar|cancele)|deuda (pagada|cancelada)|pague.*deuda/,['P','J','H']],
    [/no (puedo|alcanza|tengo.*para) pagar|sin dinero|no me alcanza/,['I','S','X']],
    [/aval|garante/,['L']],
    [/(score|puntaje).*(bajo|subir|mejorar)|subir.*(score|puntaje)/,['A','G','K']],
    [/no me (prestan|aprueban)|rechaz|nadie me presta/,['D','F','Y']],
    [/refinancia|reprograma/,['S','I']],
    [/prescrib|caduc|desaparec/,['M','J']],
    [/minimo.*tarjeta|pago minimo/,['T']],
    [/ruc|ingresos/,['U','Y']],
    [/consolida|unificar|juntar.*deuda/,['X']],
    [/alquil/,['R']],
    [/consultar.*(reporte|score)|ver.*(reporte|score)/,['N','V']]
  ];
  function rank(query,record){const q=normalize(query),terms=tokens(query);let score=0;const title=tokens(record.title),body=tokens(record.text);for(const t of terms){if(title.some(w=>near(t,w)))score+=5;else if(body.some(w=>near(t,w)))score+=1;}
    if(q.length>3&&normalize(record.title).includes(q))score+=15;
    for(const [pattern,ids] of intents){if(pattern.test(q)){const i=ids.indexOf(record.key);if(i>=0)score+=30-i*7;}}
    // A generic word alone is not enough to recommend an unrelated answer.
    return terms.length?score:0;
  }
  const input=document.getElementById('faqSearch'),grid=document.getElementById('faqGrid');
  const records=Array.from(grid.querySelectorAll('.faq-item')).map((item,index)=>({item,index,key:item.querySelector('.faq-q-icon').textContent.trim(),title:item.querySelector('.faq-question > span').textContent.trim(),text:item.textContent,cat:item.dataset.cat}));
  let activeCat='all';
  function collapse(record){record.item.classList.remove('open');record.item.querySelector('.faq-question').setAttribute('aria-expanded','false');record.item.querySelector('.faq-answer').style.maxHeight='';}
  function render(){const query=input.value.trim();const ranked=records.map(record=>({...record,score:query?rank(query,record):0})).filter(record=>activeCat==='all'||record.cat.split(' ').includes(activeCat)).filter(record=>!query||record.score>=4).sort((a,b)=>query?b.score-a.score||a.index-b.index:a.index-b.index);
    const shown=query?ranked.slice(0,6):ranked;const ids=new Set(shown.map(r=>r.index));
    records.forEach(record=>{record.item.classList.toggle('hidden',!ids.has(record.index));if(!ids.has(record.index))collapse(record);});
    shown.forEach(record=>grid.appendChild(record.item));
    const suggestions=document.getElementById('faqSuggestions'),list=document.getElementById('faqSuggestionLinks');list.replaceChildren();suggestions.hidden=!query||!shown.length;
    shown.slice(0,3).forEach(record=>{const button=document.createElement('button');button.type='button';button.textContent=record.title;button.addEventListener('click',()=>{const target=record.item.querySelector('.faq-question');if(!record.item.classList.contains('open'))toggleFAQ(target);target.focus({preventScroll:true});record.item.scrollIntoView({behavior:'smooth',block:'center'});});list.appendChild(button);});
    document.getElementById('faqEmpty').hidden=shown.length>0;
    document.getElementById('faqCounter').textContent=query?`${shown.length} preguntas relacionadas con tu búsqueda`:`Mostrando ${shown.length} de ${records.length} preguntas`;
  }
  window.filterFAQ=()=>{activeCat='all';document.querySelectorAll('.faq-cat-btn').forEach((b,i)=>b.classList.toggle('active',i===0));render();};
  window.filterCat=(cat,button)=>{activeCat=cat;document.querySelectorAll('.faq-cat-btn').forEach(b=>b.classList.toggle('active',b===button));render();};
  document.getElementById('faqReset').addEventListener('click',()=>{input.value='';filterFAQ();input.focus();});
  input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();document.querySelector('#faqSuggestionLinks button')?.click();}});
  document.getElementById('faqCounter').setAttribute('aria-live','polite');render();
})();

