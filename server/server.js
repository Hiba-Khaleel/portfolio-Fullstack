const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const cors=require('cors');
require('dotenv').config();


app.use(cors()); 
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT; 

app.use(express.json());

// ADMIN SECTION

const myPassword = 1234;

app.post('/check-password', (req, res) => {
  const userPassword = parseInt(req.body.password);
  if (userPassword === myPassword) {
    res.json({ success: true, message: 'Access granted!' });
  } else {
    res.json({ success: false, message: 'Access denied!' });
  }
});

// PROJECTS' SECTION

// Create a MySQL connection pool 
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Hiba.Khaleel1998',
  database: 'my_projects',
});

app.post('/projects', (req, res) => {
  const { project_name, project_details, github_link } = req.body;

  const insertQuery = 'INSERT INTO projects (project_name, project_details, github_link) VALUES (?, ?, ?)';
  const insertValues = [project_name, project_details, github_link];

  pool.query(insertQuery, insertValues, (err, result) => {
    if (err) {
      console.error('Error adding project:', err);
      return res.status(500).json({ error: 'Failed to add the project.' });
    }

    const newProjectId = result.insertId;
    const newProject = {
      id: newProjectId,
      project_name,
      project_details,
      github_link,
    };

    return res.json(newProject);
  });
});

// GET route to fetch all projects
app.get('/projects', (req, res) => {
  const selectQuery = 'SELECT * FROM projects';

  pool.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: 'Failed to fetch projects.' });
    }

    return res.json(results);
  });
});

// GET route to fetch a project by its ID
app.get('/projects/:id', (req, res) => {
  const projectId = req.params.id;
  const selectQuery = 'SELECT * FROM projects WHERE id = ?';

  pool.query(selectQuery, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching project:', err);
      return res.status(500).json({ error: 'Failed to fetch the project.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = results[0];
    return res.json(project);
  });
});

// PATCH route to update a project by its ID
app.patch('/projects/:id', (req, res) => {
  const projectId = req.params.id;
  const updateData = req.body; 

  const updateQuery = 'UPDATE projects SET ? WHERE id = ?';

  pool.query(updateQuery, [updateData, projectId], (err, result) => {
    if (err) {
      console.error('Error updating project:', err);
      return res.status(500).json({ error: 'Failed to update the project.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ message: 'Project updated successfully.' });
  });
});

// DELETE route to delete a project by its ID
app.delete('/projects/:id', (req, res) => {
  const projectId = req.params.id;

  const deleteQuery = 'DELETE FROM projects WHERE id = ?';

  pool.query(deleteQuery, [projectId], (err, result) => {
    if (err) {
      console.error('Error deleting project:', err);
      return res.status(500).json({ error: 'Failed to delete the project.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ message: 'Project deleted successfully.' });
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
