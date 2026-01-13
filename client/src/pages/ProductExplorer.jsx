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
    if (!user) {
      toast({ title: "Login Required", status: "warning" });
      return;
    }
    setIsWatchlistLoading(true);
    try {
      const token = localStorage.getItem('market_mind_token');

      await axios.post(`${API_BASE_URL}/api/watchlist`, {
        productId: product.id,
        targetPrice: product.price * 0.9
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Added to your Watchlist!", status: "success", duration: 2000 });
    } catch (error) {
      console.error("Watchlist Error Detail:", error.response);

      if (error.response && error.response.status === 409) {
        toast({ title: "Already Tracking", description: "This item is already in your list.", status: "info", duration: 2000 });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Server Error. Check Terminal.",
          status: "error"
        });
      }
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  return (
    <Card direction="column" overflow="hidden" variant="outline" bg="white" shadow="sm" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
      <Image objectFit="cover" h="160px" w="100%" src={imgUrl} alt={product.name} />
      <CardBody>
        <Flex justify="space-between" align="center" mb={2}>
          <Badge colorScheme="teal" rounded="full" px={2}>{product.category?.split('|')[0]}</Badge>
          <Text fontWeight="bold" fontSize="lg" color="green.600">₹{product.price.toLocaleString()}</Text>
        </Flex>

        <Heading size="sm" mb={1} noOfLines={2}>{shortName}</Heading>

        <Text fontSize="xs" color="blue.500" cursor="pointer" fontWeight="bold" display="flex" alignItems="center" onClick={() => setShowSpecs(!showSpecs)} mb={3}>
          {showSpecs ? "Hide Specs" : "View Specs"} <Icon as={showSpecs ? FaChevronUp : FaChevronDown} ml={1} />
        </Text>
        <Collapse in={showSpecs} animateOpacity>
          <Text fontSize="xs" color="gray.500" mb={3} noOfLines={4}>{product.name}</Text>
        </Collapse>

        {analysisData && (
          <Box bg="blue.50" p={3} rounded="md" mb={3} border="1px solid" borderColor="blue.100">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.600">Fair Price (AI):</Text>
              <Text fontSize="xs" fontWeight="bold" color="blue.600">₹{analysisData.aiPrice?.toLocaleString()}</Text>
            </Flex>
            <Flex justify="space-between" mb={2}>
              <Text fontSize="xs" color="gray.600">Flipkart:</Text>
              <Text fontSize="xs" fontWeight="bold">₹{analysisData.flipkartPrice?.toLocaleString()}</Text>
            </Flex>
            <Flex justify="space-between" pt={2} borderTop="1px dashed" borderColor="blue.200" align="center">
              <Text fontSize="xs" fontWeight="bold">Verdict:</Text>
              <Badge colorScheme={analysisData.verdict === "Great Deal" ? "green" : "orange"} variant="solid">
                {analysisData.verdict}
              </Badge>
            </Flex>
          </Box>
        )}

        <Stack direction="row" spacing={2} mt={2}>
          <Button flex={1} size="sm" colorScheme="blue" variant="outline" leftIcon={<FaChartLine />} onClick={handleAnalyze} isLoading={isAnalyzing}>
            Analyze
          </Button>
          <Button size="sm" colorScheme="pink" variant="ghost" isLoading={isWatchlistLoading} onClick={addToWatchlist}>
            <Icon as={FaHeart} />
          </Button>
        </Stack>
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
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="7xl">
        <Heading mb={6} textAlign="center">Deals Explorer</Heading>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={8}>
          <InputGroup>
            <InputLeftElement pointerEvents="none"><FaSearch color="gray.300" /></InputLeftElement>
            <Input placeholder="Search products..." bg="white" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </InputGroup>

          <Select bg="white" w={{ base: 'full', md: '300px' }} value={category} onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}>
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
          <Flex justify="center" align="center" minH="200px"><Spinner size="xl" color="blue.500" /></Flex>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} mb={10}>
              {currentItems.map(product => (
                <ExplorerCard key={product.id} product={product} />
              ))}
            </SimpleGrid>

            {totalPages > 1 && (
              <HStack justify="center" spacing={4}>
                <Button onClick={handlePrev} isDisabled={currentPage === 1} leftIcon={<FaArrowLeft />}>
                  Prev
                </Button>
                <Text fontWeight="bold">Page {currentPage} of {totalPages}</Text>
                <Button onClick={handleNext} isDisabled={currentPage === totalPages} rightIcon={<FaArrowRight />}>
                  Next
                </Button>
              </HStack>
            )}

            {filteredProducts.length === 0 && (
              <Text textAlign="center" color="gray.500">No products found matching your search.</Text>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}