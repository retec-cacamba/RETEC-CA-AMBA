(function(){
  const phone=(window.SITE_CONFIG&&window.SITE_CONFIG.whatsapp)||"5511926311240";
  function wa(msg){return 'https://wa.me/'+phone+'?text='+encodeURIComponent(msg)}
  document.querySelectorAll('.js-wa').forEach(function(el){
    const msg=el.getAttribute('data-message')||'Olá! Quero orçamento de caçamba em Curitiba.';
    el.href=wa(msg); el.target='_blank'; el.rel='noopener';
  });
  const form=document.getElementById('bookingForm');
  if(form){form.addEventListener('submit',function(e){
    e.preventDefault();
    const nome=document.getElementById('nome').value.trim();
    const local=document.getElementById('local').value.trim();
    const tam=document.getElementById('tam').value;
    const data=document.getElementById('data').value.trim();
    const msg=`Olá! Vim pelo site de Curitiba e quero reservar uma caçamba.\n\nNome: ${nome}\nLocal: ${local}\nTamanho: ${tam}\nQuando preciso: ${data||'a combinar'}`;
    window.open(wa(msg),'_blank','noopener');
  })}
})();
