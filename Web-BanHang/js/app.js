// Helper $ and show/hide
function $(id) { return document.getElementById(id); }
/**
 * Show an element.
 * - NAV elements should become flex so they keep their horizontal layout.
 * - Other elements default to 'block'.
 */
function show(el) {
  if (!el) return;
  try {
    const tag = (el.tagName || '').toUpperCase();
    if (tag === 'NAV') {
      el.style.display = 'flex';
      return;
    }
    // if this element already has an explicit display value in CSS that isn't "none",
    // clearing inline style lets CSS decide. Otherwise default to 'block'.
    const computed = window.getComputedStyle(el).display;
    if (computed && computed !== 'none') {
      el.style.display = '';
    } else {
      el.style.display = 'block';
    }
  } catch (e) {
    // fallback
    el.style.display = 'block';
  }
}

function hide(el) { if (el) el.style.display = 'none'; }

// API helper (từ login.js)
async function api(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  
  return res.json();
}
/**
 * Hàm này giải mã một chuỗi Base64 URL (xử lý lỗi padding và ký tự)
 */
function decodeBase64Url(base64Url) {
  try {
    // 1. Chuyển Base64 URL thành Base64 chuẩn
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 2. Thêm padding (=) bị thiếu mà atob yêu cầu
    let padding = base64.length % 4;
    if(padding) {
      if(padding === 2) base64 += '==';
      else if(padding === 3) base64 += '=';
    }

    // 3. Decode
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Lỗi decode Base64 URL:", e);
    return null; // Trả về null nếu lỗi
  }
}

// ========== TRANG CHỦ - SẢN PHẨM BÁN CHẠY ==========
async function showHome() {
  try {
    $('content').innerHTML = '<div class="loading">Đang tải sản phẩm...</div>';
    
    const data = await api('/san-pham-ban-chay', 'GET');
    
    if (!data || data.length === 0) {
      $('content').innerHTML = '<h2>Chưa có sản phẩm bán chạy</h2>';
      return;
    }
    
    // Hiển thị search bar ở trang chủ
    show($('search-bar'));
    
    $('content').innerHTML = `
      <h2>Sản phẩm bán chạy</h2>
      <div class="grid">
        ${data.map(p => `
          <div class="product" onclick="showProductDetail(${p.id})">
            <img src="${p.anh}" alt="${p.ten_san_pham}" onerror="this.src='assets/images/no-image.jpg'" />
            <h3>${p.ten_san_pham}</h3>
            <div class="price">${formatPrice(p.gia_ban)}</div>
            ${p.gia_cu ? `<div class="old-price">${formatPrice(p.gia_cu)}</div>` : ''}
            <div class="product-info">
              <p>${p.mo_ta ? p.mo_ta.substring(0, 50) + '...' : ''}</p>
              <div class="rating">★ ${p.so_sao_trung_binh || 0}/5 (${p.so_luot_mua || 0} lượt mua)</div>
            </div>
            <button onclick="event.stopPropagation(); addToCart(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')" class="them-vao-gio-btn">
              Thêm vào giỏ
            </button>
            <button onclick="event.stopPropagation(); buyNow(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')" class="btn-buy-now">
              Mua ngay
            </button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Lỗi load sản phẩm:', err);
    $('content').innerHTML = '<h2>Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.</h2>';
  }
}

// ========== DANH MỤC ==========
async function showCategories() {
  try {
    $('content').innerHTML = '<div class="loading">Đang tải danh mục...</div>';
    hide($('search-bar'));
    
    const cats = await api('/nhom-san-pham', 'GET');
    
    if (!cats || cats.length === 0) {
      $('content').innerHTML = '<h2>Chưa có danh mục</h2>';
      return;
    }
    
    $('content').innerHTML = `
      <h2>Danh mục sản phẩm</h2>
      <div class="grid">
        ${cats.map(c => `
          <div class="category" onclick="showProducts(${c.id})">
            <img src="${c.anh}" alt="${c.ten_nhom}" onerror="this.src='assets/images/no-image.jpg'" />
            <h3>${c.ten_nhom}</h3>
            <p>${c.mo_ta || ''}</p>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Lỗi load danh mục:', err);
    $('content').innerHTML = '<h2>Không thể tải danh mục</h2>';
  }
}

