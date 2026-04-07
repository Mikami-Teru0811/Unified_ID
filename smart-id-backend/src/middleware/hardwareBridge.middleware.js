export const verifyHardwareBridge = (req, res, next) => {
    const key = req.headers['x-hardware-key'];
    const validKey = process.env.HARDWARE_BRIDGE_KEY;
    
    if (!validKey) {
        console.warn('Hardware bridge key not configured - allowing request (development mode)');
        return next();
    }
    
    if (!key) {
        console.warn(`Hardware bridge auth failed: Missing key from ${req.ip}`);
        return res.status(401).json({ 
            error: 'Hardware bridge key required',
            code: 'MISSING_BRIDGE_KEY'
        });
    }
    
    if (key !== validKey) {
        console.warn(`Hardware bridge auth failed: Invalid key from ${req.ip}`);
        return res.status(401).json({ 
            error: 'Invalid hardware bridge key',
            code: 'INVALID_BRIDGE_KEY'
        });
    }
    
    next();
};

export const optionalHardwareBridge = (req, res, next) => {
    const key = req.headers['x-hardware-key'];
    const validKey = process.env.HARDWARE_BRIDGE_KEY;
    
    if (key && validKey && key === validKey) {
        req.hardwareBridge = true;
    }
    
    next();
};

export const allowHardwareBridgeOrAuthenticatedUser = () => {
    return (req, res, next) => {
        const key = req.headers['x-hardware-key'];
        const validKey = process.env.HARDWARE_BRIDGE_KEY;
        const authHeader = req.headers.authorization;
        const hasBearerToken = Boolean(authHeader && authHeader.startsWith('Bearer '));

        if (key && validKey && key === validKey) {
            req.hardwareBridge = true;
            return next();
        }

        if (hasBearerToken) {
            return next();
        }

        return res.status(401).json({
            error: 'Hardware bridge key or user authentication required',
            code: 'HARDWARE_OR_AUTH_REQUIRED'
        });
    };
};
