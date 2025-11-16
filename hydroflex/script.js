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
  if (slides.length) {
    show(0);
    var interval = setInterval(()=>{ idx = (idx + 1) % slides.length; show(idx); }, 4000);

    // dot clicks: go to index and restart autoplay
    dots.forEach((d,di)=> d.addEventListener('click', ()=>{
      idx = di;
      show(idx);
      clearInterval(interval);
      interval = setInterval(()=>{ idx = (idx + 1) % slides.length; show(idx); }, 4000);
    }));
  }

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

  // --- Cart functionality ---
  const CART_KEY = 'hf_cart';

  function getCart(){
    try{
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    }catch(e){
      return [];
    }
  }
  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount(){
    const countEl = document.getElementById('cart-count');
    if(!countEl) return;
    const cart = getCart();
    const totalQty = cart.reduce((s,i)=> s + (i.qty||0), 0);
    countEl.textContent = totalQty;
    countEl.style.display = totalQty ? 'inline-block' : 'none';
  }

  function addToCart(item){
    const cart = getCart();
    // try to find similar item (same id/size)
    const existing = cart.find(i=> i.id === item.id && i.size === item.size);
    if(existing){
      existing.qty = Math.min(99, (existing.qty||0) + item.qty);
    } else {
      cart.push(item);
    }
    saveCart(cart);
  }

  // Bind add-to-cart on product page
  const addBtn = document.getElementById('add-to-cart');
  if(addBtn){
    addBtn.addEventListener('click', ()=>{
      const size = document.getElementById('product-size').value;
      const qty = parseInt(document.getElementById('product-qty').value, 10) || 1;
      const priceMap = { '500': 4500, '750': 5500 }; 
      const unitCents = priceMap[size] || 4500;
      const item = {
        id: 'hydroflex',
        name: 'HydroFlex',
        size: size + ' ml',
        qty: qty,
        price_cents: unitCents
      };
      addToCart(item);
      // feedback
      addBtn.textContent = 'Añadido ✓';
      setTimeout(()=> addBtn.textContent = 'Añadir al carrito', 1200);
    });

    // update displayed unit price when size changes
    const sizeSel = document.getElementById('product-size');
    const unitPriceEl = document.getElementById('unit-price');
    if(sizeSel && unitPriceEl){
      const priceMapDisplay = { '500': 45, '750': 55 };
      sizeSel.addEventListener('change', ()=>{
        unitPriceEl.textContent = priceMapDisplay[sizeSel.value];
      });
      // initialize
      unitPriceEl.textContent = priceMapDisplay[sizeSel.value] || priceMapDisplay['500'];
    }
  }

  // If on carrito page, render cart
  if(window.location.pathname.endsWith('carrito.html') || window.location.href.includes('carrito.html')){
    function centsToCurrency(c){
      return (c/100).toFixed(2).replace('.',',') + ' ARS';
    }
    const cartArea = document.getElementById('cart-content');
    function renderCart(){
      const cart = getCart();
      if(!cartArea) return;
      if(cart.length === 0){
        cartArea.innerHTML = '<p class="small">Tu carrito está vacío.</p><a class="btn" href="hydroflex.html">Ver producto</a>';
        return;
      }
      let total = 0;
      const rows = cart.map((item, idx)=>{
        const subtotal = item.qty * (item.price_cents||0);
        total += subtotal;
        return `
          <div class="cart-item card" data-idx="${idx}" style="display:flex;gap:12px;align-items:center;padding:10px;margin-bottom:8px">
            <div style="flex:1">
              <strong>${item.name}</strong><div class="small">${item.size}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <button class="qty-btn" data-op="-">−</button>
              <input class="qty-input" type="number" value="${item.qty}" min="1" style="width:52px;text-align:center">
              <button class="qty-btn" data-op="+">+</button>
            </div>
            <div style="min-width:90px;text-align:right">${centsToCurrency(subtotal)}</div>
            <div><button class="remove-btn">Eliminar</button></div>
          </div>`;
      }).join('');

      cartArea.innerHTML = `<div>${rows}</div>
        <div style="margin-top:12px;text-align:right"><strong>Total: ${centsToCurrency(total)}</strong></div>
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end"><button id="clear-cart" class="btn ghost">Vaciar carrito</button><button id="checkout" class="btn">Pagar</button></div>`;

      // bind qty buttons and inputs
      cartArea.querySelectorAll('.qty-btn').forEach(b=>{
        b.addEventListener('click', ()=>{
          const itemDiv = b.closest('.cart-item');
          const idx = parseInt(itemDiv.getAttribute('data-idx'),10);
          const op = b.getAttribute('data-op');
          const cart = getCart();
          if(op === '+') cart[idx].qty = Math.min(99, cart[idx].qty + 1);
          else cart[idx].qty = Math.max(1, cart[idx].qty - 1);
          saveCart(cart);
          renderCart();
        });
      });
      cartArea.querySelectorAll('.qty-input').forEach(inp=>{
        inp.addEventListener('change', ()=>{
          const itemDiv = inp.closest('.cart-item');
          const idx = parseInt(itemDiv.getAttribute('data-idx'),10);
          const v = Math.max(1, parseInt(inp.value,10) || 1);
          const cart = getCart();
          cart[idx].qty = Math.min(99, v);
          saveCart(cart);
          renderCart();
        });
      });
      cartArea.querySelectorAll('.remove-btn').forEach(b=>{
        b.addEventListener('click', ()=>{
          const itemDiv = b.closest('.cart-item');
          const idx = parseInt(itemDiv.getAttribute('data-idx'),10);
          const cart = getCart();
          cart.splice(idx,1);
          saveCart(cart);
          renderCart();
        });
      });

      const clearBtn = document.getElementById('clear-cart');
      if(clearBtn) clearBtn.addEventListener('click', ()=>{ saveCart([]); renderCart(); });
      const checkoutBtn = document.getElementById('checkout');
      if(checkoutBtn) checkoutBtn.addEventListener('click', ()=>{
        alert('Simulación de pago: se enviará la orden. Total: ' + (total/100).toFixed(2) + ' ARS');
        saveCart([]);
        renderCart();
      });
    }

    renderCart();
  }

  // Initialize cart count on load
  updateCartCount();

  // Chat toggle (UI only)
  const chatToggle = document.getElementById('chat-toggle');
  const chatWidget = document.getElementById('chat-widget');
  const chatClose = document.getElementById('chat-close');
  if(chatToggle && chatWidget){
    chatToggle.addEventListener('click', ()=>{
      const expanded = chatToggle.getAttribute('aria-expanded') === 'true';
      chatToggle.setAttribute('aria-expanded', String(!expanded));
      if(chatWidget.style.display === 'flex'){
        chatWidget.style.display = 'none';
        chatWidget.setAttribute('aria-hidden','true');
      } else {
        chatWidget.style.display = 'flex';
        chatWidget.setAttribute('aria-hidden','false');
      }
    });
  }
  if(chatClose && chatWidget){
    chatClose.addEventListener('click', ()=>{
      chatWidget.style.display = 'none';
      chatWidget.setAttribute('aria-hidden','true');
      if(chatToggle) chatToggle.setAttribute('aria-expanded','false');
    });
  }

});

// -------------------------------------------------
// Hamburguesa (cambio mínimo: evitar error si no existe)
// -------------------------------------------------
const menuBtn = document.getElementById("menu-toggle");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
}


