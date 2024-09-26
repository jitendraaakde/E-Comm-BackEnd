const express = require('express');
const router = express.Router();
const { loginController, signupController } = require('../controllers/userControllers');

router.post('/api/user/login', loginController);

router.post('/api/user/signup', signupController);

module.exports = router;
