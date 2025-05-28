const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const users = [];

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) return res.status(400).send('User exists');
  users.push({ username, password });
  res.status(201).send('Registered');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).send('Invalid credentials');
  const token = jwt.sign({ username }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
