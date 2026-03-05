import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, Input, SimpleGrid, Select, Stack,
  Card, CardBody, Image, Flex, Badge, Icon, Button, Collapse,
  useToast, InputGroup, InputLeftElement, Spinner,
  HStack
} from '@chakra-ui/react';
import { FaSearch, FaChevronDown, FaChevronUp, FaChartLine, FaHeart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

// --- HELPER: CATEGORY IMAGES ---
const getCategoryImage = (category) => {
  const cat = category ? category.toLowerCase() : "";
  if (cat.includes('computer') || cat.includes('laptop')) return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80";
  if (cat.includes('phone') || cat.includes('mobile')) return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80";
  if (cat.includes('audio') || cat.includes('headphone')) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80";
  if (cat.includes('tv') || cat.includes('monitor')) return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80";
  if (cat.includes('cloth') || cat.includes('fashion')) return "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80";
  if (cat.includes('home') || cat.includes('kitchen')) return "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=400&q=80";
  return "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80";
};

// --- CARD COMPONENT ---
const ExplorerCard = ({ product }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [showSpecs, setShowSpecs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  const shortName = product.name ? product.name.split(' ').slice(0, 5).join(' ') : "Unknown Product";
  const imgUrl = getCategoryImage(product.category);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Get AI Prediction from Backend
      // Defaults to 0/4.0 if missing to prevent Python errors
      const aiResponse = await axios.post(`${API_BASE_URL}/api/predict`, {
        name: product.name,
        category: product.category,
        rating: product.rating || 4.0,
        rating_count: product.rating_count || 100
      });

      const aiPrice = aiResponse.data.predicted_price;

      // 2. Mock Competitor Data (Flipkart) 
      const flipkartVariance = (Math.random() * 0.2) - 0.1;
      const flipkartPrice = Math.floor(product.price * (1 + flipkartVariance));

      // 3. Verdict Logic
      // If actual price is lower than AI fair price, it's a "Steal"
      const isGoodDeal = product.price < aiPrice;

      setAnalysisData({
        flipkartPrice,
        aiPrice,
        verdict: isGoodDeal ? "Great Deal" : "Fair Price"
      });

    } catch (error) {
      console.error("AI Analysis Failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not fetch AI prediction. Ensure Python dependencies are installed.",
        status: "error"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToWatchlist = async () => {
    try {
      const token = localStorage.getItem("market_mind_token");

      if (!token) {
        alert("Please log in first.");
        return;
      }

      // --- STEP 1: CLEAN THE DATA ---
      // Remove "₹" and commas from price, then convert to Number
      // Example: "₹1,200" becomes 1200
      const cleanPrice = Number(String(product.price).replace(/[^0-9.]/g, ''));

      // Check if ID exists (Mongo usually uses _id, APIs use id)
      // Fallback: Generate an ID from the product name if missing
      const fallbackId = product.name
        ? product.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
        : `prod-${Date.now()}`;
      const productId = product.id || product._id || fallbackId;

      if (!productId) {
        console.error("Product has no ID!", product);
        alert("Error: Cannot add product (Missing ID). Check Console.");
        return;
      }

      // --- STEP 2: SEND CLEAN DATA ---
      const payload = {
        productId: productId,
        name: product.name,
        price: cleanPrice, // Sending a pure Number now
        image: product.image,
        link: product.link
      };

      console.log("Sending payload:", payload); // Check this in Console if it fails again!

      const response = await axios.post(
        `${API_BASE_URL}/api/watchlist`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Added to Watchlist!");

    } catch (error) {
      // --- STEP 3: SEE THE REAL ERROR MESSAGE ---
      console.error("Full Error Object:", error);

      if (error.response) {
        // The backend usually sends a message like "Price must be a number"
        console.error("Backend Error Data:", error.response.data);
        alert(`Failed: ${error.response.data.message || "Bad Request"}`);
      } else {
        alert("Network Error. Check console.");
      }
    }
  };

  return (
    <Card
      direction="column"
      overflow="hidden"
      variant="elevated"
      bg="white"
      shadow="md"
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="2xl"
      _hover={{ shadow: '2xl', transform: 'translateY(-6px)', borderColor: 'teal.200' }}
      transition="all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
      h="100%"
    >
      <Box position="relative" overflow="hidden">
        <Image
          objectFit="cover"
          h={{ base: "220px", md: "200px" }}
          w="100%"
          src={imgUrl}
          alt={product.name}
          fallbackSrc="https://via.placeholder.com/400x200"
          transition="transform 0.4s ease"
          _hover={{ transform: 'scale(1.05)' }}
        />
      </Box>

      <CardBody display="flex" flexDir="column" p={6}>
        <Flex justify="space-between" align="flex-start" mb={4} wrap="wrap" gap={2}>
          <Badge
            bg="teal.50"
            color="teal.600"
            rounded="full"
            px={3}
            py={1}
            fontSize="2xs"
            fontWeight="bold"
            letterSpacing="wider"
            textTransform="uppercase"
            noOfLines={1}
            maxW="55%"
          >
            {product.category?.split('|')[0]}
          </Badge>
          <Text fontWeight="900" fontSize="xl" color="gray.800" noOfLines={1} maxW="40%">
            ₹{product.price.toLocaleString()}
          </Text>
        </Flex>

        <Heading size="md" mb={2} fontWeight="800" color="gray.800" lineHeight="tight" noOfLines={2} title={shortName}>
          {shortName}
        </Heading>

        <Text
          fontSize="sm"
          color="teal.500"
          cursor="pointer"
          fontWeight="600"
          display="flex"
          alignItems="center"
          onClick={() => setShowSpecs(!showSpecs)}
          mb={3}
          _hover={{ color: 'teal.600' }}
          transition="color 0.2s"
        >
          {showSpecs ? "Hide Specs" : "View Specs"}
          <Icon as={showSpecs ? FaChevronUp : FaChevronDown} ml={1} transition="transform 0.2s" />
        </Text>

        <Collapse in={showSpecs} animateOpacity>
          <Text fontSize="sm" color="gray.500" mb={4} noOfLines={4} lineHeight="relaxed">
            {product.name}
          </Text>
        </Collapse>

        {analysisData && (
          <Box
            bg="#f8fafc"
            p={4}
            rounded="xl"
            mb={4}
            borderWidth="1px"
            borderColor="gray.200"
            shadow="inner"
          >
            <Flex justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.500" fontWeight="600">Fair Price (AI):</Text>
              <Text fontSize="sm" fontWeight="800" color="teal.600">₹{analysisData.aiPrice?.toLocaleString()}</Text>
            </Flex>
            <Flex justify="space-between" mb={3}>
              <Text fontSize="sm" color="gray.500" fontWeight="600">Flipkart:</Text>
              <Text fontSize="sm" fontWeight="800" color="gray.800">₹{analysisData.flipkartPrice?.toLocaleString()}</Text>
            </Flex>
            <Flex justify="space-between" pt={3} borderTop="1px dashed" borderColor="gray.300" align="center">
              <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">Verdict:</Text>
              <Badge
                colorScheme={analysisData.verdict === "Great Deal" ? "teal" : "orange"}
                variant="subtle"
                rounded="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="bold"
                noOfLines={1}
              >
                {analysisData.verdict}
              </Badge>
            </Flex>
          </Box>
        )}

        <Box mt="auto" pt={2}>
          <Stack direction="row" spacing={3}>
            <Button
              flex={1}
              size="md"
              bg="teal.500"
              color="white"
              rounded="xl"
              fontWeight="bold"
              _hover={{ bg: 'teal.600', shadow: 'md', transform: 'translateY(-2px)' }}
              _active={{ bg: 'teal.700', transform: 'translateY(0)' }}
              transition="all 0.2s"
              leftIcon={<FaChartLine />}
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
            >
              Analyze
            </Button>
            <Button
              size="md"
              colorScheme="gray"
              variant="outline"
              rounded="xl"
              borderWidth="2px"
              _hover={{ bg: 'pink.50', color: 'pink.500', borderColor: 'pink.200', transform: 'translateY(-2px)', shadow: 'sm' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              isLoading={isWatchlistLoading}
              onClick={() => addToWatchlist()}
              aria-label="Add to Watchlist"
            >
              <Icon as={FaHeart} boxSize={4} />
            </Button>
          </Stack>
        </Box>
      </CardBody>
    </Card>
  );
};

// --- MAIN PAGE ---
export default function ProductExplorer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const productCat = p.category ? p.category.toLowerCase() : "";
    const matchesCategory = category === 'all' || productCat.includes(category);
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <Box minH="100vh" bg="#f4f4f5" py={12}>
      <Container maxW="7xl">
        <Stack spacing={3} mb={12} textAlign="center" alignItems="center">
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="900"
            color="gray.800"
            letterSpacing="tight"
          >
            Deals Explorer
          </Heading>
          <Text color="gray.500" fontSize="lg" maxW="2xl">
            Discover the best tech gadgets, analyze true market value with AI, and find unbeatable deals curated just for you.
          </Text>
        </Stack>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          mb={10}
          bg="white"
          p={4}
          rounded="2xl"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search products..."
              bg="gray.50"
              border="none"
              rounded="xl"
              _focus={{ bg: 'white', ring: 2, ringColor: 'teal.400' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>

          <Select
            size="lg"
            bg="gray.50"
            border="none"
            rounded="xl"
            w={{ base: 'full', md: '350px' }}
            _focus={{ bg: 'white', ring: 2, ringColor: 'teal.400' }}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="computers">Computers & Accessories</option>
            <option value="home">Home & Kitchen</option>
            <option value="clothing">Clothing & Apparel</option>
            <option value="health">Health & Personal Care</option>
            <option value="sports">Sports & Fitness</option>
          </Select>
        </Stack>

        {loading ? (
          <Flex justify="center" align="center" minH="40vh">
            <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" />
          </Flex>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8} mb={12}>
              {currentItems.map(product => (
                <ExplorerCard key={product.id} product={product} />
              ))}
            </SimpleGrid>

            {totalPages > 1 && (
              <Flex justify="center" align="center" mt={8}>
                <HStack
                  spacing={2}
                  bg="white"
                  p={2}
                  rounded="2xl"
                  shadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Button
                    onClick={handlePrev}
                    isDisabled={currentPage === 1}
                    leftIcon={<FaArrowLeft />}
                    variant="ghost"
                    rounded="xl"
                    colorScheme="teal"
                  >
                    Prev
                  </Button>
                  <Badge bg="teal.50" color="teal.700" px={4} py={2} rounded="xl" fontSize="sm" fontWeight="bold">
                    Page {currentPage} of {totalPages}
                  </Badge>
                  <Button
                    onClick={handleNext}
                    isDisabled={currentPage === totalPages}
                    rightIcon={<FaArrowRight />}
                    variant="ghost"
                    rounded="xl"
                    colorScheme="teal"
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            )}

            {filteredProducts.length === 0 && (
              <Flex direction="column" align="center" justify="center" py={20} bg="white" rounded="3xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
                <Icon as={FaSearch} boxSize={12} color="gray.300" mb={4} />
                <Heading size="md" color="gray.800" mb={2} fontWeight="700">No products found</Heading>
                <Text color="gray.500" textAlign="center" maxW="md">
                  We couldn't find anything matching your search criteria. Try adjusting your filters.
                </Text>
              </Flex>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}