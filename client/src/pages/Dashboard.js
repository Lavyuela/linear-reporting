import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Progress,
  Badge,
  Button,
  Select,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';
import useApi from '../hooks/useApi';

const ProjectCard = ({ project }) => {
  const { colorMode } = useColorMode();
  // Convert progress from decimal (0-1) to percentage (0-100)
  const progress = (project.progress || 0) * 100;
  const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set';
  const targetDate = project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'Not set';
  
  // Calculate days remaining or overdue
  const getDaysRemaining = () => {
    if (!project.targetDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(project.targetDate);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining();
  
  // Status styling
  let statusColor, statusBg, statusIcon;
  switch (project.state) {
    case 'completed':
      statusColor = 'green.400';
      statusBg = colorMode === 'dark' ? 'green.900' : 'green.50';
      statusIcon = '✓';
      break;
    case 'canceled':
      statusColor = 'red.400';
      statusBg = colorMode === 'dark' ? 'red.900' : 'red.50';
      statusIcon = '✕';
      break;
    case 'paused':
      statusColor = 'orange.400';
      statusBg = colorMode === 'dark' ? 'orange.900' : 'orange.50';
      statusIcon = '⏸';
      break;
    case 'started':
      statusColor = 'blue.400';
      statusBg = colorMode === 'dark' ? 'blue.900' : 'blue.50';
      statusIcon = '▶';
      break;
    default:
      statusColor = 'purple.400';
      statusBg = colorMode === 'dark' ? 'purple.900' : 'purple.50';
      statusIcon = '⏱';
  }
  
  // Timeline styling
  let timelineColor = 'gray.400';
  let timelineBg = colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50';
  let timelineIcon = '🕒';
  
  if (daysRemaining !== null) {
    if (daysRemaining < 0) {
      timelineColor = 'red.400';
      timelineBg = colorMode === 'dark' ? 'red.900' : 'red.50';
      timelineIcon = '⚠️';
    } else if (daysRemaining <= 7) {
      timelineColor = 'orange.400';
      timelineBg = colorMode === 'dark' ? 'orange.900' : 'orange.50';
      timelineIcon = '⏰';
    } else {
      timelineColor = 'green.400';
      timelineBg = colorMode === 'dark' ? 'green.900' : 'green.50';
      timelineIcon = '📅';
    }
  }

  return (
    <Card
      direction="column"
      overflow="hidden"
      h="100%"
      bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
      borderRadius="2xl"
      transition="all 0.3s ease"
      _hover={{ 
        transform: 'translateY(-8px)', 
        boxShadow: colorMode === 'dark' 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        h="6px" 
        bgGradient={colorMode === 'dark' 
          ? 'linear(to-r, brand.500, accent.500)' 
          : 'linear(to-r, brand.400, accent.400)'} 
        borderTopRadius="2xl"
      />
      
      <CardHeader pb={0}>
        <Flex justify="space-between" align="center">
          <Heading 
            size="md" 
            fontWeight="semibold"
            bgGradient={colorMode === 'dark' 
              ? 'linear(to-r, gray.100, gray.300)' 
              : 'linear(to-r, gray.700, gray.900)'}
            bgClip="text"
          >
            {project.name}
          </Heading>
          <HStack>
            <Badge 
              px={2} 
              py={1} 
              bg={statusBg} 
              color={statusColor} 
              borderRadius="full"
              display="flex"
              alignItems="center"
            >
              <Box as="span" mr={1}>{statusIcon}</Box>
              {project.state}
            </Badge>
          </HStack>
        </Flex>
      </CardHeader>

      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Text 
            noOfLines={2} 
            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            fontSize="sm"
          >
            {project.description || 'No description'}
          </Text>
          
          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="sm" fontWeight="medium" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                Progress
              </Text>
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                color={progress > 75 ? 'green.400' : progress > 25 ? 'blue.400' : 'orange.400'}
              >
                {Math.round(progress)}%
              </Text>
            </Flex>
            <Box position="relative">
              <Progress 
                value={progress} 
                size="sm" 
                borderRadius="full" 
                bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100'}
                sx={{
                  '& > div': {
                    background: colorMode === 'dark' 
                      ? 'linear-gradient(90deg, #0099ff, #7c00fc)' 
                      : 'linear-gradient(90deg, #0099ff, #7c00fc)',
                    transition: 'width 1s ease-in-out',
                  }
                }}
              />
              {progress >= 100 && (
                <Box 
                  position="absolute" 
                  top="-2px" 
                  right="-2px" 
                  fontSize="xs"
                >
                  ✨
                </Box>
              )}
            </Box>
          </Box>

          <SimpleGrid columns={2} spacing={4}>
            <Box 
              p={2} 
              borderRadius="md" 
              bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
            >
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Start Date</Text>
              <Text fontSize="sm" fontWeight="medium">{startDate}</Text>
            </Box>
            <Box 
              p={2} 
              borderRadius="md" 
              bg={timelineBg}
              color={timelineColor}
            >
              <Flex justify="space-between">
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Target Date</Text>
                <Text fontSize="xs">{timelineIcon}</Text>
              </Flex>
              <Text fontSize="sm" fontWeight="medium">{targetDate}</Text>
              {daysRemaining !== null && (
                <Text fontSize="xs" mt={1}>
                  {daysRemaining < 0 
                    ? `${Math.abs(daysRemaining)} days overdue` 
                    : daysRemaining === 0 
                      ? 'Due today' 
                      : `${daysRemaining} days remaining`}
                </Text>
              )}
            </Box>
          </SimpleGrid>
        </VStack>
      </CardBody>

      <CardFooter pt={0}>
        <Button
          as={RouterLink}
          to={`/projects/${project.id}`}
          rightIcon={<FaArrowRight />}
          variant={colorMode === 'dark' ? 'neon' : 'ghost'}
          colorScheme={colorMode === 'dark' ? undefined : 'brand'}
          size="sm"
          ml="auto"
          borderRadius="full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

const Dashboard = () => {
  const { colorMode } = useColorMode();
  const [filter, setFilter] = useState('all');
  const { data: projects, loading, error, refetch } = useApi('/api/projects');
  const { isOpen: isOpenTotal, onOpen: onOpenTotal, onClose: onCloseTotal } = useDisclosure();
  const { isOpen: isOpenActive, onOpen: onOpenActive, onClose: onCloseActive } = useDisclosure();
  const { isOpen: isOpenCompleted, onOpen: onOpenCompleted, onClose: onCloseCompleted } = useDisclosure();
  const { isOpen: isOpenDue, onOpen: onOpenDue, onClose: onCloseDue } = useDisclosure();
  const { data: teams } = useApi('/api/teams');

  const handleRefresh = () => {
    refetch();
  };

  const filteredProjects = projects ? projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.state !== 'completed' && project.state !== 'canceled';
    if (filter === 'completed') return project.state === 'completed';
    return project.teams.nodes.some(team => team.id === filter);
  }) : [];
  
  // Calculate statistics based on FILTERED projects
  const totalProjects = filteredProjects.length;
  const activeProjects = filteredProjects.filter(p => p.state !== 'completed' && p.state !== 'canceled').length;
  const completedProjects = filteredProjects.filter(p => p.state === 'completed').length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
  
  // Calculate projects with upcoming deadlines from FILTERED projects
  const upcomingDeadlines = filteredProjects.filter(p => {
    if (!p.targetDate || p.state === 'completed' || p.state === 'canceled') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(p.targetDate);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  return (
    <Box>
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
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          gap={4}
        >
          <Box>
            <Heading 
              size="md" 
              fontWeight="bold"
              letterSpacing="tight"
            >
              Project Analytics
            </Heading>
            <Text 
              mt={0.5} 
              fontSize="xs"
              color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
            >
              {new Date().toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          </Box>
          
          <Button 
            onClick={handleRefresh} 
            variant={colorMode === 'dark' ? 'neon' : 'solid'}
            colorScheme={colorMode === 'dark' ? undefined : 'brand'}
            leftIcon={<Box as="span" fontSize="sm">↻</Box>}
            size="sm"
            borderRadius="md"
            px={4}
          >
            Refresh Data
          </Button>
        </Flex>

        {error && (
          <Alert 
            status="error" 
            mb={6} 
            borderRadius="lg" 
            variant={colorMode === 'dark' ? 'solid' : 'subtle'}
          >
            <AlertIcon />
            <AlertTitle>Error loading projects!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filter Section - Moved to top */}
        <Flex 
          mb={6} 
          direction={{ base: 'column', md: 'row' }}
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }} 
          gap={4}
        >
          <HStack spacing={4}>
            <Text fontWeight="medium">Filter by:</Text>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              w="200px"
              borderRadius="full"
              bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'white'}
              _hover={{
                borderColor: colorMode === 'dark' ? 'brand.400' : 'brand.500',
              }}
            >
              <option value="all">All Projects</option>
              <option value="active">Active Projects</option>
              <option value="completed">Completed Projects</option>
              {teams && teams.map(team => (
                <option key={team.id} value={team.id}>
                  Team: {team.name}
                </option>
              ))}
            </Select>
          </HStack>
          
          <Text 
            fontSize="sm" 
            color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
            fontStyle="italic"
          >
            Showing {filteredProjects.length} of {projects ? projects.length : 0} projects
          </Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={4}>
          <Box 
            p={3} 
            borderRadius="md" 
            bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.100'}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          >
            <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>Total Projects</Text>
            <Flex align="center" mt={1}>
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                cursor="pointer"
                onClick={onOpenTotal}
                _hover={{ color: 'blue.500', transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                {totalProjects}
              </Text>
              <Box 
                ml={3} 
                p={1} 
                borderRadius="full" 
                bg={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.100'}
              >
                <Box as="span" fontSize="lg">📊</Box>
              </Box>
            </Flex>
          </Box>
          
          <Box 
            p={3} 
            borderRadius="md" 
            bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'}
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'blue.800' : 'blue.100'}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          >
            <Text fontSize="xs" color={colorMode === 'dark' ? 'blue.200' : 'blue.600'}>Active Projects</Text>
            <Flex align="center" mt={1}>
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                color={colorMode === 'dark' ? 'blue.200' : 'blue.600'}
                cursor="pointer"
                onClick={onOpenActive}
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                {activeProjects}
              </Text>
              <Box 
                ml={3} 
                p={1} 
                borderRadius="full" 
                bg={colorMode === 'dark' ? 'blue.800' : 'blue.100'}
              >
                <Box as="span" fontSize="lg">⚡</Box>
              </Box>
            </Flex>
          </Box>
          
          <Box 
            p={5} 
            borderRadius="lg" 
            bg={colorMode === 'dark' ? 'green.900' : 'green.50'}
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'green.800' : 'green.100'}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          >
            <Text fontSize="xs" color={colorMode === 'dark' ? 'green.200' : 'green.600'}>Completed</Text>
            <Flex align="center" mt={1}>
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                color={colorMode === 'dark' ? 'green.200' : 'green.600'}
                cursor="pointer"
                onClick={onOpenCompleted}
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                {completedProjects}
              </Text>
              <Box 
                ml={3} 
                p={1} 
                borderRadius="full" 
                bg={colorMode === 'dark' ? 'green.800' : 'green.100'}
              >
                <Box as="span" fontSize="lg">✓</Box>
              </Box>
            </Flex>
            <Text fontSize="sm" mt={2} color={colorMode === 'dark' ? 'green.300' : 'green.700'}>
              {completionRate}% completion rate
            </Text>
          </Box>
          
          <Box 
            p={3} 
            borderRadius="md" 
            bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'}
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'orange.800' : 'orange.100'}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          >
            <Text fontSize="xs" color={colorMode === 'dark' ? 'orange.200' : 'orange.600'}>Due Soon</Text>
            <Flex align="center" mt={1}>
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                color={colorMode === 'dark' ? 'orange.200' : 'orange.600'}
                cursor="pointer"
                onClick={onOpenDue}
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                {upcomingDeadlines}
              </Text>
              <Box 
                ml={3} 
                p={1} 
                borderRadius="full" 
                bg={colorMode === 'dark' ? 'orange.800' : 'orange.100'}
              >
                <Box as="span" fontSize="lg">⏰</Box>
              </Box>
            </Flex>
            <Text fontSize="sm" mt={2} color={colorMode === 'dark' ? 'orange.300' : 'orange.700'}>
              Projects due within 7 days
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Box key={i} height="300px">
              <Skeleton 
                height="100%" 
                startColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                endColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                borderRadius="xl"
              />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <>
          {filteredProjects.length === 0 ? (
            <Box 
              textAlign="center" 
              py={10} 
              px={6} 
              borderRadius="xl" 
              bg={colorMode === 'dark' ? 'glass.bg' : 'white'}
              backdropFilter="blur(10px)"
              borderWidth="1px"
              borderColor={colorMode === 'dark' ? 'glass.border' : 'gray.100'}
            >
              <Text fontSize="xl">No projects found matching your filter.</Text>
              <Button 
                mt={4} 
                onClick={() => setFilter('all')} 
                variant={colorMode === 'dark' ? 'neon' : 'solid'}
                colorScheme={colorMode === 'dark' ? undefined : 'brand'}
                size="sm"
              >
                Show all projects
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={isOpenTotal} onClose={onCloseTotal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>All Projects ({totalProjects})</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {filteredProjects.map(project => (
                <Box 
                  key={project.id} 
                  p={3} 
                  borderRadius="md" 
                  bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50'}
                  borderWidth="1px"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{project.name}</Text>
                    <Badge colorScheme={project.state === 'completed' ? 'green' : 'blue'}>
                      {project.state}
                    </Badge>
                  </HStack>
                  <Progress value={(project.progress || 0) * 100} size="sm" colorScheme="blue" borderRadius="full" />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {Math.round((project.progress || 0) * 100)}% complete
                  </Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenActive} onClose={onCloseActive} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Active Projects ({activeProjects})</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {filteredProjects.filter(p => p.state !== 'completed' && p.state !== 'canceled').map(project => (
                <Box 
                  key={project.id} 
                  p={3} 
                  borderRadius="md" 
                  bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'}
                  borderWidth="1px"
                  borderColor="blue.500"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{project.name}</Text>
                    <Badge colorScheme="blue">{project.state}</Badge>
                  </HStack>
                  <Progress value={(project.progress || 0) * 100} size="sm" colorScheme="blue" borderRadius="full" />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {Math.round((project.progress || 0) * 100)}% complete
                  </Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenCompleted} onClose={onCloseCompleted} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Completed Projects ({completedProjects})</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {filteredProjects.filter(p => p.state === 'completed').map(project => (
                <Box 
                  key={project.id} 
                  p={3} 
                  borderRadius="md" 
                  bg={colorMode === 'dark' ? 'green.900' : 'green.50'}
                  borderWidth="1px"
                  borderColor="green.500"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{project.name}</Text>
                    <Badge colorScheme="green">✓ Completed</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Completed: {project.completedAt ? new Date(project.completedAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenDue} onClose={onCloseDue} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Projects Due Soon ({upcomingDeadlines})</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {filteredProjects.filter(p => {
                if (!p.targetDate) return false;
                const daysUntil = Math.ceil((new Date(p.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntil <= 7 && daysUntil >= 0;
              }).map(project => {
                const daysUntil = Math.ceil((new Date(project.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <Box 
                    key={project.id} 
                    p={3} 
                    borderRadius="md" 
                    bg={colorMode === 'dark' ? 'orange.900' : 'orange.50'}
                    borderWidth="1px"
                    borderColor="orange.500"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">{project.name}</Text>
                      <Badge colorScheme="orange">{daysUntil} days left</Badge>
                    </HStack>
                    <Progress value={(project.progress || 0) * 100} size="sm" colorScheme="orange" borderRadius="full" />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Due: {new Date(project.targetDate).toLocaleDateString()}
                    </Text>
                  </Box>
                );
              })}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;