// ========== SẢN PHẨM THEO NHÓM ==========
async function showProducts(nhomId) {
  try {
    $('content').innerHTML = '<div class="loading">Đang tải sản phẩm...</div>';
    hide($('search-bar'));
    
    const prods = await api(`/san-pham?nhom=${nhomId}`, 'GET');
    
    if (!prods || prods.length === 0) {
      $('content').innerHTML = `
        <h2>Sản phẩm trong nhóm</h2>
        <p>Chưa có sản phẩm trong nhóm này.</p>
        <button onclick="showCategories()">← Quay lại danh mục</button>
      `;
      return;
    }
    
    $('content').innerHTML = `
      <div style="margin-bottom: 1rem;">
        <button onclick="showCategories()">← Quay lại danh mục</button>
      </div>
      <h2>Sản phẩm</h2>
      <div class="grid">
        ${prods.map(p => `
          <div class="product" onclick="showProductDetail(${p.id})">
            <img src="${p.anh}" alt="${p.ten_san_pham}" onerror="this.src='assets/images/no-image.jpg'" />
            <h3>${p.ten_san_pham}</h3>
            <div class="price">${formatPrice(p.gia_ban)}</div>
            ${p.gia_cu ? `<div class="old-price">${formatPrice(p.gia_cu)}</div>` : ''}
            <div class="product-info">
              <p>${p.mo_ta ? p.mo_ta.substring(0, 50) + '...' : ''}</p>
              <div class="rating">★ ${p.so_sao_trung_binh || 0}/5 (${p.so_luot_mua || 0} lượt mua)</div>
            </div>
                <button onclick="event.stopPropagation(); addToCart(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')" 
                  style="background: linear-gradient(135deg, #4caf50 0%, #43a047 100%); 
                        color: white; 
                        border: none; 
                        padding: 0.9rem 2rem; 
                        border-radius: 30px; 
                        cursor: pointer; 
                        margin-top: 1rem; 
                        width: 100%; 
                        font-weight: 700; 
                        font-size: 1.05rem; 
                        transition: all 0.3s ease; 
                        text-transform: uppercase; 
                        letter-spacing: 1px; 
                        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);">
                  Thêm vào giỏ
                </button>
            <button onclick="event.stopPropagation(); buyNow(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')" class="btn-buy-now">
              Mua ngay
            </button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Lỗi load sản phẩm:', err);
    $('content').innerHTML = '<h2>Không thể tải sản phẩm</h2>';
  }
}

// ========== CHI TIẾT SẢN PHẨM + ĐÁNH GIÁ ==========
async function showProductDetail(id) {
  try {
    const p = await api(`/san-pham/${id}`, 'GET'); // Trả {p, danh_gia: []}
    const avgRating = p.danh_gia.length > 0 ? (p.danh_gia.reduce((sum, d) => sum + d.so_sao, 0) / p.danh_gia.length).toFixed(1) : 0;
    
    $('content').innerHTML = `
      <div class="product-detail">
        <img src="${p.anh}" alt="${p.ten_san_pham}" class="detail-img" />
        <div class="detail-info">
          <h2>${p.ten_san_pham}</h2>
          <div class="rating">★ ${avgRating}/5 (${p.danh_gia.length} đánh giá) - ${p.so_luot_mua || 0} lượt mua</div>
          <p>${p.mo_ta || ''}</p>
          <div class="price">${formatPrice(p.gia_ban)}</div>
          ${p.gia_cu ? `<div class="old-price">${formatPrice(p.gia_cu)}</div>` : ''}
          <button onclick="addToCart(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')">Thêm vào giỏ</button>
          <button onclick="buyNow(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')" class="btn-buy-now">Mua ngay</button>
        </div>
        
        <h3>Đánh giá</h3>
        <div class="reviews">
          ${p.danh_gia.map(d => `
            <div class="review-item">
              <span class="stars">★${'★'.repeat(d.so_sao - 1)}${'☆'.repeat(5 - d.so_sao)}</span>
              <p>${d.noi_dung}</p>
              <small>${formatDate(d.ngay_danh_gia)}</small>
            </div>
          `).join('') || '<p>Chưa có đánh giá nào.</p>'}
        </div>
        
        <h4>Đánh giá của bạn</h4>
        <select id="rating-stars">
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
        <textarea id="feedback" placeholder="Bình luận về sản phẩm..." rows="3"></textarea>
        <button onclick="submitFeedback(${p.id})" class="btn-primary">Gửi đánh giá</button>
      </div>
      <button onclick="showHome()" class="btn-secondary">Quay lại</button>
    `;
  } catch (err) {
    console.error('Lỗi load chi tiết:', err);
    $('content').innerHTML = '<h2>Không thể tải sản phẩm</h2>';
  }
}

