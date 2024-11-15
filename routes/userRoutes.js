const express = require('express');
const router = express.Router();
const { loginController, signupController, googleAuth, editUserData, getUserAddresses, addUserAddresses, deleteUserAddresses, changeUserPassword, deleteUser, logoutUser, otpController, userPlaceOrder, userOrdersHistory, forgetPassword, handleForgetPasswordOtp, handleNewPassword } = require('../controllers/userControllers');
const preventRoutes = require('../auth/routesAccessAuth');

router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/google', googleAuth)
router.post('/forget-password', forgetPassword)
router.post('/forget-password-otp', handleForgetPasswordOtp)
router.post('/new-password', handleNewPassword)
router.put('/edit-user', preventRoutes, editUserData)
router.post('/add-order', preventRoutes, userPlaceOrder)
router.get('/get-addresses', preventRoutes, getUserAddresses)
router.get('/order-history', preventRoutes, userOrdersHistory)
router.post('/add-addresses', preventRoutes, addUserAddresses)
router.delete('/delete-address/:id', preventRoutes, deleteUserAddresses)
router.post('/change-password', preventRoutes, changeUserPassword)
router.delete('/delete-user', preventRoutes, deleteUser)
router.get('/logout', preventRoutes, logoutUser)
router.post('/otp', otpController)


module.exports = router;
