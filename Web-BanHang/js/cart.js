// ========== CART MANAGEMENT ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUserId = null; // Để tách cart theo user

// Lấy key cart theo userId (admin dùng riêng)
function getCartKey(userId) {
  return userId && !isAdminUser() ? `cart_${userId}` : 'cart_admin';
}

// Kiểm tra admin từ token
function isAdminUser() {
  if (!token) return false;
  try {
    const decoded = JSON.parse(atob(token));
    return decoded.la_admin === 1;
  } catch {
    return false;
  }
}

// Cập nhật số lượng giỏ hàng trên menu
function updateCartCount(userId = null) {
  currentUserId = userId;
  const key = getCartKey(userId);
  cart = JSON.parse(localStorage.getItem(key)) || [];
  const cartCount = $('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.so_luong, 0);
    cartCount.textContent = totalItems;
  }
}

// Thêm sản phẩm vào giỏ
function addToCart(id, name, price, img) {
  loadCart(); // Load cart hiện tại
  const item = cart.find(i => i.id === id);
  
  if (item) {
    item.so_luong++;
  } else {
    cart.push({ 
      id, 
      ten_san_pham: name, 
      gia_ban: price, 
      anh: img, 
      so_luong: 1 
    });
  }
  
  saveCart();
  updateCartCount(currentUserId);
  alert('Đã thêm vào giỏ hàng!');
}

// Mua ngay (clear cart, add 1, checkout)
function buyNow(id, name, price, img) {
  cart = [{ id, ten_san_pham: name, gia_ban: price, anh: img, so_luong: 1 }];
  saveCart();
  updateCartCount(currentUserId);
  showCheckout();
}

// Load cart từ localStorage
function loadCart() {
  const key = getCartKey(currentUserId);
  cart = JSON.parse(localStorage.getItem(key)) || [];
}

// Save cart to localStorage
function saveCart() {
  const key = getCartKey(currentUserId);
  localStorage.setItem(key, JSON.stringify(cart));
}

// Hiển thị giỏ hàng
function showCart() {
  loadCart();
  if (cart.length === 0) {
    $('content').innerHTML = `
      <h2>Giỏ hàng</h2>
      <div class="empty-cart">
        <p>Giỏ hàng của bạn đang trống</p>
        <button onclick="showHome()">Tiếp tục mua sắm</button>
      </div>
    `;
    return;
  }
  
  let total = 0;
  cart.forEach(item => total += item.gia_ban * item.so_luong);
  
  $('content').innerHTML = `
    <h2>Giỏ hàng của bạn</h2>
    <div id="cart-items"></div>
    <div class="cart-summary">
      <h3>Tổng cộng: <span id="total">${formatPrice(total)}</span></h3>
      <div class="cart-actions">
        <button onclick="showHome()" class="btn-secondary">Tiếp tục mua</button>
        <button onclick="showCheckout()" class="btn-primary">Thanh toán</button>
      </div>
    </div>
  `;
  
  renderCart();
}

// Render danh sách sản phẩm trong giỏ
function renderCart() {
  const items = $('cart-items');
  let total = 0;
  
  items.innerHTML = cart.map((item, i) => {
    const subtotal = item.gia_ban * item.so_luong;
    total += subtotal;
    
    return `
      <div class="cart-item">
        <img src="${item.anh}" alt="${item.ten_san_pham}" onerror="this.src='assets/images/no-image.jpg'" />
        <div class="cart-item-info">
          <h4>${item.ten_san_pham}</h4>
          <p class="price">${formatPrice(item.gia_ban)}</p>
        </div>
        <div class="cart-item-qty">
          <button onclick="decreaseQty(${i})">-</button>
          <input type="number" value="${item.so_luong}" min="1" onchange="updateQty(${i}, this.value)" />
          <button onclick="increaseQty(${i})">+</button>
        </div>
        <div class="cart-item-total">
          <p>${formatPrice(subtotal)}</p>
          <button onclick="removeItem(${i})" class="btn-remove">Xóa</button>
        </div>
      </div>
    `;
  }).join('');
  
  $('total').textContent = formatPrice(total);
}