async function submitFeedback(productId) {
  const so_sao = parseInt($('rating-stars').value);
  const noi_dung = $('feedback').value.trim();
  if (!noi_dung || so_sao < 1 || so_sao > 5) {
    alert('Chọn sao 1-5 và viết bình luận!');
    return;
  }
  
  // Check đã mua (gọi API nhanh)
  try {
    const hasBought = await api(`/check-mua/${productId}`, 'GET'); // API mới: SELECT COUNT(*) FROM ChiTietDonHang WHERE san_pham_id = ? AND don_hang_id IN (SELECT id FROM DonHang WHERE nguoi_dung_id = ? AND trang_thai = 'da_giao')
    if (!hasBought || hasBought.count === 0) {
      alert('Bạn chưa mua sản phẩm này, không thể đánh giá!');
      return;
    }
  } catch (err) {
    console.error('Check mua lỗi:', err);
  }
  
  // Post đánh giá
  const res = await api('/danh-gia', 'POST', { san_pham_id: productId, so_sao, noi_dung });
  if (res.success) {
    alert('Đánh giá thành công! Cập nhật ★' + so_sao);
    showProductDetail(productId); // Reload reviews
  } else {
    alert('Lỗi gửi: ' + res.error);
  }
}

// ========== XEM ĐƠN HÀNG USER ==========
async function showMyOrders() {
  if (!token) { 
    alert('Chưa đăng nhập!'); 
    return; 
  }
  
  $('content').innerHTML = '<div class="loading">Đang tải...</div>';
  hide($('search-bar'));
  
  try {
    // Lấy userId từ token
    const decoded = JSON.parse(atob(token));
    const userId = decoded.id;
    
    const response = await fetch(`/api/don-hang/${userId}`, { method: 'GET' });
    if (!response.ok) throw new Error(response.statusText);
    
    const orders = await response.json();
    
    if (!orders || orders.length === 0) {
      $('content').innerHTML = `
        <h2>Đơn hàng của bạn</h2>
        <p>Chưa có đơn hàng nào.</p>
         <button onclick="showHome()" 
                style="padding: 1.3rem 2rem; 
                background: #e0e0e0; 
                color: #333; 
                border: none; 
                border-radius: 15px; 
                cursor: pointer; 
                font-size: 1.1rem; 
                font-weight: 800; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); 
                transition: all 0.3s ease;">
          Tiếp tục mua sắm
        </button>
      `;
      return;
    }
    
    $('content').innerHTML = `
      <h2>Đơn hàng của bạn (${orders.length} đơn)</h2>
      <div class="orders-list">
        ${orders.map(o => `
          <div class="order-card">
            <div class="order-header">
              <strong>Đơn #${o.id}</strong>
              <span class="status status-${o.trang_thai}">${formatStatus(o.trang_thai)}</span>
            </div>
                <div class="order-products">
                  ${
                    o.chi_tiet && o.chi_tiet.length
                      ? o.chi_tiet
                          .map(
                            (p, idx) => `
                        <div class="product-line" style="margin: 6px 0; padding: 6px; border: 1px solid #eee; border-radius: 6px;">
                          <p><strong>Sản phẩm ${idx + 1}:</strong> ${p.ten_san_pham || 'Sản phẩm #' + p.san_pham_id}</p>
                          <p><strong>Số lượng:</strong> ${p.so_luong}</p>
                          <p><strong>Giá:</strong> ${formatPrice(p.gia_luc_mua)}</p>
                        </div>
                      `
                          )
                          .join('')
                      : '<em>Chưa có chi tiết sản phẩm.</em>'
                  }
                </div>


            ${o.trang_thai === 'da_giao' ? `<button onclick="showFeedbackFormForOrder(${o.id})" class="btn-primary">Đánh giá</button>` : ''}
          </div>
        `).join('')}
      </div>
      <button onclick="showHome()" class="btn-secondary">Quay lại</button>
    `;
  } catch (err) {
    console.error('Lỗi load đơn:', err);
    $('content').innerHTML = `
      <h2>Đơn hàng của bạn</h2>
      <p>Lỗi tải đơn (kiểm tra console). Thử lại.</p>
      <button onclick="showMyOrders()" class="btn-secondary">Thử lại</button>
    `;
  }
}


