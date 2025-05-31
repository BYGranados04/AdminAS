require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// 🛡️ Middleware de prueba para saber si se ejecuta
app.use((req, res, next) => {
  console.log('🟢 Middleware ejecutado:', req.method, req.url);
  next();
});

// ✅ CORS completo (acepta también preflight)
app.use(cors({
  origin: 'https://bytedeveloopers.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ Backend activo y middleware cargado');
});

// ✅ IMPORTANTE: Manejo explícito del preflight
app.options('*', cors());

// Ruta principal de Stripe
app.post('/create-checkout-session', async (req, res) => {
  const { carrito } = req.body;

  const line_items = carrito.map(item => ({
    price_data: {
      currency: 'gtq',
      product_data: {
        name: item.nombre,
      },
      unit_amount: item.precio * 100,
    },
    quantity: item.cantidad,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://bytedeveloopers.com/ventas-kiosco?success=true',
      cancel_url: 'https://bytedeveloopers.com/ventas-kiosco?cancel=true',
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('❌ Error en Stripe:', err.message);
    res.status(500).json({ error: 'Fallo al crear sesión de pago' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
