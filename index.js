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

app.get("/weather", async (req, res) => {
  try {
    const city = req.query.city || "London";
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(data.cod).json({ error: data.message });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar OpenWeather" });
  }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
