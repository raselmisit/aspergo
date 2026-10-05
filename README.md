# ASPER GO — ANYTHING, ANYTIME, ANYWHERE 🚀

A modern, lightweight, high-converting e-commerce web application crafted specifically for Bangladesh with role-based access control, no-code catalog management, live social proof badges, and seamless 1-click fast checkout.

---

## 🌟 Key Features

### 1. 🎨 Brand Identity & Styling
- **Logo & Branding:** Official ASPER GO emblem with custom Crimson Gradient accents (`#C8102E` to `#8B0000`).
- **Typography & Theme:** Dark Charcoal (`#1A1A1A`) header/footer, soft gray product surfaces (`#F8F9FA`), and high-converting offer badges inspired by DeliveryHobe and Othoba.
- **Tagline:** *ANYTHING, ANYTIME, ANYWHERE*

### 2. ⚡ 1-Click Fast Checkout (Optimized for Bangladesh)
- **Zero Friction:** Customers can order directly without compulsory prior account creation.
- **Delivery Zone Automation:** Inside Dhaka (৳60 / 24h) and Outside Dhaka (৳120 / 48h).
- **Payment Options:** 
  - 100% Cash on Delivery (COD)
  - bKash (বিকাশ) with dynamic TrxID verification field
  - Nagad (নগদ) manual mobile banking
  - Rocket & Card payments
- **Direct WhatsApp Support:** 1-click instant order receipt sharing to WhatsApp support agent.

### 3. 🔥 Live Social Proof Badges
- **Real-Time Viewing Counter:** (e.g. `🔥 350+ people viewing right now`) with real-time simulated fluctuations.
- **Verified Delivery Badge:** (e.g. `✅ 120+ units delivered`) showing genuine social proof.
- **Flash Deals Countdown:** Dynamic hours, minutes, and seconds countdown banner.

### 4. 🚚 Real-time Order Tracking
- Track parcel status instantly by **Order ID** (e.g., `AG-956314`) or **Mobile Number**.
- Interactive visual step timeline: `Order Placed` ➔ `Processing / Packing` ➔ `In Transit (Courier)` ➔ `Delivered`.

### 5. 🛠 No-Code Admin & Manager Dashboard (RBAC)
- **Role-Based Access Control:**
  - **Super Admin:** Full control over catalog, live orders, staff permissions, hero banners, site configuration, and delivery fees.
  - **Store Manager:** Add/edit/delete products, create categories/subcategories, update order fulfillment status (Pending -> Shipped -> Delivered) without access to core system settings.
- **Dynamic Category & Subcategory Builder:** Create new product categories and subcategories dynamically from the dashboard without touching code.
- **Direct Image Uploads:** Integrated file uploader (Multer) as well as external image URL support.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@aspergo.com` | `admin123` | Full control (Products, Orders, Roles, Settings) |
| **🛠 Store Manager** | `manager@aspergo.com` | `manager123` | Products, Categories, Order status |
| **🛍 Customer** | `customer@aspergo.com` | `customer123` | Storefront, Orders, Saved Address |

> 💡 *Tip: You can also use the 1-click Demo Switcher in the top notification bar or login modal to switch roles instantly.*

---

## 🚀 How to Run

### Development Mode (Concurrent Backend + Frontend Hot Reload):
```bash
npm run dev
```
- Frontend UI: `http://localhost:3000`
- Express API: `http://localhost:5000`

### Production Mode:
```bash
# 1. Build the frontend client
npm run build

# 2. Start the unified production server
npm start
```
- Open `http://localhost:5000` in your browser.

---

## 📁 Project Structure

```
d:/ASPERGO/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/         # Header, HeroSlider, FlashDeals, ProductCard, FastCheckout, OrderTracker...
│   │   ├── context/            # AuthContext (JWT & RBAC), CartContext (1-Click & Drawer)
│   │   ├── pages/              # AdminDashboard, CustomerAccount
│   │   ├── api.js              # Centralized API service
│   │   ├── index.css           # ASPER GO crimson gradient theme & animations
│   │   └── App.jsx             # Main router and view coordinator
│   └── dist/                   # Production-ready client build
├── server/                     # Express REST API & Database
│   ├── aspergo.db              # SQLite High-Performance Database (WAL mode)
│   ├── db.js                   # Relational DB Schema & Seeding (Users, Products, Orders, Categories)
│   └── server.js               # REST API Routes & Auth Middlewares
├── uploads/                    # Product media uploads
├── public/                     # Static assets (logo.png)
└── package.json                # Root scripts and dependencies
```
