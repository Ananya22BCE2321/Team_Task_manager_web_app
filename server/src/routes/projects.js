const express = require('express');
const { knex } = require('../db');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProjectRules, addMemberRules } = require('../validators/project');
const { createTaskRules } = require('../validators/task');

const router = express.Router();
router.use(auth);

async function projectAccessible(user, projectId) {
  if (user.role === 'admin') {
    return true;
  }
  const project = await knex('projects').where('id', projectId).first();
  if (!project) return false;
  if (project.owner_id === user.id) return true;
  const member = await knex('project_members').where({ project_id: projectId, user_id: user.id }).first();
  return Boolean(member);
}

router.get('/', async (req, res) => {
  if (req.user.role === 'admin') {
    const projects = await knex('projects');
    return res.json({ projects });
  }

  const projects = await knex('projects')
    .leftJoin('project_members', 'projects.id', 'project_members.project_id')
    .where(function () {
      this.where('projects.owner_id', req.user.id).orWhere('project_members.user_id', req.user.id);
    })
    .select('projects.*')
    .groupBy('projects.id');

  res.json({ projects });
});

router.post('/', createProjectRules, validate, async (req, res) => {
  const { name, description } = req.body;
  const inserted = await knex('projects').insert({ name, description, owner_id: req.user.id });
  const projectId = inserted[0];
  const project = await knex('projects').where({ id: projectId }).first();

  await knex('project_members').insert({ project_id: project.id, user_id: req.user.id });
  res.status(201).json({ project });
});

router.get('/:id', async (req, res) => {
  const projectId = Number(req.params.id);
  if (!(await projectAccessible(req.user, projectId))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const project = await knex('projects').where('id', projectId).first();
  const members = await knex('project_members')
    .join('users', 'project_members.user_id', 'users.id')
    .where('project_members.project_id', projectId)
    .select('users.id', 'users.name', 'users.email', 'users.role');
  res.json({ project, members });
});

router.put('/:id', createProjectRules, validate, async (req, res) => {
  const projectId = Number(req.params.id);
  const project = await knex('projects').where('id', projectId).first();
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (req.user.role !== 'admin' && req.user.id !== project.owner_id) {
    return res.status(403).json({ error: 'Not authorized to update project' });
  }

  await knex('projects').where('id', projectId).update({ ...req.body });
  const updated = await knex('projects').where('id', projectId).first();
  res.json({ project: updated });
});

router.delete('/:id', async (req, res) => {
  const projectId = Number(req.params.id);
  const project = await knex('projects').where('id', projectId).first();
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (req.user.role !== 'admin' && req.user.id !== project.owner_id) {
    return res.status(403).json({ error: 'Not authorized to delete project' });
  }

  await knex('projects').where('id', projectId).del();
  res.json({ success: true });
});

router.get('/:id/members', async (req, res) => {
  const projectId = Number(req.params.id);
  if (!(await projectAccessible(req.user, projectId))) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const members = await knex('project_members')
    .join('users', 'project_members.user_id', 'users.id')
    .where('project_members.project_id', projectId)
    .select('users.id', 'users.name', 'users.email', 'users.role');
  res.json({ members });
});

router.post('/:id/members', addMemberRules, validate, async (req, res) => {
  const projectId = Number(req.params.id);
  const project = await knex('projects').where('id', projectId).first();
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (req.user.role !== 'admin' && req.user.id !== project.owner_id) {
    return res.status(403).json({ error: 'Not authorized to manage members' });
  }

  const member = await knex('users').where('email', req.body.email).first();
  if (!member) {
    return res.status(404).json({ error: 'User not found' });
  }

  await knex('project_members')
    .insert({ project_id: projectId, user_id: member.id })
    .onConflict(['project_id', 'user_id'])
    .ignore();

  const members = await knex('project_members')
    .join('users', 'project_members.user_id', 'users.id')
    .where('project_members.project_id', projectId)
    .select('users.id', 'users.name', 'users.email', 'users.role');
  res.json({ members });
});

router.get('/:id/tasks', async (req, res) => {
  const projectId = Number(req.params.id);
  if (!(await projectAccessible(req.user, projectId))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const tasks = await knex('tasks')
    .where('project_id', projectId)
    .select('tasks.*');

  res.json({ tasks });
});

router.post('/:id/tasks', createTaskRules, validate, async (req, res) => {
  const projectId = Number(req.params.id);
  if (!(await projectAccessible(req.user, projectId))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const inserted = await knex('tasks').insert({ project_id: projectId, ...req.body });
  const taskId = inserted[0];
  const task = await knex('tasks').where({ id: taskId }).first();
  res.status(201).json({ task });
});

module.exports = router;
