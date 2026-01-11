import {
    Box, Heading, Text, Input, Button, SimpleGrid, Stack, Container,
    Card, CardBody, Image, Flex, Badge, Icon, useToast, VStack, Collapse,
    useColorModeValue, Select
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config';

const CleanProductCard = ({ item }) => {
    const [showSpecs, setShowSpecs] = useState(false);
    const shortName = item.name ? item.name.split(' ').slice(0, 5).join(' ') : "Unknown Product";
    const bg = useColorModeValue('white', 'gray.700');

    const imgSeed = item.id || item.name.replace(/\s/g, '');
    const imgUrl = `https://picsum.photos/seed/${imgSeed}/300/200`;

    return (
        <Card direction={{ base: 'column', sm: 'row' }} overflow="hidden" variant="outline" p={0} mb={4} bg={bg} shadow="sm">
            <Image
                objectFit="cover"
                maxW={{ base: '100%', sm: '150px' }}
                h={{ base: '150px', sm: 'auto' }}
                src={imgUrl}
                alt={item.name}
            />
            <Stack p={4} w="full">
                <CardBody p={0}>
                    <Flex justify="space-between" align="start">
                        <Box>
                            <Badge mb={2} colorScheme={item.isMock ? "orange" : "teal"} variant="solid" rounded="md" px={2}>
                                {item.role || "Component"} {item.isMock && "(Demo)"}
                            </Badge>

                            <Heading size="md" mb={1}>{shortName}</Heading>

                            <Text
                                fontSize="sm" color="blue.500" cursor="pointer" fontWeight="bold"
                                display="flex" alignItems="center" onClick={() => setShowSpecs(!showSpecs)} mt={1}
                            >
                                {showSpecs ? "Hide Specs" : "View Specs"} <Icon as={showSpecs ? FaChevronUp : FaChevronDown} ml={1} size="xs" />
                            </Text>

                            <Collapse in={showSpecs} animateOpacity>
                                <Text fontSize="xs" color="gray.500" mt={2} noOfLines={3}>{item.name}</Text>
                            </Collapse>
                        </Box>

                        <VStack align="end">
                            <Text fontSize="xl" fontWeight="bold" color="green.600">₹{item.price.toLocaleString()}</Text>
                            <Button size="xs" colorScheme="gray" onClick={() => window.open(`https://www.amazon.in/s?k=${item.name}`, '_blank')}>
                                Buy
                            </Button>
                        </VStack>
                    </Flex>
                </CardBody>
            </Stack>
        </Card>
    );
};

export default function BudgetBuilder() {
    const [budget, setBudget] = useState('');
    const [selectedType, setSelectedType] = useState('gaming');
    const [setupResult, setSetupResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!budget || budget < 5000) {
            toast({ title: "Invalid Budget", description: "Minimum budget is ₹5,000", status: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/build-setup`, {
                budget: parseInt(budget),
                type: selectedType
            });
            setSetupResult(response.data);
            toast({ title: "Setup Generated!", status: "success", duration: 2000 });
        } catch (error) {
            console.error("API Error", error);
            toast({ title: "Error", description: "Server didn't respond. Is it running?", status: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box minH="100vh" bg="gray.50" py={10}>
            <Container maxW="5xl">
                <VStack spacing={8} align="stretch">
                    <Box textAlign="center" py={5}>
                        <Heading size="2xl" mb={2} bgGradient="linear(to-r, teal.400, green.500)" bgClip="text">
                            Smart Setup Builder
                        </Heading>
                        <Text color="gray.500">AI-powered recommendations for your budget.</Text>
                    </Box>

                    <Card p={6} shadow="lg" rounded="xl" borderTop="4px solid" borderColor="teal.400">
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="end">
                            <Box>
                                <Text fontWeight="bold" mb={2}>Total Budget (₹)</Text>
                                <Input placeholder="50000" size="lg" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
                            </Box>
                            <Box>
                                <Text fontWeight="bold" mb={2}>Type</Text>
                                <Select size="lg" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                    <option value="gaming">🎮 Gaming</option>
                                    <option value="productivity">💼 Work / Office</option>
                                    <option value="entertainment">🎬 Home Cinema</option>
                                </Select>
                            </Box>
                            <Button size="lg" colorScheme="teal" onClick={handleGenerate} isLoading={isLoading}>
                                Generate Setup
                            </Button>
                        </SimpleGrid>
                    </Card>

                    {setupResult && (
                        <Box>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="lg" color="gray.700">Recommended Setup</Heading>
                                <Badge colorScheme="green" fontSize="xl" p={2} borderRadius="md">
                                    Total: ₹{setupResult.totalCost.toLocaleString()}
                                </Badge>
                            </Flex>
                            <Stack spacing={4}>
                                {setupResult.items.map((item, index) => (
                                    <CleanProductCard key={index} item={item} />
                                ))}
                            </Stack>
                        </Box>
                    )}
                </VStack>
            </Container>
        </Box>
    );
}