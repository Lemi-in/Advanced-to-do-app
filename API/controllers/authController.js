const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


exports.register = async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({ email: req.body.email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 mins
    await user.save();
  
    const resetLink = `http://localhost:5173/reset-password/${token}`; // Frontend URL
    try {
      await sendEmail(user.email, 'Reset Password', `Click to reset: ${resetLink}`);
    } catch (err) {
      console.error('Email sending failed:', err.message);
      // Optional: keep going to avoid crashing
    }
    
  
    res.json({ message: 'Reset link sent to email' });
  };
  

  exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    console.log("Token received:", token);
  
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
  
    if (!user) {
      console.log("Token invalid or expired");
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
  
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
  
    res.json({ message: 'Password reset successful' });
  };
  
