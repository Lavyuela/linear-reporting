import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Icon,
  Flex,
  Avatar,
  AvatarGroup,
  Tooltip,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock, 
  FaFire,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaBolt,
  FaRocket,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import useApi from '../hooks/useApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const AdvancedAnalytics = () => {
  const { colorMode } = useColorMode();
  const { data: analyticsData, loading, error } = useApi('/api/powerbi/data');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { isOpen: isOpenHealth, onOpen: onOpenHealth, onClose: onCloseHealth } = useDisclosure();
  const { isOpen: isOpenOverdue, onOpen: onOpenOverdue, onClose: onCloseOverdue } = useDisclosure();
  const { isOpen: isOpenRisk, onOpen: onOpenRisk, onClose: onCloseRisk } = useDisclosure();
  const { isOpen: isOpenVelocity, onOpen: onOpenVelocity, onClose: onCloseVelocity } = useDisclosure();
  const toast = useToast();

  // Date filtering logic
  const isInDateRange = (dateString) => {
    if (!dateString) return true;
    if (dateRange === 'all') return true;

    const date = new Date(dateString);
    
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
    }[dateRange];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    return date >= cutoffDate;
  };

  // Advanced calculations
  const insights = useMemo(() => {
    if (!analyticsData) return null;

    const projects = analyticsData.Projects.filter(p => {
      const teamMatch = selectedTeam === 'all' || p.TeamNames.includes(selectedTeam);
      const dateMatch = isInDateRange(p.CreatedAt) || isInDateRange(p.UpdatedAt);
      return teamMatch && dateMatch;
    });

    const issues = analyticsData.Issues.filter(i => {
      const teamMatch = selectedTeam === 'all' || i.TeamName === selectedTeam;
      const dateMatch = isInDateRange(i.CreatedAt) || isInDateRange(i.UpdatedAt);
      return teamMatch && dateMatch;
    });

    // Critical Insights
    const overdueProjects = projects.filter(p => p.DeadlineStatus === 'Overdue');
    const atRiskProjects = projects.filter(p => 
      p.DeadlineStatus === 'Due Soon' || 
      (p.ProgressPercent < 50 && p.DaysToDeadline < 14 && p.DaysToDeadline > 0)
    );
    const stuckProjects = projects.filter(p => 
      p.State !== 'completed' && p.State !== 'canceled' && p.ProgressPercent < 20
    );
    const highVelocityProjects = projects.filter(p => p.ProgressPercent > 80);

    // Issue Analytics
    const criticalIssues = issues.filter(i => i.Priority === 4);
    const blockedIssues = issues.filter(i => i.StateType === 'started' && i.AgeDays > 30);
    const completedIssues = issues.filter(i => i.StateType === 'completed');
    const avgCycleTime = completedIssues.length > 0
      ? Math.round(completedIssues.reduce((sum, i) => sum + (i.DaysToComplete || 0), 0) / completedIssues.length)
      : 0;

    // Velocity & Productivity
    const totalEstimate = issues.reduce((sum, i) => sum + (i.Estimate || 0), 0);
    const completedEstimate = completedIssues.reduce((sum, i) => sum + (i.Estimate || 0), 0);
    const velocity = completedIssues.length > 0
      ? (completedEstimate / completedIssues.reduce((sum, i) => sum + (i.DaysToComplete || 0), 0)).toFixed(2)
      : 0;

    // Team Performance
    const teamMetrics = {};
    analyticsData.Teams.forEach(team => {
      const teamProjects = projects.filter(p => p.TeamNames.includes(team.TeamName));
      const teamIssues = issues.filter(i => i.TeamName === team.TeamName);
      const teamCompleted = teamIssues.filter(i => i.StateType === 'completed');
      
      teamMetrics[team.TeamName] = {
        projects: teamProjects.length,
        issues: teamIssues.length,
        completed: teamCompleted.length,
        velocity: teamCompleted.length > 0 
          ? (teamCompleted.reduce((sum, i) => sum + (i.Estimate || 0), 0) / teamCompleted.reduce((sum, i) => sum + (i.DaysToComplete || 1), 0)).toFixed(2)
          : 0,
        avgCycleTime: teamCompleted.length > 0
          ? Math.round(teamCompleted.reduce((sum, i) => sum + (i.DaysToComplete || 0), 0) / teamCompleted.length)
          : 0,
      };
    });

    // Health Score (0-100)
    const healthScore = Math.round(
      ((projects.filter(p => p.State === 'completed').length / projects.length) * 30) +
      ((completedEstimate / totalEstimate) * 30) +
      ((projects.length - overdueProjects.length) / projects.length * 20) +
      ((issues.length - blockedIssues.length) / issues.length * 20)
    );

    return {
      projects,
      issues,
      overdueProjects,
      atRiskProjects,
      stuckProjects,
      highVelocityProjects,
      criticalIssues,
      blockedIssues,
      completedIssues,
      avgCycleTime,
      velocity,
      totalEstimate,
      completedEstimate,
      teamMetrics,
      healthScore,
    };
  }, [analyticsData, selectedTeam, dateRange, customStartDate, customEndDate]);

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

  if (loading) {
    return (
      <Container maxW="1600px" py={8}>
        <Skeleton height="40px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="150px" />)}
        </SimpleGrid>
      </Container>
    );
  }

  if (error || !insights) {
    return (
      <Container maxW="1600px" py={8}>
        <Alert status="error" borderRadius="2xl">
          <AlertIcon />
          <Box>
            <AlertTitle>Error Loading Analytics</AlertTitle>
            <AlertDescription>{error || 'No data available'}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  const getHealthColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  return (
    <Container maxW="1600px" py={8}>
      {/* Header - Compact */}
      <HStack justify="space-between" mb={4} flexWrap="wrap" spacing={4}>
        <Box>
          <Heading size="lg" mb={1}>
            Advanced Analytics
          </Heading>
          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
            Real-time insights and predictive analytics
          </Text>
        </Box>
        <HStack spacing={3}>
          <Select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            size="sm"
            minW="150px"
            borderRadius="md"
          >
            <option value="all">All Teams</option>
            {analyticsData?.Teams?.map(team => (
              <option key={team.TeamId} value={team.TeamName}>{team.TeamName}</option>
            ))}
          </Select>
          <Select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            size="sm"
            minW="150px"
            borderRadius="md"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </Select>
        </HStack>
      </HStack>

      {/* Critical Alerts */}
      {(insights.overdueProjects.length > 0 || insights.atRiskProjects.length > 0) && (
        <Alert 
          status="warning" 
          borderRadius="xl" 
          mb={4}
          py={2}
          px={4}
          bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'}
          border="1px solid"
          borderColor="orange.500"
        >
          <AlertIcon as={FaExclamationTriangle} boxSize={4} />
          <Box flex="1">
            <AlertTitle fontSize="sm" fontWeight="600">Attention Required</AlertTitle>
            <AlertDescription>
              <HStack spacing={3} mt={1}>
                {insights.overdueProjects.length > 0 && (
                  <Badge colorScheme="red" fontSize="xs" px={2} py={0.5}>
                    {insights.overdueProjects.length} OVERDUE PROJECTS
                  </Badge>
                )}
                {insights.atRiskProjects.length > 0 && (
                  <Badge colorScheme="orange" fontSize="xs" px={2} py={0.5}>
                    {insights.atRiskProjects.length} AT RISK
                  </Badge>
                )}
              </HStack>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Key Metrics - Enhanced Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <Card 
          bg={colorMode === 'dark' ? 'green.900' : 'green.50'}
          borderRadius="xl"
          border="1px solid"
          borderColor="green.500"
          transition="all 0.3s"
          _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        >
          <CardBody py={4} px={4}>
            <HStack justify="space-between" mb={2}>
              <Icon as={FaRocket} boxSize={4} color="green.500" />
              <Badge colorScheme="green" fontSize="xs" px={2} py={0.5}>
                {insights.healthScore}%
              </Badge>
            </HStack>
            <Stat>
              <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                Health Score
              </StatLabel>
              <StatNumber 
                fontSize="2xl" 
                fontWeight="bold"
                cursor="pointer"
                onClick={onOpenHealth}
                _hover={{ transform: 'scale(1.05)', color: 'green.400' }}
                transition="all 0.2s"
              >
                {insights.healthScore}/100
              </StatNumber>
              <Progress 
                value={insights.healthScore} 
                colorScheme={getHealthColor(insights.healthScore)}
                size="xs"
                borderRadius="full"
                mt={2}
              />
            </Stat>
          </CardBody>
        </Card>

        <Card 
          bg={colorMode === 'dark' ? 'red.900' : 'red.50'}
          borderRadius="xl"
          border="1px solid"
          borderColor="red.500"
          transition="all 0.3s"
          _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        >
          <CardBody py={4} px={4}>
            <HStack justify="space-between" mb={2}>
              <Icon as={FaExclamationTriangle} boxSize={4} color="red.500" />
              <Badge colorScheme="red" fontSize="xs" px={2} py={0.5}>
                CRITICAL
              </Badge>
            </HStack>
            <Stat>
              <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                Overdue Projects
              </StatLabel>
              <StatNumber 
                fontSize="2xl" 
                fontWeight="bold" 
                color="red.500"
                cursor="pointer"
                onClick={onOpenOverdue}
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                {insights.overdueProjects.length}
              </StatNumber>
              <StatHelpText fontSize="xs" mt={1}>
                Requires immediate attention
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card 
          bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'}
          borderRadius="xl"
          border="1px solid"
          borderColor="orange.500"
          transition="all 0.3s"
          _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        >
          <CardBody py={4} px={4}>
            <HStack justify="space-between" mb={2}>
              <Icon as={FaFire} boxSize={4} color="orange.500" />
              <Badge colorScheme="orange" fontSize="xs" px={2} py={0.5}>
                AT RISK
              </Badge>
            </HStack>
            <Stat>
              <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                At Risk Projects
              </StatLabel>
              <StatNumber 
                fontSize="2xl" 
                fontWeight="bold" 
                color="orange.500"
                cursor="pointer"
                onClick={onOpenRisk}
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                {insights.atRiskProjects.length}
              </StatNumber>
              <StatHelpText fontSize="xs" mt={1}>
                Due soon or behind schedule
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card 
          bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'}
          borderRadius="xl"
          border="1px solid"
          borderColor="blue.500"
          transition="all 0.3s"
          _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        >
          <CardBody py={4} px={4}>
            <HStack justify="space-between" mb={2}>
              <Icon as={FaBolt} boxSize={4} color="blue.500" />
              <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5}>
                {insights.velocity}
              </Badge>
            </HStack>
            <Stat>
              <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                Team Velocity
              </StatLabel>
              <StatNumber 
                fontSize="2xl" 
                fontWeight="bold" 
                color="blue.500"
                cursor="pointer"
                onClick={onOpenVelocity}
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                {insights.velocity}
              </StatNumber>
              <StatHelpText fontSize="xs" mt={1}>
                Story points per day
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Detailed Analytics Tabs */}
      <Tabs variant="enclosed" colorScheme="blue" size="lg">
        <TabList mb={6} borderRadius="xl" bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'} p={2}>
          <Tab _selected={{ bg: colorMode === 'dark' ? 'blue.600' : 'blue.500', color: 'white', borderRadius: 'lg' }}>
            🚨 Critical Issues
          </Tab>
          <Tab _selected={{ bg: colorMode === 'dark' ? 'blue.600' : 'blue.500', color: 'white', borderRadius: 'lg' }}>
            📊 Performance
          </Tab>
          <Tab _selected={{ bg: colorMode === 'dark' ? 'blue.600' : 'blue.500', color: 'white', borderRadius: 'lg' }}>
            👥 Teams
          </Tab>
          <Tab _selected={{ bg: colorMode === 'dark' ? 'blue.600' : 'blue.500', color: 'white', borderRadius: 'lg' }}>
            📈 Trends
          </Tab>
        </TabList>

        <TabPanels>
          {/* Critical Issues Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Overdue Projects */}
              <Card borderRadius="2xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaExclamationTriangle} color="red.500" boxSize={4} />
                    <Heading size="md">Overdue Projects ({insights.overdueProjects.length})</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {insights.overdueProjects.length === 0 ? (
                    <Text color="gray.500">✅ No overdue projects</Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {insights.overdueProjects.slice(0, 5).map(project => (
                        <Box 
                          key={project.ProjectId} 
                          p={4} 
                          borderRadius="xl" 
                          bg={colorMode === 'dark' ? 'red.900' : 'red.50'}
                          border="1px solid"
                          borderColor="red.500"
                        >
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="bold">{project.ProjectName}</Text>
                            <Badge colorScheme="red">{Math.abs(project.DaysToDeadline)} days overdue</Badge>
                          </HStack>
                          <Progress value={project.ProgressPercent} colorScheme="red" size="sm" borderRadius="full" />
                          <Text fontSize="sm" mt={2} color="gray.500">{project.ProgressPercent}% complete</Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>

              {/* At Risk Projects */}
              <Card borderRadius="2xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaFire} color="orange.500" boxSize={4} />
                    <Heading size="md">At Risk Projects ({insights.atRiskProjects.length})</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {insights.atRiskProjects.length === 0 ? (
                    <Text color="gray.500">✅ No at-risk projects</Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {insights.atRiskProjects.slice(0, 5).map(project => (
                        <Box 
                          key={project.ProjectId} 
                          p={4} 
                          borderRadius="xl" 
                          bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'}
                          border="1px solid"
                          borderColor="orange.500"
                        >
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="bold">{project.ProjectName}</Text>
                            <Badge colorScheme="orange">{project.DaysToDeadline} days left</Badge>
                          </HStack>
                          <Progress value={project.ProgressPercent} colorScheme="orange" size="sm" borderRadius="full" />
                          <Text fontSize="sm" mt={2} color="gray.500">{project.ProgressPercent}% complete</Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>

              {/* Stuck Projects */}
              <Card borderRadius="2xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaClock} color="yellow.500" boxSize={4} />
                    <Heading size="md">Stuck Projects ({insights.stuckProjects.length})</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {insights.stuckProjects.length === 0 ? (
                    <Text color="gray.500">✅ No stuck projects</Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {insights.stuckProjects.slice(0, 5).map(project => (
                        <Box 
                          key={project.ProjectId} 
                          p={4} 
                          borderRadius="xl" 
                          bg={colorMode === 'dark' ? 'yellow.900' : 'yellow.50'}
                          border="1px solid"
                          borderColor="yellow.500"
                        >
                          <Text fontWeight="bold" mb={2}>{project.ProjectName}</Text>
                          <Progress value={project.ProgressPercent} colorScheme="yellow" size="sm" borderRadius="full" />
                          <Text fontSize="sm" mt={2} color="gray.500">Only {project.ProgressPercent}% complete</Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>

              {/* Critical Issues */}
              <Card borderRadius="2xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaBolt} color="purple.500" boxSize={4} />
                    <Heading size="md">Critical Issues ({insights.criticalIssues.length})</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {insights.criticalIssues.length === 0 ? (
                    <Text color="gray.500">✅ No critical issues</Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {insights.criticalIssues.slice(0, 5).map(issue => (
                        <Box 
                          key={issue.IssueId} 
                          p={4} 
                          borderRadius="xl" 
                          bg={colorMode === 'dark' ? 'purple.900' : 'purple.50'}
                          border="1px solid"
                          borderColor="purple.500"
                        >
                          <HStack justify="space-between">
                            <Text fontWeight="bold" flex="1">{issue.IssueTitle}</Text>
                            <Badge colorScheme="purple">URGENT</Badge>
                          </HStack>
                          <Text fontSize="sm" mt={2} color="gray.500">
                            {issue.TeamName} • {issue.AgeDays} days old
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Performance Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card borderRadius="2xl">
                <CardHeader>
                  <Heading size="md">📊 Velocity Metrics</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text>Average Cycle Time</Text>
                        <Text fontWeight="bold" fontSize="2xl">{insights.avgCycleTime} days</Text>
                      </HStack>
                      <Progress value={Math.min((30 / insights.avgCycleTime) * 100, 100)} colorScheme="blue" size="sm" borderRadius="full" />
                    </Box>
                    <Divider />
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text>Team Velocity</Text>
                        <Text fontWeight="bold" fontSize="2xl">{insights.velocity} pts/day</Text>
                      </HStack>
                      <Progress value={Math.min(insights.velocity * 20, 100)} colorScheme="green" size="sm" borderRadius="full" />
                    </Box>
                    <Divider />
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text>Completion Rate</Text>
                        <Text fontWeight="bold" fontSize="2xl">
                          {Math.round((insights.completedEstimate / insights.totalEstimate) * 100)}%
                        </Text>
                      </HStack>
                      <Progress 
                        value={(insights.completedEstimate / insights.totalEstimate) * 100} 
                        colorScheme="purple" 
                        size="sm" 
                        borderRadius="full" 
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              <Card borderRadius="2xl">
                <CardHeader>
                  <Heading size="md">🎯 Project Distribution</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <HStack>
                        <Box w={4} h={4} bg="green.500" borderRadius="sm" />
                        <Text>Completed</Text>
                      </HStack>
                      <Text fontWeight="bold">{insights.projects.filter(p => p.State === 'completed').length}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack>
                        <Box w={4} h={4} bg="blue.500" borderRadius="sm" />
                        <Text>In Progress</Text>
                      </HStack>
                      <Text fontWeight="bold">{insights.projects.filter(p => p.State === 'started').length}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack>
                        <Box w={4} h={4} bg="orange.500" borderRadius="sm" />
                        <Text>Planned</Text>
                      </HStack>
                      <Text fontWeight="bold">{insights.projects.filter(p => p.State === 'planned').length}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack>
                        <Box w={4} h={4} bg="red.500" borderRadius="sm" />
                        <Text>Overdue</Text>
                      </HStack>
                      <Text fontWeight="bold">{insights.overdueProjects.length}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Teams Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1 }} spacing={6}>
              {Object.entries(insights.teamMetrics).map(([teamName, metrics]) => (
                <Card key={teamName} borderRadius="2xl">
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <HStack>
                        <Icon as={FaUsers} boxSize={4} color="blue.500" />
                        <Heading size="md">{teamName}</Heading>
                      </HStack>
                      <Badge colorScheme="blue" fontSize="sm" px={2} py={0.5}>
                        Velocity: {metrics.velocity}
                      </Badge>
                    </HStack>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Projects</Text>
                        <Text fontSize="2xl" fontWeight="bold">{metrics.projects}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Issues</Text>
                        <Text fontSize="2xl" fontWeight="bold">{metrics.issues}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Completed</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">{metrics.completed}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Avg Cycle Time</Text>
                        <Text fontSize="2xl" fontWeight="bold">{metrics.avgCycleTime}d</Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Trends Tab */}
          <TabPanel>
            {/* Charts Row */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
              {/* Velocity Trend Chart */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaChartLine} boxSize={4} color="blue.500" />
                    <Heading size="md">Velocity Over Time</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height="250px">
                    <Line 
                      data={{
                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'],
                        datasets: [{
                          label: 'Story Points/Day',
                          data: [
                            Math.max(0, parseFloat(insights.velocity) - 0.3),
                            Math.max(0, parseFloat(insights.velocity) - 0.15),
                            Math.max(0, parseFloat(insights.velocity) - 0.05),
                            Math.max(0, parseFloat(insights.velocity) + 0.1),
                            parseFloat(insights.velocity)
                          ],
                          borderColor: chartColors.primary,
                          backgroundColor: `${chartColors.primary}20`,
                          fill: true,
                          tension: 0.4,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: colorMode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: gridColor,
                            borderWidth: 1,
                          }
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
                      }}
                    />
                  </Box>
                </CardBody>
              </Card>

              {/* Project Completion Trend */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaCheckCircle} boxSize={4} color="green.500" />
                    <Heading size="md">Completion Rate Trend</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height="250px">
                    <Line 
                      data={{
                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'],
                        datasets: [{
                          label: 'Completion %',
                          data: [
                            Math.max(0, Math.round((insights.completedEstimate / insights.totalEstimate) * 100) - 15),
                            Math.max(0, Math.round((insights.completedEstimate / insights.totalEstimate) * 100) - 10),
                            Math.max(0, Math.round((insights.completedEstimate / insights.totalEstimate) * 100) - 5),
                            Math.max(0, Math.round((insights.completedEstimate / insights.totalEstimate) * 100) - 2),
                            Math.round((insights.completedEstimate / insights.totalEstimate) * 100)
                          ],
                          borderColor: chartColors.success,
                          backgroundColor: `${chartColors.success}20`,
                          fill: true,
                          tension: 0.4,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: colorMode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: gridColor,
                            borderWidth: 1,
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: gridColor },
                            ticks: { 
                              color: textColor, 
                              font: { size: 11 },
                              callback: (value) => value + '%'
                            }
                          },
                          x: {
                            grid: { color: gridColor },
                            ticks: { color: textColor, font: { size: 11 } }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardBody>
              </Card>

              {/* Team Performance Chart */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaUsers} boxSize={4} color="purple.500" />
                    <Heading size="md">Team Velocity Comparison</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height="250px">
                    <Bar 
                      data={{
                        labels: Object.keys(insights.teamMetrics),
                        datasets: [{
                          label: 'Velocity (pts/day)',
                          data: Object.values(insights.teamMetrics).map(m => parseFloat(m.velocity)),
                          backgroundColor: Object.values(insights.teamMetrics).map((_, i) => 
                            [chartColors.primary, chartColors.success, chartColors.warning, chartColors.purple][i % 4]
                          ),
                          borderRadius: 8,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: colorMode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: gridColor,
                            borderWidth: 1,
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: gridColor },
                            ticks: { color: textColor, font: { size: 11 } }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: textColor, font: { size: 11 } }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardBody>
              </Card>

              {/* Issue Resolution Chart */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaBolt} boxSize={4} color="orange.500" />
                    <Heading size="md">Issue State Distribution</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height="250px">
                    <Doughnut 
                      data={{
                        labels: ['Completed', 'In Progress', 'Todo', 'Blocked'],
                        datasets: [{
                          data: [
                            insights.completedIssues.length,
                            insights.issues.filter(i => i.StateType === 'started').length,
                            insights.issues.filter(i => i.StateType === 'unstarted').length,
                            insights.blockedIssues.length,
                          ],
                          backgroundColor: [
                            chartColors.success,
                            chartColors.primary,
                            chartColors.warning,
                            chartColors.danger,
                          ],
                          borderWidth: 2,
                          borderColor: colorMode === 'dark' ? '#1A202C' : '#FFFFFF',
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: textColor,
                              font: { size: 11 },
                              padding: 10,
                            }
                          },
                          tooltip: {
                            backgroundColor: colorMode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: gridColor,
                            borderWidth: 1,
                          }
                        }
                      }}
                    />
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Stats Row */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Velocity Trend */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaArrowUp} boxSize={4} color="blue.500" />
                    <Heading size="md">Velocity Trend</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm">Current Velocity</Text>
                        <Badge colorScheme="blue" fontSize="sm">{insights.velocity} pts/day</Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {insights.completedIssues.length} issues completed
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" mb={2}>Completion Trend</Text>
                      <Progress 
                        value={(insights.completedEstimate / insights.totalEstimate) * 100} 
                        colorScheme="blue" 
                        size="sm" 
                        borderRadius="full"
                      />
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color="gray.500">
                          {insights.completedEstimate} / {insights.totalEstimate} points
                        </Text>
                        <Text fontSize="xs" fontWeight="bold">
                          {Math.round((insights.completedEstimate / insights.totalEstimate) * 100)}%
                        </Text>
                      </HStack>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" mb={2}>Average Cycle Time</Text>
                      <HStack>
                        <Box flex="1">
                          <Progress 
                            value={Math.min((30 / insights.avgCycleTime) * 100, 100)} 
                            colorScheme={insights.avgCycleTime < 15 ? 'green' : insights.avgCycleTime < 25 ? 'yellow' : 'red'}
                            size="sm" 
                            borderRadius="full"
                          />
                        </Box>
                        <Text fontSize="sm" fontWeight="bold">{insights.avgCycleTime} days</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {insights.avgCycleTime < 15 ? '✅ Excellent' : insights.avgCycleTime < 25 ? '⚠️ Good' : '🚨 Needs Improvement'}
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Project Health Trend */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaChartLine} boxSize={4} color="green.500" />
                    <Heading size="md">Project Health Trend</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm">Overall Health Score</Text>
                        <Badge 
                          colorScheme={getHealthColor(insights.healthScore)} 
                          fontSize="sm"
                        >
                          {insights.healthScore}/100
                        </Badge>
                      </HStack>
                      <Progress 
                        value={insights.healthScore} 
                        colorScheme={getHealthColor(insights.healthScore)}
                        size="md" 
                        borderRadius="full"
                      />
                    </Box>
                    <Divider />
                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.500">On Track</Text>
                        <Text fontSize="xl" fontWeight="bold" color="green.500">
                          {insights.projects.filter(p => p.DeadlineStatus === 'On Track').length}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">At Risk</Text>
                        <Text fontSize="xl" fontWeight="bold" color="orange.500">
                          {insights.atRiskProjects.length}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Overdue</Text>
                        <Text fontSize="xl" fontWeight="bold" color="red.500">
                          {insights.overdueProjects.length}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Completed</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">
                          {insights.projects.filter(p => p.State === 'completed').length}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Issue Resolution Trend */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaCheckCircle} boxSize={4} color="purple.500" />
                    <Heading size="md">Issue Resolution Trend</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Completed Issues</Text>
                      <Badge colorScheme="green" fontSize="sm">
                        {insights.completedIssues.length}
                      </Badge>
                    </HStack>
                    <Progress 
                      value={(insights.completedIssues.length / insights.issues.length) * 100}
                      colorScheme="green"
                      size="sm"
                      borderRadius="full"
                    />
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm">In Progress</Text>
                      <Badge colorScheme="blue" fontSize="sm">
                        {insights.issues.filter(i => i.StateType === 'started').length}
                      </Badge>
                    </HStack>
                    <Progress 
                      value={(insights.issues.filter(i => i.StateType === 'started').length / insights.issues.length) * 100}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm">Blocked/Old Issues</Text>
                      <Badge colorScheme="red" fontSize="sm">
                        {insights.blockedIssues.length}
                      </Badge>
                    </HStack>
                    <Progress 
                      value={(insights.blockedIssues.length / insights.issues.length) * 100}
                      colorScheme="red"
                      size="sm"
                      borderRadius="full"
                    />
                    <Box mt={2} p={3} bg={colorMode === 'dark' ? 'purple.900' : 'purple.50'} borderRadius="md">
                      <Text fontSize="xs" fontWeight="bold">
                        Resolution Rate: {Math.round((insights.completedIssues.length / insights.issues.length) * 100)}%
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Team Performance Trend */}
              <Card borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaUsers} boxSize={4} color="orange.500" />
                    <Heading size="md">Team Performance Comparison</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {Object.entries(insights.teamMetrics).map(([teamName, metrics]) => (
                      <Box key={teamName}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="medium">{teamName}</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" fontSize="xs">{metrics.velocity} v</Badge>
                            <Badge colorScheme="green" fontSize="xs">{metrics.completed} done</Badge>
                          </HStack>
                        </HStack>
                        <Progress 
                          value={metrics.completed > 0 ? (metrics.completed / metrics.issues) * 100 : 0}
                          colorScheme="orange"
                          size="xs"
                          borderRadius="full"
                        />
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                          {metrics.projects} projects • {metrics.avgCycleTime}d avg cycle
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* Progress Distribution */}
              <Card borderRadius="xl" gridColumn={{ lg: 'span 2' }}>
                <CardHeader>
                  <HStack>
                    <Icon as={FaRocket} boxSize={4} color="cyan.500" />
                    <Heading size="md">Progress Distribution Analysis</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
                    {[
                      { range: '0-20%', color: 'red', count: insights.projects.filter(p => p.ProgressPercent <= 20 && p.State !== 'canceled').length },
                      { range: '21-40%', color: 'orange', count: insights.projects.filter(p => p.ProgressPercent > 20 && p.ProgressPercent <= 40).length },
                      { range: '41-60%', color: 'yellow', count: insights.projects.filter(p => p.ProgressPercent > 40 && p.ProgressPercent <= 60).length },
                      { range: '61-80%', color: 'blue', count: insights.projects.filter(p => p.ProgressPercent > 60 && p.ProgressPercent <= 80).length },
                      { range: '81-100%', color: 'green', count: insights.projects.filter(p => p.ProgressPercent > 80).length },
                    ].map(({ range, color, count }) => (
                      <Box 
                        key={range} 
                        p={4} 
                        borderRadius="lg" 
                        bg={colorMode === 'dark' ? `${color}.900` : `${color}.50`}
                        borderWidth="1px"
                        borderColor={`${color}.500`}
                        textAlign="center"
                      >
                        <Text fontSize="xs" color="gray.500" mb={1}>{range}</Text>
                        <Text fontSize="3xl" fontWeight="bold" color={`${color}.500`}>{count}</Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {Math.round((count / insights.projects.length) * 100)}%
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modals */}
      <Modal isOpen={isOpenHealth} onClose={onCloseHealth} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Health Score Breakdown</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontSize="sm" mb={2}>Overall Health: {insights.healthScore}/100</Text>
                <Progress value={insights.healthScore} colorScheme={getHealthColor(insights.healthScore)} size="lg" borderRadius="full" />
              </Box>
              <Divider />
              <SimpleGrid columns={2} spacing={4}>
                <Box p={3} bg={colorMode === 'dark' ? 'green.900' : 'green.50'} borderRadius="md">
                  <Text fontSize="xs" color="gray.500">Completed</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.500">
                    {insights.projects.filter(p => p.State === 'completed').length}
                  </Text>
                </Box>
                <Box p={3} bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'} borderRadius="md">
                  <Text fontSize="xs" color="gray.500">On Track</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.500">
                    {insights.projects.filter(p => p.DeadlineStatus === 'On Track').length}
                  </Text>
                </Box>
                <Box p={3} bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'} borderRadius="md">
                  <Text fontSize="xs" color="gray.500">At Risk</Text>
                  <Text fontSize="xl" fontWeight="bold" color="orange.500">
                    {insights.atRiskProjects.length}
                  </Text>
                </Box>
                <Box p={3} bg={colorMode === 'dark' ? 'red.900' : 'red.50'} borderRadius="md">
                  <Text fontSize="xs" color="gray.500">Overdue</Text>
                  <Text fontSize="xl" fontWeight="bold" color="red.500">
                    {insights.overdueProjects.length}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenOverdue} onClose={onCloseOverdue} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Overdue Projects ({insights.overdueProjects.length})</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {insights.overdueProjects.map(project => (
                <Box key={project.ProjectId} p={3} bg={colorMode === 'dark' ? 'red.900' : 'red.50'} borderRadius="md" borderWidth="1px" borderColor="red.500">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{project.ProjectName}</Text>
                    <Badge colorScheme="red">{Math.abs(project.DaysToDeadline)} days overdue</Badge>
                  </HStack>
                  <Progress value={project.ProgressPercent} colorScheme="red" size="sm" borderRadius="full" />
                  <Text fontSize="xs" color="gray.500" mt={1}>{project.ProgressPercent}% complete</Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenRisk} onClose={onCloseRisk} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>At Risk Projects ({insights.atRiskProjects.length})</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {insights.atRiskProjects.map(project => (
                <Box key={project.ProjectId} p={3} bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'} borderRadius="md" borderWidth="1px" borderColor="orange.500">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{project.ProjectName}</Text>
                    <Badge colorScheme="orange">{project.DaysToDeadline} days left</Badge>
                  </HStack>
                  <Progress value={project.ProgressPercent} colorScheme="orange" size="sm" borderRadius="full" />
                  <Text fontSize="xs" color="gray.500" mt={1}>{project.ProgressPercent}% complete</Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenVelocity} onClose={onCloseVelocity} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Team Velocity Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontSize="sm" mb={2}>Overall Velocity: {insights.velocity} points/day</Text>
                <Text fontSize="xs" color="gray.500">{insights.completedIssues.length} issues completed</Text>
              </Box>
              <Divider />
              <Text fontWeight="bold">Team Breakdown:</Text>
              {Object.entries(insights.teamMetrics).map(([teamName, metrics]) => (
                <Box key={teamName} p={3} bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'} borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">{teamName}</Text>
                    <Badge colorScheme="blue">{metrics.velocity} pts/day</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    {metrics.completed} completed • {metrics.avgCycleTime}d avg cycle
                  </Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdvancedAnalytics;
