
// Simple testimonials carousel and accordion
document.addEventListener('DOMContentLoaded', function(){
  // Testimonials carousel
  const slides = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.dot');
  let idx = 0;

  function show(i){
    // activate the i-th slide using class (opacity-based stacking)
    slides.forEach((s,si)=> s.classList.toggle('active', si === i));
    dots.forEach((d,di)=> d.classList.toggle('active', di === i));
  }

  // initialize
  show(0);
  let interval = setInterval(()=>{ idx = (idx + 1) % slides.length; show(idx); }, 4000);

  // dot clicks: go to index and restart autoplay
  dots.forEach((d,di)=> d.addEventListener('click', ()=>{
    idx = di;
    show(idx);
    clearInterval(interval);
    interval = setInterval(()=>{ idx = (idx + 1) % slides.length; show(idx); }, 4000);
  }));

  // Accordion
  document.querySelectorAll('.accordion-header').forEach(h=>{
    h.addEventListener('click', ()=> {
      const body = h.nextElementSibling;
      const open = body.style.display === 'block';
      document.querySelectorAll('.accordion-body').forEach(b=> b.style.display='none');
      if(!open) body.style.display='block';
    });
  });

  // Smooth scroll for internal nav links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({behavior:'smooth'});
    });
  });
});