// Hiển thị form đánh giá từng sản phẩm trong đơn
async function showFeedbackFormForOrder(orderId) {
  $('content').innerHTML = '<div class="loading">Đang tải chi tiết đơn...</div>';

  try {
        const response = await fetch(`/api/chi-tiet-don/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Không tải được đơn hàng');

    const data = await response.json();
      if (!data || !data.chi_tiet || data.chi_tiet.length === 0) {
        $('content').innerHTML = `
          <h2>Đơn hàng #${orderId}</h2>
          <p>Không có sản phẩm để đánh giá.</p>
          <button onclick="showMyOrders()" class="btn-secondary">Quay lại</button>
        `;
        return;
      }

// Hiển thị form
$('content').innerHTML = `
  <h2>Đánh giá đơn hàng #${data.don_hang_id}</h2>
  <p><strong>Tổng tiền:</strong> ${formatPrice(data.tong_tien)}</p>
  <p><strong>Số lượng sản phẩm:</strong> ${data.so_luong_items}</p>
  
  <div class="feedback-list">
    ${data.chi_tiet.map((p, idx) => `
      <div class="feedback-item" style="margin:10px 0;padding:15px;border:1px solid #ddd;border-radius:8px;background:#f9f9f9;">
        <div style="display:flex;gap:10px;margin-bottom:10px;">
          <img src="${p.anh || '/images/placeholder.jpg'}" alt="${p.ten_san_pham}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;" />
          <div>
            <h4 style="margin:0 0 5px 0;">${p.ten_san_pham}</h4>
            <p style="margin:0;color:#666;">Số lượng: ${p.so_luong} | Giá: ${formatPrice(p.gia_luc_mua)}</p>
            <p style="margin:5px 0 0 0;font-weight:bold;">Thành tiền: ${formatPrice(p.thanh_tien)}</p>
          </div>
        </div>
        
        <label>Chọn số sao:</label>
        <select id="rating-${p.san_pham_id}" style="padding:8px;width:100%;max-width:200px;">
          <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
          <option value="4">⭐⭐⭐⭐ (4 sao)</option>
          <option value="3">⭐⭐⭐ (3 sao)</option>
          <option value="2">⭐⭐ (2 sao)</option>
          <option value="1">⭐ (1 sao)</option>
        </select>
        
        <textarea id="feedback-${p.san_pham_id}" placeholder="Nhận xét của bạn..." rows="3" style="width:100%;margin-top:6px;padding:8px;"></textarea>
        
        <button onclick="submitFeedback(${p.san_pham_id}, ${data.don_hang_id})" 
                id="btn-${p.san_pham_id}"
                class="btn-primary" style="margin-top:6px;">
          Gửi đánh giá
        </button>
        <span id="status-${p.san_pham_id}" style="margin-left:10px;color:#28a745;"></span>
      </div>
    `).join('')}
  </div>
  <button onclick="showMyOrders()" class="btn-secondary" style="margin-top:10px;">Quay lại</button>
`;

  } catch (err) {
    console.error('Lỗi tải chi tiết đơn:', err);
    $('content').innerHTML = `<p>Lỗi tải đơn hàng. Kiểm tra console!</p>
    <button onclick="showMyOrders()" class="btn-secondary">Quay lại</button>`;
  }
}


// Submit đánh giá cho sản phẩm đã mua trong đơn
// Gửi đánh giá cho 1 sản phẩm trong đơn
async function submitFeedback(productId, orderId) {
  const ratingSelect = $(`rating-${productId}`);
  const feedbackTextarea = $(`feedback-${productId}`);
  const submitBtn = $(`btn-${productId}`);
  const statusSpan = $(`status-${productId}`);
  
  if (!ratingSelect || !feedbackTextarea) {
    alert('Không tìm thấy form!');
    return;
  }
  
  const so_sao = parseInt(ratingSelect.value);
  const noi_dung = feedbackTextarea.value.trim();

  if (!noi_dung || noi_dung.length < 5) {
    alert('Nhập nội dung đánh giá (ít nhất 5 ký tự)!');
    feedbackTextarea.focus();
    return;
  }

  // Disable button
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
  }

  try {
    const tokenData = JSON.parse(atob(token));
    const userId = tokenData.id;

    const res = await fetch(`/api/danh-gia-don/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        san_pham_id: productId,
        nguoi_dung_id: userId,
        so_sao,
        noi_dung,
      }),
    });

    const result = await res.json();
    
    if (res.ok && result.success) {
      if (statusSpan) {
        statusSpan.textContent = '✓ Đã gửi!';
        statusSpan.style.color = '#28a745';
      }
      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
      ratingSelect.disabled = true;
      feedbackTextarea.disabled = true;
      if (submitBtn) {
        submitBtn.textContent = '✓ Đã đánh giá';
        submitBtn.style.background = '#6c757d';
      }
    } else {
      throw new Error(result.error || 'Không thể gửi đánh giá');
    }
  } catch (err) {
    console.error('Lỗi gửi đánh giá:', err);
    alert('Không gửi được đánh giá: ' + err.message);
    
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gửi đánh giá';
    }
  }
}


