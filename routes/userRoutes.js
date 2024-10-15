const express = require('express');
const router = express.Router();
const { loginController, signupController, googleAuth, editUserData, getUserAddresses, addUserAddresses, deleteUserAddresses, changeUserPassword, deleteUser } = require('../controllers/userControllers');
const preventRoutes = require('../auth/routesAccessAuth');

router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/google', googleAuth)
router.put('/edit-user', preventRoutes, editUserData)
router.get('/get-addresses', preventRoutes, getUserAddresses)
router.post('/add-addresses', preventRoutes, addUserAddresses)
router.delete('/delete-address/:id', preventRoutes, deleteUserAddresses)
router.post('/change-password', preventRoutes, changeUserPassword)
router.delete('/delete-user', preventRoutes, deleteUser)


module.exports = router;