// Tăng số lượng
function increaseQty(i) {
  cart[i].so_luong++;
  saveCart();
  renderCart();
  updateCartCount(currentUserId);
}

// Giảm số lượng
function decreaseQty(i) {
  if (cart[i].so_luong > 1) {
    cart[i].so_luong--;
    saveCart();
    renderCart();
    updateCartCount(currentUserId);
  }
}

// Cập nhật số lượng
function updateQty(i, qty) {
  const newQty = parseInt(qty) || 1;
  cart[i].so_luong = newQty > 0 ? newQty : 1;
  saveCart();
  renderCart();
  updateCartCount(currentUserId);
}

// Xóa sản phẩm
function removeItem(i) {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    cart.splice(i, 1);
    saveCart();
    renderCart();
    updateCartCount(currentUserId);
  }
}

// Hiển thị checkout
function showCheckout() {
  loadCart();
  let total = 0;
  cart.forEach(item => total += item.gia_ban * item.so_luong);
  
  $('content').innerHTML = `
    <h2>Thanh toán & giao hàng</h2>
    <div class="checkout-container">
      <div class="checkout-form">
        <div class="form-group">
          <label>Họ tên người nhận *</label>
          <input id="name" type="text" placeholder="Nguyễn Văn A" required />
        </div>
        
        <div class="form-group">
          <label>Số điện thoại *</label>
          <input id="phone" type="tel" placeholder="0909123456" required />
        </div>
        
        <div class="form-group">
          <label>Địa chỉ giao hàng *</label>
          <textarea id="address" rows="3" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" required></textarea>
        </div>
        
        <div class="form-group">
          <label>Ghi chú (không bắt buộc)</label>
          <textarea id="note" rows="2" placeholder="Ghi chú thêm về đơn hàng..."></textarea>
        </div>
      </div>
      
      <div class="checkout-summary">
        <h3>Đơn hàng của bạn</h3>
        <div class="order-items">
          ${cart.map(item => `
            <div class="order-item">
              <span>${item.ten_san_pham} x${item.so_luong}</span>
              <span>${formatPrice(item.gia_ban * item.so_luong)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-total">
          <strong>Tổng cộng:</strong>
          <strong>${formatPrice(total)}</strong>
        </div>
        
        <div class="checkout-actions">
          <button onclick="showCart()" class="btn-secondary">← Quay lại giỏ hàng</button>
          <button onclick="placeOrder()" class="btn-primary">Đặt hàng</button>
        </div>
      </div>
    </div>
  `;
}

// Đặt hàng
async function placeOrder() {
  const name = $('name').value.trim();
  const phone = $('phone').value.trim();
  const address = $('address').value.trim();
  const note = $('note') ? $('note').value.trim() : '';
  
  if (!name || !phone || !address) {
    alert('Vui lòng nhập đầy đủ thông tin bắt buộc!');
    return;
  }
  
  // Validate số điện thoại
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(phone)) {
    alert('Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.');
    return;
  }
  
  const shipping = {
    ten: name,
    dien_thoai: phone,
    dia_chi: address
  };
  
  if (note) {
    shipping.ghi_chu = note;
  }
  
  try {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Đang xử lý...';
    
    const res = await api('/dat-hang', 'POST', { cart, shipping });
    
    if (res.success) {
      cart = [];
      saveCart();
      updateCartCount(currentUserId);
      
      alert(`Đặt hàng thành công!\nMã đơn hàng: #${res.donHangId}\nCảm ơn bạn đã mua hàng!`);
      // Redirect đến detail sản phẩm đầu tiên để đánh giá nếu có
      if (res.products && res.products.length > 0) {
        showProductDetail(res.products[0].id);
      } else {
        showHome();
      }
    } else {
      alert('Lỗi: ' + (res.error || 'Không thể đặt hàng'));
      btn.disabled = false;
      btn.textContent = 'Đặt hàng';
    }
  } catch (err) {
    console.error('Lỗi đặt hàng:', err);
    alert('Lỗi kết nối khi đặt hàng!');
    event.target.disabled = false;
    event.target.textContent = 'Đặt hàng';
  }
}

// Format giá tiền
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Cập nhật cart count khi load trang
updateCartCount();