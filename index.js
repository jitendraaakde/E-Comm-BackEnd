const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const { dbConnect } = require('./db/dbConnection');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes')
const productRoutes = require('./routes/productRoutes')

// Connect to the database
dbConnect();

// Middleware
app.use(cors({
    origin: ['https://e-commerce-jitu.netlify.app', 'https://e-comm-backend-ugos.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.use('/api/users/', userRoutes);
app.use('/api/admin/', adminRoutes);
app.use('/api/product/', productRoutes);

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on `, process.env.PORT);
});
