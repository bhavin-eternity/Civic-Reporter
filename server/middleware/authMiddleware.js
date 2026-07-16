const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next()
        } catch (error) {
            return res.status(401).json({ message: 'Token failed, not authorized' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No token not authorized' });
    }
}

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, adminOnly };