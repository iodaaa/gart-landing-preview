/* UX safeguards only. Real bot protection must run at the submission endpoint. */
(() => {
 const born=performance.now(),attempts=new Map();let lastSuccess=-Infinity;
 const minDelay=3000,cooldown=30000;
 let transport=null;
 const message='Прототип: заявка не отправлена. После подключения формы здесь появится подтверждение отправки.';
 function attach(form,key){
  if(!form.querySelector('[name=website]')){const trap=document.createElement('div');trap.className='spam-field';trap.setAttribute('aria-hidden','true');trap.innerHTML='<label>Оставьте поле пустым<input type="text" name="website" tabindex="-1" autocomplete="off"></label>';form.append(trap);}
  if(!attempts.has(key))attempts.set(key,{busy:false,done:false,id:crypto.randomUUID()});
  return {async submit(data){
   const state=attempts.get(key);
   if(state.busy||state.done)return{ok:false,message:'Эта форма уже обработана. Не отправляйте её повторно.'};
   const errors=GartQuiz.validateContact(data.name||'',data.phone||'',data.consent===true);
   if(Object.keys(errors).length)return{ok:false,message:Object.values(errors)[0]};
   if(form.elements.website.value)return{ok:false,message:'Не удалось обработать форму. Обновите страницу и попробуйте ещё раз.'};
   if(performance.now()-born<minDelay)return{ok:false,message:'Проверьте введённые данные и повторите через несколько секунд.'};
   if(performance.now()-lastSuccess<cooldown)return{ok:false,message:'Форма уже обработана. Подождите 30 секунд перед новым обращением.'};
   state.busy=true;const button=form.querySelector('[type=submit]');button.disabled=true;button.setAttribute('aria-busy','true');
   try{
    const payload={...data,phone:data.phone.replace(/\D/g,''),website:form.elements.website.value,submissionId:state.id,formType:key};
    // A backend adapter must obtain a signed server challenge and submit it with this payload.
    const result=transport?await transport(payload):{ok:true,demo:true,message};
    if(!result||result.ok!==true)throw new Error('submission failed');
    state.done=true;lastSuccess=performance.now();return result;
   }catch{return{ok:false,message:'Не удалось отправить. Данные сохранены в форме — попробуйте ещё раз.'};}
   finally{state.busy=false;button.disabled=state.done;button.removeAttribute('aria-busy');}
  }};
 }
 window.GartLead={attach,reset(key){attempts.delete(key);},configureTransport(adapter){if(typeof adapter!=='function')throw new TypeError('Transport must be a function');transport=adapter;}};
})();
