import React from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    Stack,
    Container,
    SimpleGrid,
    Icon,
    Flex,
    useColorModeValue,
    Image
} from '@chakra-ui/react';
import { FaChartLine, FaRobot, FaHeart, FaArrowRight, FaCheckCircle, FaRocket } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, text, icon, color }) => {
    return (
        <Stack
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow={'xl'}
            p={8}
            rounded={'2xl'}
            align={'flex-start'}
            pos={'relative'}
            _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
            transition="all 0.3s ease"
            borderTop={`4px solid`}
            borderColor={color}
        >
            <Flex
                w={12}
                h={12}
                align={'center'}
                justify={'center'}
                color={'white'}
                rounded={'lg'}
                bg={color}
                mb={4}
            >
                {icon}
            </Flex>
            <Heading size="md" fontWeight="bold">{title}</Heading>
            <Text color={'gray.500'} fontSize="sm">{text}</Text>
        </Stack>
    );
};

export default function LandingPage() {
    return (
        <Box overflowX="hidden">

            <Box bg="gray.900" position="relative" pb={20} pt={20}>
                <Box position="absolute" top="-20%" left="-10%" w="600px" h="600px" bg="blue.600" filter="blur(120px)" opacity={0.2} rounded="full" />
                <Box position="absolute" bottom="-10%" right="-5%" w="500px" h="500px" bg="purple.600" filter="blur(120px)" opacity={0.2} rounded="full" />

                <Container maxW={'6xl'} position="relative" zIndex={10}>
                    <Stack direction={{ base: 'column', md: 'row' }} spacing={10} align="center">

                        <Stack flex={1} spacing={6}>
                            <Flex align="center" color="blue.400" fontWeight="bold" letterSpacing="wide" fontSize="sm">
                                <Icon as={FaRocket} mr={2} />
                                V2.0 NOW LIVE
                            </Flex>

                            <Heading lineHeight={1.1} fontWeight={800} fontSize={{ base: '4xl', md: '6xl' }} color="white">
                                Stop Overpaying <br />
                                <Text as={'span'} bgGradient="linear(to-r, blue.400, teal.300)" bgClip="text">
                                    For Tech.
                                </Text>
                            </Heading>

                            <Text color={'gray.400'} fontSize={'lg'}>
                                Market Mind uses AI to track prices, compare retailers, and build your dream setup within your exact budget. Don't buy until you check here.
                            </Text>

                            <Stack spacing={4} direction={{ base: 'column', sm: 'row' }}>
                                <Button
                                    as={Link} to="/register"
                                    rounded={'full'} size={'lg'} px={8}
                                    bgGradient="linear(to-r, blue.500, teal.500)"
                                    color={'white'}
                                    _hover={{ bgGradient: 'linear(to-r, blue.600, teal.600)', transform: 'scale(1.05)' }}
                                    rightIcon={<FaArrowRight />}
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    as={Link} to="/login"
                                    rounded={'full'} size={'lg'} px={8}
                                    variant="outline" colorScheme="gray" color="white"
                                    _hover={{ bg: 'whiteAlpha.200' }}
                                >
                                    Login
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={4} align="center" pt={4}>
                                <Text color="gray.500" fontSize="sm"><Icon as={FaCheckCircle} color="green.400" mr={1} /> No credit card</Text>
                                <Text color="gray.500" fontSize="sm"><Icon as={FaCheckCircle} color="green.400" mr={1} /> 1400+ Products</Text>
                            </Stack>
                        </Stack>

                        <Flex flex={1} justify={'center'} align={'center'} position={'relative'} w={'full'}>
                            <Box
                                position={'relative'}
                                height={'350px'}
                                rounded={'2xl'}
                                boxShadow={'2xl'}
                                width={'full'}
                                overflow={'hidden'}
                                bg="gray.800"
                                border="1px solid"
                                borderColor="gray.700"
                            >
                                <Image
                                    alt={'Hero Image'}
                                    fit={'cover'}
                                    align={'center'}
                                    w={'100%'}
                                    h={'100%'}
                                    opacity={0.8}
                                    src={
                                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
                                    }
                                />
                                <Box position="absolute" bottom="0" w="full" bgGradient="linear(to-t, gray.900, transparent)" h="150px" />
                            </Box>
                        </Flex>

                    </Stack>
                </Container>
            </Box>

            <Box p={10} bg="gray.50" position="relative" zIndex={20} mt={-16}>
                <Container maxW={'6xl'}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                        <FeatureCard
                            color="blue.400"
                            icon={<Icon as={FaChartLine} w={6} h={6} />}
                            title={'Fair Price AI'}
                            text={'Our algorithm analyzes historical data to tell you if a "deal" is actually a scam or a steal.'}
                        />
                        <FeatureCard
                            color="teal.400"
                            icon={<Icon as={FaRobot} w={6} h={6} />}
                            title={'Smart Budget Builder'}
                            text={'Tell us you have ₹50,000. We will find the perfect combination of Laptop, Monitor, and Mouse for you.'}
                        />
                        <FeatureCard
                            color="purple.400"
                            icon={<Icon as={FaHeart} w={6} h={6} />}
                            title={'Personal Watchlist'}
                            text={'Save your favorite items to your personal dashboard to track their prices and availability at a glance.'}
                        />
                    </SimpleGrid>
                </Container>
            </Box>

            <Box bg="white" color="gray.600" py={10} borderTop="1px solid" borderColor="gray.200">
                <Container maxW={'6xl'} textAlign="center">
                    <Heading size="md" mb={2} color="blue.600">Market Mind</Heading>
                    <Text fontSize="sm">© 2024 Market Mind Inc. Smart Shopping for Smart People.</Text>
                </Container>
            </Box>
        </Box>
    );
}