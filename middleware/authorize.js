module.exports = function authorize(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Permiso insuficiente' });
        }

        next();
    };
};
