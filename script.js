/* Change this number if orders should go to another WhatsApp account. */
const WHATSAPP_NUMBER = '212787142624';
const products = [];
const cart = new Map();
const dialog = document.querySelector('#cart-dialog');
const cartItems = document.querySelector('#cart-items');
const cartToggle = document.querySelector('#cart-toggle');
const totalLabel = document.querySelector('#cart-total');
const form = document.querySelector('#order-form');
const checkout = document.querySelector('#checkout');

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
  plus.textContent = '+';
  button.append(plus);
  button.addEventListener('click', () => {
    cart.set(id, (cart.get(id) || 0) + 1);
    updateCart();
    document.querySelector('#order-status').textContent = `${category} — ${name} ajouté au panier`;
  });
  row.append(button);
}

const lemonRow = document.createElement('li');
lemonRow.innerHTML = '<span>Jus de citron</span><i aria-hidden="true"></i><strong>8 dh</strong>';
document.querySelector('.juice .category ul').append(lemonRow);
registerProduct(lemonRow, 'Jus', 'Jus de citron', 8);

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
  cartToggle.textContent = `Voir mon panier (${count}) · ${total} dh`;
  totalLabel.textContent = `${total} dh`;
  checkout.disabled = !count;
  document.querySelector('#clear-cart').disabled = !count;
}

cartToggle.addEventListener('click', () => dialog.showModal());
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
