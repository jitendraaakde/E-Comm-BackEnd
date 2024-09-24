const express = require('express')
const router = express.Router()
const { loginContoller } = require('../controllers/userControllers')

router.get('/api/user/login', loginContoller)

module.exports = router