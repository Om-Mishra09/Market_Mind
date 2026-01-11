import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    Spinner,
    Flex,
    useToast,
    Button,
    VStack,
    Icon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SearchIcon } from '@chakra-ui/icons';
import ProductCard from '../components/ProductCard';
import API_BASE_URL from '../config';

export default function Watchlist() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        const user = JSON.parse(localStorage.getItem('market_mind_user'));
        if (!user || !user.token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/watchlist`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            const formattedItems = response.data.map(item => ({
                ...item.product,
                watchlistId: item.id
            }));

            setItems(formattedItems);
        } catch (error) {
            console.error("Failed to fetch watchlist", error);
            toast({
                title: 'Error loading watchlist',
                description: 'Could not connect to the server.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        const user = JSON.parse(localStorage.getItem('market_mind_user'));
        const itemToRemove = items.find(i => i.id === productId);
        if (!itemToRemove) return;

        const idToDelete = itemToRemove.watchlistId || productId;

        try {
            await axios.delete(`${API_BASE_URL}/api/watchlist/${idToDelete}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setItems(prev => prev.filter(i => i.id !== productId));

            toast({
                title: 'Item removed',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Remove failed:", error);
            toast({
                title: 'Failed to remove',
                description: 'Could not remove item.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={4} minH="calc(100vh - 64px)">
            <Container maxW="7xl">
                <Heading mb={6}>My Watchlist</Heading>

                {isLoading ? (
                    <Flex justify="center" align="center" minH="200px">
                        <Spinner size="xl" color="blue.500" />
                    </Flex>
                ) : items.length === 0 ? (
                    <VStack spacing={6} py={20} textAlign="center">
                        <Icon as={SearchIcon} w={20} h={20} color="gray.300" />
                        <Heading size="lg" color="gray.500">No items watched yet</Heading>
                        <Text color="gray.500">Start tracking prices to find the best deals.</Text>
                        <Button as={RouterLink} to="/explorer" colorScheme="blue" size="lg">
                            Explore Deals
                        </Button>
                    </VStack>
                ) : (
                    <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
                        {items.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isWatchlist={true}
                                onRemove={() => handleRemove(product.id)}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </Container>
        </Box>
    );
}
