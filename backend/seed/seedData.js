const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsphere';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for Seeding...');

    // Puraana data clean karna
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🧹 Old data wiped successfully.');

    // 1. Users create karna
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    const admin = await User.create({
      name: 'Admin Boss',
      email: 'admin@shopsphere.com',
      password: adminPassword,
      role: 'admin'
    });

    const customer = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@shopsphere.com',
      password: customerPassword,
      role: 'customer'
    });

    console.log('👤 Users seeded: admin@shopsphere.com & customer@shopsphere.com');

    // 2. Categories create karna
    const categories = await Category.insertMany([
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and accessories' },
      { name: 'Fashion & Apparel', slug: 'fashion-apparel', description: 'Trendy clothing and style' },
      { name: 'Home & Living', slug: 'home-living', description: 'Decor, kitchen, and furniture' },
      { name: 'Fitness & Sports', slug: 'fitness-sports', description: 'Workout gear and athletic accessories' },
      { name: 'Books & Stationery', slug: 'books-stationery', description: 'Novels, guides, notebooks, and pens' }
    ]);

    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    console.log('📦 5 Categories seeded.');

    // 3. Coupons create karna
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000,
        maxDiscount: 500,
        expiryDate: nextYear,
        usageLimit: 200,
        isActive: true
      },
      {
        code: 'FLAT200',
        discountType: 'flat',
        discountValue: 200,
        minOrderAmount: 1500,
        expiryDate: nextYear,
        usageLimit: 100,
        isActive: true
      }
    ]);
    console.log('🎟️ 2 Demo Coupons seeded: WELCOME10 & FLAT200');

    // 4. Realistic 20 Products create karna
    const productsData = [
      // Electronics
      {
        name: 'Pro Noise Cancelling Wireless Headphones',
        sku: 'ELEC-HEAD-001',
        description: 'Immersive sound with 40-hour battery life and fast charging.',
        category: catMap['Electronics'],
        price: 4999,
        discountPrice: 3999,
        stock: 35,
        reorderThreshold: 10,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
        rating: 4.8,
        numReviews: 24
      },
      {
        name: 'Smart AMOLED Fitness Tracker Watch',
        sku: 'ELEC-WAT-002',
        description: 'Heart rate monitoring, SPO2, 100+ sports modes, waterproof.',
        category: catMap['Electronics'],
        price: 2999,
        discountPrice: 2499,
        stock: 22,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
        rating: 4.5,
        numReviews: 18
      },
      {
        name: 'Ultra-Slim Ergonomic Mechanical Keyboard',
        sku: 'ELEC-KEY-003',
        description: 'RGB backlit mechanical switches with dual Bluetooth and 2.4GHz.',
        category: catMap['Electronics'],
        price: 3499,
        discountPrice: 2999,
        stock: 15,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
        rating: 4.6,
        numReviews: 12
      },
      {
        name: 'High-Speed 65W GaN Fast Charger',
        sku: 'ELEC-CHG-004',
        description: 'Compact 3-port charger compatible with laptops, phones, and tablets.',
        category: catMap['Electronics'],
        price: 1499,
        discountPrice: 1199,
        stock: 3,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'],
        rating: 4.4,
        numReviews: 9
      },
      // Fashion
      {
        name: 'Classic Vintage Denim Jacket',
        sku: 'FASH-JKT-001',
        description: 'Premium durable denim jacket with brass buttons and relaxed fit.',
        category: catMap['Fashion & Apparel'],
        price: 2499,
        discountPrice: 1999,
        stock: 20,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80'],
        rating: 4.7,
        numReviews: 15
      },
      {
        name: 'Minimalist Cotton Crewneck Sweatshirt',
        sku: 'FASH-SWT-002',
        description: '100% organic breathable cotton sweatshirt for daily comfort.',
        category: catMap['Fashion & Apparel'],
        price: 1299,
        discountPrice: 999,
        stock: 40,
        reorderThreshold: 10,
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'],
        rating: 4.3,
        numReviews: 8
      },
      {
        name: 'Polarized Retro Sunglasses',
        sku: 'FASH-SUN-003',
        description: 'UV400 protection with ultra-lightweight alloy metal frame.',
        category: catMap['Fashion & Apparel'],
        price: 899,
        discountPrice: 699,
        stock: 2,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'],
        rating: 4.6,
        numReviews: 31
      },
      {
        name: 'Genuine Leather Bifold Wallet',
        sku: 'FASH-WAL-004',
        description: 'RFID blocking slim wallet crafted from full-grain leather.',
        category: catMap['Fashion & Apparel'],
        price: 999,
        discountPrice: 799,
        stock: 25,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
        rating: 4.5,
        numReviews: 14
      },
      // Home & Living
      {
        name: 'Ceramic Pour-Over Coffee Maker Set',
        sku: 'HOME-COF-001',
        description: 'Artisan hand-crafted ceramic dripper with wooden stand and glass carafe.',
        category: catMap['Home & Living'],
        price: 1899,
        discountPrice: 1599,
        stock: 18,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
        rating: 4.9,
        numReviews: 29
      },
      {
        name: 'Nordic Minimalist LED Desk Lamp',
        sku: 'HOME-LMP-002',
        description: 'Touch dimmable warm LED lamp with wireless phone charging base.',
        category: catMap['Home & Living'],
        price: 2199,
        discountPrice: 1799,
        stock: 14,
        reorderThreshold: 4,
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'],
        rating: 4.6,
        numReviews: 11
      },
      {
        name: 'Aromatherapy Ultrasonic Essential Oil Diffuser',
        sku: 'HOME-DIF-003',
        description: 'Silent mist diffuser with 7 ambient color lights and timer.',
        category: catMap['Home & Living'],
        price: 1499,
        discountPrice: 1199,
        stock: 30,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'],
        rating: 4.4,
        numReviews: 20
      },
      {
        name: 'Insulated Stainless Steel Water Bottle 1L',
        sku: 'HOME-BOT-004',
        description: 'Keeps water cold for 24 hours and hot for 12 hours. BPA Free.',
        category: catMap['Home & Living'],
        price: 799,
        discountPrice: 599,
        stock: 50,
        reorderThreshold: 10,
        images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
        rating: 4.7,
        numReviews: 45
      },
      // Fitness & Sports
      {
        name: 'Eco-Friendly Non-Slip Yoga Mat',
        sku: 'FIT-YOG-001',
        description: 'Extra thick 6mm cushioning with alignment lines and carry strap.',
        category: catMap['Fitness & Sports'],
        price: 1199,
        discountPrice: 949,
        stock: 28,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'],
        rating: 4.8,
        numReviews: 33
      },
      {
        name: 'Adjustable Dumbbells Set (20kg Pair)',
        sku: 'FIT-DMB-002',
        description: 'Rapid-switch selector pin mechanism with anti-slip grip.',
        category: catMap['Fitness & Sports'],
        price: 5999,
        discountPrice: 4999,
        stock: 8,
        reorderThreshold: 3,
        images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80'],
        rating: 4.9,
        numReviews: 19
      },
      {
        name: 'Resistance Bands Set (5 Levels)',
        sku: 'FIT-BND-003',
        description: 'Natural latex loop bands with door anchor and travel pouch.',
        category: catMap['Fitness & Sports'],
        price: 699,
        discountPrice: 499,
        stock: 4,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80'],
        rating: 4.3,
        numReviews: 22
      },
      {
        name: 'Speed Jump Rope with Ball Bearings',
        sku: 'FIT-ROP-004',
        description: 'Tangle-free steel cable rope for cardio and cross-training.',
        category: catMap['Fitness & Sports'],
        price: 499,
        discountPrice: 349,
        stock: 45,
        reorderThreshold: 8,
        images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80'],
        rating: 4.5,
        numReviews: 17
      },
      // Books & Stationery
      {
        name: 'Premium Hardcover Dotted Journal',
        sku: 'BOOK-JRN-001',
        description: '160 GSM bleed-proof bamboo paper with pen loop and inner pocket.',
        category: catMap['Books & Stationery'],
        price: 649,
        discountPrice: 499,
        stock: 35,
        reorderThreshold: 10,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
        rating: 4.9,
        numReviews: 40
      },
      {
        name: 'Fine Calligraphy Fountain Pen Gift Set',
        sku: 'BOOK-PEN-002',
        description: 'Brass barrel pen with 3 interchangeable nibs and ink cartridges.',
        category: catMap['Books & Stationery'],
        price: 1299,
        discountPrice: 999,
        stock: 12,
        reorderThreshold: 4,
        images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80'],
        rating: 4.7,
        numReviews: 14
      },
      {
        name: 'The Pragmatic Programmer (Anniversary Edition)',
        sku: 'BOOK-PRG-003',
        description: 'Classic software engineering best-seller book for developers.',
        category: catMap['Books & Stationery'],
        price: 1499,
        discountPrice: 1299,
        stock: 16,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800&q=80'],
        rating: 5.0,
        numReviews: 52
      },
      {
        name: 'Desk Cable Organizer & Wooden Stand',
        sku: 'BOOK-ORG-004',
        description: 'Solid walnut organizer for pens, sticky notes, and mobile stand.',
        category: catMap['Books & Stationery'],
        price: 899,
        discountPrice: 699,
        stock: 1,
        reorderThreshold: 5,
        images: ['https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&q=80'],
        rating: 4.6,
        numReviews: 16
      }
    ];

    await Product.insertMany(productsData);
    console.log(`🚀 Successfully seeded ${productsData.length} products!`);

    console.log('\n--- DEMO LOGIN CREDENTIALS ---');
    console.log('Admin:    admin@shopsphere.com    | Password: admin123');
    console.log('Customer: customer@shopsphere.com | Password: customer123');
    console.log('Coupons:  WELCOME10 (10% off), FLAT200 (₹200 flat off)');
    console.log('------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();