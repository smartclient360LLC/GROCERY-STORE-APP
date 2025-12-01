# POS (Point of Sale) Features

## ✅ Implemented Features

### 1. **Cash Counter / POS System**
- ✅ Offline order processing (no customer login required)
- ✅ Multiple payment methods:
  - 💵 Cash
  - 💳 Credit Card
  - 💳 Debit Card
  - 📱 QR Code
- ✅ Real-time cart management
- ✅ Product search and quick add
- ✅ Quantity adjustment
- ✅ Order confirmation with order number

### 2. **Sales Reporting**
- ✅ Daily sales reports
- ✅ Monthly sales reports
- ✅ Payment method breakdown:
  - Cash sales
  - Card sales (Credit + Debit)
  - QR Code sales
  - Online sales
- ✅ Total orders and revenue tracking
- ✅ Daily breakdown for monthly view

### 3. **Backend Changes**
- ✅ Payment method enum added to Order and Payment models
- ✅ POS order flag (`isPosOrder`)
- ✅ Sales reporting endpoints
- ✅ Admin-only access control

---

## 🚀 How to Use

### Access POS System

1. **Login as Admin:**
   - Email: `admin@grocerystore.com`
   - Password: `admin123`

2. **Navigate to POS:**
   - Go to Admin Dashboard
   - Click "Cash Counter / POS" card
   - Or directly: http://localhost:3000/admin/pos

### Process a Sale

1. **Search/Select Products:**
   - Use search bar to find products
   - Click on product card to add to cart

2. **Manage Cart:**
   - Adjust quantities with +/- buttons
   - Remove items with × button
   - View total at bottom

3. **Process Payment:**
   - Click "Process Payment" button
   - Select payment method (Cash, Credit, Debit, QR)
   - Click "Confirm Payment"
   - Order number will be displayed

### View Sales Reports

1. **Access Reports:**
   - Go to Admin Dashboard
   - Click "Sales Reports" card
   - Or directly: http://localhost:3000/admin/sales

2. **Daily Report:**
   - Select date using date picker
   - View total orders, revenue, and payment breakdown

3. **Monthly Report:**
   - Select month and year
   - View monthly summary
   - See daily breakdown table

---

## 📊 API Endpoints

### POS Order Creation
```
POST /api/orders/pos
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "productName": "Organic Apples",
      "price": 4.99,
      "quantity": 2
    }
  ],
  "paymentMethod": "CASH",
  "isPosOrder": true
}
```

### Daily Sales Report
```
GET /api/orders/sales/daily?date=2025-11-26
Authorization: Bearer <admin_token>
```

### Monthly Sales Report
```
GET /api/orders/sales/monthly?year=2025&month=11
Authorization: Bearer <admin_token>
```

---

## 🔧 Database Changes

### Migration: `V2__add_payment_method.sql`

Added columns:
- `orders.payment_method` - Payment method enum
- `orders.is_pos_order` - Boolean flag for POS orders
- `payments.payment_method` - Payment method enum

Indexes added for performance:
- `idx_orders_created_at` - For date-based queries
- `idx_orders_status` - For status filtering
- `idx_orders_payment_method` - For payment method filtering

---

## 💡 Features

### Payment Methods
- **CASH**: Traditional cash payment
- **CREDIT_CARD**: Credit card payment
- **DEBIT_CARD**: Debit card payment
- **QR_CODE**: QR code payment (UPI, etc.)
- **ONLINE**: Online payment (Stripe, etc.)

### POS Order Characteristics
- Automatically set to `CONFIRMED` status
- No shipping address required
- Immediate order confirmation
- Order number generated automatically

### Sales Reports
- **Daily**: View sales for any specific date
- **Monthly**: View all days in a month with summary
- **Payment Breakdown**: See revenue by payment method
- **Order Count**: Track number of orders

---

## 🎯 Use Cases

1. **In-Store Sales:**
   - Customer comes to store
   - Cashier uses POS to scan/add items
   - Process payment (cash/card/QR)
   - Print receipt with order number

2. **Daily Closing:**
   - Admin checks daily sales report
   - Verifies cash, card, QR totals
   - Reconciles with actual cash/transactions

3. **Monthly Analysis:**
   - View monthly sales trends
   - Compare payment methods
   - Identify best-selling days
   - Plan inventory based on sales

---

## 🔒 Security

- ✅ Admin-only access (`@PreAuthorize("hasRole('ADMIN')")`)
- ✅ JWT authentication required
- ✅ RBAC enforcement

---

## 📝 Next Steps (Optional Enhancements)

1. **Receipt Printing:**
   - Add print functionality
   - Generate PDF receipts
   - Email receipts to customers

2. **Barcode Scanner:**
   - Integrate barcode scanning
   - Quick product lookup

3. **Inventory Updates:**
   - Auto-update stock after POS sale
   - Low stock alerts

4. **Advanced Reports:**
   - Product-wise sales
   - Category-wise sales
   - Time-based analysis
   - Export to Excel/PDF

5. **Multiple Cashiers:**
   - Track sales by cashier
   - Cashier performance reports

---

## 🚀 Quick Start

1. **Start all services:**
   ```bash
   # Backend services should be running
   # Frontend should be running
   ```

2. **Login as admin:**
   - http://localhost:3000/login
   - Email: `admin@grocerystore.com`
   - Password: `admin123`

3. **Access POS:**
   - http://localhost:3000/admin/pos

4. **View Reports:**
   - http://localhost:3000/admin/sales

---

## 📚 Files Created/Modified

### Backend
- `backend/order-service/src/main/resources/db/migration/V2__add_payment_method.sql`
- `backend/order-service/src/main/java/com/grocerystore/order/model/Order.java`
- `backend/order-service/src/main/java/com/grocerystore/order/dto/OrderDto.java`
- `backend/order-service/src/main/java/com/grocerystore/order/dto/CreateOrderRequest.java`
- `backend/order-service/src/main/java/com/grocerystore/order/dto/SalesReportDto.java`
- `backend/order-service/src/main/java/com/grocerystore/order/service/OrderService.java`
- `backend/order-service/src/main/java/com/grocerystore/order/controller/OrderController.java`
- `backend/order-service/src/main/java/com/grocerystore/order/repository/OrderRepository.java`
- `backend/payment-service/src/main/java/com/grocerystore/payment/model/Payment.java`

### Frontend
- `frontend/src/pages/PosCounter.jsx`
- `frontend/src/pages/PosCounter.css`
- `frontend/src/pages/SalesReports.jsx`
- `frontend/src/pages/SalesReports.css`
- `frontend/src/App.jsx` (updated routes)
- `frontend/src/pages/AdminDashboard.jsx` (added quick links)

---

Enjoy your new POS system! 🎉

