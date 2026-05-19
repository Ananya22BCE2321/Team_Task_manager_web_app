const express = require('express');
const { knex } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const queryTasks = knex('tasks')
    .select('tasks.*', 'projects.name as project_name')
    .leftJoin('projects', 'tasks.project_id', 'projects.id');

  if (req.user.role !== 'admin') {
    queryTasks
      .leftJoin('project_members', 'tasks.project_id', 'project_members.project_id')
      .where(function () {
        this.where('tasks.assignee_id', req.user.id)
          .orWhere('projects.owner_id', req.user.id)
          .orWhere('project_members.user_id', req.user.id);
      })
      .groupBy('tasks.id', 'projects.name');
  }

  const tasks = await queryTasks;
  const overdue = tasks.filter((task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done');
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, { todo: 0, 'in-progress': 0, done: 0 });

  const projects = await knex('projects')
    .modify((builder) => {
      if (req.user.role !== 'admin') {
        builder.where('owner_id', req.user.id).orWhereIn('id', function () {
          this.select('project_id').from('project_members').where('user_id', req.user.id);
        });
      }
    })
    .select('id', 'name', 'description');

  res.json({ tasks, overdue, statusCounts, projectCount: projects.length, projects });
});

module.exports = router;
