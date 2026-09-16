(() => {
 // Native details provides keyboard semantics; this also supports older browsers.
 const benefits=[...document.querySelectorAll('.workshop-points details')];
 const pictures=[...document.querySelectorAll('[data-approach-image]')];
 pictures.forEach(img=>img.loading='eager');
 let activeApproach=0;
 function selectApproach(index){activeApproach=index;benefits.forEach((item,i)=>{item.open=i===index;item.querySelector('summary').setAttribute('aria-expanded',String(i===index));});pictures.forEach((img,i)=>img.hidden=i!==index);}
 benefits.forEach((item,index)=>item.querySelector('summary').addEventListener('click',event=>{event.preventDefault();selectApproach(index);}));
 benefits.forEach((item,index)=>item.addEventListener('toggle',()=>{if(item.open&&index!==activeApproach)selectApproach(index);else if(!benefits.some(entry=>entry.open))selectApproach(activeApproach);}));
 selectApproach(0);
 document.querySelector('.hero-actions .text-link').addEventListener('click',()=>{if(document.querySelector('.quiz-panel').hidden)document.querySelector('.quiz-start').click();});
 // Measure every answer at the actual column width, then reserve one answer slot.
 const proof=document.querySelector('.workshop-points');let measuredWidth=-1;
 const reserveProof=()=>{
  const width=proof.getBoundingClientRect().width;
  const probe=proof.cloneNode(true);probe.classList.remove('proof-stable');
  probe.setAttribute('aria-hidden','true');probe.inert=true;
  Object.assign(probe.style,{position:'absolute',left:'-10000px',top:'0',width:`${width}px`,visibility:'hidden',pointerEvents:'none'});
  probe.querySelectorAll('details').forEach(item=>{item.removeAttribute('name');item.open=true;});
  document.body.append(probe);
  const rows=[...probe.querySelectorAll('details')];
  const answerHeight=Math.ceil(Math.max(...rows.map(item=>item.querySelector('p').getBoundingClientRect().height)));
  const headers=rows.reduce((sum,item)=>sum+item.getBoundingClientRect().height-item.querySelector('p').getBoundingClientRect().height,0);
  probe.remove();proof.style.setProperty('--proof-answer-height',`${answerHeight}px`);
  proof.style.setProperty('--proof-total-height',`${Math.ceil(headers+answerHeight)}px`);
  proof.classList.add('proof-stable');measuredWidth=width;
 };
 new ResizeObserver(()=>{if(Math.abs(proof.getBoundingClientRect().width-measuredWidth)>.5)reserveProof();}).observe(proof);
 document.fonts.ready.then(reserveProof);
})();
