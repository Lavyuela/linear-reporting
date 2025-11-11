const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Linear API client
const linearClient = axios.create({
  baseURL: 'https://api.linear.app/graphql',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.LINEAR_API_KEY
  }
});

// Debug request/response
linearClient.interceptors.request.use(request => {
  console.log('Linear API Request:', JSON.stringify(request.data));
  return request;
});

linearClient.interceptors.response.use(
  response => {
    console.log('Linear API Response Status:', response.status);
    return response;
  },
  error => {
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Linear API Error Details:', JSON.stringify(error.response.data.errors, null, 2));
    }
    console.error('Linear API Error:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
    return Promise.reject(error);
  }
);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test Linear API connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const query = `
      query {
        viewer {
          id
          name
          email
        }
      }
    `;

    console.log('Testing Linear API connection with key:', process.env.LINEAR_API_KEY.substring(0, 10) + '...');
    const response = await linearClient.post('', { query });
    
    if (response.data.errors) {
      console.error('Linear API test returned errors:', response.data.errors);
      return res.status(500).json({ error: 'Linear API test failed', details: response.data.errors });
    }
    
    res.json({ success: true, user: response.data.data.viewer });
  } catch (error) {
    console.error('Error testing Linear API connection:', error.message);
    res.status(500).json({ error: 'Failed to connect to Linear API', message: error.message });
  }
});

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    // Using the correct Linear API query format
    const query = `
      query Teams {
        teams {
          nodes {
            id
            name
            key
            description
            color
          }
        }
      }
    `;

    const response = await linearClient.post('', { query });
    
    if (response.data.errors) {
      console.error('Linear API returned errors:', response.data.errors);
      return res.status(500).json({ error: 'Linear API returned errors', details: response.data.errors });
    }
    
    res.json(response.data.data.teams.nodes);
  } catch (error) {
    console.error('Error fetching teams:', error.message);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get projects
app.get('/api/projects', async (req, res) => {
  try {
    const query = `
      query Projects {
        projects {
          nodes {
            id
            name
            description
            state
            progress
            startDate
            targetDate
            teams {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    const response = await linearClient.post('', { query });
    
    if (response.data.errors) {
      console.error('Linear API returned errors:', response.data.errors);
      return res.status(500).json({ error: 'Linear API returned errors', details: response.data.errors });
    }
    
    // Get projects and sort by target date (end date)
    const projects = response.data.data.projects.nodes;
    
    // Sort projects: ongoing projects with target dates first, then completed projects, then projects without target dates
    const sortedProjects = projects.sort((a, b) => {
      const aIsCompleted = a.state === 'completed' || a.state === 'canceled';
      const bIsCompleted = b.state === 'completed' || b.state === 'canceled';
      
      // If one is completed and the other is not, the ongoing one comes first
      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;
      
      // If both are ongoing or both are completed, sort by target date
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate) - new Date(b.targetDate);
      }
      
      // If only one has a target date, it comes first
      if (a.targetDate && !b.targetDate) return -1;
      if (!a.targetDate && b.targetDate) return 1;
      
      // If neither has a target date, sort by start date if available
      if (a.startDate && b.startDate) {
        return new Date(a.startDate) - new Date(b.startDate);
      }
      
      // Otherwise keep original order
      return 0;
    });
    
    res.json(sortedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project details with issues
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const query = `
      query ProjectDetails($id: String!) {
        project(id: $id) {
          id
          name
          description
          state
          progress
          startDate
          targetDate
          teams {
            nodes {
              id
              name
            }
          }
          issues {
            nodes {
              id
              title
              description
              state {
                name
                type
              }
              assignee {
                name
              }
              priority
              estimate
              labels {
                nodes {
                  name
                  color
                }
              }
            }
          }
        }
      }
    `;

    const variables = { id: projectId };

    const response = await linearClient.post('', { query, variables });
    
    if (response.data.errors) {
      console.error('Linear API returned errors:', response.data.errors);
      return res.status(500).json({ error: 'Linear API returned errors', details: response.data.errors });
    }
    
    res.json(response.data.data.project);
  } catch (error) {
    console.error(`Error fetching project ${req.params.projectId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// Get project summary statistics
app.get('/api/projects/:projectId/summary', async (req, res) => {
  try {
    const { projectId } = req.params;
    const query = `
      query ProjectSummary($id: String!) {
        project(id: $id) {
          id
          name
          progress
          issues {
            nodes {
              state {
                name
                type
              }
              estimate
            }
          }
        }
      }
    `;

    const variables = { id: projectId };

    const response = await linearClient.post('', { query, variables });
    
    if (response.data.errors) {
      console.error('Linear API returned errors:', response.data.errors);
      return res.status(500).json({ error: 'Linear API returned errors', details: response.data.errors });
    }
    
    const project = response.data.data.project;
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const issues = project.issues.nodes;
    
    // Calculate summary statistics
    const totalIssues = issues.length;
    const completedIssues = issues.filter(issue => issue.state.type === 'completed').length;
    const inProgressIssues = issues.filter(issue => issue.state.type === 'started').length;
    const todoIssues = issues.filter(issue => issue.state.type === 'unstarted').length;
    const canceledIssues = issues.filter(issue => issue.state.type === 'canceled').length;
    
    // Calculate total and completed estimates
    const totalEstimate = issues.reduce((sum, issue) => sum + (issue.estimate || 0), 0);
    const completedEstimate = issues
      .filter(issue => issue.state.type === 'completed')
      .reduce((sum, issue) => sum + (issue.estimate || 0), 0);
    
    res.json({
      id: project.id,
      name: project.name,
      progress: project.progress,
      totalIssues,
      completedIssues,
      inProgressIssues,
      todoIssues,
      canceledIssues,
      totalEstimate,
      completedEstimate,
      estimateProgress: totalEstimate > 0 ? (completedEstimate / totalEstimate) * 100 : 0
    });
  } catch (error) {
    console.error(`Error fetching project summary ${req.params.projectId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch project summary' });
  }
});

// Power BI Analytics Endpoints
const { fetchLinearData, transformForPowerBI } = require('./export-powerbi');

// Get all data for Power BI (JSON format)
app.get('/api/powerbi/data', async (req, res) => {
  try {
    console.log('Fetching data for Power BI...');
    const rawData = await fetchLinearData();
    const transformedData = transformForPowerBI(rawData);
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching Power BI data:', error.message);
    res.status(500).json({ error: 'Failed to fetch Power BI data' });
  }
});

// Get projects data for Power BI
app.get('/api/powerbi/projects', async (req, res) => {
  try {
    const rawData = await fetchLinearData();
    const transformedData = transformForPowerBI(rawData);
    res.json(transformedData.Projects);
  } catch (error) {
    console.error('Error fetching projects for Power BI:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects data' });
  }
});

// Get issues data for Power BI
app.get('/api/powerbi/issues', async (req, res) => {
  try {
    const rawData = await fetchLinearData();
    const transformedData = transformForPowerBI(rawData);
    res.json(transformedData.Issues);
  } catch (error) {
    console.error('Error fetching issues for Power BI:', error.message);
    res.status(500).json({ error: 'Failed to fetch issues data' });
  }
});

// Get teams data for Power BI
app.get('/api/powerbi/teams', async (req, res) => {
  try {
    const rawData = await fetchLinearData();
    const transformedData = transformForPowerBI(rawData);
    res.json(transformedData.Teams);
  } catch (error) {
    console.error('Error fetching teams for Power BI:', error.message);
    res.status(500).json({ error: 'Failed to fetch teams data' });
  }
});

// Get metrics for Power BI
app.get('/api/powerbi/metrics', async (req, res) => {
  try {
    const rawData = await fetchLinearData();
    const transformedData = transformForPowerBI(rawData);
    res.json(transformedData.Metrics[0]);
  } catch (error) {
    console.error('Error fetching metrics for Power BI:', error.message);
    res.status(500).json({ error: 'Failed to fetch metrics data' });
  }
});

// Serve static assets
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
