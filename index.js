const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const { dbConnect } = require('./db/dbConnection');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');

// Connect to the database
dbConnect();

// Middleware to allow requests from any origin
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // If you want to send cookies, authorization headers, etc.
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users/', userRoutes);
app.use('/api/admin/', adminRoutes);
app.use('/api/product/', productRoutes);

// Start the server
const PORT = process.env.PORT || 3000;  // Ensure PORT is set from environment or fallback to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
