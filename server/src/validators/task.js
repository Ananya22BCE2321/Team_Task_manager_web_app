const { body } = require('express-validator');

const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('assignee_id').optional().isInt().withMessage('Assignee must be a user ID'),
  body('due_date').optional().isISO8601().toDate().withMessage('Due date must be a valid date')
];

const updateTaskRules = [
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress or done'),
  body('assignee_id').optional().isInt().withMessage('Assignee must be a user ID'),
  body('due_date').optional().isISO8601().toDate().withMessage('Due date must be a valid date')
];

module.exports = { createTaskRules, updateTaskRules };
