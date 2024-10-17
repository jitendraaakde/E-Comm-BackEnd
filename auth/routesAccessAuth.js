const jwt = require('jsonwebtoken');

const preventRoutes = (req, res, next) => {
    console.log('prevent routes')
    const token = req.cookies.token;
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
