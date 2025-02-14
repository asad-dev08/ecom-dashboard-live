const express = require('express');
const router = express.Router();
const db = require('../db.json');

router.get('/', (req, res) => {
  const { email } = req.query;
  const users = db.users || [];
  const user = users.find(u => u.email === email);
  
  if (user) {
    res.json([user]);
  } else {
    res.json([]);
  }
});

module.exports = router; 