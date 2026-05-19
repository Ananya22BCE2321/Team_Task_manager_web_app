const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { knex } = require('../db');
const validate = require('../middleware/validate');
const { signupRules, loginRules } = require('../validators/auth');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signupRules, validate, async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await knex('users').where({ email }).first();
  if (existing) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  const usersCount = await knex('users').count('* as count').first();
  const role = Number(usersCount.count) === 0 ? 'admin' : 'member';
  const passwordHash = await bcrypt.hash(password, 10);

  const inserted = await knex('users').insert({ name, email, password: passwordHash, role });
  const userId = inserted[0];
  const user = await knex('users').where({ id: userId }).first();
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user });
});

router.post('/login', loginRules, validate, async (req, res) => {
  const { email, password } = req.body;
  const user = await knex('users').where({ email }).first();
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
