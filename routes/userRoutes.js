const express = require('express');
const router = express.Router();
const { loginController, signupController, googleAuth } = require('../controllers/userControllers');

router.post('/api/user/login', loginController);

router.post('/api/user/signup', signupController);
router.post('/api/users/google', googleAuth)

module.exports = router;
