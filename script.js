const SETS_API = 'sets.json';
const CART_KEY = 'brickMarketCart';

async function fetchSets() {
  try {
    const response = await fetch(SETS_API);
    if (!response.ok) throw new Error('Failed to load sets');
    return await response.json();
  } catch (error) {
    console.warn(error);
    return [
      { id: 1, name: 'City Skyline Adventure', theme: 'City', price: 84.99, condition: 'New', type: 'buy', image: 'https://placehold.co/480x320/ffb300/111111?text=City+Skyline' },
      { id: 2, name: 'Classic Castle Vault', theme: 'Castle', price: 129.99, condition: 'Retired', type: 'sell', image: 'https://placehold.co/480x320/8d6e63/ffffff?text=Castle+Vault' },
      { id: 3, name: 'Space Explorer Troop', theme: 'Space', price: 69.99, condition: 'Used', type: 'trade', image: 'https://placehold.co/480x320/1976d2/ffffff?text=Space+Explorer' },
      { id: 4, name: 'Modular Market Street', theme: 'Creator', price: 149.99, condition: 'New', type: 'buy', image: 'https://placehold.co/480x320/388e3c/ffffff?text=Market+Street' },
      { id: 5, name: 'Historic Train Station', theme: 'Trains', price: 159.99, condition: 'Retired', type: 'sell', image: 'https://placehold.co/480x320/6d4c41/ffffff?text=Train+Station' },
      { id: 6, name: 'Pirate Island Hideout', theme: 'Pirates', price: 94.99, condition: 'Used', type: 'trade', image: 'https://placehold.co/480x320/c2185b/ffffff?text=Pirate+Hideout' }
    ];
  }
}

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(setId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === setId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: setId, quantity: 1 });
  }
  saveCart(cart);
  alert('Added to cart');
}

function removeFromCart(setId) {
  const cart = getCart().filter(item => item.id !== setId);
  saveCart(cart);
  renderCartPage();
}

async function checkoutCart() {
  const cart = getCart();
  if (!cart.length) return;

  const sets = await fetchSets();
  const items = cart.map(entry => {
    const set = sets.find(item => item.id === entry.id);
    return set ? { ...set, quantity: entry.quantity } : null;
  }).filter(Boolean);

  let total = 0;
  const message = items.map(item => {
    total += item.price * item.quantity;
    return `${item.quantity} × ${item.name}`;
  }).join('\n');

  alert(`Order complete!\n\n${message}\n\nTotal: ${formatCurrency(total)}`);
  localStorage.removeItem(CART_KEY);
  renderCartPage();
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function renderShoppingPage(sets) {
  const list = document.getElementById('setList');
  const emptyState = document.getElementById('emptyState');
  if (!list) return;
  list.innerHTML = '';
  if (!sets.length) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  sets.forEach(set => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-content">
        <div>
          <h3>${set.name}</h3>
          <p>${set.theme} · ${set.condition} · ${set.type.toUpperCase()}</p>
        </div>
        <div class="card-meta">
          <span class="badge">${set.type}</span>
          <span>${formatCurrency(set.price)}</span>
        </div>
        <button class="button primary" onclick="addToCart(${set.id})">Add to Cart</button>
      </div>`;
      list.appendChild(card);
  });
}

async function renderCartPage() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutButton = document.getElementById('checkoutButton');
  if (!cartItemsContainer || !cartCount || !cartTotalEl || !checkoutButton) return;

  const cart = getCart();
  const sets = await fetchSets();
  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartCount.textContent = '0 items';
    cartTotalEl.textContent = '$0.00';
    checkoutButton.disabled = true;
    return;
  }

  const items = cart.map(entry => {
    const set = sets.find(item => item.id === entry.id);
    return set ? { ...set, quantity: entry.quantity } : null;
  }).filter(Boolean);

  cartItemsContainer.innerHTML = '';
  let total = 0;
  items.forEach(item => {
    total += item.price * item.quantity;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <div>
          <strong>${item.name}</strong>
          <div>${item.quantity} × ${formatCurrency(item.price)} · ${item.type.toUpperCase()}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:flex-end;">
        <button onclick="removeFromCart(${item.id})">Remove</button>
      </div>`;
    cartItemsContainer.appendChild(row);
  });

  cartCount.textContent = `${cart.reduce((sum, entry) => sum + entry.quantity, 0)} items`;
  cartTotalEl.textContent = formatCurrency(total);
  checkoutButton.disabled = false;
}

function initializePage() {
  const page = document.body.dataset.page;
  if (page === 'shopping') {
    fetchSets().then(sets => {
      const searchInput = document.getElementById('searchInput');
      renderShoppingPage(sets);
      if (searchInput) {
        searchInput.addEventListener('input', event => {
          const query = event.target.value.toLowerCase().trim();
          const filtered = sets.filter(set => {
            return set.name.toLowerCase().includes(query)
              || set.theme.toLowerCase().includes(query)
              || set.condition.toLowerCase().includes(query)
              || set.type.toLowerCase().includes(query);
          });
          renderShoppingPage(filtered);
        });
      }
    });
  }
  if (page === 'cart') {
    renderCartPage();
  }
}

window.addEventListener('DOMContentLoaded', initializePage);
