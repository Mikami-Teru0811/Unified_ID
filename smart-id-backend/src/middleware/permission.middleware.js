import Permission from '../models/Permission.js';

export const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;
      
      if (!role) {
        return res.status(401).json({ message: 'Unauthorized: No role found' });
      }

      if (role === 'admin') {
        return next();
      }

      const permDoc = await Permission.findOne({ role });
      
      if (!permDoc) {
        return res.status(403).json({ 
          message: `Access denied: No permissions configured for role '${role}'` 
        });
      }

      const hasPermission = permDoc.permissions?.[permissionKey];

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied: '${permissionKey}' permission required for ${role}` 
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during permission check' });
    }
  };
};
