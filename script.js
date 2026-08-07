(() => {
  'use strict';
  const cfg = window.DISK_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const trackedKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid'];
  const tracked = new URLSearchParams();
  trackedKeys.forEach(k => { if (params.get(k)) tracked.set(k, params.get(k)); });

const sendEvent = (event, extra={}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event, ...extra});
};
const reportWhatsAppConversion = () => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', {
    send_to: 'AW-18362672744/BT1hcOmNqNocEOjMgLRE',
    value: 1.0,
    currency: 'BRL'
  });
};
const waUrl = message => `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(message || cfg.whatsappMessage || 'Olá!')}`;
  const checkoutUrl = size => {
    const url = new URL(cfg.checkoutUrl, location.href);
    tracked.forEach((v,k)=>url.searchParams.set(k,v));
    if(size) url.searchParams.set('cacamba',size);
    return url.toString();
  };
document.querySelectorAll('.labor-link').forEach(a => {
  a.href = waUrl(cfg.laborMessage || 'Olá! Gostaria de alugar uma caçamba e adicionar mão de obra por R$ 80,00.');
  a.target = '_blank'; a.rel = 'noopener';
  a.addEventListener('click', () => {
    reportWhatsAppConversion();
    sendEvent('labor_quote_click', {service:'cacamba_com_mao_de_obra', price:80});
  });
});
document.querySelectorAll('.wa-link').forEach(a => {
  a.href = waUrl(); a.target='_blank'; a.rel='noopener';
  a.addEventListener('click',()=>{
    reportWhatsAppConversion();
    sendEvent('whatsapp_click',{location:a.closest('section,header,footer')?.id||'page'});
  });
});
  document.querySelectorAll('.checkout-link').forEach(a => {
    a.href = checkoutUrl();
    a.addEventListener('click',()=>sendEvent('checkout_click',{location:a.closest('section,header,footer')?.id||'page'}));
  });
  document.getElementById('ctaPhone').textContent = cfg.phoneDisplay || 'WhatsApp';
  document.getElementById('footerPhone').textContent = cfg.phoneDisplay || '';
  document.getElementById('addressText').textContent = cfg.address || '';
  document.getElementById('footerAddress').textContent = cfg.address || '';

  const sizes = [
    {size:'3 m³',dims:['1,80 m comp.','1,20 m larg.','1,10 m alt.'],use:'Pequenas limpezas e reformas.',tag:'Compacta'},
    {size:'4 m³',dims:['2,10 m comp.','1,50 m larg.','1,10 m alt.'],use:'Reformas residenciais e limpeza.',tag:'Versátil'},
    {size:'5 m³',dims:['2,40 m comp.','1,70 m larg.','1,20 m alt.'],use:'Reformas em geral e maior volume.',tag:'Mais pedida',featured:true},
    {size:'7 m³',dims:['2,90 m comp.','1,90 m larg.','1,20 m alt.'],use:'Obras médias e grandes reformas.',tag:'Maior volume'},
    {size:'10 m³',dims:['2,50 m comp.','1,90 m larg.','1,40 m alt.'],use:'Grandes obras e construções.',tag:'Obras grandes'},
    {size:'16 m³',dims:['4,10 m comp.','2,90 m larg.','1,60 m alt.'],use:'Grandes volumes e demolições.',tag:'Sob consulta',consult:true}
  ];
  const grid = document.getElementById('dumpsterGrid');
  grid.innerHTML = sizes.map(s => `<article class="dumpster-card ${s.featured?'featured':''}">${s.featured?'<span class="popular-tag">MAIS PEDIDA</span>':''}<div class="dumpster-visual"><img src="cacamba.webp?v=20" width="380" height="230" loading="lazy" alt="Caçamba amarela Disk Caçamba ${s.size}"></div><div class="dumpster-body"><div class="dumpster-title"><h3>${s.size}</h3><span>${s.tag}</span></div><div class="dimensions">${s.dims.map(d=>`<span>${d}</span>`).join('')}</div><p>${s.use}</p><div class="card-extras"><span>⚡ Entrega em até 2 horas</span><span>👷 Mão de obra + R$ 80,00</span></div><a class="button button-book size-checkout" data-size="${s.size}" href="#"><span>${s.consult?'Consultar':'Reservar pelo WhatsApp'}</span><small>${s.consult?'Via WhatsApp':'Solicitar pelo WhatsApp'}</small></a></div></article>`).join('');
