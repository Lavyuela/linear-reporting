import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorMode,
  useColorModeValue,
  HStack,
  IconButton,
  Text,
  Container,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaChartLine, FaRegClock, FaChartBar } from 'react-icons/fa';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Format time as HH:MM:SS
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Glassmorphism styling
  const headerBg = useColorModeValue(
    'rgba(255, 255, 255, 0.8)', 
    'rgba(26, 32, 44, 0.8)'
  );
  const borderColor = useColorModeValue(
    'rgba(226, 232, 240, 0.8)', 
    'rgba(45, 55, 72, 0.8)'
  );
  
  return (
    <Box
      as="header"
      bg={headerBg}
      borderBottom="1px"
      borderColor={borderColor}
      py={2}
      px={4}
      position="sticky"
      top={0}
      zIndex={10}
      backdropFilter="blur(20px) saturate(180%)"
      boxShadow={colorMode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        : '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)'}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: colorMode === 'dark'
          ? 'linear-gradient(90deg, transparent, rgba(0, 153, 255, 0.5), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(0, 153, 255, 0.3), transparent)',
      }}
    >
      <Container maxW="1400px">
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Box
              bg={colorMode === 'dark' ? 'accent.500' : 'brand.500'}
              p={1.5}
              borderRadius="md"
              color="white"
              mr={2}
              boxShadow={colorMode === 'dark' ? '0 0 10px rgba(124, 0, 252, 0.3)' : 'none'}
            >
              <FaChartLine size={14} />
            </Box>
            <Heading 
              as="h1" 
              size="md" 
              bgGradient={colorMode === 'dark' 
                ? 'linear(to-r, brand.400, accent.400)' 
                : 'linear(to-r, brand.500, accent.500)'}
              bgClip="text"
              fontWeight="bold"
              letterSpacing="tight"
            >
              <RouterLink to="/">Linear Reporting</RouterLink>
            </Heading>
            <Badge 
              ml={1.5} 
              colorScheme={colorMode === 'dark' ? 'cyan' : 'blue'}
              variant={colorMode === 'dark' ? 'solid' : 'subtle'}
              fontSize="2xs"
              textTransform="uppercase"
              px={1.5}
              py={0.5}
            >
              Pro
            </Badge>
          </HStack>
          
          <HStack spacing={6}>
            <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
              <Box textAlign="right">
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>{formattedDate}</Text>
                <Flex align="center" justify="flex-end">
                  <FaRegClock size={10} style={{ marginRight: '4px' }} />
                  <Text fontSize="sm" fontWeight="medium" fontFamily="mono">{formattedTime}</Text>
                </Flex>
              </Box>
              <Divider orientation="vertical" h="20px" mx={4} />
            </HStack>
            
            <HStack spacing={2}>
              <Button 
                as={RouterLink} 
                to="/" 
                variant="neon" 
                size="xs"
                leftIcon={<FaChartLine size={10} />}
                iconSpacing={1}
                px={3}
              >
                Dashboard
              </Button>
              <Button 
                as={RouterLink} 
                to="/analytics" 
                variant="neon" 
                size="xs"
                leftIcon={<FaChartBar size={10} />}
                iconSpacing={1}
                px={3}
              >
                Analytics
              </Button>
              <IconButton
                icon={colorMode === 'light' ? <FaMoon size={12} /> : <FaSun size={12} />}
                onClick={toggleColorMode}
                variant={colorMode === 'dark' ? 'neon' : 'ghost'}
                aria-label="Toggle color mode"
                size="xs"
              />
            </HStack>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
