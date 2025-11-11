const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const linearClient = axios.create({
  baseURL: 'https://api.linear.app/graphql',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.LINEAR_API_KEY
  }
});

const query = `
  query {
    projects {
      nodes {
        id
        name
        teams {
          nodes {
            id
            name
          }
        }
      }
    }
    teams {
      nodes {
        id
        name
        key
      }
    }
  }
`;

linearClient.post('', { query })
  .then(res => {
    const data = res.data.data;
    
    console.log('\n=== ALL TEAMS ===');
    data.teams.nodes.forEach(team => {
      console.log(`${team.name} (${team.key}) - ID: ${team.id}`);
    });
    
    console.log('\n=== PROJECTS AND THEIR TEAMS ===');
    data.projects.nodes.forEach(project => {
      console.log(`\n${project.name}`);
      if (project.teams.nodes.length > 0) {
        project.teams.nodes.forEach(team => {
          console.log(`  → ${team.name}`);
        });
      } else {
        console.log('  → No teams assigned');
      }
    });
    
    console.log('\n=== TEAM PROJECT COUNTS ===');
    data.teams.nodes.forEach(team => {
      const projectCount = data.projects.nodes.filter(p => 
        p.teams.nodes.some(t => t.id === team.id)
      ).length;
      console.log(`${team.name}: ${projectCount} projects`);
    });
    
  })
  .catch(err => {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Details:', err.response.data);
    }
  });
