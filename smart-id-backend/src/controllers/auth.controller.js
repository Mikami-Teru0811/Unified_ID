import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Whitelist of allowed roles for self-registration
const ALLOWED_REGISTRATION_ROLES = ['patient'];

// Minimum password requirements
const MIN_PASSWORD_LENGTH = 8;

// 🔑 GENERATE JWT TOKEN
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            name: user.name,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );
};

// 🟢 REGISTER USER
export const registerUser = async (req, res) => {
    try {
        const { name, username, password, role } = req.body;
        const normalizedUsername = username?.trim().toLowerCase();

        // Validate required fields
        if (!name || !normalizedUsername || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate role whitelist - prevent unauthorized role registration
        if (!ALLOWED_REGISTRATION_ROLES.includes(role)) {
            return res.status(400).json({ 
                message: `Invalid role. Self-registration is only allowed for: ${ALLOWED_REGISTRATION_ROLES.join(', ')}` 
            });
        }

        // Validate password complexity
        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ 
                message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` 
            });
        }

        // Check for username uniqueness
        const userExists = await User.findOne({ username: normalizedUsername });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = await User.create({
            name,
            username: normalizedUsername,
            password,
            role
        });

        res.status(201).json({
            message: 'User registered successfully',
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// 🔵 LOGIN USER
export const loginUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const normalizedUsername = username?.trim().toLowerCase();

        if (!normalizedUsername || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        const user = await User.findOne({ username: normalizedUsername });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Verify role if specified
        if (role && user.role !== role) {
            return res.status(403).json({ message: 'Role mismatch' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.json({
            message: 'Login successful',
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
