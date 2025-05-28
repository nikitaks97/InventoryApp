const express = require('express');

const router = express.Router();
let tasks = [];

router.get('/', (req, res) => {
  res.json(tasks);
});

router.post('/', (req, res) => {
  const task = { id: Date.now(), ...req.body };
  tasks.push(task);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === +req.params.id);
  if (index === -1) return res.status(404).send('Task not found');
  tasks[index] = { ...tasks[index], ...req.body };
  res.json(tasks[index]);
});

router.delete('/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== +req.params.id);
  res.status(204).end();
});

module.exports = router;
