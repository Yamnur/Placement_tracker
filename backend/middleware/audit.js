const AuditLog = require('../models/AuditLog');

const auditMiddleware = (action, entity) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await AuditLog.create({
          user: req.user._id,
          userName: req.user.name,
          userRole: req.user.role,
          action,
          entity,
          entityId: req.params?.id || data?._id,
          details: `${req.method} ${req.originalUrl}`,
          ip: req.ip || req.connection.remoteAddress,
          method: req.method,
          path: req.originalUrl,
        });
      } catch {}
    }
    return originalJson(data);
  };
  next();
};

module.exports = auditMiddleware;
