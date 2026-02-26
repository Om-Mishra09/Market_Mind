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
      const aiResponse = await axios.post(`${API_BASE_URL}/api/predict`, {
        name: product.name,
        category: product.category,
        rating: product.rating || 4.0,
        rating_count: product.rating_count || 100
      });

      const aiPrice = aiResponse.data.predicted_price;
      const flipkartVariance = (Math.random() * 0.2) - 0.1;
      const flipkartPrice = Math.floor(product.price * (1 + flipkartVariance));
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
        description: "Could not fetch AI prediction.",
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
        toast({
          title: "Login Required",
          description: "Please log in to add items to your watchlist.",
          status: "warning"
        });
        return;
      }

      setIsWatchlistLoading(true);

      const cleanPrice = Number(String(product.price).replace(/[^0-9.]/g, ''));
      const fallbackId = product.name
        ? product.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
        : `prod-${Date.now()}`;
      const productId = product.id || product._id || fallbackId;

      if (!productId) {
        toast({ title: "Error", description: "Missing Product ID", status: "error" });
        return;
      }

      const payload = {
        productId: productId,
        name: product.name,
        price: cleanPrice,
        image: imgUrl, 
        link: product.link || "#" 
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/watchlist`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Added to Watchlist!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

    } catch (error) {
      console.error("Full Error Object:", error);
      toast({
        title: "Failed to add",
        description: error.response?.data?.message || "Network Error",
        status: "error"
      });
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
          {/* FIX: Ensure onClick calls the function properly */}
          <Button size="sm" colorScheme="pink" variant="ghost" isLoading={isWatchlistLoading} onClick={addToWatchlist}>
            <Icon as={FaHeart} />
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
};