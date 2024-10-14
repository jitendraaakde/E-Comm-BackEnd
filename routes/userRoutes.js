const express = require('express');
const router = express.Router();
const { loginController, signupController, googleAuth, editUserData, getUserAddresses } = require('../controllers/userControllers');
const preventRoutes = require('../auth/routesAccessAuth');

router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/google', googleAuth)
router.put('/edit-user', preventRoutes, editUserData)
router.get('/get-addresses', preventRoutes, getUserAddresses)


module.exports = router;
