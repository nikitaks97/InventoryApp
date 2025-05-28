const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middlewares/auth');
const { errorHandler } = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// Only start server if this module is run directly (avoids open handles in tests)
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
