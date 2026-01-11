import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    useToast,
    Container,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(name, email, password);
            toast({
                title: 'Account created.',
                description: "You've successfully registered.",
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/');
        } catch (error) {
            toast({
                title: 'Registration failed.',
                description: error.response?.data?.error || 'Something went wrong.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="md" py={12}>
            <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
                <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                    <Heading size="lg">Create Account</Heading>
                    <Text color="gray.500">Join Market Mind today</Text>

                    <FormControl id="name" isRequired>
                        <FormLabel>Full Name</FormLabel>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </FormControl>

                    <FormControl id="email" isRequired>
                        <FormLabel>Email address</FormLabel>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                        />
                    </FormControl>

                    <FormControl id="password" isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme="blue"
                        width="full"
                        isLoading={isLoading}
                        loadingText="Creating account..."
                    >
                        Sign Up
                    </Button>

                    <Text fontSize="sm">
                        Already have an account?{' '}
                        <Text as={RouterLink} to="/login" color="blue.500" fontWeight="bold">
                            Log In
                        </Text>
                    </Text>
                </VStack>
            </Box>
        </Container>
    );
}
