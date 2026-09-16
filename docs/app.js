(() => {
  const model=window.GartQuiz;
  let state=model.createState(),reference=null,uploadVersion=0;
  const content=document.querySelector('#quiz-content');
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const steps=[
    {title:'Что вы хотите изготовить?',subtitle:'Выберите один из вариантов, чтобы мы могли предложить наиболее подходящие решения.',options:['Лампаду','Вазу','Скульптуру или декоративное изделие','Скамью / стол','Другое изделие из камня','Пока не определился']},
    {title:'Расскажите, с чего хотите начать',subtitle:'Это поможет нам лучше понять вашу задачу и предложить подходящее решение.',options:['Нашёл подходящий вариант и хочу изготовить похожий','У меня есть фотография или пример','Есть идея, но готового примера пока нет','Пока выбираю — нужна помощь']},
    {title:'Есть пример того, что вам нравится?',subtitle:'Загрузите фотографию, рисунок или скриншот. Это поможет нам точнее понять задачу и рассчитать стоимость.'},
    {title:'Что для вас сейчас важнее всего узнать?',subtitle:'Выберите один вариант — мы сосредоточимся на том, что для вас действительно важно.',options:['Сколько примерно будет стоить','Как лучше реализовать выбранный вариант','Какие материалы подойдут','Какой размер лучше выбрать','Хочу обсудить задачу со специалистом']}
  ];
  const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
  function startQuiz(){document.querySelector('.quiz-entry').hidden=true;document.querySelector('.quiz-panel').hidden=false;document.querySelector('.quiz-shell').classList.add('is-started');}
  function focusTitle(){const h=content.querySelector('h3');h.focus({preventScroll:true});const r=h.getBoundingClientRect();if(r.top<30||r.bottom>innerHeight-30)h.scrollIntoView({block:'center',behavior:motion()});}
  function updateProgress(complete=false){document.querySelector('#step-label').textContent=complete?'ГОТОВО':state.step===4?'КОНТАКТЫ':`ШАГ ${state.step+1} ИЗ 4`;document.querySelector('#progress-fill').style.width=`${complete?100:(state.step+1)*20}%`;document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',complete?5:state.step+1);}
  const controls=(disabled=false)=>`<div class="quiz-controls">${state.step?'<button class="quiz-back" type="button">← Назад</button>':'<span class="quiz-hint">Выберите один вариант</span>'}<button class="button quiz-next" type="button" ${disabled?'disabled':''}>Далее <span aria-hidden="true">→</span></button></div>`;
  function clearReference(){uploadVersion++;if(reference)URL.revokeObjectURL(reference.url);reference=null;state.answers[2]='';}
  async function receiveFile(file){
    if(!file)return;
    const version=++uploadVersion,error=content.querySelector('#upload-error');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){error.textContent='Выберите изображение в формате JPG, PNG или WEBP.';return;}
    if(file.size>10*1024*1024){error.textContent='Изображение больше 10 МБ. Выберите файл меньшего размера.';return;}
    const url=URL.createObjectURL(file),img=new Image();img.src=url;error.textContent='Проверяем изображение…';
    try{await img.decode();if(version!==uploadVersion||state.step!==2){URL.revokeObjectURL(url);return;}if(reference)URL.revokeObjectURL(reference.url);reference={url,name:file.name};state.answers[2]=file.name;render();content.querySelector('.replace-image').focus({preventScroll:true});}
    catch{URL.revokeObjectURL(url);if(version===uploadVersion&&state.step===2)error.textContent='Не удалось открыть изображение. Попробуйте другой файл.';}
  }
  function renderUpload(){
    content.insertAdjacentHTML('beforeend',`<input class="file-input" id="reference-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Выбрать изображение" tabindex="-1"><div class="upload-zone">${reference?`<div class="upload-preview"><img src="${reference.url}" alt="Ваш загруженный пример изделия"><div><p>${escape(reference.name)}</p><p class="upload-status">✓ Изображение загружено</p><button type="button" class="inline-link replace-image">Заменить</button><button type="button" class="inline-link remove-image">Удалить</button></div></div>`:'<svg class="upload-icon" aria-hidden="true" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="2"/><circle cx="14" cy="14" r="3"/><path d="m5 29 10-10 7 7 6-7 7 8"/></svg><p>Перетащите изображение сюда</p><button class="button choose-image" type="button">Выбрать изображение</button><small>JPG, PNG или WEBP · до 10 МБ</small>'}</div><p class="quiz-error" id="upload-error" role="status" aria-live="polite"></p>${reference?'':'<button type="button" class="inline-link upload-skip">Продолжить без изображения</button>'}${controls()}`);
    const zone=content.querySelector('.upload-zone'),input=content.querySelector('#reference-file');
    content.querySelector('.choose-image,.replace-image').addEventListener('click',()=>input.click());input.addEventListener('change',()=>receiveFile(input.files[0]));
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('is-dragging');});zone.addEventListener('dragleave',()=>zone.classList.remove('is-dragging'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('is-dragging');receiveFile(e.dataTransfer.files[0]);});
    content.querySelector('.remove-image')?.addEventListener('click',()=>{clearReference();render();content.querySelector('.choose-image').focus({preventScroll:true});});content.querySelector('.upload-skip')?.addEventListener('click',advance);
  }
  function advance(){uploadVersion++;if(model.next(state))render(true);}
  function render(focus=false){
    updateProgress();
    if(state.step<4){const step=steps[state.step];content.innerHTML=`<h3 class="question-title" id="question-title" tabindex="-1">${step.title}</h3><p class="question-subtitle" id="question-description">${step.subtitle}</p>`;
      if(state.step===2)renderUpload();
      else content.insertAdjacentHTML('beforeend',`<fieldset class="quiz-options" aria-labelledby="question-title" aria-describedby="question-description">${step.options.map(option=>`<label class="quiz-option"><input type="radio" name="quiz-answer" value="${escape(option)}" ${state.answers[state.step]===option?'checked':''}><span>${option}</span></label>`).join('')}</fieldset>${controls(!state.answers[state.step])}`);
      content.querySelectorAll('[name=quiz-answer]').forEach(input=>input.addEventListener('change',()=>{model.choose(state,input.value);content.querySelector('.quiz-next').disabled=false;}));content.querySelector('.quiz-next').addEventListener('click',advance);
    }else renderContact();
    content.querySelector('.quiz-back')?.addEventListener('click',()=>{uploadVersion++;model.back(state);render(true);});if(focus)focusTitle();
  }
  function renderContact(){
    content.innerHTML=`<h3 class="question-title" tabindex="-1">Остался последний шаг</h3><p class="question-subtitle">Оставьте контакт — специалист свяжется с вами, ответит на вопросы и сориентирует по стоимости.</p><form class="contact-form" novalidate><div class="quiz-inputs"><label class="field-label">Ваше имя<input name="name" autocomplete="given-name" maxlength="80" required placeholder="Например: Анна" value="${escape(state.contact.name)}" aria-describedby="contact-error"></label><label class="field-label">Телефон<input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="25" required placeholder="+7 (___) ___-__-__" value="${escape(state.contact.phone)}" aria-describedby="contact-error"></label></div><label class="field-label comment-field">Комментарий (необязательно)<textarea name="comment" maxlength="2000" placeholder="Например: хотелось бы сделать из светлого камня, примерный размер 25 × 15 см">${escape(state.contact.comment)}</textarea></label><fieldset class="contact-methods"><legend>Как удобнее связаться?</legend>${['Позвонить','WhatsApp','Telegram'].map(method=>`<label><input type="radio" name="method" value="${method}" ${state.contact.method===method?'checked':''}>${method}</label>`).join('')}</fieldset>${reference?`<div class="contact-reference"><img src="${reference.url}" alt="Ваш референс"><span>Ваш референс<br>${escape(reference.name)}</span></div>`:''}<label class="consent"><input type="checkbox" name="consent" ${state.contact.consent?'checked':''} required aria-describedby="contact-error"><span>Я согласен на обработку персональных данных. <a class="inline-link" href="privacy.html" target="_blank" rel="noopener">Подробнее</a></span></label><p class="demo-note">Прототип: контакты и изображение не отправляются.</p><p class="quiz-error" id="contact-error" role="alert"></p><div class="quiz-controls"><button class="quiz-back" type="button">← Назад</button><button class="button quiz-next" type="submit">Получить ответ и расчёт <span aria-hidden="true">→</span></button></div></form>`;
    const form=content.querySelector('form');
    const guard=window.GartLead.attach(form,'quiz');
    const save=()=>{state.contact={name:form.elements.name.value,phone:form.elements.phone.value,comment:form.elements.comment.value,method:form.elements.method.value,consent:form.elements.consent.checked};};
    form.addEventListener('input',save);form.addEventListener('change',save);form.addEventListener('submit',async event=>{event.preventDefault();save();const errors=model.validateContact(state.contact.name,state.contact.phone,state.contact.consent);for(const name of ['name','phone','consent'])form.elements[name].setAttribute('aria-invalid',String(Boolean(errors[name])));if(Object.keys(errors).length){content.querySelector('#contact-error').textContent=Object.values(errors)[0];form.elements[Object.keys(errors)[0]].focus();return;}const result=await guard.submit({...state.contact,answers:[...state.answers]});if(!result.ok){content.querySelector('#contact-error').textContent=result.message;return;}success();});
  }
  function success(){
    updateProgress(true);content.innerHTML=`<div class="quiz-success"><span class="success-mark" aria-hidden="true">✓</span><h3 class="question-title" tabindex="-1">${escape(state.contact.name.trim())},<br>ваш запрос сформирован.</h3><dl class="quiz-summary"><dt>Изделие</dt><dd>${escape(state.answers[0])}</dd><dt>С чего начнём</dt><dd>${escape(state.answers[1])}</dd><dt>Пример</dt><dd>${escape(reference?.name||'Без изображения')}</dd><dt>Важно узнать</dt><dd>${escape(state.answers[3])}</dd><dt>Связь</dt><dd>${escape(state.contact.method)}</dd></dl><p>Это демонстрация: заявка не отправлена, и звонка не будет. После подключения формы здесь появится подтверждение отправки.</p><button class="text-link quiz-reset" type="button">Пройти подбор ещё раз <span aria-hidden="true">↗</span></button></div>`;
    state.contact=model.createState().contact;clearReference();content.querySelector('.quiz-reset').addEventListener('click',()=>{state=model.createState();window.GartLead.reset('quiz');render(true);});focusTitle();
  }
  document.querySelector('.quiz-start').addEventListener('click',()=>{startQuiz();render(true);});
  const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
  function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('is-open');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('is-open',open);});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  const privacy=document.querySelector('#privacy-dialog'),catalog=document.querySelector('#catalog-dialog');
  document.addEventListener('click',event=>{if(event.target.closest('[data-privacy]'))privacy.showModal();const button=event.target.closest('[data-catalog]');if(button){catalog.querySelector('h2').textContent=button.dataset.catalog;catalog.showModal();}});
  catalog.querySelector('.catalog-quiz').addEventListener('click',()=>{catalog.close();startQuiz();render();document.querySelector('#quiz').scrollIntoView({behavior:motion()});focusTitle();});
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelectorAll('.dialog-close,.dialog-done').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});});
  render();
})();

