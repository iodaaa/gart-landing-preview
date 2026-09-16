(function(root){
  function createState(){return {step:0,answers:['','','',''],contact:{name:'',phone:'',comment:'',method:'Позвонить',consent:true}};}
  function choose(state,value){if(state.step<4)state.answers[state.step]=value;}
  function next(state){if(state.step>=4||(state.step!==2&&!state.answers[state.step]))return false;state.step++;return true;}
  function back(state){state.step=Math.max(0,state.step-1);}
  function validateContact(name,phone,consent){
    const errors={};
    if(typeof name!=='string'||name.trim().length<2||name.length>80)errors.name='Укажите имя — от 2 до 80 символов.';
    const digits=phone.replace(/\D/g,'');
    if(!/^[+\d\s()\-]+$/.test(phone)||digits.length<10||digits.length>15||/^(\d)\1+$/.test(digits))errors.phone='Проверьте номер: от 10 до 15 цифр с кодом страны.';
    if(!consent)errors.consent='Подтвердите согласие для завершения подбора.';
    return errors;
  }
  root.GartQuiz={createState,choose,next,back,validateContact};
})(globalThis);