document.querySelectorAll('.size-checkout').forEach(a=>{
  const size = a.dataset.size;
  a.href = waUrl(`Olá! Vim pelo site da Disk Caçamba e gostaria de reservar uma caçamba de ${size}. Também quero saber sobre entrega em até 2 horas e a opção de mão de obra por R$ 80,00. Meu bairro/CEP é: `);
  a.target = '_blank';
  a.rel = 'noopener';
  const main = a.querySelector('span');
  const small = a.querySelector('small');
  if (main) main.textContent = 'Reservar pelo WhatsApp';
  if (small) small.textContent = `Solicitar caçamba de ${size}`;
  a.addEventListener('click',()=>{
    reportWhatsAppConversion();
    sendEvent('whatsapp_size_click',{size});
  });
});

  const subprefs=['Centro','Água Verde','Batel','Bigorrilho','Boqueirão','Cajuru','CIC','Portão','Santa Felicidade','Pinheirinho','Boa Vista','Bairro Alto','Uberaba','Hauer','Xaxim','São José dos Pinhais','Colombo','Pinhais','Araucária','Campo Largo','Fazenda Rio Grande','Almirante Tamandaré','Quatro Barras','Campina Grande do Sul'];
  document.getElementById('subprefList').innerHTML=subprefs.map(x=>`<span>${x}</span>`).join('');

  const faqs=[
    ['A entrega em até 2 horas é garantida?','O prazo é uma modalidade expressa sujeita à região, trânsito e disponibilidade operacional. A equipe confirma antes da contratação.'],
    ['Qual é o prazo de entrega?','O prazo depende da região, do trânsito e da disponibilidade operacional. A equipe confirma a previsão antes da contratação.'],
    ['Posso colocar a caçamba na rua?','A possibilidade depende das regras locais e das condições do endereço. Informe o local para receber a orientação adequada.'],
    ['Quais materiais posso descartar?','Informe o tipo de resíduo antes da reserva. Materiais perigosos, líquidos e itens com destinação especial podem não ser permitidos.'],
    ['Quanto tempo posso ficar com a caçamba?','O período é informado no orçamento e pode variar de acordo com o serviço escolhido.'],
    ['Como funciona o pagamento?','As formas disponíveis são apresentadas no checkout ou informadas pela equipe antes da confirmação.'],
    ['A retirada é automática?','A retirada segue o prazo combinado. Quando necessário, confirme com a equipe pelo WhatsApp.'],
    ['Atendem condomínios e empresas?','Sim, mediante consulta do endereço, acesso e necessidade do serviço.'],
    ['Posso contratar mão de obra junto com a caçamba?','Sim. A mão de obra é um adicional de R$ 80,00 disponível junto com a locação da caçamba.'],
    ['Quanto custa a mão de obra?','O adicional informado no site é de R$ 80,00 e deve ser contratado junto com a caçamba. Confirme o escopo antes do fechamento.'],
    ['As medidas são exatas?','São medidas aproximadas. O formato pode variar conforme o equipamento disponibilizado.']
  ];
  document.getElementById('faqList').innerHTML=faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');

  const menuBtn=document.querySelector('.menu-toggle'), menu=document.querySelector('.mobile-menu');
  menuBtn.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}));

document.getElementById('leadForm').addEventListener('submit',e=>{
  e.preventDefault(); const fd=new FormData(e.currentTarget);
  const msg=`Olá! Vim pelo site da Disk Caçamba.
Nome: ${fd.get('name')}
Bairro/CEP: ${fd.get('location')}
Serviço: ${fd.get('service')}
Tamanho da caçamba: ${fd.get('size')}
Gostaria de confirmar disponibilidade, prazo expressa e valor.`;
  sendEvent('lead_form_submit',{service:fd.get('service'),size:fd.get('size')});
  reportWhatsAppConversion();
  window.open(waUrl(msg),'_blank','noopener');
});



  const mapTooltipV22 = document.getElementById('mapTooltipV22');
  document.querySelectorAll('.map-point-v22').forEach(point => {
    const showPoint = () => {
      if (!mapTooltipV22) return;
      mapTooltipV22.querySelector('strong').textContent = point.dataset.region;
      mapTooltipV22.querySelector('span').textContent = point.dataset.status;
    };
    point.addEventListener('mouseenter', showPoint);
    point.addEventListener('focus', showPoint);
    point.addEventListener('click', () => {
      showPoint();
      sendEvent('map_region_click', {region: point.dataset.region, status: point.dataset.status});
      reportWhatsAppConversion();
      window.open(waUrl(`Olá! Vim pelo mapa do site da Disk Caçamba e gostaria de consultar entrega para ${point.dataset.region}. Meu bairro/CEP é: `), '_blank', 'noopener');
    });
  });

  const activityMessages = [
    ['⚡ Entrega expressa disponível', 'Consulte prazo para Curitiba e região'],
    ['👷 Adicional de mão de obra', 'Inclua por R$ 80,00 junto com a caçamba'],
    ['📍 Atendimento em Curitiba', 'Confirme cobertura para seu bairro ou cidade'],
    ['🚛 Caçamba de 5 m³', 'Uma das opções mais procuradas no site'],
    ['💬 Orçamento rápido', 'Fale diretamente pelo WhatsApp']
  ];
  const toast = document.getElementById('activityToast');
  const toastTitle = document.getElementById('activityTitle');
  const toastText = document.getElementById('activityText');
  let activityIndex = 0;
  const showActivity = () => {
    if (!toast) return;
    const [title, text] = activityMessages[activityIndex % activityMessages.length];
    toastTitle.textContent = title;
    toastText.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5200);
    activityIndex++;
  };
  setTimeout(showActivity, 3500);
  setInterval(showActivity, 15000);

  const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  const back=document.querySelector('.back-top');
  addEventListener('scroll',()=>back.classList.toggle('show',scrollY>700),{passive:true});
  back.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

  const schema={"@context":"https://schema.org","@type":"LocalBusiness","name":cfg.companyName,"telephone":cfg.phoneDisplay,"address":{"@type":"PostalAddress","addressLocality":"Curitiba","addressRegion":"PR","addressCountry":"BR"},"areaServed":cfg.serviceArea,"url":location.origin};
  document.getElementById('schemaJson').textContent=JSON.stringify(schema);
})();
