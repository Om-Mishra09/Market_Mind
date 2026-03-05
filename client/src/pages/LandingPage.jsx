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
            p={8}
            rounded="3xl"
            align={'flex-start'}
            pos={'relative'}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            boxShadow="sm"
            _hover={{
                transform: 'translateY(-6px)',
                shadow: '2xl',
                borderColor: useColorModeValue(`${color.split('.')[0]}.100`, `${color.split('.')[0]}.800`)
            }}
            transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
        >
            <Flex
                w={14}
                h={14}
                align={'center'}
                justify={'center'}
                rounded={'2xl'}
                color={color}
                bg={useColorModeValue(`${color.split('.')[0]}.50`, `${color.split('.')[0]}.900`)}
                mb={5}
                shadow="sm"
            >
                {icon}
            </Flex>
            <Heading size="md" fontWeight="800" color={useColorModeValue('gray.900', 'white')}>{title}</Heading>
            <Text color={useColorModeValue('gray.500', 'gray.400')} fontSize="md" lineHeight="tall">{text}</Text>
        </Stack>
    );
};

export default function LandingPage() {
    return (
        <Box overflowX="hidden" bg={useColorModeValue('#f8fafc', 'gray.900')}>
            {/* HERO SECTION */}
            <Box position="relative" pb={32} pt={{ base: 20, md: 32 }} overflow="hidden">
                {/* Modern Mesh/Radial Gradients */}
                <Box position="absolute" top="-10%" left="-10%" w="800px" h="800px" bgGradient="radial(blue.400, transparent, transparent)" filter="blur(140px)" opacity={0.15} rounded="full" style={{ mixBlendMode: 'multiply' }} />
                <Box position="absolute" bottom="-20%" right="-5%" w="600px" h="600px" bgGradient="radial(purple.400, transparent, transparent)" filter="blur(140px)" opacity={0.15} rounded="full" style={{ mixBlendMode: 'multiply' }} />

                {/* Subtle Dotted Grid Background */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    opacity={useColorModeValue(0.4, 0.1)}
                    backgroundImage="radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)"
                    backgroundSize="32px 32px"
                    zIndex={0}
                />

                <Container maxW={'7xl'} position="relative" zIndex={10}>
                    <Stack direction={{ base: 'column', lg: 'row' }} spacing={{ base: 12, lg: 16 }} align="center">

                        <Stack flex={1} spacing={8} maxW={{ base: 'full', lg: 'xl' }}>
                            <Flex
                                align="center"
                                bg={useColorModeValue('white', 'gray.800')}
                                border="1px solid"
                                borderColor={useColorModeValue('gray.200', 'gray.700')}
                                rounded="full"
                                px={4}
                                py={1.5}
                                w="fit-content"
                                shadow="sm"
                            >
                                <Icon as={FaRocket} color="blue.500" mr={2} boxSize={3.5} />
                                <Text fontSize="xs" fontWeight="800" color={useColorModeValue('gray.700', 'gray.300')} letterSpacing="widest" textTransform="uppercase">
                                    V2.0 NOW LIVE
                                </Text>
                            </Flex>

                            <Heading
                                lineHeight={1.1}
                                fontWeight={900}
                                fontSize={{ base: '4xl', sm: '5xl', lg: '6xl' }}
                                color={useColorModeValue('gray.900', 'white')}
                                letterSpacing="tight"
                            >
                                Stop Overpaying <br />
                                <Text as={'span'} bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text" display="inline-block" py={2}>
                                    For Tech.
                                </Text>
                            </Heading>

                            <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize={'xl'} lineHeight="tall" fontWeight="400">
                                Market Mind uses AI to track prices, compare retailers, and build your dream setup within your exact budget. Don't buy until you check here.
                            </Text>

                            <Stack spacing={4} direction={{ base: 'column', sm: 'row' }} pt={4}>
                                <Button
                                    as={Link} to="/register"
                                    rounded={'full'}
                                    size={'lg'}
                                    h={14}
                                    px={10}
                                    fontWeight="bold"
                                    bg="gray.900"
                                    color={'white'}
                                    _hover={{ bg: 'gray.800', transform: 'translateY(-2px)', shadow: 'xl' }}
                                    _active={{ transform: 'none' }}
                                    transition="all 0.2s"
                                    rightIcon={<FaArrowRight />}
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    as={Link} to="/login"
                                    rounded={'full'}
                                    size={'lg'}
                                    h={14}
                                    px={10}
                                    fontWeight="bold"
                                    variant="outline"
                                    colorScheme="gray"
                                    color={useColorModeValue('gray.700', 'white')}
                                    bg={useColorModeValue('white', 'transparent')}
                                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                                    _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.200'), transform: 'translateY(-2px)', shadow: 'sm' }}
                                    _active={{ transform: 'none' }}
                                    transition="all 0.2s"
                                >
                                    Login
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={6} align="center" pt={4} divider={<Box as="span" w="4px" h="4px" rounded="full" bg="gray.300" />}>
                                <Flex align="center">
                                    <Icon as={FaCheckCircle} color="teal.500" mr={2} />
                                    <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm" fontWeight="600">No credit card</Text>
                                </Flex>
                                <Flex align="center">
                                    <Icon as={FaCheckCircle} color="teal.500" mr={2} />
                                    <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm" fontWeight="600">1400+ Products</Text>
                                </Flex>
                            </Stack>
                        </Stack>

                        <Flex flex={1} justify={'center'} align={'center'} position={'relative'} w={'full'}>
                            <Box
                                position={'relative'}
                                height={{ base: '300px', sm: '400px', lg: '500px' }}
                                rounded={'3xl'}
                                boxShadow={'2xl'}
                                width={'full'}
                                overflow={'hidden'}
                                bg="gray.900"
                                border="4px solid"
                                borderColor={useColorModeValue('white', 'gray.800')}
                                transform="perspective(1000px) rotateY(-12deg) rotateX(5deg)"
                                transition="transform 0.5s ease"
                                _hover={{ transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)' }}
                            >
                                <Image
                                    alt={'Hero Image'}
                                    fit={'cover'}
                                    align={'center'}
                                    w={'100%'}
                                    h={'100%'}
                                    opacity={0.9}
                                    src={'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
                                />
                                <Box position="absolute" inset="0" bgGradient="linear(to-tr, rgba(0,0,0,0.4), transparent)" />
                            </Box>

                            {/* Decorative Elements around image */}
                            <Box position="absolute" top="-4" right="-4" w="24" h="24" bgGradient="linear(to-br, blue.400, purple.400)" rounded="full" filter="blur(20px)" opacity={0.6} zIndex={-1} />
                            <Box position="absolute" bottom="-8" left="10" w="32" h="32" bgGradient="linear(to-tr, teal.400, blue.400)" rounded="full" filter="blur(30px)" opacity={0.5} zIndex={-1} />
                        </Flex>

                    </Stack>
                </Container>
            </Box>

            {/* FEATURES SECTION */}
            <Box py={24} bg={useColorModeValue('white', 'gray.900')} position="relative" zIndex={20}>
                <Container maxW={'7xl'}>
                    <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'} mb={16}>
                        <Text color={'blue.500'} fontWeight={800} textTransform={'uppercase'} letterSpacing={'widest'} fontSize={'sm'}>
                            Smart Features
                        </Text>
                        <Heading fontSize={'4xl'} fontWeight={900} color={useColorModeValue('gray.900', 'white')}>
                            Everything you need to buy smart.
                        </Heading>
                    </Stack>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, lg: 12 }}>
                        <FeatureCard
                            color="blue.500"
                            icon={<Icon as={FaChartLine} w={6} h={6} />}
                            title={'Fair Price AI'}
                            text={'Our algorithm analyzes historical data to tell you if a "deal" is actually a scam or a steal. Shop with absolute confidence.'}
                        />
                        <FeatureCard
                            color="purple.500"
                            icon={<Icon as={FaRobot} w={6} h={6} />}
                            title={'Smart Budget Builder'}
                            text={'Tell us you have ₹50,000. We will instantly find the perfect, compatible combination of Laptop, Monitor, and Accessories for you.'}
                        />
                        <FeatureCard
                            color="teal.500"
                            icon={<Icon as={FaHeart} w={6} h={6} />}
                            title={'Personal Watchlist'}
                            text={'Pin your favorite items to your personal dashboard to track their real-time prices and availability at a single glance.'}
                        />
                    </SimpleGrid>
                </Container>
            </Box>

            {/* FOOTER */}
            <Box bg={useColorModeValue('gray.50', 'gray.900')} color="gray.500" py={12} borderTop="1px solid" borderColor={useColorModeValue('gray.200', 'gray.800')}>
                <Container maxW={'7xl'} textAlign="center">
                    <Flex justify="center" align="center" mb={4}>
                        <Icon as={FaRobot} color="gray.400" mr={2} boxSize={5} />
                        <Heading size="md" fontWeight="800" color={useColorModeValue('gray.900', 'white')} letterSpacing="tight">Market Mind</Heading>
                    </Flex>
                    <Text fontSize="sm" fontWeight="500">© 2026 Market Mind Inc. Smart Shopping for Smart People.</Text>
                </Container>
            </Box>
        </Box>
    );
}