// Helper: Chuyển từ nút đánh giá trong list đơn → mở form
function showProductDetailFromOrder(orderId) {
  showFeedbackFormForOrder(orderId);
}

// ========== TÌM KIẾM ==========
async function doSearch() {
  const q = $('search-input').value.trim();
  try {
    $('content').innerHTML = '<div class="loading">Đang tìm kiếm...</div>';
    
    let res;
    if (!q) {
      // Trống: Load full sản phẩm
      res = await api('/san-pham', 'GET');
      $('content').innerHTML = `
        <h2>Tất cả sản phẩm</h2>
        <div class="grid">
          ${res.map(p => `
            <div class="product" onclick="showProductDetail(${p.id})">
              <img src="${p.anh}" alt="${p.ten_san_pham}" onerror="this.src='assets/images/no-image.jpg'" />
              <h3>${p.ten_san_pham}</h3>
              <div class="price">${formatPrice(p.gia_ban)}</div>
              ${p.gia_cu ? `<div class="old-price">${formatPrice(p.gia_cu)}</div>` : ''}
              <div class="product-info">
                <p>${p.mo_ta ? p.mo_ta.substring(0, 50) + '...' : ''}</p>
                <div class="rating">★ ${p.so_sao_trung_binh || 0}/5 (${p.so_luot_mua || 0} lượt mua)</div>
              </div>
              <button onclick="event.stopPropagation(); addToCart(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')">
                Thêm vào giỏ
              </button>
              <button onclick="event.stopPropagation(); buyNow(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')" class="btn-buy-now">
                Mua ngay
              </button>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      res = await api(`/tim-kiem?q=${encodeURIComponent(q)}`, 'GET');
      if (!res || res.length === 0) {
        $('content').innerHTML = `<h2>Kết quả tìm kiếm: "${q}"</h2><p>Không tìm thấy sản phẩm nào.</p>`;
        return;
      }
      $('content').innerHTML = `
        <h2>Kết quả: "${q}"</h2>
        <div class="grid">
          ${res.map(p => `
            <div class="product" onclick="showProductDetail(${p.id})">
              <img src="${p.anh}" alt="${p.ten_san_pham}" onerror="this.src='assets/images/no-image.jpg'" />
              <h3>${p.ten_san_pham}</h3>
              <div class="price">${formatPrice(p.gia_ban)}</div>
              ${p.gia_cu ? `<div class="old-price">${formatPrice(p.gia_cu)}</div>` : ''}
              <div class="product-info">
                <p>${p.mo_ta ? p.mo_ta.substring(0, 50) + '...' : ''}</p>
                <div class="rating">★ ${p.so_sao_trung_binh || 0}/5 (${p.so_luot_mua || 0} lượt mua)</div>
              </div>
              <button onclick="event.stopPropagation(); addToCart(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')">
                Thêm vào giỏ
              </button>
              <button onclick="event.stopPropagation(); buyNow(${p.id}, '${escapeHtml(p.ten_san_pham)}', ${p.gia_ban}, '${p.anh}')" class="btn-buy-now">
                Mua ngay
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (err) {
    console.error('Lỗi tìm kiếm:', err);
    alert('Lỗi khi tìm kiếm');
  }
}

// Event listener cho Enter
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = $('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }
  if (token) updateUINav();
});

// ========== ADMIN - QUẢN LÝ ĐƠN HÀNG ==========
async function showAdminOrders() {
  if (!token) {
    alert('Chưa đăng nhập!');
    return;
  }
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.la_admin !== 1) {
      alert('Không có quyền!');
      return;
    }
  } catch (e) {
    alert('Token không hợp lệ!');
    logout();
    return;
  }
  
  try {
    $('content').innerHTML = '<div class="loading">Đang tải đơn hàng...</div>';
    hide($('search-bar'));
    
    const orders = await api('/admin/don-hang', 'GET');
    
    if (!orders || orders.length === 0) {
      $('content').innerHTML = `
        <h2>Quản lý đơn hàng</h2>
        <p>Chưa có đơn hàng nào.</p>
      `;
      return;
    }
    
    $('content').innerHTML = `
      <h2>Quản lý đơn hàng (Tổng: ${orders.length} đơn)</h2>
      <div class="orders-list">
        ${orders.map(o => `
          <div class="order-card">
            <div class="order-header">
              <strong>Đơn #${o.id}</strong>
              <span class="status status-${o.trang_thai}">${formatStatus(o.trang_thai)}</span>
            </div>
            <div class="order-info">
              <p><strong>Khách hàng:</strong> ${o.ten_nguoi_nhan} - ${o.dien_thoai_nguoi_nhan}</p>
              <p><strong>Địa chỉ:</strong> ${o.dia_chi_giao}</p>
              <p><strong>Tổng tiền:</strong> ${formatPrice(o.tong_tien)}</p>
              <p><strong>Ngày đặt:</strong> ${formatDate(o.ngay_tao)}</p>
              ${o.ma_cod ? `<p><strong>Mã COD:</strong> ${o.ma_cod}</p>` : ''}
              ${o.ghi_chu ? `<p><strong>Ghi chú:</strong> ${o.ghi_chu}</p>` : ''}
            </div>
            <div class="order-actions">
              <button onclick="callConfirm(${o.id}, '${o.dien_thoai_nguoi_nhan}')" class="btn-call">📞 Gọi xác nhận</button>
              <button onclick="updateStatusQuick(${o.id}, 'da_xac_nhan')" class="btn-status">Xác nhận</button>
              <button onclick="updateStatusQuick(${o.id}, 'dang_dong_goi')" class="btn-status">Chuyển đóng gói</button>
              <button onclick="updateStatusQuick(${o.id}, 'dang_giao')" class="btn-status">Gửi bưu điện</button>
              <button onclick="updateOrderCOD(${o.id})" class="btn-cod">Cập nhật COD</button>
              <button onclick="updateStatusQuick(${o.id}, 'da_giao')" class="btn-status">Hoàn thành giao</button>
              <button onclick="updateStatusQuick(${o.id}, 'da_huy')" class="btn-huy">Hủy hàng</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Lỗi load đơn hàng:', err);
    $('content').innerHTML = '<h2>Không thể tải đơn hàng</h2>';
  }
}
async function callConfirm(orderId, phone) {
  if (confirm(`Gọi xác nhận cho ${phone}?`)) {
    const note = prompt('Ghi chú sau gọi (ví dụ: Khách đồng ý nhận hàng):') || `Đã gọi xác nhận lúc ${new Date().toLocaleString('vi-VN')}`;
    try {
      const res = await api(`/admin/don-hang/${orderId}`, 'PUT', { ghi_chu: note });
      if (res.success) {
        alert('Cập nhật ghi chú thành công!');
        showAdminOrders();
      }
    } catch (err) {
      alert('Lỗi cập nhật!');
    }
  }
}
async function updateStatusQuick(orderId, status) {
  if (confirm(`Cập nhật trạng thái thành ${formatStatus(status)}?`)) {
    try {
      const res = await api(`/admin/don-hang/${orderId}`, 'PUT', { trang_thai: status });
      if (res.success) {
        alert('Cập nhật thành công!');
        showAdminOrders();
      }
    } catch (err) {
      alert('Lỗi cập nhật!');
    }
  }
}
// callConfirm, updateStatusQuick, updateOrderCOD (giữ nguyên)
async function updateOrderCOD(orderId) {
  const maCOD = prompt('Nhập mã COD:');
  if (!maCOD) return;
  
  try {
    const res = await api(`/admin/don-hang/${orderId}`, 'PUT', { ma_cod: maCOD });
    if (res.success) {
      alert('Cập nhật mã COD thành công!');
      showAdminOrders();
    } else {
      alert('Lỗi: ' + (res.error || 'Không thể cập nhật'));
    }
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    alert('Lỗi kết nối!');
  }
}
// ========== ADMIN - THỐNG KÊ + BIỂU ĐỒ ==========
async function showStats() {
  try {
    $('content').innerHTML = '<div class="loading">Đang tải biểu đồ...</div>';
    hide($('search-bar'));

    // 👉 Tạm thời bỏ qua phần gọi API thống kê
    /*
    const stats = await api('/admin/thong-ke', 'GET');
    console.log('Stats API response:', stats);

    if (!stats || !stats.data || !Array.isArray(stats.data) || stats.data.length === 0) {
      $('content').innerHTML = `
        <h2>Thống kê bán hàng</h2>
        <p>Chưa có dữ liệu hoặc API lỗi.</p>
      `;
      return;
    }
    */

    // 👉 Hiển thị iframe Grafana trước
    $('content').innerHTML = `
      <h2>Thống kê bán hàng (30 ngày gần nhất)</h2>
      <h3>Biểu đồ số lượng mặt hàng bán theo ngày (Grafana)</h3>
      <div class="grafana-chart" style="display:flex; justify-content:center; margin-top:20px;">
        <iframe
          src="http://nguyennhukhiem.com/grafana/d-solo/add8kv7/thng-k-sn-phm-bn-c?orgId=1&from=1761930000000&to=1764521999999&timezone=browser&panelId=1&__feature.dashboardSceneSolo=true"
          width="900"
          height="400"
          frameborder="0"
          style="border-radius:12px; box-shadow:0 0 15px rgba(0,0,0,0.2);"
        ></iframe>
      </div>
    `;
  } catch (err) {
    console.error('Lỗi load biểu đồ:', err);
    $('content').innerHTML = '<h2>Không thể tải biểu đồ</h2>';
  }
}


