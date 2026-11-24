const meals = [
  {id:1,name:"Campus Classic Burger",category:"Burgers",price:350,emoji:"🍔",tag:"STUDENT FAVOURITE",rating:"4.9",time:"10–15 min",description:"Juicy burger, fresh lettuce, tomato and our signature sauce.",bg:"linear-gradient(135deg,#ffe4c8,#fff2e4)"},
  {id:2,name:"Pepperoni Pizza",category:"Pizza",price:650,emoji:"🍕",tag:"CROWD PLEASER",rating:"4.8",time:"15–20 min",description:"Cheesy pizza topped with pepperoni and a rich tomato base.",bg:"linear-gradient(135deg,#ffe3df,#fff0e8)"},
  {id:3,name:"Loaded Crispy Fries",category:"Sides",price:200,emoji:"🍟",tag:"BUDGET PICK",rating:"4.7",time:"5–10 min",description:"Golden, crunchy fries with a side of creamy dipping sauce.",bg:"linear-gradient(135deg,#fff0bd,#fff8e0)"},
  {id:4,name:"Chocolate Milkshake",category:"Drinks",price:250,emoji:"🥤",tag:"SWEET TREAT",rating:"4.8",time:"5–10 min",description:"A thick, cool chocolate shake for your study break.",bg:"linear-gradient(135deg,#eadbff,#f8efff)"},
  {id:5,name:"Double Cheese Burger",category:"Burgers",price:480,emoji:"🍔",tag:"EXTRA CHEESY",rating:"4.9",time:"10–15 min",description:"Double cheese, a grilled patty and a soft toasted bun.",bg:"linear-gradient(135deg,#ffe8c8,#fff5e6)"},
  {id:6,name:"Margherita Pizza",category:"Pizza",price:550,emoji:"🍕",tag:"MEAT-FREE",rating:"4.6",time:"15–20 min",description:"Classic tomato, melted mozzarella and fragrant herbs.",bg:"linear-gradient(135deg,#ffdfd6,#fff0eb)"},
  {id:7,name:"Chicken Bites",category:"Sides",price:300,emoji:"🍗",tag:"CRUNCH TIME",rating:"4.8",time:"10–15 min",description:"Crispy golden chicken bites, perfect for sharing or not.",bg:"linear-gradient(135deg,#ffdfc6,#fff1e5)"},
  {id:8,name:"Fresh Passion Juice",category:"Drinks",price:120,emoji:"🧃",tag:"FRESH PICK",rating:"4.7",time:"2–5 min",description:"A refreshing passion fruit drink served chilled.",bg:"linear-gradient(135deg,#ffedbf,#fff8e4)"}
];

const state = {category:"All", search:"", cart:{}};
const $ = (selector) => document.querySelector(selector);
const money = (amount) => `KSh ${amount.toLocaleString("en-KE")}`;

function renderMeals() {
  const filtered = meals.filter(meal =>
    (state.category === "All" || meal.category === state.category) &&
    `${meal.name} ${meal.category} ${meal.description}`.toLowerCase().includes(state.search.toLowerCase())
  );
  $("#menu-grid").innerHTML = filtered.map(meal => `
    <article class="food-card">
      <div class="food-visual" style="background:${meal.bg}">
        <span class="food-tag">${meal.tag}</span>
        <span class="food-symbol" role="img" aria-label="${meal.category}">${meal.emoji}</span>
      </div>
      <div class="food-details">
        <div class="food-meta"><span>${meal.category} · ${meal.time}</span><span class="rating">★ ${meal.rating}</span></div>
        <h3>${meal.name}</h3>
        <p>${meal.description}</p>
        <div class="food-bottom"><span class="food-price">${money(meal.price)}</span><button class="add-button" data-add="${meal.id}" aria-label="Add ${meal.name} to cart">+</button></div>
      </div>
    </article>`).join("");
  $("#empty-state").classList.toggle("hidden", filtered.length > 0);
}

