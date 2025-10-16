import express from 'express';
const router = express.Router();

// Importing the authentication routes
import authRoutes from './authRoutes.js';

// Importing the protected Home routes
import homeRoutes from './homeRoutes.js';

router.use('/auth', authRoutes);
router.use('/home', homeRoutes);

export default router;