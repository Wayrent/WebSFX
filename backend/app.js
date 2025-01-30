const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const soundRoutes = require('./routes/soundRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Убедитесь, что указаны правильные URL
app.use(bodyParser.json());

// Routes
app.use('/api/sounds', soundRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
