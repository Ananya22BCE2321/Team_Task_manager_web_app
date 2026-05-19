import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await apiRequest('/dashboard');
      setSummary(data);
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createProject = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiRequest('/projects', { method: 'POST', body: { name, description } });
      setSuccess('Project created successfully!');
      setName('');
      setDescription('');
      loadSummary();
    } catch (err) {
      setError(err.error || 'Unable to create project');
    }
  };

  return (
    <section className="dashboard-view">
      <div className="dashboard-grid">
        <div className="summary-card">
          <h2>Dashboard</h2>
          {summary ? (
            <>
              <p>Projects: {summary.projectCount}</p>
              <p>Open tasks: {summary.statusCounts.todo + summary.statusCounts['in-progress']}</p>
              <p>Done tasks: {summary.statusCounts.done}</p>
              <p>Overdue tasks: {summary.overdue.length}</p>
            </>
          ) : (
            <p>Loading summary…</p>
          )}
        </div>
        <div className="summary-card">
          <h2>Create Project</h2>
          <form onSubmit={createProject}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            <button type="submit">Create</button>
          </form>
          {success ? <p className="success">{success}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </div>
      </div>
      <div className="project-list">
        <h2>Projects</h2>
        {projects.length ? (
          <div className="project-grid">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description || 'No description yet.'}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p>No projects yet. Create your first project.</p>
        )}
      </div>
      <div className="overdue-card">
        <h2>Overdue Tasks</h2>
        {summary && summary.overdue.length ? (
          <ul>
            {summary.overdue.map((task) => (
              <li key={task.id}>{task.title} — {task.project_name}</li>
            ))}
          </ul>
        ) : (
          <p>No overdue tasks.</p>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
