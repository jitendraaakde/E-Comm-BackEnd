const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const { dbConnect } = require('./db/dbConnection');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/adminRoutes')

// Connect to the database
dbConnect();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());  // Use cookieParser before defining routes

// Routes
app.use('/api/users/', userRoutes);
app.use('/api/admin/', adminRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
