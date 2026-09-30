const bagsGridEl = document.getElementById("bagsGrid");

async function loadBags(category = "all") {
  if (!bagsGridEl) return;
  try {
    const response = await fetch(`/api/bags?category=${category}`);
    const bags = await response.json();

    if (!bags.length) {
      bagsGridEl.innerHTML = "<p>No bags found in this category.</p>";
      return;
    }

    bagsGridEl.innerHTML = bags.map(bag => `
      <article class="product-card" onclick="openBagModal(${bag.id})">
        ${bag.tag ? `<span class="tag">${bag.tag}</span>` : ""}
        <div class="product-img">
          <img src="${bag.image}" alt="${bag.name}">
        </div>
        <div class="product-info">
          <h3>${bag.name}</h3>
          <p>${bag.material} · ${bag.color}</p>
          <div style="font-size:12px;margin:4px 0;">
            ${renderStars(bag.rating)} <span style="color:var(--muted)">(${bag.review_count})</span>
          </div>
          <div class="product-bottom">
            <span class="price">$${bag.price}</span>
            <button class="add" onclick="event.stopPropagation(); addToCart(${JSON.stringify(bag).replace(/"/g, '&quot;')})">+</button>
          </div>
        </div>
      </article>
    `).join("");
  } catch (error) {
    bagsGridEl.innerHTML = "<p>Could not load the bags collection.</p>";
    console.error(error);
  }
}

function filterBags(category, btnEl) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  loadBags(category);
}

async function openBagModal(bagId) {
  modalQty = 1;
  try {
    const response = await fetch(`/api/bags/${bagId}`);
    const bag = await response.json();

    modalBodyEl.innerHTML = `
      <div class="modal-grid">
        <div class="modal-gallery">
          <img src="${bag.image}" alt="${bag.name}">
        </div>
        <div class="modal-details">
          ${bag.tag ? `<div class="modal-badge">${bag.tag}</div>` : ""}
          <h2 class="modal-title">${bag.name}</h2>
          <div class="modal-rating-summary">
            ${renderStars(bag.rating)}
            <span>${bag.rating} / 5 (${bag.review_count} reviews)</span>
          </div>
          <div class="modal-price">$${bag.price}</div>
          <p class="modal-desc">${bag.description}</p>
          <div class="modal-specs">
            <div><span>Material:</span> <strong>${bag.material}</strong></div>
            <div><span>Color:</span> <strong>${bag.color}</strong></div>
          </div>
          
          <div style="display:flex;gap:15px;align-items:center;margin-top:10px;">
            <div class="qty-picker">
              <button class="qty-btn" onclick="updateModalQty(-1)">-</button>
              <span class="qty-val" id="modalQtyVal">1</span>
              <button class="qty-btn" onclick="updateModalQty(1)">+</button>
            </div>
            <button class="btn-add-modal" onclick="addBagModalItemToCart(${bag.id})">Add to bag</button>
          </div>

          <div class="modal-reviews-block">
            <h4>Customer Reviews</h4>
            <div class="reviews-list">
              ${(bag.reviews || []).map(r => `
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
    alert("Could not load bag details.");
  }
}

async function addBagModalItemToCart(bagId) {
  const response = await fetch(`/api/bags/${bagId}`);
  const bag = await response.json();

  for (let i = 0; i < modalQty; i++) {
    cart.push(bag);
  }
  renderCart();
  closeModal();
  openCart();
}

const customBagForm = document.getElementById("customBagForm");
if (customBagForm) {
  customBagForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("custName").value;
    const email = document.getElementById("custEmail").value;
    const details = document.getElementById("custDetails").value;

    try {
      const res = await fetch("/api/custom-bag-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, details })
      });
      const data = await res.json();
      alert(data.message);
      customBagForm.reset();
    } catch (err) {
      console.error(err);
      alert("Submission error.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadBags("all");
});
