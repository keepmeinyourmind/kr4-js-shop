const cartItems = document.querySelector('#cart-items');
if (cartItems) {
  function renderCart() {
    const cart = readStore('techbox-cart').filter(id => products.some(product => product.id === id));
    cartItems.replaceChildren();
    document.querySelector('#cart-message').textContent = cart.length ? `Товаров в корзине: ${cart.length}` : 'Корзина пуста. Добавьте товары из каталога.';
    document.querySelector('#cart-order').hidden = cart.length === 0;
    const uniqueIds = [...new Set(cart)];
    uniqueIds.forEach(id => {
      const product = products.find(item => item.id === id);
      const quantity = cart.filter(item => item === id).length;
      const row = document.createElement('div'); row.classList.add('cart-row');
      const label = document.createElement('p'); label.textContent = `${product.title} — ${quantity} × ${formatPrice(product.price)}`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.classList.add('button', 'button--secondary'); remove.textContent = 'Удалить один'; remove.dataset.id = id;
      row.append(label, remove); cartItems.append(row);
    });
    const total = cart.reduce((sum, id) => sum + products.find(product => product.id === id).price, 0);
    document.querySelector('#cart-total').textContent = `Итого: ${formatPrice(total)}`;
    updateCartCount();
  }
  cartItems.addEventListener('click', event => {
    const button = event.target.closest('button[data-id]'); if (!button) return;
    const cart = readStore('techbox-cart'); const index = cart.indexOf(Number(button.dataset.id));
    if (index !== -1) cart.splice(index, 1);
    writeStore('techbox-cart', cart); renderCart();
  });
  renderCart();
}
