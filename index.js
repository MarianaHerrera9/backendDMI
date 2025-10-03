require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

const { authenticate } = require('./middleware/authMiddleware');
app.get('/protected', authenticate, (req, res) => {
    res.json({ message: 'Acceso autorizado', user: req.user });
});

app.use('/doctor', doctorRoutes);

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
