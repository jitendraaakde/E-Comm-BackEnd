const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes')
const { dbConnect } = require('./db/dbConnection')
const bodyParser = require('body-parser');

dbConnect()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); app.use(userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
