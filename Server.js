// server.js
require('dotenv').config(); // ✅ Esto debe ir primero

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ya se puede usar

const app = express();
app.use(cors());
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
    console.error('Error en sesión de Stripe:', err.message);
    res.status(500).json({ error: 'Fallo al crear sesión de pago' });
  }
});

app.listen(4242, () => {
  console.log('✅ Servidor Stripe corriendo en http://localhost:4242');
});