function cartEntries() {
  return Object.entries(state.cart).map(([id, quantity]) => {
    const meal = meals.find(item => item.id === Number(id));
    return {...meal, quantity};
  }).filter(item => item && item.quantity > 0);
}
function cartTotals() {
  const items = cartEntries();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal === 0 ? 0 : ($("#fulfilment")?.value === "Delivery" ? 100 : 0);
  return {items,count,subtotal,delivery,total:subtotal+delivery};
}
function renderCart() {
  const totals = cartTotals();
  $("#cart-count").textContent = totals.count;
  $("#drawer-count").textContent = `(${totals.count})`;
  $("#cart-items").innerHTML = totals.items.map(item => `
    <div class="cart-item">
      <div class="cart-item-visual">${item.emoji}</div>
      <div><h3>${item.name}</h3><span class="item-price">${money(item.price * item.quantity)}</span>
        <div class="quantity-control"><button data-change="${item.id}" data-delta="-1" aria-label="Decrease ${item.name} quantity">−</button><span>${item.quantity}</span><button data-change="${item.id}" data-delta="1" aria-label="Increase ${item.name} quantity">+</button></div>
      </div>
      <button class="remove-item" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
    </div>`).join("");
  $("#cart-empty").classList.toggle("hidden", totals.count > 0);
  $("#cart-summary").classList.toggle("hidden", totals.count === 0);
  $("#subtotal").textContent = money(totals.subtotal);
  $("#delivery-fee").textContent = money(totals.delivery);
  $("#total").textContent = money(totals.total);
  $("#checkout-total").textContent = money(totals.total);
}
function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => node.classList.remove("show"), 2200);
}
function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderCart();
  toast(`${meals.find(meal => meal.id === id).name} added to your cart`);
}
function openCart() {
  $("#overlay").classList.remove("hidden");
  $("#cart-drawer").classList.add("open");
  $("#cart-drawer").setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("#overlay").classList.add("hidden");
  $("#cart-drawer").classList.remove("open");
  $("#cart-drawer").setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
function updateFulfilment() {
  const delivery = $("#fulfilment").value === "Delivery";
  $("#location-label").childNodes[0].textContent = delivery ? "Delivery location" : "Pickup point";
  $("#location-input").placeholder = delivery ? "e.g. Hostel block, room number" : "e.g. Student centre";
  renderCart();
}

$("#menu-grid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
$("#categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  document.querySelectorAll(".category-chip").forEach(chip => chip.classList.toggle("selected", chip === button));
  renderMeals();
});
$("#search-input").addEventListener("input", event => {
  state.search = event.target.value.trim();
  renderMeals();
});
$("#focus-search").addEventListener("click", () => {
  $("#search-input").focus();
  $("#menu").scrollIntoView({behavior:"smooth"});
});
$("#open-cart").addEventListener("click", openCart);
$("#close-cart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#browse-menu").addEventListener("click", () => {closeCart();$("#menu").scrollIntoView({behavior:"smooth"});});
$("#cart-items").addEventListener("click", event => {
  const change = event.target.closest("[data-change]");
  const remove = event.target.closest("[data-remove]");
  if (change) {
    const id = Number(change.dataset.change);
    state.cart[id] = (state.cart[id] || 0) + Number(change.dataset.delta);
    if (state.cart[id] <= 0) delete state.cart[id];
    renderCart();
  }
  if (remove) {delete state.cart[Number(remove.dataset.remove)];renderCart();}
});
$("#fulfilment").addEventListener("change", updateFulfilment);
$("#checkout-button").addEventListener("click", () => {
  closeCart();
  $("#checkout-modal").classList.remove("hidden");
  $("#checkout-form").classList.remove("hidden");
  $("#order-success").classList.add("hidden");
  $("#checkout-total").textContent = money(cartTotals().total);
});
$("#close-checkout").addEventListener("click", () => $("#checkout-modal").classList.add("hidden"));
$("#checkout-modal").addEventListener("click", event => {
  if (event.target === $("#checkout-modal")) $("#checkout-modal").classList.add("hidden");
});
$("#checkout-form").addEventListener("submit", event => {
  event.preventDefault();
  const totals = cartTotals();
  if (!totals.count) {toast("Add a meal to your cart first.");return;}
  const form = new FormData(event.currentTarget);
  const orderNumber = `CB-${Date.now().toString().slice(-6)}`;
  $("#checkout-form").classList.add("hidden");
  $("#order-success").classList.remove("hidden");
  $("#success-message").textContent = `Thanks, ${form.get("customerName")}! Your demo order ${orderNumber} has a total of ${money(totals.total)}. ${form.get("fulfilment")} selected.`;
  // Front-end demo only: this does not send an order to a server or process payment.
  state.cart = {};
  renderCart();
});
$("#finish-order").addEventListener("click", () => {
  $("#checkout-modal").classList.add("hidden");
  $("#menu").scrollIntoView({behavior:"smooth"});
});
$("#year").textContent = new Date().getFullYear();

renderMeals();
renderCart();
