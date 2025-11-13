import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  Input,
  Select,
  Button,
  Grid,
  GridItem,
  Image,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FiSearch, FiStar } from 'react-icons/fi';
import { useTourStore } from '../store/useTourStore';
import TourCard from '../components/TourCard';
import GlassBox from '../components/GlassBox';
export default function Home() {
  const { tours, loading, fetchTours } = useTourStore();

  const glassBg = useColorModeValue(
    'rgba(255, 255, 255, 0.11)',
    'rgba(26,32,44,0.5)',
  );
  const blurStyle = {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  // Fetch once when page loads
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  if (loading)
    return (
      <Container textAlign="center" py={10}>
        <Text>Loading tours...</Text>
      </Container>
    );

  if (!tours.length)
    return (
      <Container textAlign="center" py={10}>
        <Text>No tours available.</Text>
      </Container>
    );

  // random hero background
  const hero = `tour-${Math.floor(Math.random() * tours.length)}-1.jpg`;

  const stats = [
    { label: 'Guided Tours Annually', value: '500+' },
    { label: 'Satisfaction Rate', value: '90.5%' },
    { label: 'Destinations', value: '150+' },
  ];

  // shuffle tours to randomize featured & miniGrid
  const shuffled = [...tours].sort(() => 0.5 - Math.random());
  const featured = shuffled.slice(0, 3);
  const miniGrid = shuffled.slice(3, 7);

  return (
    <Box>
      {/* HERO SECTION */}
      <Box
        w="100%"
        h="100vh"
        backgroundImage="url(/img/origbg.webp)"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        color="white"
      >
        <VStack
          position="relative"
          top="40%"
          transform="translateY(-40%)"
          spacing={6}
          textAlign="center"
          zIndex="1"
        >
          <Heading fontSize={['3xl', '5xl']} fontWeight="extrabold">
            Make Travel Easy,
            <br /> Enjoy More Fun
          </Heading>
          <Text fontSize="lg" maxW="lg">
            Experience travel that's simple, exciting, and worry-free.
          </Text>

          {/* Filter Card */}
          <GlassBox>
            <Tabs variant="soft-rounded" colorScheme="purple" mb={4}>
              <TabList justifyContent="center">
                <Tab>Destinations</Tab>
                <Tab>Tours</Tab>
                <Tab>Packages</Tab>
              </TabList>
            </Tabs>

            <SimpleGrid columns={[1, 5]} spacing={3}>
              <Input placeholder="Find a Destination" />
              <Select placeholder="Select Price Range">
                <option>$0-$500</option>
                <option>$500-$1000</option>
                <option>$1000+</option>
              </Select>
              <Select placeholder="All Cities">
                <option>Paris</option>
                <option>Tokyo</option>
                <option>New York</option>
              </Select>
              <Select placeholder="Select Date Range">
                <option>Jan 2025</option>
                <option>Feb 2025</option>
              </Select>
              <Button colorScheme="purple" rightIcon={<FiSearch />}>
                Discover
              </Button>
            </SimpleGrid>
          </GlassBox>
        </VStack>
      </Box>

      {/* STATS + FEATURED */}
      <Container maxW="7xl" py={20} textAlign="center">
        <Heading mb={2}>
          Travella creates inspiring, budget-friendly travel experiences.
        </Heading>
        <Text color="gray.600" mb={10}>
          that our customers love.
        </Text>

        <SimpleGrid columns={[1, 3]} spacing={6} mb={12}>
          {stats.map((s) => (
            <VStack key={s.label}>
              <Heading fontSize="3xl">{s.value}</Heading>
              <Text color="gray.500">{s.label}</Text>
            </VStack>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={[1, 3]} spacing={6}>
          {featured.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </SimpleGrid>
      </Container>

      {/* IMAGE GRID */}
      <Container maxW="7xl" py={20}>
        <Heading textAlign="center" mb={2}>
          Unveil the incredible experiences that await you
        </Heading>
        <Text textAlign="center" color="gray.600" mb={12}>
          at your thoughtfully selected destinations.
        </Text>

        <Grid templateColumns={['1fr', '2fr 3fr']} gap={6}>
          <GridItem
            bgImage={`url(/img/lbg-1.jpg)`}
            bgSize="cover"
            bgPos="center"
            borderRadius="xl"
            position="relative"
            minH="700px"
            overflow="hidden"
          >
            <VStack
              position="absolute"
              top="70%"
              left="10%"
              transform="translateY(-50%)"
              align="flex-start"
              color="white"
              spacing={6}
            >
              <Heading fontSize="5xl" fontWeight="bold" lineHeight="1.3">
                Soak in the <br /> beauty of
                <br /> nature.
              </Heading>

              {/* oval image slider */}
              <HStack
                bg="rgb(255, 255, 255)"
                borderRadius="full"
                p={1}
                w="100%"
                h="40%"
                spacing="2"
                overflow="hidden"
                {...blurStyle}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Image
                    key={n}
                    src={`/img/lbg-${n}.jpg`}
                    w="60px"
                    h="40px"
                    objectFit="cover"
                    borderRightRadius={n === 5 ? 'full' : '5'}
                    borderLeftRadius={n === 1 ? 'full' : '5'}
                  />
                ))}
              </HStack>
            </VStack>
          </GridItem>

          {/* Right Grid */}
          <GridItem>
            <SimpleGrid columns={[1, 2]} spacing={10} h="100%">
              {miniGrid.map((tour) => (
                <Box
                  key={tour._id}
                  bg="white"
                  _hover={{
                    transform: 'translateY(-3px)',
                    transition: '0.3s',
                  }}
                >
                  <Box position="relative">
                    <Image
                      src={tour.imageCover}
                      alt={tour.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      borderRadius={15}
                    />
                    <Box
                      position="absolute"
                      top="10px"
                      right="10px"
                      bg="white"
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      boxShadow="sm"
                    >
                      <Icon as={FiStar} color="yellow.400" boxSize={4} />
                      <Text fontWeight="bold" fontSize="sm">
                        {tour.ratingsAverage?.toFixed(1) || '4.9'}
                      </Text>
                    </Box>
                  </Box>

                  <Box px={4} py={4}>
                    <HStack justify="space-between" mb={1}>
                      <Heading fontSize="md" noOfLines={1}>
                        {tour.name}
                      </Heading>
                      <Text fontWeight="semibold" color="gray.700">
                        ${tour.price.toLocaleString()}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>
                      {tour.summary}
                    </Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </GridItem>
        </Grid>
      </Container>

      {/* CTA FOOTER */}
      <Box
        bgImage={`url(/img/tours/${hero})`}
        bgSize="cover"
        bgPos="center"
        py={40}
        textAlign="center"
        color="white"
        position="relative"
      >
        <Box position="absolute" inset="0" bg="rgba(0, 0, 0, 0.55)" />
        <VStack position="relative" spacing={6}>
          <Heading fontSize={['3xl', '5xl']}>
            Begin your exciting adventure into nature today.
          </Heading>
          <Button size="lg" colorScheme="purple">
            Sign Up
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
