const express = require('express');
const router = express.Router();
const { loginController, signupController, googleAuth } = require('../controllers/userControllers');
const preventRoutes = require('../auth/routesAccessAuth');

router.post('/api/user/login', loginController);

router.post('/api/user/signup', signupController);
router.post('/api/users/google', googleAuth)
router.post('/api/users/cart', preventRoutes, (req, res) => {
    console.log("Cookies-------------------------:", req.cookies.token);
    res.send({ msg: 'Cart items logged' });
});


module.exports = router;
