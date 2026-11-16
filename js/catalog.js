const grid = document.querySelector('#products');
if (grid) {
  const search = document.querySelector('#search');
  const category = document.querySelector('#category');
  const sort = document.querySelector('#sort');
  const favoritesOnly = document.querySelector('#favorites-only');
  const count = document.querySelector('#catalog-count');
  const empty = document.querySelector('#catalog-empty');
  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function renderCatalog() {
    const favorites = readStore('techbox-favorites');
    const query = search.value.trim().toLocaleLowerCase('ru');
    const result = products.filter(product => product.title.toLocaleLowerCase('ru').includes(query) &&
      (category.value === 'all' || product.category === category.value) &&
      (!favoritesOnly.checked || favorites.includes(product.id)));
    if (sort.value === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort.value === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort.value === 'title') result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    grid.replaceChildren();
    count.textContent = `Найдено товаров: ${result.length}`;
    empty.hidden = result.length !== 0;
    result.forEach(product => {
      const card = makeElement('article', 'product-card');
      const image = makeElement('img', 'product-card__image');
      image.src = `images/product-${product.image}-800.jpg`;
      image.srcset = `images/product-${product.image}-400.jpg 400w, images/product-${product.image}-800.jpg 800w`;
      image.sizes = '(min-width: 1024px) 340px, (min-width: 640px) 45vw, 90vw';
      image.alt = product.title; image.width = 800; image.height = 600; image.loading = 'lazy';
      const actions = makeElement('div', 'product-card__actions');
      if (product.page) {
        const link = makeElement('a', 'button', 'Подробнее'); link.classList.add('button--secondary'); link.href = product.page; actions.append(link);
      }
      const add = makeElement('button', 'button', 'В корзину'); add.classList.add('button--primary'); add.type = 'button'; add.dataset.action = 'cart'; add.dataset.id = product.id;
      const favorite = makeElement('button', 'button', favorites.includes(product.id) ? 'Убрать из избранного' : 'В избранное');
      favorite.classList.add('button--secondary'); favorite.type = 'button'; favorite.dataset.action = 'favorite'; favorite.dataset.id = product.id;
      favorite.setAttribute('aria-pressed', String(favorites.includes(product.id)));
      actions.append(add, favorite);
      card.append(image, makeElement('p', 'product-card__category', product.categoryTitle), makeElement('h3', 'product-card__title', product.title), makeElement('p', 'product-card__description', product.description), makeElement('p', 'product-card__price', formatPrice(product.price)), actions);
      grid.append(card);
    });
  }
  search.addEventListener('input', renderCatalog);
  [category, sort, favoritesOnly].forEach(control => control.addEventListener('change', renderCatalog));
  document.querySelector('#reset-filters').addEventListener('click', () => { search.value = ''; category.value = 'all'; sort.value = 'default'; favoritesOnly.checked = false; renderCatalog(); });
  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === 'cart') {
      const cart = readStore('techbox-cart'); cart.push(id); writeStore('techbox-cart', cart); updateCartCount();
      button.textContent = 'Добавлено ✓';
    } else {
      const favorites = readStore('techbox-favorites');
      writeStore('techbox-favorites', favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id]);
      renderCatalog();
    }
  });
  renderCatalog();
}
