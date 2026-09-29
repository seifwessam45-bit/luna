let cart = [];
let modalQty = 1;

const productsEl = document.getElementById("products");
const reviewsGridEl = document.getElementById("reviewsGrid");
const cartEl = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const modalEl = document.getElementById("productModal");
const modalBodyEl = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModal");

function renderStars(rating = 5) {
  const fullStars = "★".repeat(Math.floor(rating));
  const emptyStars = "☆".repeat(5 - Math.floor(rating));
  return `<span class="stars">${fullStars}${emptyStars}</span>`;
}

async function loadProducts() {
  if (!productsEl) return;
  try {
    const response = await fetch("/api/products");
    const products = await response.json();

    productsEl.innerHTML = products.map(product => `
      <article class="product-card" onclick="openProductModal(${product.id})">
        ${product.tag ? `<span class="tag">${product.tag}</span>` : ""}
        <div class="product-img">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.material} · ${product.color}</p>
          <div style="font-size:12px;margin:4px 0;">
            ${renderStars(product.rating)} <span style="color:var(--muted)">(${product.review_count})</span>
          </div>
          <div class="product-bottom">
            <span class="price">$${product.price}</span>
            <button class="add" onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">+</button>
          </div>
        </div>
      </article>
    `).join("");
  } catch (error) {
    productsEl.innerHTML = "<p>Could not load the collection.</p>";
    console.error(error);
  }
}

async function loadFeaturedReviews() {
  if (!reviewsGridEl) return;
  try {
    const response = await fetch("/api/reviews/featured");
    const reviews = await response.json();

    if (!reviews.length) {
      reviewsGridEl.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
      return;
    }

    reviewsGridEl.innerHTML = reviews.slice(0, 6).map(review => `
      <div class="review-card">
        <div>${renderStars(review.rating)}</div>
        <p class="review-comment">“${review.comment}”</p>
        <div class="review-meta">
          <span class="review-author">${review.author}</span>
          <span>${review.product_name}</span>
        </div>
      </div>
    `).join("");
  } catch (error) {
    reviewsGridEl.innerHTML = "<p>Unable to load reviews.</p>";
    console.error(error);
  }
}

async function openProductModal(productId) {
  modalQty = 1;
  try {
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();

    modalBodyEl.innerHTML = `
      <div class="modal-grid">
        <div class="modal-gallery">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="modal-details">
          ${product.tag ? `<div class="modal-badge">${product.tag}</div>` : ""}
          <h2 class="modal-title">${product.name}</h2>
          <div class="modal-rating-summary">
            ${renderStars(product.rating)}
            <span>${product.rating} / 5 (${product.review_count} customer reviews)</span>
          </div>
          <div class="modal-price">$${product.price}</div>
          <p class="modal-desc">${product.description}</p>
          <div class="modal-specs">
            <div><span>Material:</span> <strong>${product.material}</strong></div>
            <div><span>Color:</span> <strong>${product.color}</strong></div>
          </div>
          
          <div style="display:flex;gap:15px;align-items:center;margin-top:10px;">
            <div class="qty-picker">
              <button class="qty-btn" onclick="updateModalQty(-1)">-</button>
              <span class="qty-val" id="modalQtyVal">1</span>
              <button class="qty-btn" onclick="updateModalQty(1)">+</button>
            </div>
            <button class="btn-add-modal" onclick="addModalItemToCart(${product.id})">Add to bag</button>
          </div>

          <div class="modal-reviews-block">
            <h4>Customer Reviews</h4>
            <form class="review-form" onsubmit="submitReview(event, ${product.id})">
              <div style="display:flex;gap:10px;">
                <input type="text" id="reviewAuthor" placeholder="Your name" style="flex:1" required>
                <select id="reviewRating" style="width:90px">
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
              </div>
              <textarea id="reviewComment" placeholder="Write your thoughts about this piece..." required></textarea>
              <button type="submit">Post Review</button>
            </form>
            <div class="reviews-list">
              ${(product.reviews || []).map(r => `
                <div style="padding:12px 0;border-bottom:1px solid var(--line);">
                  <div style="display:flex;justify-content:space-between;font-size:13px;">
                    <strong>${r.author}</strong>
                    <span style="color:var(--muted);font-size:12px;">${r.date}</span>
                  </div>
                  <div style="margin:4px 0;">${renderStars(r.rating)}</div>
                  <p style="font-size:13px;color:var(--ink);">${r.comment}</p>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    modalEl.classList.add("open");
    overlay.classList.add("show");
  } catch (err) {
    console.error(err);
    alert("Could not load product details.");
  }
}

function updateModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  const qtyValEl = document.getElementById("modalQtyVal");
  if (qtyValEl) qtyValEl.textContent = modalQty;
}

async function addModalItemToCart(productId) {
  const response = await fetch(`/api/products/${productId}`);
  const product = await response.json();

  for (let i = 0; i < modalQty; i++) {
    cart.push(product);
  }
  renderCart();
  closeModal();
  openCart();
}

async function submitReview(event, productId) {
  event.preventDefault();
  const author = document.getElementById("reviewAuthor").value;
  const rating = document.getElementById("reviewRating").value;
  const comment = document.getElementById("reviewComment").value;

  try {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, rating, comment })
    });
    const data = await response.json();
    if (data.success) {
      openProductModal(productId);
      loadProducts();
      loadFeaturedReviews();
    } else {
      alert(data.error || "Could not save review.");
    }
  } catch (err) {
    console.error(err);
    alert("Error submitting review.");
  }
}

function closeModal() {
  modalEl.classList.remove("open");
  if (!cartEl.classList.contains("open")) {
    overlay.classList.remove("show");
  }
}

function addToCart(product) {
  cart.push(product);
  renderCart();
  openCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  document.getElementById("count").textContent = cart.length;
  const items = document.getElementById("cartItems");

  if (!cart.length) {
    items.innerHTML = '<p style="color:#746e6a;font-size:14px">Your bag is waiting for something lovely.</p>';
  } else {
    items.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="">
        <div>
          <h4>${item.name}</h4>
          <p>$${item.price}</p>
          <button class="remove" onclick="removeItem(${index})">Remove</button>
        </div>
        <strong>$${item.price}</strong>
      </div>
    `).join("");
  }

  document.getElementById("total").textContent =
    "$" + cart.reduce((sum, item) => sum + Number(item.price), 0);
}

function openCart() {
  closeModal();
  cartEl.classList.add("open");
  overlay.classList.add("show");
}

function closeCart() {
  cartEl.classList.remove("open");
  overlay.classList.remove("show");
}

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", () => {
  closeCart();
  closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeModal();
  }
});

document.getElementById("checkout").addEventListener("click", async () => {
  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      items: cart.map(item => item.id)
    })
  });

  const data = await response.json();
  alert(data.message);
});

document.getElementById("newsletterForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const response = await fetch("/api/newsletter", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email})
  });

  const data = await response.json();
  alert(data.message);
  event.target.reset();
});

loadProducts();
loadFeaturedReviews();
renderCart();

