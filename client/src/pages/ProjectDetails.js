import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  Progress,
  Badge,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Tag,
  TagLabel,
  Tooltip,
  useColorMode,
  Container,
  Icon,
  Grid,
  GridItem,
  Circle,
} from '@chakra-ui/react';
import { FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import useApi from '../hooks/useApi';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ProjectDetails = () => {
  const { colorMode } = useColorMode();
  const { projectId } = useParams();
  const { data: project, loading: projectLoading, error: projectError } = useApi(`/api/projects/${projectId}`);
  const { data: summary, loading: summaryLoading, error: summaryError } = useApi(`/api/projects/${projectId}/summary`);
  const [activeTab, setActiveTab] = useState(0);

  const loading = projectLoading || summaryLoading;
  const error = projectError || summaryError;

  // Helper function to extract first name from email
  const maskEmail = (name) => {
    if (!name) return '-';
    // Check if the name contains an @ symbol (email format)
    if (name.includes('@')) {
      const [localPart] = name.split('@');
      // Extract first name (part before dot or dash)
      const firstName = localPart.split(/[._-]/)[0];
      // Capitalize first letter
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    return name;
  };

  // Prepare chart data
  const issueStatusData = summary ? {
    labels: ['Completed', 'In Progress', 'To Do', 'Canceled'],
    datasets: [
      {
        data: [
          summary.completedIssues,
          summary.inProgressIssues,
          summary.todoIssues,
          summary.canceledIssues,
        ],
        backgroundColor: colorMode === 'dark' ? [
          'rgba(72, 187, 120, 0.8)',
          'rgba(66, 153, 225, 0.8)',
          'rgba(237, 137, 54, 0.8)',
          'rgba(229, 62, 62, 0.8)',
        ] : [
          'rgba(72, 187, 120, 0.7)',
          'rgba(66, 153, 225, 0.7)',
          'rgba(237, 137, 54, 0.7)',
          'rgba(229, 62, 62, 0.7)',
        ],
        borderColor: colorMode === 'dark' ? [
          'rgba(72, 187, 120, 1)',
          'rgba(66, 153, 225, 1)',
          'rgba(237, 137, 54, 1)',
          'rgba(229, 62, 62, 1)',
        ] : [
          'rgba(72, 187, 120, 1)',
          'rgba(66, 153, 225, 1)',
          'rgba(237, 137, 54, 1)',
          'rgba(229, 62, 62, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  } : null;

  // Bar chart data for issue distribution
  const issueDistributionData = summary ? {
    labels: ['Completed', 'In Progress', 'To Do', 'Canceled'],
    datasets: [
      {
        label: 'Issues',
        data: [
          summary.completedIssues,
          summary.inProgressIssues,
          summary.todoIssues,
          summary.canceledIssues,
        ],
        backgroundColor: colorMode === 'dark' ? [
          'rgba(72, 187, 120, 0.8)',
          'rgba(66, 153, 225, 0.8)',
          'rgba(237, 137, 54, 0.8)',
          'rgba(229, 62, 62, 0.8)',
        ] : [
          'rgba(72, 187, 120, 0.7)',
          'rgba(66, 153, 225, 0.7)',
          'rgba(237, 137, 54, 0.7)',
          'rgba(229, 62, 62, 0.7)',
        ],
        borderRadius: 6,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: colorMode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        bodyColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        boxPadding: 8,
        cornerRadius: 8,
        titleFont: {
          family: "'Montserrat', sans-serif",
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        displayColors: true,
        borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    },
  };
  
  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    },
  };

  // Get issue status color
  const getStatusColor = (statusType) => {
    switch (statusType) {
      case 'completed':
        return 'green';
      case 'started':
        return 'blue';
      case 'unstarted':
        return 'orange';
      case 'canceled':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get priority display
  const getPriorityDisplay = (priority) => {
    switch (priority) {
      case 0:
        return { label: 'No Priority', color: 'gray' };
      case 1:
        return { label: 'Urgent', color: 'red' };
      case 2:
        return { label: 'High', color: 'orange' };
      case 3:
        return { label: 'Medium', color: 'yellow' };
      case 4:
        return { label: 'Low', color: 'green' };
      default:
        return { label: 'Unknown', color: 'gray' };
    }
  };

  return (
    <Box>
      <Button
        as={RouterLink}
        to="/"
        leftIcon={<FaArrowLeft />}
        variant={colorMode === 'dark' ? 'neon' : 'outline'}
        colorScheme={colorMode === 'dark' ? undefined : 'gray'}
        mb={6}
        borderRadius="full"
        size="sm"
      >
        Back to Dashboard
      </Button>

      {error && (
        <Alert 
          status="error" 
          mb={6} 
          borderRadius="lg" 
          variant={colorMode === 'dark' ? 'solid' : 'subtle'}
        >
          <AlertIcon />
          <AlertTitle>Error loading project!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <VStack spacing={6} align="stretch">
          <Box 
            borderRadius="xl" 
            overflow="hidden" 
            bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
            p={6}
            boxShadow={colorMode === 'dark' 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
            backdropFilter="blur(10px)"
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
          >
            <Skeleton 
              height="60px" 
              startColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
              endColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
              borderRadius="lg"
            />
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box 
              borderRadius="xl" 
              overflow="hidden" 
              bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
              p={6}
              boxShadow={colorMode === 'dark' 
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
              backdropFilter="blur(10px)"
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
            >
              <Skeleton 
                height="200px" 
                startColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                endColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                borderRadius="lg"
              />
            </Box>
            <Box 
              borderRadius="xl" 
              overflow="hidden" 
              bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
              p={6}
              boxShadow={colorMode === 'dark' 
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
              backdropFilter="blur(10px)"
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
            >
              <Skeleton 
                height="200px" 
                startColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                endColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                borderRadius="lg"
              />
            </Box>
          </SimpleGrid>
          
          <Box 
            borderRadius="xl" 
            overflow="hidden" 
            bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
            p={6}
            boxShadow={colorMode === 'dark' 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
            backdropFilter="blur(10px)"
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
          >
            <Skeleton 
              height="400px" 
              startColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
              endColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
              borderRadius="lg"
            />
          </Box>
        </VStack>
      ) : project ? (
        <>
          <Box 
            position="relative" 
            mb={8} 
            borderRadius="xl" 
            overflow="hidden"
            bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
            boxShadow={colorMode === 'dark' 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
            backdropFilter="blur(10px)"
            p={6}
          >
            <Box 
              position="absolute" 
              top={0} 
              left={0} 
              right={0} 
              h="4px" 
              bgGradient={colorMode === 'dark' 
                ? 'linear(to-r, brand.500, accent.500)' 
                : 'linear(to-r, brand.400, accent.400)'} 
            />
            
            <Flex
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap={4}
              mb={4}
            >
              <Box>
                <HStack mb={2} align="center">
                  <Heading 
                    size="xl" 
                    bgGradient={colorMode === 'dark' 
                      ? 'linear(to-r, gray.100, gray.300)' 
                      : 'linear(to-r, gray.700, gray.900)'}
                    bgClip="text"
                    fontWeight="bold"
                    letterSpacing="tight"
                  >
                    {project.name}
                  </Heading>
                  <Badge 
                    colorScheme={project.state === 'completed' ? 'green' : project.state === 'canceled' ? 'red' : 'blue'} 
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                    variant={colorMode === 'dark' ? 'solid' : 'subtle'}
                  >
                    {project.state}
                  </Badge>
                </HStack>
                <Text 
                  color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                  fontSize="md"
                  maxW="700px"
                >
                  {project.description || 'No description'}
                </Text>
              </Box>

              <HStack spacing={2} flexWrap="wrap">
                {project.teams.nodes.map(team => (
                  <Tag 
                    key={team.id} 
                    size="md" 
                    colorScheme={colorMode === 'dark' ? 'cyan' : 'brand'} 
                    borderRadius="full"
                    px={3}
                    py={1}
                    variant={colorMode === 'dark' ? 'solid' : 'subtle'}
                  >
                    <TagLabel>{team.name}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            </Flex>
            
            {/* Project timeline info */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mt={4}>
              <Box 
                p={3} 
                borderRadius="md" 
                bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
              >
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Start Date</Text>
                <Text fontSize="md" fontWeight="medium">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                </Text>
              </Box>
              
              <Box 
                p={3} 
                borderRadius="md" 
                bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
              >
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Target Date</Text>
                <Text fontSize="md" fontWeight="medium">
                  {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'Not set'}
                </Text>
              </Box>
              
              <Box 
                p={3} 
                borderRadius="md" 
                bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
              >
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Progress</Text>
                <Flex align="center" justify="space-between">
                  <Text fontSize="md" fontWeight="medium">
                    {Math.round((project.progress || 0) * 100)}%
                  </Text>
                  <Box w="100px" ml={2}>
                    <Progress 
                      value={(project.progress || 0) * 100} 
                      size="sm" 
                      borderRadius="full" 
                      colorScheme="brand"
                      sx={{
                        '& > div': {
                          background: colorMode === 'dark' 
                            ? 'linear-gradient(90deg, #0099ff, #7c00fc)' 
                            : 'linear-gradient(90deg, #0099ff, #7c00fc)',
                        }
                      }}
                    />
                  </Box>
                </Flex>
              </Box>
              
              <Box 
                p={3} 
                borderRadius="md" 
                bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
              >
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Status</Text>
                <Flex align="center">
                  <Circle 
                    size="10px" 
                    bg={project.state === 'completed' 
                      ? 'green.400' 
                      : project.state === 'canceled' 
                        ? 'red.400' 
                        : project.state === 'started' 
                          ? 'blue.400' 
                          : 'orange.400'} 
                    mr={2} 
                  />
                  <Text fontSize="md" fontWeight="medium" textTransform="capitalize">
                    {project.state}
                  </Text>
                </Flex>
              </Box>
            </SimpleGrid>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Box 
              borderRadius="xl" 
              overflow="hidden"
              bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
              boxShadow={colorMode === 'dark' 
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
              backdropFilter="blur(10px)"
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
              p={6}
              transition="all 0.3s ease"
              _hover={{ 
                transform: 'translateY(-5px)', 
                boxShadow: colorMode === 'dark' 
                  ? '0 15px 35px 0 rgba(0, 0, 0, 0.4)' 
                  : '0 15px 35px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <VStack align="stretch" spacing={5}>
                <Heading 
                  size="md" 
                  fontWeight="semibold"
                  bgGradient={colorMode === 'dark' 
                    ? 'linear(to-r, brand.300, brand.100)' 
                    : 'linear(to-r, brand.600, brand.400)'}
                  bgClip="text"
                >
                  Issue Distribution
                </Heading>
                
                <Box height="250px" position="relative">
                  {issueStatusData && <Doughnut data={issueStatusData} options={chartOptions} />}
                  {summary && (
                    <Flex 
                      position="absolute" 
                      top="50%" 
                      left="50%" 
                      transform="translate(-50%, -50%)" 
                      direction="column" 
                      align="center"
                      justify="center"
                      pointerEvents="none"
                      zIndex={1}
                    >
                      <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Total</Text>
                      <Text fontSize="2xl" fontWeight="bold">{summary.totalIssues}</Text>
                    </Flex>
                  )}
                </Box>
                
                {summary && (
                  <SimpleGrid columns={2} spacing={4}>
                    <Box 
                      p={3} 
                      borderRadius="md" 
                      bg={colorMode === 'dark' ? 'green.900' : 'green.50'}
                      borderWidth="1px"
                      borderColor={colorMode === 'dark' ? 'green.800' : 'green.100'}
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'green.200' : 'green.600'}>Completed</Text>
                        <Circle size="8px" bg="green.400" />
                      </Flex>
                      <Text fontSize="xl" fontWeight="bold" color={colorMode === 'dark' ? 'green.200' : 'green.600'}>
                        {summary.completedIssues}
                      </Text>
                    </Box>
                    
                    <Box 
                      p={3} 
                      borderRadius="md" 
                      bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'}
                      borderWidth="1px"
                      borderColor={colorMode === 'dark' ? 'blue.800' : 'blue.100'}
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'blue.200' : 'blue.600'}>In Progress</Text>
                        <Circle size="8px" bg="blue.400" />
                      </Flex>
                      <Text fontSize="xl" fontWeight="bold" color={colorMode === 'dark' ? 'blue.200' : 'blue.600'}>
                        {summary.inProgressIssues}
                      </Text>
                    </Box>
                    
                    <Box 
                      p={3} 
                      borderRadius="md" 
                      bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'}
                      borderWidth="1px"
                      borderColor={colorMode === 'dark' ? 'orange.800' : 'orange.100'}
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'orange.200' : 'orange.600'}>To Do</Text>
                        <Circle size="8px" bg="orange.400" />
                      </Flex>
                      <Text fontSize="xl" fontWeight="bold" color={colorMode === 'dark' ? 'orange.200' : 'orange.600'}>
                        {summary.todoIssues}
                      </Text>
                    </Box>
                    
                    <Box 
                      p={3} 
                      borderRadius="md" 
                      bg={colorMode === 'dark' ? 'red.900' : 'red.50'}
                      borderWidth="1px"
                      borderColor={colorMode === 'dark' ? 'red.800' : 'red.100'}
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'red.200' : 'red.600'}>Canceled</Text>
                        <Circle size="8px" bg="red.400" />
                      </Flex>
                      <Text fontSize="xl" fontWeight="bold" color={colorMode === 'dark' ? 'red.200' : 'red.600'}>
                        {summary.canceledIssues}
                      </Text>
                    </Box>
                  </SimpleGrid>
                )}
              </VStack>
            </Box>

            <Box 
              borderRadius="xl" 
              overflow="hidden"
              bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
              boxShadow={colorMode === 'dark' 
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
              backdropFilter="blur(10px)"
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
              p={6}
              transition="all 0.3s ease"
              _hover={{ 
                transform: 'translateY(-5px)', 
                boxShadow: colorMode === 'dark' 
                  ? '0 15px 35px 0 rgba(0, 0, 0, 0.4)' 
                  : '0 15px 35px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <VStack align="stretch" spacing={5}>
                <Heading 
                  size="md" 
                  fontWeight="semibold"
                  bgGradient={colorMode === 'dark' 
                    ? 'linear(to-r, accent.300, accent.100)' 
                    : 'linear(to-r, accent.600, accent.400)'}
                  bgClip="text"
                >
                  Project Metrics
                </Heading>
                
                {summary && (
                  <>
                    <Box height="250px">
                      <Bar data={issueDistributionData} options={barChartOptions} />
                    </Box>
                    
                    <SimpleGrid columns={1} spacing={4}>
                      <Box 
                        p={4} 
                        borderRadius="md" 
                        bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
                      >
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mb={1}>Completion Rate</Text>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontSize="xl" fontWeight="bold">
                            {summary.totalIssues > 0 ? Math.round((summary.completedIssues / summary.totalIssues) * 100) : 0}%
                          </Text>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                            {summary.completedIssues} of {summary.totalIssues} issues
                          </Text>
                        </Flex>
                        <Progress 
                          value={summary.totalIssues > 0 ? (summary.completedIssues / summary.totalIssues) * 100 : 0} 
                          size="sm" 
                          borderRadius="full" 
                          colorScheme="green"
                        />
                      </Box>
                      
                      <Box 
                        p={4} 
                        borderRadius="md" 
                        bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
                      >
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mb={1}>Estimate Progress</Text>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontSize="xl" fontWeight="bold">
                            {Math.round(summary.estimateProgress)}%
                          </Text>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                            {summary.completedEstimate} / {summary.totalEstimate} points
                          </Text>
                        </Flex>
                        <Progress 
                          value={summary.estimateProgress} 
                          size="sm" 
                          borderRadius="full" 
                          colorScheme="blue"
                        />
                      </Box>
                    </SimpleGrid>
                  </>
                )}
              </VStack>
            </Box>
          </SimpleGrid>

          <Box 
            borderRadius="xl" 
            overflow="hidden"
            bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
            boxShadow={colorMode === 'dark' 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
            backdropFilter="blur(10px)"
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
            mb={8}
          >
            <Tabs 
              variant={colorMode === 'dark' ? 'soft-rounded' : 'enclosed'} 
              colorScheme="brand" 
              index={activeTab} 
              onChange={setActiveTab}
              p={4}
            >
              <TabList mb={4}>
                <Tab 
                  _selected={{ 
                    color: colorMode === 'dark' ? 'white' : 'brand.600',
                    bg: colorMode === 'dark' ? 'whiteAlpha.200' : 'brand.50',
                    fontWeight: 'semibold'
                  }}
                  borderRadius="full"
                  px={5}
                >
                  Issues
                </Tab>
                <Tab 
                  _selected={{ 
                    color: colorMode === 'dark' ? 'white' : 'brand.600',
                    bg: colorMode === 'dark' ? 'whiteAlpha.200' : 'brand.50',
                    fontWeight: 'semibold'
                  }}
                  borderRadius="full"
                  px={5}
                >
                  Timeline
                </Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0}>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th 
                            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                            borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                          >
                            Title
                          </Th>
                          <Th 
                            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                            borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                          >
                            Status
                          </Th>
                          <Th 
                            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                            borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                          >
                            Assignee
                          </Th>
                          <Th 
                            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                            borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                          >
                            Priority
                          </Th>
                          <Th 
                            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                            borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                          >
                            Estimate
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {project.issues.nodes.map(issue => {
                          const priority = getPriorityDisplay(issue.priority);
                          return (
                            <Tr key={issue.id}>
                              <Td 
                                borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                              >
                                <Tooltip 
                                  label={issue.description || 'No description'} 
                                  hasArrow 
                                  placement="top"
                                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.800'}
                                  color="white"
                                  px={3}
                                  py={2}
                                  borderRadius="md"
                                  fontSize="sm"
                                >
                                  <Text 
                                    noOfLines={1}
                                    fontWeight="medium"
                                    color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}
                                  >
                                    {issue.title}
                                  </Text>
                                </Tooltip>
                              </Td>
                              <Td 
                                borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                              >
                                <Badge 
                                  colorScheme={getStatusColor(issue.state.type)}
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                  variant={colorMode === 'dark' ? 'solid' : 'subtle'}
                                >
                                  {issue.state.name}
                                </Badge>
                              </Td>
                              <Td 
                                borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                                color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                              >
                                {maskEmail(issue.assignee?.name)}
                              </Td>
                              <Td 
                                borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                              >
                                <Badge 
                                  colorScheme={priority.color}
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                  variant={colorMode === 'dark' ? 'solid' : 'subtle'}
                                >
                                  {priority.label}
                                </Badge>
                              </Td>
                              <Td 
                                borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                                fontWeight="medium"
                                color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                              >
                                {issue.estimate || '-'}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
                
                <TabPanel px={0}>
                  <Box p={4} borderRadius="md" bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}>
                    <Flex align="center" mb={4}>
                      {project.state === 'completed' ? (
                        <Circle size="10px" bg="green.400" mr={2} />
                      ) : new Date(project.targetDate) < new Date() ? (
                        <Circle size="10px" bg="red.400" mr={2} />
                      ) : (
                        <Circle size="10px" bg="blue.400" mr={2} />
                      )}
                      <Text fontWeight="medium">
                        {project.state === 'completed' 
                          ? 'Project completed' 
                          : new Date(project.targetDate) < new Date()
                            ? 'Project is past due date'
                            : `${Math.ceil((new Date(project.targetDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`
                        }
                      </Text>
                    </Flex>
                    
                    <Box 
                      position="relative" 
                      h="8px" 
                      bg={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                      borderRadius="full"
                      mb={6}
                    >
                      <Box 
                        position="absolute"
                        top={0}
                        left={0}
                        h="100%"
                        w={`${(project.progress || 0) * 100}%`}
                        bg={colorMode === 'dark' 
                          ? 'linear-gradient(90deg, #0099ff, #7c00fc)' 
                          : 'linear-gradient(90deg, #0099ff, #7c00fc)'}
                        borderRadius="full"
                      />
                    </Box>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Box>
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mb={2}>Project Timeline</Text>
                        <VStack align="stretch" spacing={4} bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'white'} p={4} borderRadius="md">
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Start Date</Text>
                            <Text>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</Text>
                          </Flex>
                          <Divider borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'} />
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Target Date</Text>
                            <Text>{project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'Not set'}</Text>
                          </Flex>
                          <Divider borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'} />
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Duration</Text>
                            <Text>
                              {project.startDate && project.targetDate 
                                ? `${Math.ceil((new Date(project.targetDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))} days` 
                                : 'Unknown'}
                            </Text>
                          </Flex>
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mb={2}>Estimate Summary</Text>
                        <VStack align="stretch" spacing={4} bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'white'} p={4} borderRadius="md">
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Total Estimate</Text>
                            <Text>{summary ? summary.totalEstimate : '-'} points</Text>
                          </Flex>
                          <Divider borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'} />
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Completed</Text>
                            <Text>{summary ? summary.completedEstimate : '-'} points</Text>
                          </Flex>
                          <Divider borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'} />
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Remaining</Text>
                            <Text>
                              {summary 
                                ? (summary.totalEstimate - summary.completedEstimate) 
                                : '-'} points
                            </Text>
                          </Flex>
                        </VStack>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </>
      ) : (
        <Box 
          textAlign="center" 
          py={10} 
          px={6} 
          borderRadius="xl" 
          bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
          backdropFilter="blur(10px)"
          borderWidth="1px"
          borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
          boxShadow={colorMode === 'dark' 
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'}
        >
          <Circle 
            size="50px" 
            bg={colorMode === 'dark' ? 'orange.900' : 'orange.100'}
            color={colorMode === 'dark' ? 'orange.200' : 'orange.600'}
            mb={4}
            mx="auto"
          >
            <Box as="span" fontSize="2xl">⚠️</Box>
          </Circle>
          <Heading 
            as="h2" 
            size="lg" 
            mb={2}
            bgGradient={colorMode === 'dark' 
              ? 'linear(to-r, orange.200, yellow.200)' 
              : 'linear(to-r, orange.600, yellow.600)'}
            bgClip="text"
          >
            Project Not Found
          </Heading>
          <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} mb={6}>
            The project you're looking for doesn't exist or you don't have access to it.
          </Text>
          <Button 
            as={RouterLink}
            to="/"
            variant={colorMode === 'dark' ? 'neon' : 'solid'}
            colorScheme={colorMode === 'dark' ? undefined : 'brand'}
            leftIcon={<FaArrowLeft />}
            size="md"
            borderRadius="full"
          >
            Return to Dashboard
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ProjectDetails;
