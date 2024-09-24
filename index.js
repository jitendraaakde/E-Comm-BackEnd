const express = require('express')
const app = express()
const userRoutes = require('./routes/userRoutes')
const { dbConnect } = require('./db/dbConnection')
dbConnect()
app.use('/', userRoutes)

app.listen(3000, () => {
    console.log('server started')
})