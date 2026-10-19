/* Change this number if orders should go to another WhatsApp account. */
const WHATSAPP_NUMBER = '212725240109';
const products = [];
const cart = new Map();
const dialog = document.querySelector('#cart-dialog');
const cartItems = document.querySelector('#cart-items');
const cartToggle = document.querySelector('#cart-toggle');
const totalLabel = document.querySelector('#cart-total');
const form = document.querySelector('#order-form');
const checkout = document.querySelector('#checkout');
cartToggle.innerHTML = '<span class="cart-symbol" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h4l3 16h15l4-12H8"/><path d="M12 9V5m5 4V3m5 6V5"/><circle cx="12" cy="27" r="2"/><circle cx="24" cy="27" r="2"/></svg><span class="cart-count">0</span></span><span class="cart-label"></span>';

document.querySelectorAll('.category').forEach(section => {
  const category = section.querySelector('h2').textContent.trim();
  section.querySelectorAll('li').forEach(row => {
    const name = row.querySelector('span').textContent.trim();
    const price = Number.parseInt(row.querySelector('strong').textContent, 10);
    registerProduct(row, category, name, price);
  });
});

function registerProduct(row, category, name, price) {
  const id = products.length;
  products.push({id, category, name, price});
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-button';
  button.setAttribute('aria-label', `Ajouter ${category} — ${name}, ${price} dh`);
  while (row.firstChild) button.append(row.firstChild);
  const plus = document.createElement('b');
  plus.className = 'add-icon';
  plus.setAttribute('aria-hidden', 'true');
  plus.textContent = 'Ajouter +';
  button.append(plus);
  button.addEventListener('click', () => {
    cart.set(id, (cart.get(id) || 0) + 1);
    updateCart();
    animateAdd(button);
    document.querySelector('#order-status').textContent = `${category} — ${name} ajouté au panier`;
  });
  row.append(button);
}

const lemonRow = document.createElement('li');
lemonRow.innerHTML = '<span>Jus de citron</span><i aria-hidden="true"></i><strong>8 dh</strong>';
registerProduct(lemonRow, 'Jus', 'Jus de citron', 8);
document.querySelector('.lemon-order').addEventListener('click', event => {
  lemonRow.querySelector('button').click();
  animateAdd(event.currentTarget);
});

function animateAdd(button) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const symbol = cartToggle.querySelector('.cart-symbol');
  const bounce = () => {
    symbol.getAnimations().forEach(animation => animation.cancel());
    symbol.animate([
      {transform:'translateY(0) rotate(0) scale(1)'},
      {transform:'translateY(-10px) rotate(-12deg) scale(1.18)',offset:.4},
      {transform:'translateY(2px) rotate(8deg) scale(.95)',offset:.75},
      {transform:'translateY(0) rotate(0) scale(1)'}
    ],{duration:500,easing:'ease-out'});
  };
  const source = button.closest('.category, .special')?.querySelector('img') || button.closest('.juice, .beverages')?.querySelector('img');
  if (!button.isConnected) return;
  if (!source) { bounce(); return; }
  const start = button.getBoundingClientRect();
  const end = symbol.getBoundingClientRect();
  const x = start.left + start.width / 2 - 28;
  const y = start.top + start.height / 2 - 28;
  const dx = end.left + end.width / 2 - 28 - x;
  const dy = end.top + end.height / 2 - 28 - y;
  const flying = document.createElement('img');
  flying.src = source.currentSrc || source.src;
  flying.alt = '';
  flying.className = 'flying-product';
  flying.setAttribute('aria-hidden', 'true');
  flying.style.left = `${x}px`;
  flying.style.top = `${y}px`;
  document.body.append(flying);
  const flight = flying.animate([
    {transform:'translate(0,0) scale(1)',opacity:1},
    {transform:`translate(${dx * .45}px,${Math.min(-65, dy * .35 - 50)}px) scale(1.15) rotate(-12deg)`,opacity:1,offset:.4},
    {transform:`translate(${dx}px,${dy}px) scale(.15) rotate(12deg)`,opacity:.25}
  ],{duration:650,easing:'cubic-bezier(.3,.05,.7,1)',fill:'forwards'});
  flight.finished.then(() => { flying.remove(); bounce(); }, () => flying.remove());
}

