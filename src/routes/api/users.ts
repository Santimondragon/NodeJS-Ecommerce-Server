//@ts-check
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import { check, validationResult } from 'express-validator';

import { User } from '../../models/User';
import defaultConfig from '../../config/default';

const router = express.Router();
const jwtSecret = defaultConfig.jwtSecret;

// @route   POST api/Users
// @desc    Register User
// @acces   Public
router.post(
  '/',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password must be at least 8 characters').isLength({
      min: 8,
    }),
    check('role', 'Role is required').not().isEmpty(),
    check('email', 'Plase enter a valid email').isEmail(),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('cellphone', 'First name is required').not().isEmpty(),
    check('address', 'First name is required').not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      username,
      password,
      role,
      email,
      firstName,
      middleName,
      lastName,
      cellphone,
      address,
    } = req.body;

    try {
      // Validate if User exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        username,
        password,
        role,
        email,
        firstName,
        middleName,
        lastName,
        cellphone,
        address,
        creationDate: Date.now(),
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: { id: user.id, username: user.username, role: user.role },
      };
      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (error, token) => {
        if (error) throw error;
        res.json({ token });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

export = router;
