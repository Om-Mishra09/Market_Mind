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
        <Box bg={bg} px={4} boxShadow="sm" position="sticky" top={0} zIndex="sticky">
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <Box>
                    <Heading size="md" color="blue.600">
                        <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                            Market Mind
                        </Link>
                    </Heading>
                </Box>

                <Flex alignItems={'center'}>
                    <Link as={RouterLink} to="/" px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.100' }} color={color}>
                        Home
                    </Link>

                    {user && (
                        <>
                            <Link as={RouterLink} to="/explorer" px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.100' }} color={color}>
                                Deals Explorer
                            </Link>
                            <Link as={RouterLink} to="/watchlist" px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.100' }} color={color}>
                                Watchlist
                            </Link>
                            <Button
                                as={RouterLink}
                                to="/budget"
                                size="sm"
                                colorScheme="purple"
                                variant="solid"
                                leftIcon={<span>✨</span>}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                            >
                                Smart Budget
                            </Button>
                        </>
                    )}

                    <Spacer w={4} />

                    {user ? (
                        <HStack spacing={4}>
                            <Text fontSize="sm" fontWeight="bold">{user.name}</Text>
                            <Button onClick={handleLogout} colorScheme="red" size="sm" variant="outline">
                                Logout
                            </Button>
                        </HStack>
                    ) : (
                        <HStack spacing={2}>
                            <Button as={RouterLink} to="/login" colorScheme="blue" size="sm" variant="ghost">
                                Login
                            </Button>
                            <Button as={RouterLink} to="/register" colorScheme="blue" size="sm" variant="solid">
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
