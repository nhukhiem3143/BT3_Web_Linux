let token = localStorage.getItem('token');

function $(id) { return document.getElementById(id); }
function show(el) { if(el) el.style.display = 'block'; }
function hide(el) { if(el) el.style.display = 'none'; }

async function api(path, method = 'POST', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  
  return res.json();
}

// Hiển thị form đăng nhập
function showLogin() {
  hide($('main-nav')); // Ẩn menu
  
  $('content').innerHTML = `
    <div class="login-container">
      <div class="login-form">
        <h2>Đăng nhập</h2>
        <input id="username" type="text" placeholder="Tên đăng nhập" />
        <input id="password" type="password" placeholder="Mật khẩu" />
        <button onclick="doLogin()">Đăng nhập</button>
      </div>
    </div>
  `;
}

// Xử lý đăng nhập
async function doLogin() {
  const username = $('username').value.trim();
  const password = $('password').value.trim();

  if (!username || !password) {
    alert('Vui lòng nhập đầy đủ thông tin!');
    return;
  }

  try {
    const res = await api('/login', 'POST', { 
      ten_dang_nhap: username, 
      mat_khau: password 
    });

    if (res.token) {
      token = res.token;
      localStorage.setItem('token', token);
      
      alert('Đăng nhập thành công!');
      
      // Reload trang để cập nhật UI
      window.location.reload();
    } else {
      alert(res.error || 'Sai tên đăng nhập hoặc mật khẩu');
    }
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    alert('Lỗi kết nối! Kiểm tra Node-RED API.');
  }
}

// Đăng xuất
function logout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    token = null;
    localStorage.removeItem('token');
    
    // Reload trang để về form login
    window.location.reload();
  }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
  token = localStorage.getItem('token');
  
  if (token) {
    // Đã đăng nhập
    show($('main-nav'));
    if (typeof showHome === 'function') {
      showHome();
    }
  } else {
    // Chưa đăng nhập
    hide($('main-nav'));
    showLogin();
  }
});