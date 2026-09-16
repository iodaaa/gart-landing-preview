(() => {
 const steps=[...document.querySelectorAll('.order-mobile details')];
 let active=0;
 const select=index=>{
  active=index;
  steps.forEach((step,i)=>{
   step.open=i===index;
   step.querySelector('summary').setAttribute('aria-expanded',String(i===index));
  });
 };
 steps.forEach((step,index)=>{
  const summary=step.querySelector('summary');
  summary.addEventListener('click',event=>{event.preventDefault();select(index);});
  step.addEventListener('toggle',()=>{
   if(step.open&&index!==active)select(index);
   else if(!steps.some(item=>item.open))select(active);
  });
 });
 select(0);
})();
