require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { spawn } = require('child_process');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API Endpoints ---

// 1. Auth: Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// 2. Auth: Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// 3. Watchlist: Add Item
app.post('/api/watchlist', authenticateToken, async (req, res) => {
  const { productId, targetPrice } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  const userIdInt = parseInt(req.user.id);
  const productIdInt = parseInt(productId);

  if (isNaN(userIdInt) || isNaN(productIdInt)) {
    console.log(`❌ Invalid ID Debug: userIdInt=${userIdInt}, productIdInt=${productIdInt}`);
    return res.status(400).json({ error: "Invalid ID format" });
  }

  console.log(`📝 Watchlist Request: User ${userIdInt} adding Product ${productIdInt}`);

  try {
    // Check if it already exists
    const existingItem = await prisma.watchlist.findFirst({
      where: {
        userId: userIdInt,
        productId: productIdInt
      }
    });

    if (existingItem) {
      return res.status(409).json({ message: "Item is already in your watchlist" });
    }

    const newItem = await prisma.watchlist.create({
      data: {
        userId: userIdInt,
        productId: productIdInt,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null
      }
    });

    console.log("✅ Added to watchlist!");
    res.status(201).json(newItem);

  } catch (error) {
    console.error("❌ Watchlist Error:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: "Item is already in your watchlist" });
    }
    res.status(500).json({ error: "Failed to add to watchlist. Check Server Logs." });
  }
});

// 4. Watchlist: Get Items
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        product: true
      }
    });
    res.json(items);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist.' });
  }
});

// 5. Watchlist: Remove Item
app.delete('/api/watchlist/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    // Attempt to delete by watchlist ID
    const deleted = await prisma.watchlist.deleteMany({
      where: {
        id: id,
        userId: userId
      }
    });

    if (deleted.count > 0) {
      return res.json({ message: 'Item removed' });
    }

    // Attempt to delete by product ID (logic fallback)
    const deleteByProduct = await prisma.watchlist.deleteMany({
      where: {
        productId: id,
        userId: userId
      }
    });

    if (deleteByProduct.count > 0) {
      return res.json({ message: 'Item removed by product ID' });
    }

    res.status(404).json({ error: 'Item not found in watchlist' });

  } catch (error) {
    console.error('Remove watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

// Endpoint: GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.products.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Endpoint: POST /api/predict
app.post('/api/predict', (req, res) => {
  const { name, category, rating, rating_count } = req.body;
  const scriptPath = path.join(__dirname, 'ml', 'predict_price.py');

  const pythonProcess = spawn('python3', [
    scriptPath,
    name,
    category,
    rating,
    rating_count
  ]);

  let dataToSend = '';
  pythonProcess.stdout.on('data', (data) => {
    dataToSend += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    try {
      const prediction = JSON.parse(dataToSend);
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to parse prediction from Python.' });
    }
  });
});

// Budget Setup Endpoint
app.post('/api/build-setup', async (req, res) => {
  const { budget, type } = req.body;
  console.log(`\n🤖 Budget Request: ₹${budget} for ${type}`);

  async function findItem(keywords, maxPrice, roleName) {
    let item = null;

    try {
      const searchTerms = [];
      keywords.forEach(k => {
        searchTerms.push({ name: { contains: k } });
        searchTerms.push({ name: { contains: k.toLowerCase() } });
      });

      item = await prisma.products.findFirst({
        where: {
          price: { lte: maxPrice },
          OR: searchTerms
        },
        orderBy: { price: 'desc' }
      });

    } catch (error) {
      console.error(`⚠️ DB Error on ${roleName}:`, error.message);
    }

    // Fallback Mock Data
    if (!item) {
      console.log(`🚨 No DB match for ${roleName}. Generating Mock Item.`);
      const randomModel = Math.floor(Math.random() * 1000);
      item = {
        id: `mock-${Math.random()}`,
        name: `${keywords[0]} Pro X${randomModel} (Demo Data)`,
        category: roleName,
        price: Math.floor(maxPrice * 0.95),
        rating: 4.5,
        role: roleName,
        isMock: true
      };
    } else {
      item.role = roleName;
    }

    return item;
  }

  try {
    const count = await prisma.products.count();
    console.log(`📊 Current Products in DB: ${count}`);

    let setup = [];

    if (type === 'gaming') {
      setup.push(await findItem(['Laptop', 'Gaming', 'Nvidia', 'RTX', 'Asus', 'HP'], budget * 0.60, "Gaming Powerhouse"));
      setup.push(await findItem(['Monitor', 'Display', 'LG', 'Samsung', 'BenQ'], budget * 0.25, "High-Res Monitor"));
      setup.push(await findItem(['Mouse', 'Keyboard', 'Razer', 'Logitech', 'Mechanical'], budget * 0.15, "Pro Peripherals"));
    }
    else if (type === 'entertainment') {
      setup.push(await findItem(['TV', 'Television', 'Sony', 'Samsung', 'LG', '4K'], budget * 0.65, "Cinematic TV"));
      setup.push(await findItem(['Speaker', 'Soundbar', 'JBL', 'Sony', 'Boat'], budget * 0.25, "Surround Sound"));
      setup.push(await findItem(['Headphone', 'Remote', 'Stand'], budget * 0.10, "Accessories"));
    }
    else {
      setup.push(await findItem(['Laptop', 'MacBook', 'ThinkPad', 'Dell', 'Surface'], budget * 0.70, "Workstation"));
      setup.push(await findItem(['Headphone', 'Sony', 'Sennheiser', 'JBL'], budget * 0.20, "Noise Cancelling Audio"));
      setup.push(await findItem(['Mouse', 'Drive', 'SSD', 'Office'], budget * 0.10, "Office Essentials"));
    }

    const totalCost = setup.reduce((acc, item) => acc + item.price, 0);

    console.log(`✅ Sending ${setup.length} items to frontend.`);
    res.json({ items: setup, totalCost });

  } catch (error) {
    console.error("❌ Critical Server Error:", error);
    res.status(200).json({
      items: [],
      totalCost: 0,
      message: "Server busy, please try again."
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});