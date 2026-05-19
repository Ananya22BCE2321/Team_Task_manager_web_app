import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

function ProjectPage({ user }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    loadProject();
    loadTasks();
    loadMembers();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await apiRequest(`/projects/${id}`);
      setProject(data.project);
      setMembers(data.members);
    } catch (err) {
      setError(err.error || 'Unable to load project');
    }
  };

  const loadTasks = async () => {
    try {
      const data = await apiRequest(`/projects/${id}/tasks`);
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await apiRequest(`/projects/${id}/members`);
      setMembers(data.members);
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest(`/projects/${id}/tasks`, {
        method: 'POST',
        body: {
          title: taskTitle,
          description: taskDescription,
          assignee_id: assigneeId || null,
          due_date: dueDate || null
        }
      });
      setMessage('Task created successfully');
      setTaskTitle('');
      setTaskDescription('');
      setAssigneeId('');
      setDueDate('');
      loadTasks();
    } catch (err) {
      setError(err.error || 'Unable to create task');
    }
  };

  const addMember = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest(`/projects/${id}/members`, { method: 'POST', body: { email: memberEmail } });
      setMemberEmail('');
      setMessage('Member added successfully');
      loadMembers();
    } catch (err) {
      setError(err.error || 'Unable to add member');
    }
  };

  const updateStatus = async (task, status) => {
    try {
      await apiRequest(`/tasks/${task.id}`, { method: 'PUT', body: { status } });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) {
    return <p>Loading project…</p>;
  }

  return (
    <section className="project-view">
      <div className="project-header">
        <Link to="/">← Back</Link>
        <h1>{project.name}</h1>
        <p>{project.description}</p>
      </div>

      <div className="project-grid">
        <div className="task-panel">
          <h2>Tasks</h2>
          {tasks.length ? (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <p>Status: {task.status}</p>
                    <p>Due: {task.due_date || 'No due date'}</p>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => updateStatus(task, 'todo')}>Todo</button>
                    <button onClick={() => updateStatus(task, 'in-progress')}>In Progress</button>
                    <button onClick={() => updateStatus(task, 'done')}>Done</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No tasks yet. Create one below.</p>
          )}
        </div>

        <div className="new-task-panel">
          <h2>Create Task</h2>
          <form onSubmit={createTask}>
            <label>Title</label>
            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
            <label>Description</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
            <label>Assignee</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
              ))}
            </select>
            <label>Due date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <button type="submit">Save task</button>
          </form>
          {user && (user.id === project.owner_id || user.role === 'admin') ? (
            <div className="member-panel">
              <h3>Team members</h3>
              <ul>
                {members.map((member) => (
                  <li key={member.id}>{member.name} ({member.role})</li>
                ))}
              </ul>
              <form onSubmit={addMember}>
                <label>Add member by email</label>
                <input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="user@example.com" />
                <button type="submit">Add member</button>
              </form>
            </div>
          ) : null}
          {message ? <p className="success">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}

export default ProjectPage;
