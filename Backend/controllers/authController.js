const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Firm = require('../models/Firm');
exports.postLogin = async (req, res, next) => {
  try {
        const { email, password ,userType} = req.body;
             let existingUser;
    if (userType === 'farmer') {
  existingUser = await Farmer.findOne({ email });
} else {
  existingUser = await Firm.findOne({ email });
}
  if (!existingUser) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

       if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email, userType },
      "sjbkjsbfkjafbjkasbdjka",
      { expiresIn: '2h' }
    );
    res.cookie('Usercookie', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7200000,
    });
    const userWithoutPassword = {
      _id: existingUser._id,
      email: existingUser.email,
      userType,
    };
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    res.clearCookie('Usercookie', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.postSignup = [
  // ──────────────────────────────────────────────
  // Common validations (shared by both roles)
  // ──────────────────────────────────────────────
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

  check('password')
    .isLength({ min: 6 })
    .withMessage('Password should be at least 6 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password should contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password should contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password should contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password should contain at least one special character')
    .trim(),

  

  check('phoneNumber')
    .trim()
    .isMobilePhone('any')
    .withMessage('Please enter a valid phone number'),

  check('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  check('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  // ──────────────────────────────────────────────
  // Role-specific validations
  // ──────────────────────────────────────────────
  check('userType')
    .notEmpty()
    .withMessage('User type is required')
    .isIn(['farmer', 'firm'])
    .withMessage('Invalid user type'),

  // Farmer-specific
  check('FirstName')
    .if(check('userType').equals('farmer'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name should be at least 2 characters long')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('First Name should contain only alphabets'),

  check('LastName')
    .if(check('userType').equals('farmer'))
    .trim()
    .matches(/^[A-Za-z\s]*$/)
    .withMessage('Last Name should contain only alphabets'),

  // Firm-specific
  check('CompanyName')
    .if(check('userType').equals('firm'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('Company Name should be at least 2 characters long'),

  check('ContactPerson')
    .if(check('userType').equals('firm'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('Contact Person name should be at least 2 characters long')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Contact Person should contain only alphabets'),

  // Terms acceptance (if you still want it)
  check('terms')
    .optional()
    .custom((value) => {
      if (value && value !== 'on') {
        throw new Error('Please accept the terms and conditions');
      }
      return true;
    }),

  // ──────────────────────────────────────────────
  // Final handler
  // ──────────────────────────────────────────────
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          errors: errors.array().map((err) => err.msg),
          oldInput: { ...req.body, password: '', confirmPassword: '' },
        });
      }

      const {
        FirstName,
        LastName,
        CompanyName,
        ContactPerson,
        email,
        password,
        phoneNumber,
        city,
        state,
        userType,
      } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      let newUser;

      if (userType === 'farmer') {
        newUser = new Farmer({
          FirstName: FirstName?.trim() || '',
          LastName: LastName?.trim() || '',
          email: email?.trim().toLowerCase(),
          password: hashedPassword,
          phoneNumber: phoneNumber?.trim(),
          city: city?.trim(),
          state: state?.trim(),
        });
      } else if (userType === 'firm') {
        newUser = new Firm({
          CompanyName: CompanyName?.trim() || '',
          ContactPerson: ContactPerson?.trim() || '',
          email: email?.trim().toLowerCase(),
          password: hashedPassword,
          phoneNumber: phoneNumber?.trim(),
          city: city?.trim(),
          state: state?.trim(),
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid user type',
        });
      }
console.log(newUser);
      await newUser.save();

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        redirect: '/login-page',
      });
    } catch (error) {
      console.error('Registration error:', error);

      // Duplicate email check example (MongoDB)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'An error occurred during registration. Please try again later.',
      });
    }
  },
];

exports.checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.Usercookie;
    if (!token) {
      return res.status(200).json({ isLoggedIn: false, user: null });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sjbkjsbfkjafbjkasbdjka");
    const userType=decoded.userType;
   
    let user;
        if (userType === 'farmer') {
            user = await Farmer.findById(decoded.userId).select('email  _id');
} else {
user = await Firm.findById(decoded.userId).select('email  _id');
}
      console.log("from authcheck",decoded)
    if (!user) {
      res.clearCookie('Usercookie', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      return res.status(200).json({ isLoggedIn: false, user: null });
    }
    return res.status(200).json({ isLoggedIn: true, user: { email: user.email, userType,_id: user._id } });
  } catch (error) {
    console.error('Error in checkAuth:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.getProfile = async (req, res, next) => {
  try {
    const token = req.cookies.Usercookie;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sjbkjsbfkjafbjkasbdjka");
    const user = await User.findById(decoded.userId);
        if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}