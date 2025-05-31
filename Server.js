require('dotenv').config(); // ✅ Esto debe ir primero

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ya se puede usar

const app = express();

// ✅ Configurar CORS SOLO para tu dominio
const corsOptions = {
  origin: 'https://bytedeveloopers.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { carrito } = req.body;

  const line_items = carrito.map(item => ({
    price_data: {
      currency: 'gtq',
      product_data: {
        name: item.nombre,
      },
      unit_amount: item.precio * 100, // Stripe usa centavos
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
    console.error('❌ Error en sesión de Stripe:', err.message);
    res.status(500).json({ error: 'Fallo al crear sesión de pago' });
  }
});

// ✅ Render usa process.env.PORT, no pongas puerto fijo
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`✅ Servidor Stripe corriendo en el puerto ${PORT}`);
});
