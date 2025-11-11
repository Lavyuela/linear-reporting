import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, useColorMode } from '@chakra-ui/react';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import Header from './components/Header';

const BackgroundEffect = () => {
  const { colorMode } = useColorMode();
  
  return colorMode === 'dark' ? (
    <>
      {/* Animated gradient orbs */}
      <Box
        position="fixed"
        top="10%"
        left="5%"
        width="300px"
        height="300px"
        borderRadius="full"
        background="radial-gradient(circle, rgba(0, 153, 255, 0.15) 0%, rgba(0, 153, 255, 0) 70%)"
        filter="blur(40px)"
        zIndex={0}
        animation="float 20s ease-in-out infinite"
        sx={{
          '@keyframes float': {
            '0%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(30px, -30px)' },
            '100%': { transform: 'translate(0, 0)' },
          },
        }}
      />
      <Box
        position="fixed"
        bottom="15%"
        right="10%"
        width="250px"
        height="250px"
        borderRadius="full"
        background="radial-gradient(circle, rgba(124, 0, 252, 0.15) 0%, rgba(124, 0, 252, 0) 70%)"
        filter="blur(40px)"
        zIndex={0}
        animation="float2 25s ease-in-out infinite"
        sx={{
          '@keyframes float2': {
            '0%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(-20px, 20px)' },
            '100%': { transform: 'translate(0, 0)' },
          },
        }}
      />
      
      {/* Grid pattern */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        opacity={0.05}
        backgroundImage={`url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0v1h20V0H0zm0 19v1h20v-1H0zm19 0h1V0h-1v19zM0 0h1v19H0V0z' fill='%23fff'/%3E%3C/svg%3E")`}
        backgroundSize="40px 40px"
        pointerEvents="none"
      />
    </>
  ) : null;
};

function App() {
  const { colorMode } = useColorMode();
  
  return (
    <Router>
      <Box 
        minH="100vh" 
        bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
        backgroundImage={colorMode === 'dark' 
          ? 'linear-gradient(to bottom right, rgba(0, 153, 255, 0.05), rgba(124, 0, 252, 0.05))'
          : 'none'}
        position="relative"
        overflow="hidden"
      >
        <BackgroundEffect />
        <Header />
        <Box 
          as="main" 
          p={4} 
          maxW="1400px" 
          mx="auto"
          position="relative"
          zIndex={1}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/analytics" element={<AdvancedAnalytics />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
