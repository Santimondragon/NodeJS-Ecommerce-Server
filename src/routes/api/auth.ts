//@ts-check
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import { check, validationResult } from 'express-validator';

import auth from '../../middleware/auth';
import { User } from '../../models/User';

import defaultConfig from '../../config/default';

const router = express.Router();
const jwtSecret = defaultConfig.jwtSecret;

// @route   GET api/Auth
// @desc    Auth route
// @acces   Public
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth
// @desc    Authenticate and get token
// @acces   Public
router.post(
  '/',
  [
    check('email', 'Plase enter a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Validate if User exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Return jsonwebtoken
      const payload = {
        user: { id: user.id, username: user.username, role: user.role },
      };

      jwt.sign(payload, jwtSecret, { expiresIn: 36000 }, (error, token) => {
        if (error) throw error;
        res.json({ token });
      });
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
);

export = router;
