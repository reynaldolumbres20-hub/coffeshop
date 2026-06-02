import { useRef, useState } from 'react'
import './App.css'

function App() {
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('pos')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const receiptRef = useRef(null)
  const reportRef = useRef(null)

  const [menu, setMenu] = useState([
    { id: 1, name: 'Americano', price: 120, category: 'Coffee', stock: 100, icon: '☕', sales: 0 },
    { id: 2, name: 'Cappuccino', price: 140, category: 'Coffee', stock: 85, icon: '☕', sales: 0 },
    { id: 3, name: 'Latte', price: 150, category: 'Coffee', stock: 90, icon: '☕', sales: 0 },
    { id: 4, name: 'Espresso', price: 100, category: 'Coffee', stock: 120, icon: '☕', sales: 0 },
    { id: 5, name: 'Caramel Macchiato', price: 170, category: 'Coffee', stock: 75, icon: '☕', sales: 0 },
    { id: 6, name: 'Mocha', price: 160, category: 'Coffee', stock: 80, icon: '☕', sales: 0 },
    { id: 7, name: 'Green Tea', price: 90, category: 'Tea', stock: 50, icon: '🍵', sales: 0 },
    { id: 8, name: 'Black Tea', price: 80, category: 'Tea', stock: 55, icon: '🍵', sales: 0 },
    { id: 9, name: 'Chai Latte', price: 130, category: 'Tea', stock: 60, icon: '🍵', sales: 0 },
    { id: 10, name: 'Cheesecake', price: 180, category: 'Pastry', stock: 40, icon: '🍰', sales: 0 },
    { id: 11, name: 'Chocolate Cake', price: 160, category: 'Pastry', stock: 35, icon: '🍰', sales: 0 },
    { id: 12, name: 'Croissant', price: 95, category: 'Pastry', stock: 45, icon: '🥐', sales: 0 },
    { id: 13, name: 'Cookies', price: 70, category: 'Pastry', stock: 60, icon: '🍪', sales: 0 },
    { id: 14, name: 'Sandwich', price: 150, category: 'Food', stock: 30, icon: '🥪', sales: 0 },
    { id: 15, name: 'Pasta', price: 200, category: 'Food', stock: 25, icon: '🍝', sales: 0 },
    { id: 16, name: 'French Fries', price: 120, category: 'Food', stock: 40, icon: '🍟', sales: 0 }
  ])

  const categories = ['all', 'Coffee', 'Tea', 'Pastry', 'Food']

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current.innerHTML
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>COFFEE LOVER SHOP - Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; background: #0a0505; color: #CD7F32; }
            .receipt-print { text-align: center; }
            hr { margin: 10px 0; border-color: #CD7F32; }
            .receipt-payment div { display: flex; justify-content: space-between; margin: 5px 0; }
            .receipt-change { color: #4caf50; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handlePrintReport = () => {
    const printContent = reportRef.current.innerHTML
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>COFFEE LOVER SHOP - Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; max-width: 900px; margin: 0 auto; background: #fff; }
            .report-header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #CD7F32; color: white; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert(`⚠️ Sorry, ${product.name} is OUT OF STOCK!`)
      return
    }
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        alert(`⚠️ Only ${product.stock} ${product.name} left!`)
        return
      }
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }
    const product = menu.find(p => p.id === productId)
    if (newQuantity > product.stock) {
      alert(`⚠️ Only ${product.stock} ${product.name} left!`)
      return
    }
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handlePayment = () => {
    const total = calculateTotal()
    const payment = parseFloat(paymentAmount)
    if (isNaN(payment) || payment < total) {
      alert(`❌ Insufficient payment! Total is ₱${total.toFixed(2)}`)
      return
    }
    const changeAmount = payment - total
    setShowPaymentModal(false)
    placeOrder(changeAmount, payment)
  }

  const placeOrder = (changeAmount, payment) => {
    const total = calculateTotal()
    const updatedMenu = menu.map(menuItem => {
      const orderedItem = cart.find(cartItem => cartItem.id === menuItem.id)
      if (orderedItem) {
        return { 
          ...menuItem, 
          stock: menuItem.stock - orderedItem.quantity,
          sales: menuItem.sales + orderedItem.quantity
        }
      }
      return menuItem
    })
    setMenu(updatedMenu)
    const newOrder = {
      id: Date.now(),
      items: [...cart],
      total: total,
      payment: payment,
      change: changeAmount,
      timestamp: new Date().toLocaleString(),
      status: 'Completed'
    }
    setOrders([newOrder, ...orders])
    setCurrentOrder(newOrder)
    setShowReceipt(true)
    setCart([])
    setPaymentAmount('')
  }

  const filteredMenu = selectedCategory === 'all' ? menu : menu.filter(item => item.category === selectedCategory)
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const totalItemsSold = menu.reduce((sum, i) => sum + i.sales, 0)
  const topSelling = [...menu].sort((a, b) => b.sales - a.sales).slice(0, 5)
  const lowStockItems = menu.filter(item => item.stock < 10)

  return (
    <div className="app">
      {/* Animated Cyber Background */}
      <div className="cyber-bg">
        <div className="cyber-grid"></div>
        <div className="cyber-glow-1"></div>
        <div className="cyber-glow-2"></div>
        <div className="cyber-glow-3"></div>
        <div className="cyber-particles">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="particle" style={{ '--i': i, '--delay': `${i * 0.08}s` }}></div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Premium Navbar */}
        <nav className="glass-nav">
          <div className="nav-logo">
            <div className="logo-3d">
              <span className="logo-icon">☕❤️</span>
              <span className="logo-text">COFFEE LOVER</span>
            </div>
          </div>
          <div className="nav-links">
            <button className={`nav-link-glow ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>
              <span className="nav-icon">🛒</span>
              <span className="nav-text">POS</span>
            </button>
            <button className={`nav-link-glow ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <span className="nav-icon">📜</span>
              <span className="nav-text">ORDERS</span>
            </button>
            <button className={`nav-link-glow ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
              <span className="nav-icon">📊</span>
              <span className="nav-text">INVENTORY</span>
            </button>
            <button className={`nav-link-glow ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <span className="nav-icon">📈</span>
              <span className="nav-text">REPORT</span>
            </button>
          </div>
          <div className="nav-stats-glow">
            <div className="stat-glow-card">
              <span className="stat-label">REVENUE</span>
              <span className="stat-value">₱{totalSales.toLocaleString()}</span>
            </div>
            <div className="stat-glow-card">
              <span className="stat-label">ORDERS</span>
              <span className="stat-value">{totalOrders}</span>
            </div>
            <div className="stat-glow-card">
              <span className="stat-label">SOLD</span>
              <span className="stat-value">{totalItemsSold}</span>
            </div>
          </div>
        </nav>

        {/* POS SECTION */}
        {activeTab === 'pos' && (
          <div className="unified-box">
            <div className="pos-header">
              <h3>✨ OUR MENU</h3>
              <div className="category-scroll">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`pill-glow ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'ALL' : cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pos-body">
              {/* MENU SECTION */}
              <div className="menu-section">
                <div className="menu-grid">
                  {filteredMenu.map(item => (
                    <div key={item.id} className="product-card" onClick={() => addToCart(item)}>
                      <div className="product-icon">{item.icon}</div>
                      <div className="product-details">
                        <div className="product-name">{item.name}</div>
                        <div className="product-price">₱{item.price}</div>
                        <div className={`product-stock ${item.stock < 10 ? 'low' : ''}`}>
                          {item.stock} left
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CART SECTION */}
              <div className="cart-section">
                <div className="cart-header">
                  <h3>🛒 CURRENT ORDER</h3>
                  <span className="cart-count">{cart.length} items</span>
                </div>
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <div className="empty-icon">☕</div>
                    <p>Cart is empty</p>
                    <small>Click any item above</small>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map(item => (
                        <div key={item.id} className="cart-item">
                          <div className="cart-item-info">
                            <span className="cart-item-name">{item.icon} {item.name}</span>
                            <span className="cart-item-price">₱{item.price}</span>
                          </div>
                          <div className="cart-item-actions">
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                            <span className="qty-num">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                          </div>
                          <div className="cart-item-total">₱{item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>
                    <div className="cart-total">
                      <span>TOTAL</span>
                      <strong>₱{calculateTotal().toFixed(2)}</strong>
                    </div>
                    <button className="checkout-btn" onClick={() => setShowPaymentModal(true)}>
                      💳 CHECKOUT
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>💳 PAYMENT</h3>
                <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="payment-total">
                  <span>TOTAL AMOUNT</span>
                  <strong>₱{calculateTotal().toFixed(2)}</strong>
                </div>
                <div className="payment-input">
                  <label>CASH RECEIVED</label>
                  <input 
                    type="number" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    autoFocus
                  />
                </div>
                {paymentAmount && parseFloat(paymentAmount) >= calculateTotal() && (
                  <div className="payment-change">
                    <span>CHANGE</span>
                    <strong>₱{(parseFloat(paymentAmount) - calculateTotal()).toFixed(2)}</strong>
                  </div>
                )}
                {paymentAmount && parseFloat(paymentAmount) < calculateTotal() && (
                  <div className="payment-error">⚠️ INSUFFICIENT!</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>CANCEL</button>
                <button className="btn-confirm" onClick={handlePayment}>CONFIRM</button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {activeTab === 'orders' && (
          <div className="orders-box">
            <div className="orders-header">
              <h3>📜 ORDER HISTORY</h3>
              <span className="orders-count">{orders.length} orders</span>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No orders yet</p>
                <small>Start taking orders from POS</small>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">#CLS-{order.id.toString().slice(-6)}</span>
                      <span className="order-date">{order.timestamp}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.icon} {item.name} x{item.quantity}</span>
                          <span>₱{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-payment">
                      <div><span>TOTAL:</span> <strong>₱{order.total.toFixed(2)}</strong></div>
                      <div><span>CASH:</span> ₱{order.payment.toFixed(2)}</div>
                      <div className="order-change"><span>CHANGE:</span> ₱{order.change.toFixed(2)}</div>
                    </div>
                    <div className="order-status">✓ COMPLETED</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Section */}
        {activeTab === 'inventory' && (
          <div className="inventory-box">
            <div className="inventory-header">
              <h3>📊 INVENTORY</h3>
              <div className="inventory-badges">
                <span>⚠️ LOW: {lowStockItems.length}</span>
                <span>📦 TOTAL: {menu.length}</span>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>SOLD</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map(item => (
                    <tr key={item.id}>
                      <td><span className="item-icon">{item.icon}</span> {item.name}</td>
                      <td>{item.category}</td>
                      <td>₱{item.price}</td>
                      <td className={item.stock < 10 ? 'warning' : ''}>{item.stock}</td>
                      <td>{item.sales}</td>
                      <td>
                        <span className={`status-badge ${item.stock === 0 ? 'out' : item.stock < 10 ? 'low' : 'good'}`}>
                          {item.stock === 0 ? 'OUT' : item.stock < 10 ? 'LOW' : 'GOOD'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Section */}
        {activeTab === 'reports' && (
          <div className="report-box">
            <div className="report-header">
              <h3>📈 SALES REPORT</h3>
              <button className="print-btn" onClick={handlePrintReport}>🖨️ PRINT</button>
            </div>
            <div className="report-content" ref={reportRef}>
              <div className="report-summary">
                <div className="summary-card">
                  <span>TOTAL REVENUE</span>
                  <strong>₱{totalSales.toLocaleString()}</strong>
                </div>
                <div className="summary-card">
                  <span>TOTAL ORDERS</span>
                  <strong>{totalOrders}</strong>
                </div>
                <div className="summary-card">
                  <span>ITEMS SOLD</span>
                  <strong>{totalItemsSold}</strong>
                </div>
                <div className="summary-card">
                  <span>AVERAGE ORDER</span>
                  <strong>₱{(totalSales / totalOrders || 0).toFixed(2)}</strong>
                </div>
              </div>
              <div className="report-table">
                <h4>🏆 TOP SELLING</h4>
                <table>
                  <thead>
                    <tr><th>RANK</th><th>ITEM</th><th>SOLD</th><th>REVENUE</th></tr>
                  </thead>
                  <tbody>
                    {topSelling.map((item, idx) => (
                      <tr key={item.id}>
                        <td>#{idx + 1}</td>
                        <td>{item.icon} {item.name}</td>
                        <td>{item.sales}</td>
                        <td>₱{(item.price * item.sales).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="report-footer">
                <p>Thank you for choosing COFFEE LOVER SHOP!</p>
                <p>🔥 THE BADDEST BREW IN TOWN 🔥</p>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && currentOrder && (
          <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
            <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="receipt-content" ref={receiptRef}>
                <div className="receipt-header">
                  <div className="receipt-logo">☕❤️</div>
                  <h3>COFFEE LOVER SHOP</h3>
                  <p>MAANGAS PREMIUM COFFEE</p>
                </div>
                <div className="receipt-body">
                  <div className="receipt-row"><span>ORDER #</span><strong>CLS-{currentOrder.id.toString().slice(-6)}</strong></div>
                  <div className="receipt-row"><span>DATE</span><span>{currentOrder.timestamp}</span></div>
                  <div className="receipt-divider"></div>
                  {currentOrder.items.map((item, idx) => (
                    <div key={idx} className="receipt-item">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="receipt-divider"></div>
                  <div className="receipt-payment">
                    <div><span>TOTAL</span><span>₱{currentOrder.total.toFixed(2)}</span></div>
                    <div><span>CASH</span><span>₱{currentOrder.payment.toFixed(2)}</span></div>
                    <div className="receipt-change"><span>CHANGE</span><span>₱{currentOrder.change.toFixed(2)}</span></div>
                  </div>
                  <div className="receipt-footer">☕ THANK YOU! COME AGAIN ❤️</div>
                </div>
              </div>
              <div className="receipt-actions">
                <button className="print-receipt" onClick={handlePrintReceipt}>🖨️ PRINT</button>
                <button className="close-receipt" onClick={() => setShowReceipt(false)}>CLOSE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
