import { Box, Flex, Link, Button, Heading, Spacer, useColorModeValue, Text, HStack } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const bg = useColorModeValue('white', 'gray.800');
    const color = useColorModeValue('gray.600', 'white');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Box
            as="nav"
            position="sticky"
            top={0}
            zIndex="banner"
            bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
            backdropFilter="blur(16px) saturate(180%)"
            borderBottom="1px solid"
            borderColor={useColorModeValue('whiteAlpha.300', 'whiteAlpha.100')}
            boxShadow="sm"
            transition="all 0.3s ease-in-out"
        >
            <Flex
                h={16}
                alignItems={'center'}
                justifyContent={'space-between'}
                maxW="7xl"
                mx="auto"
                px={{ base: 4, md: 8 }}
            >
                <Box>
                    <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                        <Heading
                            size="md"
                            fontWeight="900"
                            letterSpacing="tight"
                            bgGradient="linear(to-r, blue.500, teal.400)"
                            bgClip="text"
                            display="flex"
                            alignItems="center"
                            gap={2}
                        >
                            Market Mind
                        </Heading>
                    </Link>
                </Box>

                <Flex alignItems={'center'} gap={{ base: 2, md: 4 }}>
                    <Link
                        as={RouterLink}
                        to="/"
                        px={3}
                        py={2}
                        rounded={'xl'}
                        fontSize="sm"
                        fontWeight="600"
                        color={color}
                        _hover={{ textDecoration: 'none', bg: useColorModeValue('gray.100', 'gray.700'), color: useColorModeValue('gray.900', 'white') }}
                        transition="all 0.2s"
                        display={{ base: 'none', md: 'block' }}
                    >
                        Home
                    </Link>

                    {user && (
                        <>
                            <Link
                                as={RouterLink}
                                to="/explorer"
                                px={3}
                                py={2}
                                rounded={'xl'}
                                fontSize="sm"
                                fontWeight="600"
                                color={color}
                                _hover={{ textDecoration: 'none', bg: useColorModeValue('gray.100', 'gray.700'), color: useColorModeValue('gray.900', 'white') }}
                                transition="all 0.2s"
                                display={{ base: 'none', md: 'block' }}
                            >
                                Deals Explorer
                            </Link>
                            <Link
                                as={RouterLink}
                                to="/watchlist"
                                px={3}
                                py={2}
                                rounded={'xl'}
                                fontSize="sm"
                                fontWeight="600"
                                color={color}
                                _hover={{ textDecoration: 'none', bg: useColorModeValue('gray.100', 'gray.700'), color: useColorModeValue('gray.900', 'white') }}
                                transition="all 0.2s"
                                display={{ base: 'none', md: 'block' }}
                            >
                                Watchlist
                            </Link>
                        </>
                    )}

                    <Spacer w={{ base: 2, md: 6 }} display={{ base: 'block', md: 'none' }} />

                    {user && (
                        <Button
                            as={RouterLink}
                            to="/budget"
                            size="sm"
                            px={4}
                            h={9}
                            rounded="full"
                            fontWeight="bold"
                            color="white"
                            bgGradient="linear(to-r, purple.500, blue.500)"
                            boxShadow="0 4px 14px 0 rgba(147, 51, 234, 0.39)"
                            leftIcon={<span>✨</span>}
                            _hover={{
                                bgGradient: "linear(to-r, purple.600, blue.600)",
                                transform: 'translateY(-2px) scale(1.02)',
                                boxShadow: "0 6px 20px rgba(147, 51, 234, 0.23)"
                            }}
                            _active={{ transform: 'scale(0.98)' }}
                            transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                        >
                            Smart Budget
                        </Button>
                    )}

                    <Spacer w={2} />

                    {user ? (
                        <HStack spacing={4}>
                            <Box
                                bg={useColorModeValue('gray.100', 'gray.700')}
                                px={3}
                                py={1.5}
                                rounded="full"
                                display={{ base: 'none', sm: 'flex' }}
                                alignItems="center"
                            >
                                <Text fontSize="xs" fontWeight="700" color={useColorModeValue('gray.700', 'gray.200')} letterSpacing="wide">
                                    {user.name?.split(' ')[0]}
                                </Text>
                            </Box>
                            <Button
                                onClick={handleLogout}
                                colorScheme="red"
                                size="sm"
                                variant="ghost"
                                rounded="full"
                                fontWeight="600"
                                _hover={{ bg: 'red.50', color: 'red.600' }}
                            >
                                Logout
                            </Button>
                        </HStack>
                    ) : (
                        <HStack spacing={3}>
                            <Button
                                as={RouterLink}
                                to="/login"
                                colorScheme="gray"
                                size="sm"
                                variant="ghost"
                                rounded="full"
                                fontWeight="600"
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                            >
                                Log in
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/register"
                                size="sm"
                                rounded="full"
                                fontWeight="bold"
                                bg="gray.900"
                                color="white"
                                _hover={{ bg: 'gray.800', transform: 'translateY(-1px)', shadow: 'md' }}
                                _active={{ bg: 'gray.700', transform: 'none' }}
                                transition="all 0.2s"
                            >
                                Get Started
                            </Button>
                        </HStack>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};

export default Navbar;
