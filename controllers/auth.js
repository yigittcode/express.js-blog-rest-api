const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array()[0]);
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    try {
        const hashedPw = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const result = await user.save();
        res.status(201).json({ message: 'User created!', userId: result._id });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).send('A user with this email could not be found.');
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res.status(401).send('Wrong password!');
        }
        const token = jwt.sign({
            email : loadedUser.email,
            id : loadedUser._id.toString()
        }, 'secret', {expiresIn : '1h'} , (err, token) =>{
            if(!err) {
                res.status(200).json({ message: 'User logged in successfully!', userId: loadedUser._id , token : token});
            }
            else {
                res.status(500).json({ error: 'Token generation failed' });
            }
        });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: 'User updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

