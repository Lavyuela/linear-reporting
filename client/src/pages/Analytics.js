import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorMode,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  HStack,
  VStack,
  Badge,
  Divider,
  Input,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import useApi from '../hooks/useApi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { colorMode } = useColorMode();
  const { data: analyticsData, loading, error } = useApi('/api/powerbi/data');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Helper function to check if date is in range
  const isInDateRange = (dateString) => {
    if (!dateString) return true;
    if (dateRange === 'all') return true;

    const date = new Date(dateString);
    const now = new Date();
    
    if (dateRange === 'custom') {
      if (!customStartDate && !customEndDate) return true;
      const start = customStartDate ? new Date(customStartDate) : new Date('1900-01-01');
      const end = customEndDate ? new Date(customEndDate) : new Date('2100-12-31');
      return date >= start && date <= end;
    }

    const daysAgo = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      '180days': 180,
      '365days': 365,
    }[dateRange];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    return date >= cutoffDate;
  };

  // Filter data by selected team and date range
  const filteredProjects = analyticsData?.Projects?.filter(p => {
    const teamMatch = selectedTeam === 'all' || p.TeamNames.includes(selectedTeam);
    const dateMatch = isInDateRange(p.CreatedAt) || isInDateRange(p.UpdatedAt);
    return teamMatch && dateMatch;
  }) || [];

  const filteredIssues = analyticsData?.Issues?.filter(i => {
    const teamMatch = selectedTeam === 'all' || i.TeamName === selectedTeam;
    const dateMatch = isInDateRange(i.CreatedAt) || isInDateRange(i.UpdatedAt);
    return teamMatch && dateMatch;
  }) || [];

  // Chart colors based on theme
  const chartColors = {
    primary: colorMode === 'dark' ? '#63B3ED' : '#3182CE',
    success: colorMode === 'dark' ? '#68D391' : '#38A169',
    warning: colorMode === 'dark' ? '#F6AD55' : '#DD6B20',
    danger: colorMode === 'dark' ? '#FC8181' : '#E53E3E',
    info: colorMode === 'dark' ? '#76E4F7' : '#00B5D8',
    purple: colorMode === 'dark' ? '#B794F4' : '#805AD5',
  };

  const gridColor = colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = colorMode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

  // Project Status Distribution
  const projectStatusData = {
    labels: ['Active', 'Completed', 'Canceled', 'Paused'],
    datasets: [{
      data: [
        filteredProjects.filter(p => p.State === 'started' || p.State === 'planned').length,
        filteredProjects.filter(p => p.State === 'completed').length,
        filteredProjects.filter(p => p.State === 'canceled').length,
        filteredProjects.filter(p => p.State === 'paused').length,
      ],
      backgroundColor: [chartColors.primary, chartColors.success, chartColors.danger, chartColors.warning],
      borderWidth: 2,
      borderColor: colorMode === 'dark' ? '#1A202C' : '#FFFFFF',
    }]
  };

  // Progress Distribution
  const progressRanges = {
    '0-20%': filteredProjects.filter(p => p.ProgressPercent <= 20).length,
    '21-40%': filteredProjects.filter(p => p.ProgressPercent > 20 && p.ProgressPercent <= 40).length,
    '41-60%': filteredProjects.filter(p => p.ProgressPercent > 40 && p.ProgressPercent <= 60).length,
    '61-80%': filteredProjects.filter(p => p.ProgressPercent > 60 && p.ProgressPercent <= 80).length,
    '81-100%': filteredProjects.filter(p => p.ProgressPercent > 80).length,
  };

  const progressDistributionData = {
    labels: Object.keys(progressRanges),
    datasets: [{
      label: 'Number of Projects',
      data: Object.values(progressRanges),
      backgroundColor: [chartColors.danger, chartColors.warning, chartColors.warning, chartColors.primary, chartColors.success],
      borderRadius: 5,
    }]
  };

  // Team Performance
  const teamData = {};
  analyticsData?.Teams?.forEach(team => {
    const teamProjects = analyticsData.Projects.filter(p => p.TeamNames.includes(team.TeamName));
    teamData[team.TeamName] = {
      active: teamProjects.filter(p => p.State !== 'completed' && p.State !== 'canceled').length,
      completed: teamProjects.filter(p => p.State === 'completed').length,
    };
  });

  const teamPerformanceData = {
    labels: Object.keys(teamData),
    datasets: [
      {
        label: 'Active Projects',
        data: Object.values(teamData).map(t => t.active),
        backgroundColor: chartColors.primary,
        borderRadius: 5,
      },
      {
        label: 'Completed Projects',
        data: Object.values(teamData).map(t => t.completed),
        backgroundColor: chartColors.success,
        borderRadius: 5,
      }
    ]
  };

  // Issue State Distribution
  const issueStateData = {
    labels: ['Todo', 'In Progress', 'Completed', 'Canceled'],
    datasets: [{
      data: [
        filteredIssues.filter(i => i.StateType === 'unstarted').length,
        filteredIssues.filter(i => i.StateType === 'started').length,
        filteredIssues.filter(i => i.StateType === 'completed').length,
        filteredIssues.filter(i => i.StateType === 'canceled').length,
      ],
      backgroundColor: [chartColors.warning, chartColors.info, chartColors.success, chartColors.danger],
      borderWidth: 2,
      borderColor: colorMode === 'dark' ? '#1A202C' : '#FFFFFF',
    }]
  };

  // Velocity & Cycle Time
  const completedIssues = filteredIssues.filter(i => i.DaysToComplete !== null);
  const avgCycleTime = completedIssues.length > 0 
    ? Math.round(completedIssues.reduce((sum, i) => sum + i.DaysToComplete, 0) / completedIssues.length)
    : 0;

  const totalEstimate = filteredIssues.reduce((sum, i) => sum + (i.Estimate || 0), 0);
  const completedEstimate = filteredIssues.filter(i => i.StateType === 'completed').reduce((sum, i) => sum + (i.Estimate || 0), 0);
  const velocity = completedIssues.length > 0 
    ? (completedEstimate / completedIssues.reduce((sum, i) => sum + i.DaysToComplete, 0)).toFixed(2)
    : 0;

  // Deadline Status
  const deadlineStats = {
    overdue: filteredProjects.filter(p => p.DeadlineStatus === 'Overdue').length,
    dueSoon: filteredProjects.filter(p => p.DeadlineStatus === 'Due Soon').length,
    onTrack: filteredProjects.filter(p => p.DeadlineStatus === 'On Track').length,
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: "'Inter', sans-serif", size: 12 },
          padding: 15,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } }
      },
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: "'Inter', sans-serif", size: 12 },
          padding: 15,
        }
      },
    }
  };

  if (loading) {
    return (
      <Container maxW="1400px" py={8}>
        <Skeleton height="40px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" />)}
        </SimpleGrid>
        <Skeleton height="400px" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="1400px" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error Loading Analytics</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1400px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <Box mb={4}>
          <Heading size="xl" mb={2}>📊 BI Analytics</Heading>
          <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
            Advanced insights and data visualization
          </Text>
        </Box>

        {/* Filters */}
        <Card mb={4}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} flexWrap="wrap">
                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">Team</Text>
                  <Select 
                    value={selectedTeam} 
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    minW="200px"
                  >
                    <option value="all">All Teams</option>
                    {analyticsData?.Teams?.map(team => (
                      <option key={team.TeamId} value={team.TeamName}>{team.TeamName}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">Date Range</Text>
                  <Select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    minW="200px"
                  >
                    <option value="all">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="180days">Last 6 Months</option>
                    <option value="365days">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </Select>
                </Box>

                {dateRange === 'custom' && (
                  <>
                    <Box>
                      <Text fontSize="sm" mb={2} fontWeight="medium">Start Date</Text>
                      <Input 
                        type="date" 
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        maxW="200px"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="sm" mb={2} fontWeight="medium">End Date</Text>
                      <Input 
                        type="date" 
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        maxW="200px"
                      />
                    </Box>
                  </>
                )}
              </HStack>

              <HStack>
                <Badge colorScheme="blue">
                  {filteredProjects.length} Projects
                </Badge>
                <Badge colorScheme="green">
                  {filteredIssues.length} Issues
                </Badge>
                {dateRange !== 'all' && (
                  <Badge colorScheme="purple">
                    Filtered by: {dateRange === 'custom' ? 'Custom Range' : dateRange.replace('days', ' Days')}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Projects</StatLabel>
              <StatNumber>{filteredProjects.length}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {Math.round((filteredProjects.filter(p => p.State === 'completed').length / filteredProjects.length) * 100)}% completed
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg Cycle Time</StatLabel>
              <StatNumber>{avgCycleTime} days</StatNumber>
              <StatHelpText>
                Per completed issue
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Velocity</StatLabel>
              <StatNumber>{velocity} pts/day</StatNumber>
              <StatHelpText>
                Story points per day
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>At Risk</StatLabel>
              <StatNumber color="red.500">{deadlineStats.overdue + deadlineStats.dueSoon}</StatNumber>
              <StatHelpText>
                {deadlineStats.overdue} overdue, {deadlineStats.dueSoon} due soon
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Projects</Tab>
          <Tab>Issues</Tab>
          <Tab>Teams</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Project Status Distribution</Heading>
                  <Box height="300px">
                    <Doughnut data={projectStatusData} options={doughnutOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Issue State Distribution</Heading>
                  <Box height="300px">
                    <Doughnut data={issueStateData} options={doughnutOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Project Progress Distribution</Heading>
                  <Box height="300px">
                    <Bar data={progressDistributionData} options={chartOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Team Performance</Heading>
                  <Box height="300px">
                    <Bar data={teamPerformanceData} options={chartOptions} />
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Deadline Status</Heading>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <HStack>
                        <Badge colorScheme="red">Overdue</Badge>
                        <Text>{deadlineStats.overdue} projects</Text>
                      </HStack>
                      <Text fontWeight="bold">{Math.round((deadlineStats.overdue / filteredProjects.length) * 100)}%</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <HStack>
                        <Badge colorScheme="orange">Due Soon</Badge>
                        <Text>{deadlineStats.dueSoon} projects</Text>
                      </HStack>
                      <Text fontWeight="bold">{Math.round((deadlineStats.dueSoon / filteredProjects.length) * 100)}%</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <HStack>
                        <Badge colorScheme="green">On Track</Badge>
                        <Text>{deadlineStats.onTrack} projects</Text>
                      </HStack>
                      <Text fontWeight="bold">{Math.round((deadlineStats.onTrack / filteredProjects.length) * 100)}%</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Average Progress by State</Heading>
                  <VStack align="stretch" spacing={4}>
                    {['started', 'planned', 'completed'].map(state => {
                      const stateProjects = filteredProjects.filter(p => p.State === state);
                      const avgProgress = stateProjects.length > 0
                        ? Math.round(stateProjects.reduce((sum, p) => sum + p.ProgressPercent, 0) / stateProjects.length)
                        : 0;
                      return (
                        <Box key={state}>
                          <HStack justify="space-between" mb={2}>
                            <Text textTransform="capitalize">{state}</Text>
                            <Text fontWeight="bold">{avgProgress}%</Text>
                          </HStack>
                          <Box bg={colorMode === 'dark' ? 'gray.700' : 'gray.200'} borderRadius="full" h="8px">
                            <Box 
                              bg={chartColors.primary} 
                              borderRadius="full" 
                              h="8px" 
                              w={`${avgProgress}%`}
                              transition="width 0.3s"
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Issues Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Issue Metrics</Heading>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <Text>Total Issues</Text>
                      <Text fontWeight="bold">{filteredIssues.length}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text>Total Estimate Points</Text>
                      <Text fontWeight="bold">{totalEstimate}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text>Completed Points</Text>
                      <Text fontWeight="bold" color="green.500">{completedEstimate}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text>Completion Rate</Text>
                      <Text fontWeight="bold">{Math.round((completedEstimate / totalEstimate) * 100)}%</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Priority Distribution</Heading>
                  <VStack align="stretch" spacing={3}>
                    {[4, 3, 2, 1, 0].map(priority => {
                      const count = filteredIssues.filter(i => i.Priority === priority).length;
                      const labels = ['None', 'Low', 'Medium', 'High', 'Urgent'];
                      const colors = ['gray', 'blue', 'yellow', 'orange', 'red'];
                      return (
                        <HStack key={priority} justify="space-between">
                          <HStack>
                            <Badge colorScheme={colors[priority]}>{labels[priority]}</Badge>
                            <Text>{count} issues</Text>
                          </HStack>
                          <Text fontWeight="bold">{Math.round((count / filteredIssues.length) * 100)}%</Text>
                        </HStack>
                      );
                    })}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Teams Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Team Statistics</Heading>
                  <VStack align="stretch" spacing={4}>
                    {analyticsData?.Teams?.map(team => {
                      const teamProjects = analyticsData.Projects.filter(p => p.TeamNames.includes(team.TeamName));
                      const teamIssues = analyticsData.Issues.filter(i => i.TeamName === team.TeamName);
                      const completionRate = teamProjects.length > 0
                        ? Math.round((teamProjects.filter(p => p.State === 'completed').length / teamProjects.length) * 100)
                        : 0;
                      
                      return (
                        <Box key={team.TeamId} p={4} borderWidth="1px" borderRadius="lg">
                          <HStack justify="space-between" mb={3}>
                            <Heading size="sm">{team.TeamName}</Heading>
                            <Badge colorScheme="purple">{completionRate}% complete</Badge>
                          </HStack>
                          <SimpleGrid columns={3} spacing={4}>
                            <Box>
                              <Text fontSize="sm" color="gray.500">Projects</Text>
                              <Text fontSize="xl" fontWeight="bold">{teamProjects.length}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="sm" color="gray.500">Issues</Text>
                              <Text fontSize="xl" fontWeight="bold">{teamIssues.length}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="sm" color="gray.500">Avg Progress</Text>
                              <Text fontSize="xl" fontWeight="bold">
                                {teamProjects.length > 0 
                                  ? Math.round(teamProjects.reduce((sum, p) => sum + p.ProgressPercent, 0) / teamProjects.length)
                                  : 0}%
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </Box>
                      );
                    })}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Analytics;
