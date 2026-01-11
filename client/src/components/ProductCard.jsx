import React, { useState } from 'react';
import {
    Box,
    Image,
    Badge,
    Text,
    Stack,
    Button,
    useColorModeValue,
    Tooltip,
    Card,
    CardBody,
    CardFooter,
    Heading,
    Flex,
    Icon,
    Divider,
} from '@chakra-ui/react';
import { StarIcon, ViewIcon } from '@chakra-ui/icons';
import { getCategoryImage } from '../utils/imageMap';

const ProductCard = ({ product, onAnalyze, onWatch, onRemove, isWatchlist = false, isAnalyzing = false }) => {
    const bg = 'white';
    const borderColor = 'gray.200';
    const [isWatching, setIsWatching] = useState(false);

    // Get static high-quality image
    const imageUrl = getCategoryImage(product.category);

    // Competitor Price Logic (Mock)
    // Formula: price * (1.05 + 0.00 to 0.10) => 5% to 15% higher
    const competitorPrice = Math.floor(product.price * (1.05 + Math.random() * 0.10));
    const savings = competitorPrice - product.price;

    // Logic for badges based on prediction
    const showPrediction = product.predicted_price !== undefined && product.predicted_price !== null;
    const isGreatDeal = showPrediction && product.price < product.predicted_price;
    const isOverpriced = showPrediction && product.price > product.predicted_price;

    const handleWatchClick = async () => {
        setIsWatching(true);
        try {
            await onWatch(product);
        } finally {
            setIsWatching(false);
        }
    };

    return (
        <Card
            maxW="sm"
            bg={bg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
        >
            <Box position="relative" height="200px" overflow="hidden">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    h="100%"
                    w="100%"
                    objectFit="cover"
                    transition="transform 0.3s"
                    _hover={{ transform: 'scale(1.05)' }}
                />
                <Badge
                    position="absolute"
                    top={3}
                    right={3}
                    bg="whiteAlpha.900"
                    color="gray.700"
                    fontSize="xs"
                    borderRadius="md"
                    px={2}
                    py={1}
                    boxShadow="sm"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    fontWeight="bold"
                >
                    {product.category || 'General'}
                </Badge>

                {savings > 0 && (
                    <Badge
                        position="absolute"
                        bottom={3}
                        left={3}
                        colorScheme="green"
                        variant="solid"
                        fontSize="xs"
                        borderRadius="full"
                        px={3}
                        py={0.5}
                        boxShadow="md"
                    >
                        Save ₹{savings.toLocaleString()} vs Competitors
                    </Badge>
                )}
            </Box>

            <CardBody pb={2} pt={4}>
                <Stack spacing={2}>
                    {product.rating ? (
                        <Flex align="center">
                            <StarIcon color="orange.400" w={3} h={3} />
                            <Text fontSize="xs" ml={1} fontWeight="semibold" color="gray.600">
                                {product.rating} <Text as="span" fontWeight="normal" color="gray.400">({product.rating_count})</Text>
                            </Text>
                        </Flex>
                    ) : <Box h={4} />}

                    <Heading size="md" noOfLines={2} title={product.name} lineHeight="1.4" fontWeight="600" color="gray.800">
                        {product.name}
                    </Heading>

                    <Box mt={1}>
                        <Flex align="baseline" wrap="wrap" gap={2}>
                            <Text fontSize="2xl" fontWeight="700" color="gray.900">
                                ₹{product.price?.toLocaleString()}
                            </Text>
                            <Text fontSize="xs" color="gray.500" textDecoration="line-through">
                                vs Flipkart: ₹{competitorPrice.toLocaleString()}
                            </Text>
                        </Flex>

                        {showPrediction && (
                            <Text fontSize="sm" color="blue.600" fontWeight="medium" mt={1}>
                                AI Fair Price: ₹{Math.round(product.predicted_price).toLocaleString()}
                            </Text>
                        )}
                    </Box>

                    {showPrediction && (
                        <Box pt={1}>
                            {isGreatDeal && (
                                <Badge colorScheme="green" variant="subtle" w="full" textAlign="center" py={1} borderRadius="md">
                                    🔥 Amazing Deal
                                </Badge>
                            )}
                            {isOverpriced && (
                                <Badge colorScheme="red" variant="subtle" w="full" textAlign="center" py={1} borderRadius="md">
                                    ⚠️ Check Other Options
                                </Badge>
                            )}
                        </Box>
                    )}
                </Stack>
            </CardBody>

            <CardFooter pt={3} pb={4} px={5}>
                <Stack w="full" spacing={3}>
                    {!isWatchlist && (
                        <>
                            {!showPrediction ? (
                                <Button
                                    w="full"
                                    size="sm"
                                    colorScheme="gray"
                                    variant="outline"
                                    onClick={() => onAnalyze(product)}
                                    isLoading={isAnalyzing}
                                    loadingText="Analyzing"
                                    fontSize="sm"
                                    borderColor="gray.300"
                                    _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                                >
                                    Analyze Price
                                </Button>
                            ) : (
                                <Button w="full" size="sm" colorScheme="green" variant="ghost" isDisabled leftIcon={<ViewIcon />} fontSize="sm">
                                    Analysis Ready
                                </Button>
                            )}

                            <Button
                                w="full"
                                size="sm"
                                colorScheme="blue"
                                variant="solid"
                                onClick={handleWatchClick}
                                isLoading={isWatching}
                                loadingText="Adding..."
                                fontWeight="600"
                                _hover={{ bg: 'blue.600' }}
                            >
                                Add to Watchlist
                            </Button>
                        </>
                    )}

                    {isWatchlist && (
                        <Button
                            w="full"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => onRemove(product.id)}
                            _hover={{ bg: 'red.50' }}
                        >
                            Remove
                        </Button>
                    )}
                </Stack>
            </CardFooter>
        </Card>
    );
};

export default ProductCard;