function updateCart() {
  cartItems.replaceChildren();
  let count = 0;
  let total = 0;
  for (const [id, quantity] of cart) {
    const product = products[id];
    count += quantity;
    total += product.price * quantity;
    const item = document.createElement('li');
    const details = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${product.category} — ${product.name}`;
    const subtotal = document.createElement('small');
    subtotal.textContent = `${product.price} dh × ${quantity} = ${product.price * quantity} dh`;
    details.append(title, subtotal);
    const controls = document.createElement('div');
    controls.className = 'quantity-controls';
    for (const delta of [-1, 1]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = delta < 0 ? '−' : '+';
      button.setAttribute('aria-label', `${delta < 0 ? 'Retirer' : 'Ajouter'} un ${product.category} ${product.name}`);
      button.addEventListener('click', () => {
        const next = cart.get(id) + delta;
        if (next <= 0) cart.delete(id); else cart.set(id, next);
        updateCart();
      });
      controls.append(button);
      if (delta < 0) {
        const number = document.createElement('span');
        number.textContent = quantity;
        controls.append(number);
      }
    }
    item.append(details, controls);
    cartItems.append(item);
  }
  if (!count) {
    const empty = document.createElement('li');
    empty.textContent = 'Votre panier est vide. Touchez + sur le menu pour commencer.';
    cartItems.append(empty);
  }
  cartToggle.querySelector('.cart-label').textContent = `Voir mon panier · ${total} dh`;
  cartToggle.querySelector('.cart-count').textContent = count;
  cartToggle.setAttribute('aria-label', `Voir mon panier, ${count} articles, ${total} dh`);
  document.querySelector('.cart-bar').hidden = count === 0;
  totalLabel.textContent = `${total} dh`;
  checkout.disabled = !count;
  document.querySelector('#clear-cart').disabled = !count;
}

cartToggle.addEventListener('click', () => dialog.showModal());
document.querySelector('.whatsapp-banner').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-cart').addEventListener('click', () => dialog.close());
document.querySelector('#clear-cart').addEventListener('click', () => { cart.clear(); updateCart(); });
document.querySelector('#delivery-mode').addEventListener('change', event => {
  const delivery = event.target.value === 'Livraison';
  document.querySelector('#address-field').hidden = !delivery;
  document.querySelector('#customer-address').required = delivery;
});

form.action = `https://wa.me/${WHATSAPP_NUMBER}`;
form.addEventListener('submit', event => {
  if (!cart.size) { event.preventDefault(); return; }
  const lines = ['Bonjour REGALOO, je souhaite commander :', ''];
  let total = 0;
  for (const [id, quantity] of cart) {
    const p = products[id];
    total += p.price * quantity;
    lines.push(`${quantity} × ${p.category} — ${p.name} : ${p.price * quantity} dh`);
  }
  const name = document.querySelector('#customer-name').value.trim();
  const mode = document.querySelector('#delivery-mode').value;
  const address = document.querySelector('#customer-address').value.trim();
  const notes = document.querySelector('#order-notes').value.trim();
  if (!name || (mode === 'Livraison' && !address)) {
    event.preventDefault();
    form.reportValidity();
    return;
  }
  lines.push('', `Total produits : ${total} dh`, 'Frais de livraison à confirmer avec REGALOO.', '', `Nom : ${name}`, `Mode : ${mode}`);
  if (mode === 'Livraison') lines.push(`Adresse : ${address}`);
  if (notes) lines.push(`Remarques : ${notes}`);
  /* Only the composed message is passed to WhatsApp. The customer sends it there. */
  document.querySelector('#whatsapp-message').value = lines.join('\n');
});
updateCart();
