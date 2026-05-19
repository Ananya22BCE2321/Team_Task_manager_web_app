const { body } = require('express-validator');

const createProjectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim()
];

const addMemberRules = [
  body('email').trim().isEmail().withMessage('Valid member email is required')
];

module.exports = { createProjectRules, addMemberRules };
