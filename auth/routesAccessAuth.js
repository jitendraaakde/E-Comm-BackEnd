const jwt = require('jsonwebtoken');

const preventRoutes = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Token", token)

    if (!token) {
        return res.send({ action: '/login' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.send({ action: '/login' })
        }
        req.user = decoded;
        next();
    });
};

module.exports = preventRoutes;
