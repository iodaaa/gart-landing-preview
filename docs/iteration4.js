(() => {
 const tiles=[...document.querySelectorAll('.material-tile')];
 function selectMaterial(key){tiles.forEach(tile=>{const active=tile.dataset.material===key;tile.setAttribute('aria-expanded',String(active));tile.setAttribute('aria-pressed',String(active));});document.querySelectorAll('[data-material-info]').forEach(panel=>panel.hidden=panel.dataset.materialInfo!==key);}
 tiles.forEach(tile=>tile.addEventListener('click',()=>selectMaterial(tile.dataset.material)));
 selectMaterial('granite');
 const form=document.querySelector('.enquiry-form'),guard=GartLead.attach(form,'enquiry'),error=form.querySelector('.form-error');
 for(const field of ['name','phone','consent'])form.elements[field].setAttribute('aria-describedby','enquiry-error');
 form.addEventListener('submit',async e=>{e.preventDefault();error.textContent='';const data={name:form.elements.name.value,phone:form.elements.phone.value,comment:form.elements.comment.value,consent:form.elements.consent.checked};const errors=GartQuiz.validateContact(data.name,data.phone,data.consent);for(const name of ['name','phone','consent'])form.elements[name].setAttribute('aria-invalid',String(!!errors[name]));if(Object.keys(errors).length){error.textContent=Object.values(errors)[0];form.elements[Object.keys(errors)[0]].focus();return;}const result=await guard.submit(data);if(!result.ok){error.textContent=result.message;return;}const output=form.querySelector('.form-result');output.hidden=false;output.textContent=result.demo?result.message:'Заявка отправлена. Спасибо за обращение.';output.focus({preventScroll:true});});
})();
