const express = require('express');
const router = express.Router();
const { loginController, signupController, googleAuth } = require('../controllers/userControllers');

router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/google', googleAuth)


module.exports = router;
