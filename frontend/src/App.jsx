import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'shop', 'cart', 'login', 'admin'
  const [cart, setCart] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`);
        let fetched = response.data;
        if (fetched.length < 8) {
          const mockData = [
            { id: 101, name: 'Premium Leather Wallet', brand: 'Tommy Hilfiger', price: 1499, originalPrice: 2999, discount: 50, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400' },
            { id: 102, name: 'Aviator Sunglasses', brand: 'Ray-Ban', price: 3799, originalPrice: 7599, discount: 50, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400' },
            { id: 103, name: 'Analog Watch', brand: 'Fossil', price: 4999, originalPrice: 9999, discount: 50, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400' },
            { id: 104, name: 'Canvas Backpack', brand: 'Wildcraft', price: 1299, originalPrice: 2599, discount: 50, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400' },
            { id: 105, name: 'Wayfarer Sunglasses', brand: 'Oakley', price: 4299, originalPrice: 8599, discount: 50, image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=400' },
            { id: 106, name: 'Chronograph Watch', brand: 'Casio', price: 5999, originalPrice: 11999, discount: 50, image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=400' },
            { id: 107, name: 'Slim Leather Belt', brand: 'Levis', price: 899, originalPrice: 1799, discount: 50, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=400' },
            { id: 108, name: 'Crossbody Sling Bag', brand: 'Caprese', price: 1899, originalPrice: 3799, discount: 50, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400' },
          ];
          fetched = [...fetched, ...mockData.filter(m => !fetched.find(f => f.name === m.name))];
        }
        setProducts(fetched);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart!`);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((total, item) => total + (Number(item.price) || 0), 0);
  const tax = cartTotal * 0.18; // 18% tax
  const finalTotal = cartTotal + tax;

  const sendEmail = async () => {
    if (!customer.name || !customer.email || !customer.address) {
      alert('Please fill in your name, email, and address first!');
      return;
    }

    try {
      // Save order to RDS Database
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        full_name: customer.name,
        email_address: customer.email,
        delivery_address: customer.address,
        total_bill: finalTotal
      });

      const itemsList = cart.map(item => `- ${item.name} (₹${item.price})`).join('%0A');
      const subject = `SWIFTCART Bill - Order for ${customer.name}`;
      const body = `SWIFTCART BILL%0A%0A` +
        `Order Saved to Database!%0A%0A` +
        `Customer Details:%0A` +
        `Name: ${customer.name}%0A` +
        `Email: ${customer.email}%0A` +
        `Address: ${customer.address}%0A%0A` +
        `Items:%0A${itemsList}%0A%0A` +
        `Total Bill: ₹${finalTotal.toFixed(2)}%0A%0A` +
        `Thank you for shopping with us!`;

      const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailtoUrl;
    } catch (err) {
      console.error('Order error', err);
      alert('Failed to save order to database. Please check your backend connection.');
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="mobile-menu"><Menu /></div>
          <div className="logo" onClick={() => setCurrentPage('home')}>SWIFTCART</div>
          <ul className="nav-links">
            <li onClick={() => setCurrentPage('home')} className={currentPage === 'home' ? 'active' : ''}>Home</li>
            <li onClick={() => setCurrentPage('shop')} className={currentPage === 'shop' ? 'active' : ''}>Shop</li>
          </ul>
        </div>
        
        <div className="nav-search">
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Search accessories..." />
          </div>
        </div>

        <div className="nav-right">
          <button className="auth-btn" onClick={() => setCurrentPage('login')}>Login</button>
          <button className="auth-btn admin-btn" onClick={() => setCurrentPage('admin-auth')}>Admin</button>
          <div className="nav-item">
            <User size={22} />
          </div>
          <div className="nav-item" onClick={() => setCurrentPage('cart')}>
            <ShoppingCart size={22} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* HOME PAGE */}
        {currentPage === 'home' && (
          <div className="home-page">
            <div className="hero-section">
              <h1>Elevate Your Style</h1>
              <p>Discover our curated collection of premium accessories.</p>
              <button className="primary-btn" onClick={() => setCurrentPage('shop')}>Explore Shop</button>
            </div>
          </div>
        )}

        {/* SHOP PAGE */}
        {currentPage === 'shop' && (
          <div className="shop-page">
            <div className="page-header">
              <h2>All Accessories</h2>
              <p>{products.length} products found</p>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading collection...</div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.image && product.image.startsWith('http') ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">IMG</div>
                      )}
                    </div>
                    <div className="product-details">
                      <h3 className="brand-name">{product.brand || 'SwiftCart'}</h3>
                      <p className="product-name">{product.name}</p>
                      <div className="price-section">
                        <span className="current-price">₹{product.price ? Math.round(product.price) : 0}</span>
                        {product.originalPrice && (
                          <span className="original-price">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CART / CHECKOUT PAGE */}
        {currentPage === 'cart' && (
          <div className="cart-page">
            <h2>Your Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
                <button className="primary-btn" onClick={() => setCurrentPage('shop')}>Continue Shopping</button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-img">
                        {item.image && item.image.startsWith('http') ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="placeholder-image">IMG</div>
                        )}
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p className="item-brand">{item.brand}</p>
                      </div>
                      <div className="cart-item-price">
                        ₹{item.price ? Math.round(Number(item.price)) : 0}
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(index)}>Remove</button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <h3>Order Summary</h3>
                  
                  <div className="customer-info-form">
                    <h4>Customer Information</h4>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={customer.email}
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                    />
                    <textarea 
                      placeholder="Delivery Address" 
                      value={customer.address}
                      onChange={(e) => setCustomer({...customer, address: e.target.value})}
                    />
                  </div>

                  <div className="summary-row">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Tax (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total Bill</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                  <button className="checkout-btn" onClick={sendEmail}>Send Bill to Email</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGIN PAGE */}
        {currentPage === 'login' && (
          <div className="auth-page">
            <div className="auth-container">
              <h2>Welcome Back</h2>
              <p>Please enter your details to sign in.</p>
              <form className="auth-form" onSubmit={async (e) => { 
                e.preventDefault(); 
                const email = e.target.elements[0].value;
                const password = e.target.elements[1].value;
                const username = email.split('@')[0];
                
                try {
                  const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`, { email, password });
                  setUsers([...users, response.data.user]);
                  alert(`Successfully registered/logged in as ${username}!`);
                  e.target.reset();
                  setCurrentPage('home');
                } catch (err) {
                  console.error('Login error', err);
                  alert('Error connecting to database');
                }
              }}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" required />
                </div>
                <button type="submit" className="primary-btn full-width">Sign In</button>
              </form>
            </div>
          </div>
        )}
        {/* ADMIN AUTH PAGE */}
        {currentPage === 'admin-auth' && (
          <div className="auth-page">
            <div className="auth-container">
              <h2>Admin Access</h2>
              <p>Please enter your credentials to access the dashboard.</p>
              <form className="auth-form" onSubmit={async (e) => { 
                e.preventDefault(); 
                try {
                  const [userRes, orderRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`),
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`)
                  ]);
                  setUsers(userRes.data);
                  setOrders(orderRes.data);
                  alert('Admin authenticated!');
                  setCurrentPage('admin');
                } catch (err) {
                  console.error('Admin fetch error', err);
                  alert('Error fetching data from database');
                }
              }}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" placeholder="Enter admin username" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter admin email" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" required />
                </div>
                <button type="submit" className="primary-btn full-width">Enter Dashboard</button>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD PAGE */}
        {currentPage === 'admin' && (
          <div className="admin-page">
            <div className="page-header">
              <h2>Admin Dashboard</h2>
              <p>Manage users and monitor orders in real-time.</p>
            </div>

            <div className="admin-section">
              <h3>Registered Users</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Joined On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No users found in database.
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id}>
                          <td>#{user.id}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td><button className="text-btn">Manage</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-section" style={{ marginTop: '4rem' }}>
              <h3>Recent Orders</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, i) => (
                        <tr key={order.id}>
                          <td>#ORD-{order.id}</td>
                          <td>{order.full_name}</td>
                          <td>₹{order.total_bill}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 SwiftCart. Minimalist E-commerce.</p>
      </footer>
    </div>
  );
}

export default App;
