const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'aspergo_super_secret_jwt_key_2026';

// Initialize Database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Configure Multer for File Uploads (Images and Videos up to 100MB)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.mimetype.startsWith('video/') ? 'video-' : 'media-';
    cb(null, prefix + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Role Check Middleware
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access. Insufficient privileges.' });
    }
    next();
  };
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, phone, address, password, role)
      VALUES (?, ?, ?, ?, ?, 'customer')
    `);
    const result = stmt.run(name, email, phone || '', address || '', hashedPassword);

    const user = {
      id: result.lastInsertRowid,
      name,
      email,
      phone: phone || '',
      address: address || '',
      role: 'customer'
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Registration successful', token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Current Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, address } = req.body;
    db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?')
      .run(name, phone, address, req.user.id);
    
    const updated = db.prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?').get(req.user.id);
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all users & role management
app.get('/api/admin/users', authenticateToken, requireRole(['super_admin']), (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, phone, address, role, created_at FROM users ORDER BY id DESC').all();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update User Role (Super Admin only)
app.put('/api/admin/users/:id/role', authenticateToken, requireRole(['super_admin']), (req, res) => {
  try {
    const { role } = req.body;
    if (!['super_admin', 'manager', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CATEGORIES & SUB-SUBCATEGORIES ROUTES ====================

// Get All Categories (with nested subcategories and sub_subcategories)
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC, id ASC').all();
    const subcategories = db.prepare('SELECT * FROM subcategories ORDER BY id ASC').all();
    const subSubcategories = db.prepare('SELECT * FROM sub_subcategories ORDER BY id ASC').all();

    const result = categories.map(cat => {
      const subs = subcategories.filter(sub => sub.category_id === cat.id).map(sub => ({
        ...sub,
        sub_subcategories: subSubcategories.filter(ssc => ssc.subcategory_id === sub.id)
      }));

      return {
        ...cat,
        subcategories: subs
      };
    });

    res.json({ categories: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Create Category
app.post('/api/categories', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { name, icon, description, display_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stmt = db.prepare(`
      INSERT INTO categories (name, slug, icon, description, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, slug, icon || 'ShoppingBag', description || '', display_order || 0);

    res.status(201).json({
      message: 'Category created successfully',
      category: { id: result.lastInsertRowid, name, slug, icon, description, display_order }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Update Category
app.put('/api/categories/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { name, icon, description, display_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    db.prepare(`
      UPDATE categories SET name = ?, slug = ?, icon = ?, description = ?, display_order = ?
      WHERE id = ?
    `).run(name, slug, icon, description, display_order || 0, req.params.id);

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Delete Category
app.delete('/api/categories/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Create Subcategory
app.post('/api/subcategories', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { category_id, name, icon, description } = req.body;
    if (!category_id || !name) return res.status(400).json({ error: 'Category ID and Name are required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stmt = db.prepare(`
      INSERT INTO subcategories (category_id, name, slug, icon, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(category_id, name, slug, icon || '', description || '');

    res.status(201).json({
      message: 'Subcategory created successfully',
      subcategory: { id: result.lastInsertRowid, category_id, name, slug, icon, description }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Delete Subcategory
app.delete('/api/subcategories/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Create Sub-Subcategory (Child Category)
app.post('/api/sub-subcategories', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { subcategory_id, name, icon, description } = req.body;
    if (!subcategory_id || !name) return res.status(400).json({ error: 'Subcategory ID and Name are required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stmt = db.prepare(`
      INSERT INTO sub_subcategories (subcategory_id, name, slug, icon, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(subcategory_id, name, slug, icon || '', description || '');

    res.status(201).json({
      message: 'Sub-Subcategory created successfully',
      sub_subcategory: { id: result.lastInsertRowid, subcategory_id, name, slug, icon, description }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Delete Sub-Subcategory
app.delete('/api/sub-subcategories/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    db.prepare('DELETE FROM sub_subcategories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Sub-Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUCTS ROUTES ====================

// Get All Products (with filters)
app.get('/api/products', (req, res) => {
  try {
    const { category, subcategory, sub_subcategory, search, featured, flash_deal, sort, min_price, max_price, limit = 50, page = 1 } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             sc.name as subcategory_name, sc.slug as subcategory_slug,
             ssc.name as sub_subcategory_name, ssc.slug as sub_subcategory_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN sub_subcategories ssc ON p.sub_subcategory_id = ssc.id
      WHERE p.status = 'active'
    `;
    const params = [];

    if (category) {
      query += ' AND (c.slug = ? OR p.category_id = ? OR sc.slug = ? OR ssc.slug = ?)';
      params.push(category, category, category, category);
    }

    if (subcategory) {
      query += ' AND (sc.slug = ? OR p.subcategory_id = ?)';
      params.push(subcategory, subcategory);
    }

    if (sub_subcategory) {
      query += ' AND (ssc.slug = ? OR p.sub_subcategory_id = ?)';
      params.push(sub_subcategory, sub_subcategory);
    }

    if (search && search.trim()) {
      const rawSearch = search.trim();
      const terms = rawSearch.split(/\s+/).filter(Boolean);
      for (const term of terms) {
        query += ` AND (
          p.title LIKE ? OR 
          p.description LIKE ? OR 
          c.name LIKE ? OR 
          c.slug LIKE ? OR 
          sc.name LIKE ? OR 
          sc.slug LIKE ? OR 
          ssc.name LIKE ? OR 
          ssc.slug LIKE ?
        )`;
        const likeTerm = `%${term}%`;
        params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
      }
    }

    if (featured === '1' || featured === 'true') {
      query += ' AND p.is_featured = 1';
    }

    if (flash_deal === '1' || flash_deal === 'true') {
      query += ' AND p.is_flash_deal = 1';
    }

    if (min_price) {
      query += ' AND (COALESCE(p.discount_price, p.price) >= ?)';
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ' AND (COALESCE(p.discount_price, p.price) <= ?)';
      params.push(Number(max_price));
    }

    // Sorting
    if (sort === 'price_asc') {
      query += ' ORDER BY COALESCE(p.discount_price, p.price) ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY COALESCE(p.discount_price, p.price) DESC';
    } else if (sort === 'popular') {
      query += ' ORDER BY p.units_delivered_base DESC';
    } else {
      query += ' ORDER BY p.id DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const products = db.prepare(query).all(...params);
    res.json({ products, total: products.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Product by ID or Slug
app.get('/api/products/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    let product;
    const baseQuery = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug, c.icon as category_icon,
             sc.name as subcategory_name, sc.slug as subcategory_slug, sc.icon as subcategory_icon,
             ssc.name as sub_subcategory_name, ssc.slug as sub_subcategory_slug, ssc.icon as sub_subcategory_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN sub_subcategories ssc ON p.sub_subcategory_id = ssc.id
    `;

    if (isNaN(identifier)) {
      product = db.prepare(`${baseQuery} WHERE p.slug = ?`).get(identifier);
    } else {
      product = db.prepare(`${baseQuery} WHERE p.id = ?`).get(Number(identifier));
    }

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Create Product
app.post('/api/products', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const {
      title,
      category_id,
      subcategory_id,
      sub_subcategory_id,
      cost_price,
      price,
      discount_price,
      stock,
      description,
      image,
      gallery,
      video_url,
      is_featured,
      is_flash_deal,
      live_views_base,
      units_delivered_base
    } = req.body;

    if (!title || !category_id || !price || !image) {
      return res.status(400).json({ error: 'Title, category, price and image are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const stmt = db.prepare(`
      INSERT INTO products (
        title, slug, category_id, subcategory_id, sub_subcategory_id, cost_price, price, discount_price, stock,
        description, image, gallery, video_url, is_featured, is_flash_deal, live_views_base, units_delivered_base
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      slug,
      category_id,
      subcategory_id || null,
      sub_subcategory_id || null,
      cost_price !== undefined ? Number(cost_price) : 0,
      Number(price),
      discount_price ? Number(discount_price) : null,
      stock !== undefined ? Number(stock) : 10,
      description || '',
      image,
      gallery ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : null,
      video_url || null,
      is_featured ? 1 : 0,
      is_flash_deal ? 1 : 0,
      live_views_base ? Number(live_views_base) : Math.floor(Math.random() * 150 + 50),
      units_delivered_base ? Number(units_delivered_base) : Math.floor(Math.random() * 200 + 40)
    );

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.lastInsertRowid,
      slug
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Update Product
app.put('/api/products/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const {
      title,
      category_id,
      subcategory_id,
      sub_subcategory_id,
      cost_price,
      price,
      discount_price,
      stock,
      description,
      image,
      gallery,
      video_url,
      is_featured,
      is_flash_deal,
      status
    } = req.body;

    db.prepare(`
      UPDATE products SET
        title = COALESCE(?, title),
        category_id = COALESCE(?, category_id),
        subcategory_id = ?,
        sub_subcategory_id = ?,
        cost_price = COALESCE(?, cost_price),
        price = COALESCE(?, price),
        discount_price = ?,
        stock = COALESCE(?, stock),
        description = COALESCE(?, description),
        image = COALESCE(?, image),
        gallery = COALESCE(?, gallery),
        video_url = ?,
        is_featured = COALESCE(?, is_featured),
        is_flash_deal = COALESCE(?, is_flash_deal),
        status = COALESCE(?, status)
      WHERE id = ?
    `).run(
      title,
      category_id,
      subcategory_id || null,
      sub_subcategory_id || null,
      cost_price !== undefined ? Number(cost_price) : null,
      price !== undefined ? Number(price) : null,
      discount_price !== undefined ? (discount_price ? Number(discount_price) : null) : null,
      stock !== undefined ? Number(stock) : null,
      description,
      image,
      gallery !== undefined ? (gallery ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : null) : null,
      video_url !== undefined ? video_url : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_flash_deal !== undefined ? (is_flash_deal ? 1 : 0) : null,
      status,
      req.params.id
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Delete Product
app.delete('/api/products/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MEDIA / IMAGE & VIDEO UPLOAD ====================
// Single Upload (handles image or video with field 'file', 'image', 'video', etc.)
app.post('/api/upload', authenticateToken, requireRole(['super_admin', 'manager']), upload.any(), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const file = req.files[0];
    const fileUrl = `/uploads/${file.filename}`;
    const isVideo = file.mimetype.startsWith('video/');
    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      imageUrl: fileUrl,
      videoUrl: isVideo ? fileUrl : null,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multiple Files Upload (for Product Gallery Images)
app.post('/api/upload-multiple', authenticateToken, requireRole(['super_admin', 'manager']), upload.array('files', 15), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const uploadedFiles = req.files.map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype
    }));
    res.json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles,
      urls: uploadedFiles.map(f => f.url)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORDERS & CHECKOUT ROUTES ====================

// Create Order (1-Click / Standard Checkout)
app.post('/api/orders', (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      delivery_address,
      district,
      notes,
      payment_method = 'cod',
      trx_id,
      items,
      delivery_fee = 60,
      user_id
    } = req.body;

    if (!customer_name || !customer_phone || !delivery_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'Name, phone, delivery address and cart items are required' });
    }

    const order_number = 'AG-' + Math.floor(100000 + Math.random() * 900000);
    
    // Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.unit_price) * Number(item.quantity);
    }
    const total_amount = subtotal + Number(delivery_fee);

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, delivery_address, district,
        notes, payment_method, trx_id, subtotal, delivery_fee, total_amount, status, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `);

    const orderResult = insertOrder.run(
      order_number,
      customer_name,
      customer_phone,
      delivery_address,
      district || 'Dhaka',
      notes || '',
      payment_method,
      trx_id || '',
      subtotal,
      Number(delivery_fee),
      total_amount,
      user_id || null
    );

    const orderId = orderResult.lastInsertRowid;

    // Insert order items & reduce stock
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_title, product_image, cost_price, unit_price, quantity, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare(`
      UPDATE products SET stock = MAX(0, stock - ?), units_delivered_base = units_delivered_base + ? WHERE id = ?
    `);

    const getProductCost = db.prepare('SELECT cost_price FROM products WHERE id = ?');

    for (const item of items) {
      let costPrice = item.cost_price || 0;
      if (!costPrice && item.product_id) {
        const prod = getProductCost.get(item.product_id);
        costPrice = prod?.cost_price || 0;
      }

      insertItem.run(
        orderId,
        item.product_id || null,
        item.title || item.product_title,
        item.image || item.product_image || '',
        Number(costPrice),
        Number(item.unit_price),
        Number(item.quantity),
        Number(item.unit_price) * Number(item.quantity)
      );

      if (item.product_id) {
        updateStock.run(Number(item.quantity), Number(item.quantity), item.product_id);
      }
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      order_number,
      order_id: orderId,
      total_amount
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track Order (Public by order_number or phone)
app.get('/api/orders/track/:query', (req, res) => {
  try {
    const { query } = req.params;
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE order_number = ? OR customer_phone = ? 
      ORDER BY id DESC
    `).all(query, query);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No order found with this Order ID or Phone number' });
    }

    const orderIds = orders.map(o => o.id);
    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})
    `).all(...orderIds);

    const result = orders.map(o => ({
      ...o,
      items: items.filter(item => item.order_id === o.id)
    }));

    res.json({ orders: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer: Get my orders
app.get('/api/orders/my-orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
    const orderIds = orders.map(o => o.id);

    let items = [];
    if (orderIds.length > 0) {
      items = db.prepare(`
        SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})
      `).all(...orderIds);
    }

    const result = orders.map(o => ({
      ...o,
      items: items.filter(item => item.order_id === o.id)
    }));

    res.json({ orders: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Get all orders
app.get('/api/admin/orders', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { status, search, limit = 100 } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const orders = db.prepare(query).all(...params);
    const orderIds = orders.map(o => o.id);

    let items = [];
    if (orderIds.length > 0) {
      items = db.prepare(`
        SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})
      `).all(...orderIds);
    }

    const result = orders.map(o => ({
      ...o,
      items: items.filter(item => item.order_id === o.id)
    }));

    res.json({ orders: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Update Order Status
app.put('/api/admin/orders/:id/status', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BANNERS ROUTES ====================
app.get('/api/banners', (req, res) => {
  try {
    const banners = db.prepare('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC').all();
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/banners', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { title, subtitle, badge_text, button_text, link, image, background_gradient, display_order } = req.body;
    const stmt = db.prepare(`
      INSERT INTO banners (title, subtitle, badge_text, button_text, link, image, background_gradient, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, subtitle, badge_text, button_text || 'Shop Now', link || '/products', image, background_gradient, display_order || 0);
    res.status(201).json({ message: 'Banner added successfully', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/banners/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { title, subtitle, badge_text, button_text, link, image, background_gradient, display_order, is_active } = req.body;
    db.prepare(`
      UPDATE banners SET
        title = COALESCE(?, title),
        subtitle = COALESCE(?, subtitle),
        badge_text = COALESCE(?, badge_text),
        button_text = COALESCE(?, button_text),
        link = COALESCE(?, link),
        image = COALESCE(?, image),
        background_gradient = COALESCE(?, background_gradient),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      title,
      subtitle,
      badge_text,
      button_text,
      link,
      image,
      background_gradient,
      display_order !== undefined ? Number(display_order) : null,
      is_active !== undefined ? Number(is_active) : null,
      req.params.id
    );
    res.json({ message: 'Banner updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/banners/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD & STATS ====================
app.get('/api/admin/stats', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count;
    const deliveredOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'").get().count;
    
    const revenueRow = db.prepare("SELECT SUM(subtotal) as total_subtotal, SUM(total_amount) as total FROM orders WHERE status != 'cancelled'").get();
    const totalRevenue = revenueRow.total || 0;
    const totalSubtotal = revenueRow.total_subtotal || totalRevenue;

    const costRow = db.prepare(`
      SELECT SUM(COALESCE(oi.cost_price, 0) * oi.quantity) as total_cost 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
    `).get();
    const totalCost = costRow.total_cost || 0;
    const totalProfit = Math.max(0, totalSubtotal - totalCost);
    const profitMargin = totalSubtotal > 0 ? Number(((totalProfit / totalSubtotal) * 100).toFixed(1)) : 0;

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const lowStockProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock <= 5').get().count;
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;

    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();
    const lowStockItems = db.prepare('SELECT id, title, stock, cost_price, price, discount_price, image FROM products WHERE stock <= 10 ORDER BY stock ASC LIMIT 6').all();

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        totalProducts,
        lowStockProducts,
        totalCustomers
      },
      recentOrders,
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SETTINGS ROUTES ====================
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', authenticateToken, requireRole(['super_admin']), (req, res) => {
  try {
    const { settings } = req.body;
    const updateStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(settings)) {
      updateStmt.run(key, String(value));
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DELIVERY ZONES ROUTES ====================
// Get delivery zones (if ?all=1 returns all, else returns only active ones)
app.get('/api/delivery-zones', (req, res) => {
  try {
    const showAll = req.query.all === '1' || req.query.all === 'true';
    const query = showAll
      ? 'SELECT * FROM delivery_zones ORDER BY display_order ASC, id ASC'
      : 'SELECT * FROM delivery_zones WHERE is_active = 1 ORDER BY display_order ASC, id ASC';
    const zones = db.prepare(query).all();
    res.json({ zones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new delivery zone
app.post('/api/delivery-zones', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { name, charge, estimated_time, is_active } = req.body;
    if (!name || charge === undefined) {
      return res.status(400).json({ error: 'Zone name and delivery charge are required' });
    }

    const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM delivery_zones').get().m || 0;
    const insertStmt = db.prepare(`
      INSERT INTO delivery_zones (name, charge, estimated_time, is_active, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      name.trim(),
      Number(charge) || 0,
      estimated_time || '24-48 Hours',
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      maxOrder + 1
    );

    res.status(201).json({
      message: 'Delivery zone created successfully',
      id: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update delivery zone
app.put('/api/delivery-zones/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { id } = req.params;
    const { name, charge, estimated_time, is_active, display_order } = req.body;

    const updateStmt = db.prepare(`
      UPDATE delivery_zones SET
        name = COALESCE(?, name),
        charge = COALESCE(?, charge),
        estimated_time = COALESCE(?, estimated_time),
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order)
      WHERE id = ?
    `);

    updateStmt.run(
      name ? name.trim() : null,
      charge !== undefined ? Number(charge) : null,
      estimated_time !== undefined ? estimated_time : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      display_order !== undefined ? Number(display_order) : null,
      id
    );

    res.json({ message: 'Delivery zone updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle delivery zone On/Off
app.patch('/api/delivery-zones/:id/toggle', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { id } = req.params;
    const zone = db.prepare('SELECT is_active FROM delivery_zones WHERE id = ?').get(id);
    if (!zone) {
      return res.status(404).json({ error: 'Delivery zone not found' });
    }

    const newStatus = zone.is_active === 1 ? 0 : 1;
    db.prepare('UPDATE delivery_zones SET is_active = ? WHERE id = ?').run(newStatus, id);
    res.json({ 
      message: `Delivery zone ${newStatus === 1 ? 'activated (চালু)' : 'deactivated (বন্ধ)'}`, 
      is_active: newStatus 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete delivery zone
app.delete('/api/delivery-zones/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM delivery_zones WHERE id = ?').run(id);
    res.json({ message: 'Delivery zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LANDING PAGES ROUTES ====================
// Get all landing pages
app.get('/api/landing-pages', (req, res) => {
  try {
    const pages = db.prepare(`
      SELECT lp.*, p.title as product_title, p.price, p.discount_price, p.stock, p.image as product_image
      FROM landing_pages lp
      LEFT JOIN products p ON lp.product_id = p.id
      ORDER BY lp.id DESC
    `).all();
    res.json({ pages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single landing page by slug or id
app.get('/api/landing-pages/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const page = db.prepare(`
      SELECT lp.*, p.title as product_title, p.price, p.discount_price, p.stock, 
             p.image as product_image, p.gallery as product_gallery, p.video_url as product_video_url,
             p.cost_price, p.description as product_description
      FROM landing_pages lp
      LEFT JOIN products p ON lp.product_id = p.id
      WHERE lp.slug = ? OR lp.id = ?
    `).get(slugOrId, slugOrId);

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    res.json({ page });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create landing page
app.post('/api/landing-pages', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const {
      product_id, title, slug, headline, subheadline, video_url,
      banner_image, features, reviews, urgent_timer_minutes,
      discount_badge, theme_color, status
    } = req.body;

    if (!title || !slug || !headline) {
      return res.status(400).json({ error: 'Title, slug, and headline are required' });
    }

    // Check slug uniqueness
    const existing = db.prepare('SELECT id FROM landing_pages WHERE slug = ?').get(slug);
    if (existing) {
      return res.status(400).json({ error: 'A landing page with this URL slug already exists' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO landing_pages (
        product_id, title, slug, headline, subheadline, video_url,
        banner_image, features, reviews, urgent_timer_minutes,
        discount_badge, theme_color, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      product_id || null,
      title,
      slug,
      headline,
      subheadline || '',
      video_url || null,
      banner_image || null,
      typeof features === 'object' ? JSON.stringify(features) : (features || '[]'),
      typeof reviews === 'object' ? JSON.stringify(reviews) : (reviews || '[]'),
      urgent_timer_minutes || 30,
      discount_badge || '',
      theme_color || '#C8102E',
      status || 'active'
    );

    res.status(201).json({
      message: 'Landing page created successfully',
      landingPageId: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update landing page
app.put('/api/landing-pages/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_id, title, slug, headline, subheadline, video_url,
      banner_image, features, reviews, urgent_timer_minutes,
      discount_badge, theme_color, status
    } = req.body;

    // Check slug uniqueness excluding this record
    if (slug) {
      const existing = db.prepare('SELECT id FROM landing_pages WHERE slug = ? AND id != ?').get(slug, id);
      if (existing) {
        return res.status(400).json({ error: 'Slug is already used by another landing page' });
      }
    }

    const updateStmt = db.prepare(`
      UPDATE landing_pages SET
        product_id = COALESCE(?, product_id),
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        headline = COALESCE(?, headline),
        subheadline = COALESCE(?, subheadline),
        video_url = ?,
        banner_image = ?,
        features = ?,
        reviews = ?,
        urgent_timer_minutes = COALESCE(?, urgent_timer_minutes),
        discount_badge = ?,
        theme_color = COALESCE(?, theme_color),
        status = COALESCE(?, status)
      WHERE id = ?
    `);

    updateStmt.run(
      product_id !== undefined ? product_id : null,
      title,
      slug,
      headline,
      subheadline,
      video_url !== undefined ? video_url : null,
      banner_image !== undefined ? banner_image : null,
      typeof features === 'object' ? JSON.stringify(features) : (features || '[]'),
      typeof reviews === 'object' ? JSON.stringify(reviews) : (reviews || '[]'),
      urgent_timer_minutes,
      discount_badge !== undefined ? discount_badge : '',
      theme_color,
      status,
      id
    );

    res.json({ message: 'Landing page updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete landing page
app.delete('/api/landing-pages/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM landing_pages WHERE id = ?').run(id);
    res.json({ message: 'Landing page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment landing page view count
app.post('/api/landing-pages/:id/view', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE landing_pages SET views = views + 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== AI AGENT ROUTES ====================
// Expert Built-in E-Commerce AI Engine
function generateExpertAIResponse(mode, prompt, context = {}) {
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const productName = context.productName || 'স্মার্ট গ্যাজেট / প্রিমিয়াম প্রোডাক্ট';
  const price = context.price || 1500;
  const costPrice = context.costPrice || 850;

  if (mode === 'marketing') {
    return {
      provider: 'aspergo_marketing_ai',
      title: `${productName} — সিজনাল মার্কেটিং ও স্কেলিং স্ট্র্যাটেজি (${currentMonth} ২০২৬)`,
      summary: `বর্তমান বাজার ও উৎসবের ট্রেন্ড অনুযায়ী কনভার্সন বৃদ্ধির জন্য একটি হাই-কনভার্টিং সেলস ফানেল তৈরি করা হয়েছে।`,
      sections: [
        {
          heading: '🎯 টার্গেট অডিয়েন্স (Target Audience)',
          points: [
            'বয়স: ১৮ থেকে ৩৬ বছর (পুরুষ ও মহিলা)',
            'লোকেশন: ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী ও খুলনা মেট্রো এলাকা',
            'আগ্রহ (Interests): অনলাইন শপিং, টেক গ্যাজেট, ট্রেন্ডিং ফ্যাশন, Daraz/AliExpress/Facebook শপার্স',
            'ডিভাইস: অ্যান্ড্রয়েড ও আইফোন ইউজার্স (সরাসরি ১-ক্লিক মোবাইল চেকআউট টার্গেটিং)'
          ]
        },
        {
          heading: '💰 বাজেট ও ক্যাম্পেইন ফানেল (Ad Budget & Funnel Strategy)',
          points: [
            'Top of Funnel (TOF - Cold Traffic): বাজেটের ৬০% — রিলস/টিকটক ভিডিও ও সমস্যা সমাধানের অ্যাড',
            'Middle of Funnel (MOF - Consideration): বাজেটের ২৫% — আনবক্সিং, কাস্টমার রিভিউ ও সোশ্যাল প্রুফ',
            'Bottom of Funnel (BOF - Retargeting): বাজেটের ১৫% — "সীমিত স্টক / ফ্রি ডেলিভারি" অফার দিয়ে কার্ট রি-টার্গেটিং',
            'দৈনিক প্রস্তাবিত টেস্ট বাজেট: $১০ - $২৫ (১,২০০ - ৩,০০০ টাকা)'
          ]
        },
        {
          heading: '🚀 অফার ও কনভার্সন বুস্টার (Irresistible Offer Strategy)',
          points: [
            'কম্বো ডিল: "২টি কিনলে ডেলিভারি একদম ফ্রি + আকর্ষণীয় গিফট"',
            'ক্যাশ অন ডেলিভারি নিশ্চয়তা: "হাতে পেয়ে পণ্য চেক করে তারপর টাকা পরিশোধ"',
            'আর্জেন্ট টাইমার: ল্যান্ডিং পেজে ৩০ মিনিটের কাউন্টডাউন টাইমার দিয়ে ফোমো (FOMO) তৈরি'
          ]
        }
      ]
    };
  }

  if (mode === 'research') {
    const profit = Math.max(0, price - costPrice);
    const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0;
    const estRtoLoss = Math.round(price * 0.08);
    const netProfit = Math.max(0, profit - estRtoLoss);

    return {
      provider: 'aspergo_research_ai',
      title: `${productName} — প্রোডাক্ট রিসার্চ ও প্রফিট মার্জিন বিশ্লেষণ`,
      score: '৯.৪ / ১০ (High Demand Potential)',
      metrics: {
        retailPrice: `৳${price}`,
        costPrice: `৳${costPrice}`,
        grossProfit: `৳${profit} (${margin}%)`,
        estNetProfitPerOrder: `৳${netProfit}`,
        marketCompetition: 'মাঝারি (Medium) — ক্রিয়েটিভ ভিডিও দিয়ে সহজেই ডমিনেট করা সম্ভব'
      },
      insights: [
        '💡 ইউনিক সেলিং পয়েন্ট (USP): দৈনন্দিন সমস্যার সহজ সমাধান এবং প্রিমিয়াম লুক ও ফিনিশ।',
        '📊 সিজনাল ডিমান্ড: বর্তমানে এই ধরণের পণ্যের চাহিদা সোশ্যাল মিডিয়ায় দ্রুত বৃদ্ধি পাচ্ছে।',
        '📦 রিটার্ন রেশিও কন্ট্রোল (RTO Defense): অর্ডার প্লেস করার পর দ্রুত ফোন কল কনফার্মেশন ও ট্র্যাকিং এসএমএস পাঠালে ডেলিভারি সাকসেস রেট ৯০%+ নিশ্চিত করা সম্ভব।',
        '🎯 প্রাইসিং টিপ: "৳' + price + '" দামটি সাইকোলজিক্যালি আকর্ষণীয়। এর সাথে ফ্রি ডেলিভারি যুক্ত করলে কনভার্সন ২০% বৃদ্ধি পাবে।'
      ]
    };
  }

  if (mode === 'ad_creator') {
    return {
      provider: 'aspergo_ad_ai',
      title: `${productName} — ফেসবুক ও টিকটক হাই-কনভার্টিং অ্যাড কপি`,
      hooks: [
        '🔥 হুক ১ (প্রশ্ন ও কৌতূহল): "আপনিও কি খুঁজছেন এমন একটি প্রডাক্ট যা আপনার কাজকে করবে দ্বিগুণ সহজ?"',
        '⚠️ হুক ২ (সমস্যা ও সমাধান): "বাজারের কমদামী নকল প্রডাক্ট কিনে প্রতারিত হচ্ছেন? এবার বেছে নিন ১০০% প্রিমিয়াম অরিজিনাল কোয়ালিটি!"',
        '⚡ হুক ৩ (সীমিত অফার): "৫০% মেগা ডিসকাউন্ট অফার! হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা সহ সারা বাংলাদেশে হোম ডেলিভারি!"'
      ],
      primaryText: `🔥 আকর্ষণীয় মেগা ডিসকাউন্ট অফারে পেয়ে যাচ্ছেন প্রিমিয়াম ${productName}!

✅ ১০০% অরিজিনাল ও টেকসই প্রিমিয়াম কোয়ালিটি
✅ ডেলিভারি ম্যানের সামনে চেক করে মূল্য পরিশোধের ১০০% গ্যারান্টি (Cash on Delivery)
✅ সারা বাংলাদেশে মাত্র ২৪-৪৮ ঘণ্টায় ফাস্ট ডেলিভারি
✅ ৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি

🎁 বিশেষ অফার: আজই অর্ডার করলে পাচ্ছেন বিশেষ ক্যাশব্যাক / ফ্রি হোম ডেলিভারি অফার!

👉 দ্রুত অর্ডার করতে নিচের লিংকে ক্লিক করুন অথবা আমাদের ইনবক্স করুন:
🛒 অর্ডার লিংক: https://aspergo.onrender.com

📞 যেকোনো তথ্যের জন্য সরাসরি কল করুন: +8801700-000000`,
      videoScript: [
        { time: '0-3 sec (Hook)', action: 'পণ্যটির সেরা ফিচার বা প্রধান সমস্যার সমাধান চোখের পলকে দেখানো' },
        { time: '3-10 sec (Pain & Agony)', action: 'সাধারণ পণ্যের ঝামেলা বনাম আমাদের প্রিমিয়াম পণ্যের পার্থক্য' },
        { time: '10-20 sec (Live Demo)', action: 'প্রোডাক্টটি বাস্তবে কীভাবে কাজ করে তা দ্রুত ক্লিপে দেখানো' },
        { time: '20-30 sec (Offer & CTA)', action: 'ক্যাশ অন ডেলিভারি লোগো সহ "Order Now" বাটনে ক্লিক করার আহ্বান' }
      ],
      hashtags: `#AsperGo #${productName.replace(/\\s+/g, '')} #OnlineShoppingBD #GadgetsBD #CashOnDelivery #BestDealsBD`
    };
  }

  // mode === 'customer_support'
  return {
    provider: 'aspergo_support_ai',
    reply: `হ্যালো! ASPER GO তে আপনাকে স্বাগতম। 😊 
আমাদের ডেলিভারি চার্জ: ঢাকা সিটির ভেতরে ৳৬০ এবং ঢাকার বাইরে ৳১২০। সারা বাংলাদেশে মাত্র ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ১০০% ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি দেওয়া হয়। 

পণ্য হাতে পেয়ে চেক করে তারপর মূল্য পরিশোধ করতে পারবেন। আপনার অর্ডারের বর্তমান অবস্থা জানতে আমাদের "Track Order" অপশন ব্যবহার করতে পারেন অথবা যেকোনো প্রয়োজনে আমাদের হেল্পলাইনে কল করুন: +880 1700-000000। আমি কি আপনাকে কোনো পছন্দের পণ্য খুঁজে পেতে সাহায্য করতে পারি?`
  };
}

app.post('/api/ai/agent', async (req, res) => {
  try {
    const { mode, prompt, context } = req.body;
    if (!mode) {
      return res.status(400).json({ error: 'AI Agent mode is required (marketing, research, ad_creator, customer_support)' });
    }

    // Check if external Gemini key exists in settings
    const keyRow = db.prepare("SELECT value FROM settings WHERE key = 'ai_gemini_api_key'").get();
    const apiKey = (keyRow && keyRow.value) || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are ASPER GO's Autonomous AI E-Commerce CMO, Product Researcher, and Customer Support Agent for Bangladesh.
Mode: ${mode}.
User Question / Input: ${prompt || 'Generate best marketing & sales strategy'}
Context: ${JSON.stringify(context || {})}
Please answer in clear, motivating, and persuasive Bengali (বাংলা) with bullet points and practical e-commerce steps.`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return res.json({
              success: true,
              mode,
              result: {
                provider: 'Google Gemini 1.5 Pro/Flash',
                title: `${mode.toUpperCase()} - AI Generated Analysis`,
                reply: text,
                raw: text
              }
            });
          }
        }
      } catch (err) {
        console.warn('Gemini live call error, using expert engine:', err.message);
      }
    }

    // Expert internal AI fallback
    const result = generateExpertAIResponse(mode, prompt, context || {});
    res.json({
      success: true,
      mode,
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/public')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ASPER GO Server running on http://0.0.0.0:${PORT}`);
});
