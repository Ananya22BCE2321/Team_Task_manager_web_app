const express = require('express');
const { knex } = require('../db');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateTaskRules } = require('../validators/task');

const router = express.Router();
router.use(auth);

async function canManageTask(req, taskId) {
  const task = await knex('tasks').where('tasks.id', taskId).first();
  if (!task) {
    return null;
  }
  const project = await knex('projects').where('id', task.project_id).first();
  if (!project) {
    return null;
  }
  const isProjectOwner = req.user.id === project.owner_id;
  const isAdmin = req.user.role === 'admin';
  const isAssignee = req.user.id === task.assignee_id;
  const member = await knex('project_members').where({ project_id: project.id, user_id: req.user.id }).first();
  return { task, project, isAdmin, isProjectOwner, isAssignee, isMember: Boolean(member) };
}

router.put('/:id', updateTaskRules, validate, async (req, res) => {
  const taskId = Number(req.params.id);
  const access = await canManageTask(req, taskId);
  if (!access) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (!access.isAdmin && !access.isProjectOwner && !access.isAssignee) {
    return res.status(403).json({ error: 'Not authorized to update this task' });
  }

  const updatePayload = { ...req.body, updated_at: knex.fn.now() };
  if (updatePayload.due_date === undefined) {
    delete updatePayload.due_date;
  }
  await knex('tasks').where('id', taskId).update(updatePayload);
  const updated = await knex('tasks').where('id', taskId).first();
  res.json({ task: updated });
});

router.delete('/:id', async (req, res) => {
  const taskId = Number(req.params.id);
  const access = await canManageTask(req, taskId);
  if (!access) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (!access.isAdmin && !access.isProjectOwner) {
    return res.status(403).json({ error: 'Not authorized to delete this task' });
  }

  await knex('tasks').where('id', taskId).del();
  res.json({ success: true });
});

module.exports = router;
