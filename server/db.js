const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'aspergo.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('super_admin', 'manager', 'customer')) DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Subcategories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Create Sub-Subcategories (Child Categories) table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sub_subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subcategory_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
    );
  `);

  // Create Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id INTEGER NOT NULL,
      subcategory_id INTEGER,
      sub_subcategory_id INTEGER,
      price REAL NOT NULL,
      discount_price REAL,
      stock INTEGER DEFAULT 10,
      description TEXT,
      image TEXT NOT NULL,
      gallery TEXT,
      is_featured INTEGER DEFAULT 0,
      is_flash_deal INTEGER DEFAULT 0,
      flash_deal_end DATETIME,
      live_views_base INTEGER DEFAULT 45,
      units_delivered_base INTEGER DEFAULT 120,
      rating REAL DEFAULT 4.9,
      total_reviews INTEGER DEFAULT 38,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
      FOREIGN KEY (sub_subcategory_id) REFERENCES sub_subcategories(id) ON DELETE SET NULL
    );
  `);

  // Safely add sub_subcategory_id column if products table was created earlier without it
  try {
    db.exec(`ALTER TABLE products ADD COLUMN sub_subcategory_id INTEGER REFERENCES sub_subcategories(id) ON DELETE SET NULL;`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Safely add cost_price column to products
  try {
    db.exec(`ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0;`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Safely add video_url column to products
  try {
    db.exec(`ALTER TABLE products ADD COLUMN video_url TEXT;`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Create Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      district TEXT NOT NULL,
      notes TEXT,
      payment_method TEXT CHECK(payment_method IN ('cod', 'bkash', 'nagad', 'rocket')) DEFAULT 'cod',
      trx_id TEXT,
      subtotal REAL NOT NULL,
      delivery_fee REAL DEFAULT 60,
      total_amount REAL NOT NULL,
      status TEXT CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Create Order Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_title TEXT NOT NULL,
      product_image TEXT,
      cost_price REAL DEFAULT 0,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  // Safely add cost_price column to order_items if table existed
  try {
    db.exec(`ALTER TABLE order_items ADD COLUMN cost_price REAL DEFAULT 0;`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Create Banners table
  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      badge_text TEXT,
      button_text TEXT DEFAULT 'Shop Now',
      link TEXT DEFAULT '/products',
      image TEXT,
      background_gradient TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Site Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const superAdminPassword = bcrypt.hashSync('admin123', salt);
    const managerPassword = bcrypt.hashSync('manager123', salt);
    const customerPassword = bcrypt.hashSync('customer123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, phone, address, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('Super Admin', 'admin@aspergo.com', '+8801700000001', 'Dhaka, Bangladesh', superAdminPassword, 'super_admin');
    insertUser.run('Store Manager', 'manager@aspergo.com', '+8801700000002', 'Dhaka, Bangladesh', managerPassword, 'manager');
    insertUser.run('Kamrul Hasan', 'customer@aspergo.com', '+8801712345678', 'House 14, Road 5, Dhanmondi, Dhaka', customerPassword, 'customer');
  }

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, icon, description, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertSub = db.prepare(`
      INSERT INTO subcategories (category_id, name, slug, description)
      VALUES (?, ?, ?, ?)
    `);

    const cat1 = insertCat.run('Smart Electronics & Gadgets', 'electronics-gadgets', 'Smartphone', 'Premium wireless gadgets, earbuds, smartwatches & accessories', 1).lastInsertRowid;
    insertSub.run(cat1, 'Wireless Earbuds & Headphones', 'earbuds-headphones', 'TWS Earbuds and ANC headphones');
    insertSub.run(cat1, 'Smart Watches & Bands', 'smartwatches', 'Fitness trackers and calling watches');
    insertSub.run(cat1, 'Power Banks & Fast Chargers', 'chargers-powerbanks', 'Fast PD chargers and power banks');
    insertSub.run(cat1, 'Audio & Bluetooth Speakers', 'speakers', 'Portable bass speakers');

    const cat2 = insertCat.run('Fashion & Lifestyle', 'fashion-lifestyle', 'Shirt', 'Trendy men and women apparel and accessories', 2).lastInsertRowid;
    insertSub.run(cat2, "Men's Premium T-Shirts & Polos", 'mens-tshirts', '100% Organic Cotton');
    insertSub.run(cat2, "Women's Ethnic & Casual Wear", 'womens-fashion', 'Kurtis, Sarees & Tops');
    insertSub.run(cat2, 'Leather Bags & Wallets', 'bags-wallets', 'Genuine leather crafted essentials');

    const cat3 = insertCat.run('Home & Kitchen Essentials', 'home-kitchen', 'Home', 'Modern appliances and daily lifestyle utility products', 3).lastInsertRowid;
    insertSub.run(cat3, 'Kitchen Smart Appliances', 'kitchen-appliances', 'Blenders, air fryers & choppers');
    insertSub.run(cat3, 'Home Décor & Lighting', 'decor-lighting', 'LED smart ambient lights & clocks');
    insertSub.run(cat3, 'Cleaning & Organizers', 'cleaning-organizers', 'Smart storage & cleaning tools');

    const cat4 = insertCat.run('Groceries & Daily Express', 'groceries-express', 'ShoppingBag', 'Quick delivered pantry, snacks & beverages', 4).lastInsertRowid;
    insertSub.run(cat4, 'Organic Tea, Coffee & Honey', 'tea-coffee-honey', 'Pure natural organic picks');
    insertSub.run(cat4, 'Healthy Nuts & Dry Fruits', 'dry-fruits', 'Premium almonds, cashew & dates');

    const cat5 = insertCat.run('Beauty & Personal Care', 'beauty-personal-care', 'Sparkles', 'Authentic skincare, grooming & perfumes', 5).lastInsertRowid;
    insertSub.run(cat5, 'Skin & Face Care Essentials', 'skincare', 'Serums, moisturizers & sunscreens');
    insertSub.run(cat5, 'Men Grooming & Shaving Kits', 'men-grooming', 'Beard trimmers & hair styling');
  }

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (title, slug, category_id, subcategory_id, price, discount_price, stock, description, image, is_featured, is_flash_deal, live_views_base, units_delivered_base, rating, total_reviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      {
        title: 'ASPER GO Pro Sound ANC Wireless Earbuds',
        slug: 'asper-go-pro-sound-anc-earbuds',
        category_id: 1,
        subcategory_id: 1,
        price: 2450,
        discount_price: 1690,
        stock: 35,
        description: 'Experience studio quality audio with 35dB Active Noise Cancellation, ENC quad mic for crystal clear calls, and 40 hours total battery life with ultra-low latency gaming mode.',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 1,
        live_views_base: 342,
        units_delivered_base: 580,
        rating: 4.9,
        total_reviews: 142
      },
      {
        title: 'Ultra Fit AMOLED Bluetooth Calling Smartwatch',
        slug: 'ultra-fit-amoled-smartwatch',
        category_id: 1,
        subcategory_id: 2,
        price: 3800,
        discount_price: 2590,
        stock: 22,
        description: 'Vibrant 1.96-inch HD AMOLED Always-On Display, IP68 waterproof rating, SpO2 & Heart Rate 24/7 tracker with metallic zinc alloy casing and double straps included.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 1,
        live_views_base: 418,
        units_delivered_base: 740,
        rating: 4.8,
        total_reviews: 215
      },
      {
        title: '20,000mAh 65W PD Super Fast Power Bank',
        slug: '20000mah-65w-fast-power-bank',
        category_id: 1,
        subcategory_id: 3,
        price: 3200,
        discount_price: 2150,
        stock: 45,
        description: 'Charge your laptop, tablet and mobile at maximum 65W speed. Digital percentage LED display, aircraft grade fire-resistant aluminum shell and triple safety protection.',
        image: 'https://images.unsplash.com/photo-1609592426507-28d844e112d8?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 0,
        live_views_base: 189,
        units_delivered_base: 320,
        rating: 4.9,
        total_reviews: 87
      },
      {
        title: 'ASPER GO Signature 220 GSM Drop Shoulder Heavy Tee',
        slug: 'asper-go-signature-drop-shoulder-tee',
        category_id: 2,
        subcategory_id: 5,
        price: 950,
        discount_price: 650,
        stock: 60,
        description: 'Crafted with 100% comb compact cotton 220 GSM fabric with silicon wash for ultra softness and long-lasting color fastness. Unisex relaxed aesthetic fit.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 1,
        live_views_base: 295,
        units_delivered_base: 950,
        rating: 4.9,
        total_reviews: 310
      },
      {
        title: 'Genuine Full-Grain Leather Minimalist Bi-Fold Wallet',
        slug: 'genuine-leather-minimalist-wallet',
        category_id: 2,
        subcategory_id: 7,
        price: 1650,
        discount_price: 1190,
        stock: 28,
        description: 'Handcrafted top-grain cowhide leather with RFID blocking protection, 8 card slots, quick access cash compartment, and luxury gift box packaging.',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
        is_featured: 0,
        is_flash_deal: 0,
        live_views_base: 125,
        units_delivered_base: 280,
        rating: 4.7,
        total_reviews: 64
      },
      {
        title: 'Multi-Function High-Speed Electric Portable Blender',
        slug: 'multi-function-portable-blender',
        category_id: 3,
        subcategory_id: 8,
        price: 1850,
        discount_price: 1250,
        stock: 18,
        description: '6 stainless steel 3D blades running at 22,000 RPM. USB rechargeable 4000mAh battery makes fresh smoothies and juices anywhere in just 30 seconds.',
        image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 1,
        live_views_base: 260,
        units_delivered_base: 430,
        rating: 4.8,
        total_reviews: 95
      },
      {
        title: 'RGB Magnetic Ambient Smart Light Bar with Music Sync',
        slug: 'rgb-magnetic-ambient-smart-light-bar',
        category_id: 3,
        subcategory_id: 9,
        price: 1450,
        discount_price: 890,
        stock: 30,
        description: 'App and remote controlled 16 million colors with dynamic sound rhythm synchronization. Perfect for gaming desks, TV setups, and bedroom ambiance.',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 0,
        live_views_base: 175,
        units_delivered_base: 310,
        rating: 4.8,
        total_reviews: 78
      },
      {
        title: 'Sundarban Raw Natural Organic Wildflower Honey (500g)',
        slug: 'sundarban-raw-natural-honey-500g',
        category_id: 4,
        subcategory_id: 11,
        price: 850,
        discount_price: 680,
        stock: 50,
        description: '100% unpasteurized, unfiltered Sundarban forest honey packed with natural pollen, enzymes, and medicinal immunity-boosting antioxidants.',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 0,
        live_views_base: 140,
        units_delivered_base: 620,
        rating: 5.0,
        total_reviews: 180
      },
      {
        title: 'Premium Roasted Salted Cashew & California Almond Mix (400g)',
        slug: 'premium-roasted-cashew-almond-mix',
        category_id: 4,
        subcategory_id: 12,
        price: 1100,
        discount_price: 850,
        stock: 40,
        description: 'Crunchy Himalayan pink salt roasted jumbo cashews and California almonds. Nutrient dense energy snack in an airtight reusable zipper pouch.',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
        is_featured: 0,
        is_flash_deal: 1,
        live_views_base: 195,
        units_delivered_base: 510,
        rating: 4.9,
        total_reviews: 112
      },
      {
        title: 'Hydra-Boost 2% Hyaluronic Acid & Niacinamide Serum (30ml)',
        slug: 'hydra-boost-hyaluronic-serum',
        category_id: 5,
        subcategory_id: 13,
        price: 1350,
        discount_price: 950,
        stock: 25,
        description: 'Deeply penetrates skin layers to restore hydration, minimize enlarged pores, fade dark spots and deliver a radiant glass-skin glow.',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        is_featured: 1,
        is_flash_deal: 0,
        live_views_base: 220,
        units_delivered_base: 390,
        rating: 4.9,
        total_reviews: 98
      }
    ];

    for (const p of products) {
      insertProd.run(
        p.title,
        p.slug,
        p.category_id,
        p.subcategory_id,
        p.price,
        p.discount_price,
        p.stock,
        p.description,
        p.image,
        p.is_featured,
        p.is_flash_deal,
        p.live_views_base,
        p.units_delivered_base,
        p.rating,
        p.total_reviews
      );
    }
  }

  const bannerCount = db.prepare('SELECT COUNT(*) as count FROM banners').get().count;
  if (bannerCount === 0) {
    const insertBanner = db.prepare(`
      INSERT INTO banners (title, subtitle, badge_text, button_text, link, image, background_gradient, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBanner.run(
      'ANYTHING, ANYTIME, ANYWHERE',
      'Biggest Mega Flash Sale with Up to 60% OFF on Top Lifestyle & Gadgets',
      'EXCLUSIVE FLASH DEALS',
      'EXPLORE OFFERS',
      '/deals',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'linear-gradient(135deg, #1A1A1A 0%, #8B0000 60%, #C8102E 100%)',
      1
    );

    insertBanner.run(
      'Express Fast Delivery Across Bangladesh',
      'Get your daily gadgets & essentials delivered directly to your doorstep with 100% Cash on Delivery',
      'SUPER FAST SHIPPING',
      'ORDER NOW',
      '/products',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
      'linear-gradient(135deg, #8B0000 0%, #C8102E 50%, #1A1A1A 100%)',
      2
    );
  }

  // Insert settings
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('site_name', 'ASPER GO');
  insertSetting.run('tagline', 'ANYTHING, ANYTIME, ANYWHERE');
  insertSetting.run('helpline', '+880 1700-000000');
  insertSetting.run('email', 'support@aspergo.com');
  insertSetting.run('inside_dhaka_delivery', '60');
  insertSetting.run('outside_dhaka_delivery', '120');
  insertSetting.run('bkash_number', '01700000000 (Merchant/Personal)');
  insertSetting.run('nagad_number', '01700000000 (Personal)');
}

module.exports = {
  db,
  initDatabase
};
