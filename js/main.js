const formatPrice = price => `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;

// Хранилище может быть недоступно в приватном режиме: сайт продолжит работу в памяти.
const memoryStore = {};
function readStore(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return memoryStore[key] || []; }
}
function writeStore(key, value) {
  memoryStore[key] = value;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* работа в памяти */ }
}
function updateCartCount() {
  const count = readStore('techbox-cart').length;
  document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = `(${count})`; });
}
updateCartCount();

const dialog = document.querySelector('#order-dialog');
document.querySelectorAll('.product-card__button').forEach(button => {
  button.addEventListener('click', () => {
    const selected = document.querySelector('#selected-product');
    if (selected && dialog) { selected.value = button.dataset.product || ''; dialog.showModal(); }
  });
});
const closeButton = document.querySelector('#close-order-dialog');
if (closeButton && dialog) closeButton.addEventListener('click', () => dialog.close());

const form = document.querySelector('#order-form');
const productSelect = document.querySelector('#order-product');
if (productSelect) {
  const productFromUrl = new URLSearchParams(location.search).get('product');
  if (productFromUrl) productSelect.value = productFromUrl;
}
if (form) {
  const message = document.createElement('p');
  message.classList.add('form-message');
  message.setAttribute('role', 'alert');
  form.prepend(message);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = Array.from(form.elements).filter(field => field.willValidate);
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    const invalid = fields.filter(field => !field.checkValidity() || (field.name === 'name' && field.value.trim().length < 2));
    const success = document.querySelector('#success-message');
    if (success) success.hidden = true;
    if (invalid.length) {
      invalid.forEach(field => field.setAttribute('aria-invalid', 'true'));
      message.textContent = 'Проверьте выделенные поля: имя, e-mail, телефон, тему и согласие. Телефон: +7 (900) 000-00-00.';
      invalid[0].focus();
      return;
    }
    message.textContent = '';
    form.reset();
    if (dialog && dialog.open) dialog.close();
    if (success) { success.textContent = 'Заявка подготовлена. Это учебный проект: данные не отправляются на сервер.'; success.hidden = false; }
  });
}

const orderSummary = document.querySelector('#order-cart-summary');
if (orderSummary) {
  const cart = readStore('techbox-cart').filter(id => products.some(product => product.id === id));
  const total = cart.reduce((sum, id) => sum + products.find(product => product.id === id).price, 0);
  orderSummary.textContent = cart.length ? `В корзине: ${cart.length} шт. на сумму ${formatPrice(total)}. Заявка носит учебный характер.` : 'Корзина пуста — можно отправить заявку на консультацию.';
}

// На главной можно остановить ролик; при уменьшенной анимации показывается фото.
const heroVideo = document.querySelector('#hero-video');
const heroVideoToggle = document.querySelector('#hero-video-toggle');
if (heroVideo && heroVideoToggle) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  function updateHeroVideo() {
    if (motionPreference.matches) {
      heroVideo.pause();
      heroVideoToggle.hidden = true;
    } else {
      heroVideo.play().then(() => {
        heroVideoToggle.hidden = false;
        heroVideoToggle.textContent = 'Остановить видео';
      }).catch(() => { heroVideoToggle.hidden = true; });
    }
  }
  heroVideoToggle.addEventListener('click', () => {
    if (heroVideo.paused) {
      heroVideo.play().then(() => { heroVideoToggle.textContent = 'Остановить видео'; }).catch(() => {});
    } else {
      heroVideo.pause();
      heroVideoToggle.textContent = 'Воспроизвести видео';
    }
  });
  motionPreference.addEventListener('change', updateHeroVideo);
  updateHeroVideo();
}