// ========== HELPER FUNCTIONS ==========
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('vi-VN');
}

function formatStatus(status) {
  const statuses = {
    'cho_xac_nhan': 'Chờ xác nhận',
    'da_xac_nhan': 'Đã xác nhận',
    'dang_dong_goi': 'Đang đóng gói',
    'dang_giao': 'Đang giao',
    'da_giao': 'Đã giao',
    'da_huy': 'Đã hủy'
  };
  return statuses[status] || status;
}

function escapeHtml(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function toggleUserMenu() {
  const menu = $('user-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Hàm mới: Gọi API để lấy tên
async function updateUINav() {
  if (!token) return;
  
  try {
    // 1. Dùng hàm decodeBase64Url để lấy UserID từ token
    const decoded = decodeBase64Url(token); // <-- SỬ DỤNG HÀM MỚI
    
    if (!decoded || !decoded.id) {
      // Nếu vẫn lỗi, chúng ta không thể tiếp tục
      throw new Error("Token không hợp lệ, không tìm thấy ID.");
    }
    const userId = decoded.id;
    const isAdmin = decoded.la_admin === 1;

    // 2. GỌI API ĐỂ LẤY TÊN
    // Dùng fetch() trực tiếp vì Nginx (từ các lần trước)
    // đang map /user/ -> /:id (của Node-RED)
    const response = await fetch(`/user/${userId}`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    if (!response.ok) {
        throw new Error(`API /user/ Lỗi: ${response.statusText}`);
    }

    const data = await response.json(); // API Node-RED trả về mảng [ { ... } ]
    
    if (!data || data.length === 0) {
      throw new Error("API trả về rỗng, không tìm thấy user.");
    }

    const user = data[0]; // Lấy user từ mảng
    
    // 3. Lấy tên từ KẾT QUẢ API
    const userName = user.ho_ten || user.ten_dang_nhap || 'User'; 
    
    // 4. Cập nhật UI
    $('user-display').textContent = userName; // <-- Dòng này thay tên "User"
    show($('user-name'));
    hide($('profile-btn')); 
    show($('orders-btn')); 
    
    if (isAdmin) {
      show($('admin-btn'));
      show($('stats-btn'));
    } else {
      hide($('admin-btn'));
      hide($('stats-btn'));
    }
    
    updateCartCount(userId);
    showHome(); 
    
  } catch (e) {
    console.error('Lỗi updateUINav (khi gọi API):', e); 
    alert('Lỗi khi tải thông tin user, đăng xuất!');
    logout();
  }
}

// Trong doLogin() của login.js, sau success: updateUINav(); showHome();