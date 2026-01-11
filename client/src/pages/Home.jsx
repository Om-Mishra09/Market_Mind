import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Button,
  Flex,
  Icon,
  Avatar,
  Badge,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';
import {
  FaChartLine, FaStar, FaShoppingCart, FaMagic,
  FaArrowUp, FaArrowDown, FaRocket, FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const RECENT_ACTIVITY = [
  { id: 1, text: "Sony Bravia price dropped by ₹1,500", type: "drop", time: "2h ago" },
  { id: 2, text: "New competitor found for iPhone 13", type: "alert", time: "5h ago" },
  { id: 3, text: "Samsung M13 back in stock", type: "stock", time: "1d ago" },
];

const StatCard = ({ label, value, icon, color, subtext, subicon }) => (
  <Box
    bg="white"
    p={6}
    rounded="2xl"
    shadow="lg"
    borderTop="4px solid"
    borderColor={color}
    transition="transform 0.2s"
    _hover={{ transform: 'translateY(-5px)' }}
  >
    <Flex justify="space-between" align="start">
      <Box>
        <Text color="gray.500" fontSize="xs" fontWeight="bold" letterSpacing="wide">{label}</Text>
        <Heading size="lg" my={2}>{value}</Heading>
        {subtext && (
          <Flex align="center" fontSize="sm" color="gray.500">
            {subicon && <Icon as={subicon} color="green.500" mr={1} />}
            {subtext}
          </Flex>
        )}
      </Box>
      <Flex w={12} h={12} bg={`${color.split('.')[0]} .50`} rounded="xl" align="center" justify="center">
        <Icon as={icon} boxSize={6} color={color} />
      </Flex>
    </Flex>
  </Box>
);

export default function Home() {
  const { user } = useAuth();
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recommendedDeals, setRecommendedDeals] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('market_mind_token');
      const config = { headers: { Authorization: `Bearer ${token} ` } };

      // 1. Fetch Watchlist Count
      const watchlistRes = await axios.get(`${API_BASE_URL}/api/watchlist`, config);
      setWatchlistCount(watchlistRes.data.length);

      // 2. Fetch Random Products for Recommendations
      const productsRes = await axios.get(`${API_BASE_URL}/api/products`);
      // Shuffle and pick 3
      const shuffled = productsRes.data.sort(() => 0.5 - Math.random());
      setRecommendedDeals(shuffled.slice(0, 3));

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!user) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  const getImgUrl = (item) => {
    // Use Picsum for consistent images if none provided
    const seed = item.id || item.name.replace(/\s/g, '');
    return `https://picsum.photos/seed/${seed}/400/300`;
  };

  return (
    <Box bg="gray.50" minH="100vh" display="flex" flexDirection="column">

      <Box bg="gray.900" pt={12} pb={32} px={6} position="relative" overflow="hidden">
        <Box position="absolute" top="0" right="0" w="400px" h="400px" bg="blue.600" filter="blur(150px)" opacity={0.2} rounded="full" />
        <Container maxW="7xl" position="relative" zIndex={1}>
          <Flex align="center" justify="space-between" mb={4}>
            <Box>
              <Badge colorScheme="blue" mb={2} rounded="full" px={3}>PRO MEMBER</Badge>
              <Heading as="h1" size="xl" mb={2} color="white">
                Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.name?.split(' ')[0] || "Trader"}!
              </Heading>
              <Text fontSize="lg" color="gray.400">Your market intelligence report is ready.</Text>
            </Box>
            <Avatar size="xl" name={user?.name} bg="blue.500" color="white" border="4px solid" borderColor="gray.800" shadow="xl" />
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" mt={-20} flex="1">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          <StatCard
            label="ITEMS TRACKED"
            value={loadingStats ? "-" : watchlistCount}
            icon={FaStar}
            color="yellow.400"
            subtext={`${watchlistCount > 0 ? watchlistCount : 0} items active`}
            subicon={FaArrowUp}
          />
          <StatCard
            label="POTENTIAL SAVINGS"
            value="₹4,500"
            icon={FaChartLine}
            color="green.400"
            subtext="Based on fair price"
          />
          <StatCard
            label="MARKET TREND"
            value="Bullish"
            icon={FaRocket}
            color="purple.400"
            subtext="Tech prices rising"
            subicon={FaArrowUp}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mb={20}>
          <Stack spacing={8} gridColumn={{ lg: "span 2" }}>

            <Box>
              <Heading size="md" mb={4} color="gray.700">Quick Actions</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Button as={Link} to="/explorer" h="auto" p={6} colorScheme="blue" bg="white" variant="outline" size="lg" _hover={{ bg: 'blue.50', borderColor: 'blue.500' }}>
                  <Flex align="center" w="full">
                    <Flex w={12} h={12} bg="blue.100" rounded="lg" align="center" justify="center" mr={4}>
                      <Icon as={FaShoppingCart} color="blue.600" boxSize={5} />
                    </Flex>
                    <Box textAlign="left">
                      <Text fontWeight="bold" color="gray.800">Deals Explorer</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="normal">Find & Analyze Products</Text>
                    </Box>
                  </Flex>
                </Button>

                <Button as={Link} to="/watchlist" h="auto" p={6} colorScheme="yellow" bg="white" variant="outline" size="lg" _hover={{ bg: 'yellow.50', borderColor: 'yellow.500' }}>
                  <Flex align="center" w="full">
                    <Flex w={12} h={12} bg="yellow.100" rounded="lg" align="center" justify="center" mr={4}>
                      <Icon as={FaStar} color="yellow.600" boxSize={5} />
                    </Flex>
                    <Box textAlign="left">
                      <Text fontWeight="bold" color="gray.800">My Watchlist</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="normal">Track Your Favorites</Text>
                    </Box>
                  </Flex>
                </Button>

                <Button as={Link} to="/budget" h="auto" p={6} colorScheme="purple" bg="white" variant="outline" size="lg" gridColumn={{ md: "span 2" }} _hover={{ bg: 'purple.50', borderColor: 'purple.500' }}>
                  <Flex align="center" w="full">
                    <Flex w={12} h={12} bg="purple.100" rounded="lg" align="center" justify="center" mr={4}>
                      <Icon as={FaMagic} color="purple.600" boxSize={5} />
                    </Flex>
                    <Box textAlign="left">
                      <Text fontWeight="bold" color="gray.800">Smart Budget Builder</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="normal">AI-Powered Setup Recommendations</Text>
                    </Box>
                    <Icon as={FaArrowUp} transform="rotate(45deg)" ml="auto" color="gray.300" />
                  </Flex>
                </Button>
              </SimpleGrid>
            </Box>

            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color="gray.700">Top Picks For You</Heading>
                <Button size="sm" variant="link" colorScheme="blue" as={Link} to="/explorer">View All</Button>
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {recommendedDeals.length > 0 ? recommendedDeals.map((deal) => (
                  <Box key={deal.id} bg="white" p={3} rounded="xl" shadow="sm" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'md', borderColor: 'blue.200' }} transition="all 0.2s">
                    <Box h="100px" bg="gray.100" rounded="lg" mb={3} backgroundImage={`url(${getImgUrl(deal)})`} backgroundSize="cover" backgroundPosition="center" />
                    <Heading size="xs" noOfLines={1} mb={1}>{deal.name}</Heading>
                    <Flex align="center" justify="space-between">
                      <Text fontWeight="bold" fontSize="sm" color="gray.800">₹{deal.price?.toLocaleString()}</Text>
                      <Badge colorScheme="green" fontSize="xs">98% Match</Badge>
                    </Flex>
                  </Box>
                )) : (
                  <Text fontSize="sm" color="gray.500">Loading recommendations...</Text>
                )}
              </SimpleGrid>
            </Box>
          </Stack>

          <Box>
            <Box bg="white" p={6} rounded="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
              <Flex align="center" mb={6}>
                <Icon as={FaClock} color="blue.500" mr={2} />
                <Heading size="sm" color="gray.700">Recent Activity</Heading>
              </Flex>
              <Stack spacing={0}>
                {RECENT_ACTIVITY.map((item, index) => (
                  <Box key={item.id} position="relative" pb={index === RECENT_ACTIVITY.length - 1 ? 0 : 6}>
                    {index !== RECENT_ACTIVITY.length - 1 && (
                      <Box position="absolute" left="15px" top="24px" bottom="0" w="2px" bg="gray.100" />
                    )}
                    <Flex>
                      <Flex zIndex={1} w={8} h={8} rounded="full" bg={item.type === 'drop' ? 'green.100' : 'blue.100'} align="center" justify="center" mr={4} shrink={0}>
                        <Icon as={item.type === 'drop' ? FaArrowDown : FaStar} color={item.type === 'drop' ? 'green.500' : 'blue.500'} boxSize={3} />
                      </Flex>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.800">{item.text}</Text>
                        <Text fontSize="xs" color="gray.400">{item.time}</Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box mt={6} p={6} bgGradient="linear(to-br, purple.500, blue.600)" rounded="2xl" shadow="lg" color="white" textAlign="center">
              <Icon as={FaMagic} boxSize={8} mb={3} opacity={0.8} />
              <Heading size="sm" mb={2}>Upgrade to Pro</Heading>
              <Text fontSize="sm" opacity={0.9} mb={4}>Get unlimited AI predictions and SMS alerts.</Text>
              <Button size="sm" bg="white" color="blue.600" width="full">View Plans</Button>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      <Box bg="white" color="gray.600" py={10} borderTop="1px solid" borderColor="gray.200" mt="auto">
        <Container maxW={'6xl'} textAlign="center">
          <Heading size="md" mb={2} color="blue.600">Market Mind</Heading>
          <Text fontSize="sm">© 2024 Market Mind Inc. Smart Shopping for Smart People.</Text>
        </Container>
      </Box>
    </Box>
  );
}