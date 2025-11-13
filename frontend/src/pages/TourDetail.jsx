import {
  Box,
  Grid,
  GridItem,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Container,
  Divider,
  Spinner,
  Avatar,
  Stack,
  useColorModeValue,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { bookTour } from '../api/bookingApi';
import { useTourStore } from '../store/useTourStore';
import { useReviewStore } from '../store/useReviewStore';
import {
  FiClock,
  FiUsers,
  FiStar,
  FiCheck,
  FiInfo,
  FiMapPin,
} from 'react-icons/fi';
import MapBox from './MapBox';
import ReviewCard from '../components/ReviewCard';

export default function TourDetail() {
  const { slug } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);

  // Zustand store hooks
  const {
    tours,
    currentTour: tour,
    setCurrentTour,
    fetchTour,
    loading: tourLoading,
  } = useTourStore();

  const { reviews, fetchReviews, loading: reviewLoading } = useReviewStore();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!slug) return;

    // ✅ Prefer existing tour from store
    const cachedTour = tours?.find((t) => t.slug === slug);

    if (cachedTour) {
      setCurrentTour(cachedTour);
      fetchReviews(cachedTour._id);
    } else {
      // fallback if direct URL
      fetchTour(slug).then((freshTour) => {
        if (freshTour?._id) fetchReviews(freshTour._id);
      });
    }
  }, [slug, tours, fetchTour, fetchReviews, setCurrentTour]);

  if (tourLoading || reviewLoading)
    return (
      <VStack py={20}>
        <Spinner size="xl" color="teal.400" />
        <Text>Loading tour details...</Text>
      </VStack>
    );

  if (!tour) return <Text textAlign="center">Tour not found.</Text>;

  const InfoBox = ({ icon, color, title, value }) => (
    <Box
      bg={cardBg}
      boxShadow="sm"
      borderRadius="lg"
      p={6}
      textAlign="center"
      border={`1px solid ${borderColor}`}
    >
      <VStack spacing={3}>
        <Box
          bg={`${color}.100`}
          color={`${color}.500`}
          w={10}
          h={10}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} boxSize={5} />
        </Box>
        <Text fontWeight="semibold" color="gray.600">
          {title}
        </Text>
        <Text fontWeight="bold" fontSize="lg">
          {value}
        </Text>
      </VStack>
    </Box>
  );

  return (
    <Box bg={bg}>
      {/* HEADER IMAGE */}
      <Box position="relative" h={['300px', '400px', '500px']}>
        <Image
          src={tour.imageCover}
          alt={tour.name}
          w="100%"
          h="100%"
          objectFit="cover"
          filter="brightness(60%)"
        />
        <VStack
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
          color="white"
          spacing={3}
        >
          <Heading size="2xl">{tour.name}</Heading>
          <HStack spacing={6} fontWeight="medium">
            <HStack>
              <FiClock />
              <Text>{tour.duration} days</Text>
            </HStack>
            <HStack>
              <FiMapPin />
              <Text>{tour.startLocation?.description}</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      <Container maxW="7xl" py={12}>
        <Grid templateColumns={['1fr', null, '2fr 1fr']} gap={10}>
          <GridItem>
            {/* About */}
            <Box bg={cardBg} boxShadow="sm" borderRadius="lg" p={8} mb={8}>
              <Heading fontSize="xl" mb={3}>
                About This Tour
              </Heading>
              <Text color={textColor} fontSize="md">
                {tour.summary}
              </Text>
            </Box>

            {/* Info Boxes */}
            <SimpleGrid columns={[1, 3]} spacing={6} mb={8}>
              <InfoBox
                icon={FiClock}
                color="blue"
                title="Duration"
                value={`${tour.duration} Days`}
              />
              <InfoBox
                icon={FiUsers}
                color="green"
                title="Group Size"
                value={`Max ${tour.maxGroupSize}`}
              />
              <InfoBox
                icon={FiStar}
                color="purple"
                title="Difficulty"
                value={
                  tour.difficulty.charAt(0).toUpperCase() +
                  tour.difficulty.slice(1)
                }
              />
            </SimpleGrid>

            {/* Highlights */}
            <Box bg={cardBg} boxShadow="sm" borderRadius="lg" p={8} mb={8}>
              <Heading fontSize="xl" mb={4}>
                Tour Highlights
              </Heading>
              <SimpleGrid columns={[1, 2]} spacing={3}>
                {[
                  'Inca Trail',
                  'High mountain passes',
                  'Machu Picchu sunrise',
                  'Andean food',
                ].map((highlight, i) => (
                  <HStack
                    key={i}
                    bg="gray.50"
                    borderRadius="md"
                    p={3}
                    boxShadow="xs"
                    spacing={3}
                  >
                    <Box
                      bg="green.100"
                      color="green.500"
                      w={6}
                      h={6}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiCheck} />
                    </Box>
                    <Text fontSize="md" color={textColor}>
                      {highlight}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </Box>

            {/* Guides */}
            <Box bg={cardBg} boxShadow="sm" borderRadius="lg" p={8} mb={8}>
              <Heading fontSize="xl" mb={4}>
                Your Guides
              </Heading>
              <Stack spacing={4}>
                {tour.guides?.map((g) => (
                  <HStack key={g._id}>
                    <Avatar src={`/img/users/${g.photo}`} name={g.name} />
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="bold">{g.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {g.role === 'lead-guide' ? 'Lead Guide' : 'Tour Guide'}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </Stack>
            </Box>

            {/* Gallery */}
            <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={8}>
              {tour.images?.map((img, i) => (
                <Image
                  key={img}
                  src={img}
                  alt={`${tour.name}-${i}`}
                  w="100%" // full width per grid cell
                  h="210px" // fixed height for uniform layout
                  objectFit="cover" // crops and centers image nicely
                  borderRadius="lg"
                  shadow="md"
                  _hover={{
                    transform: 'scale(1.03)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              ))}
            </SimpleGrid>

            {/* Map */}
            <Box bg={cardBg} boxShadow="sm" borderRadius="lg" p={8} mb={8}>
              <Heading fontSize="xl" mb={4}>
                Tour Location
              </Heading>
              <MapBox locations={tour.locations} />
            </Box>

            {/* Reviews */}
            <Box bg={cardBg} boxShadow="sm" borderRadius="lg" p={8}>
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FiInfo} color="gray.700" boxSize={5} />
                  <Text fontWeight="bold" fontSize="lg">
                    Reviews ({reviews.length})
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FiStar} color="yellow.400" boxSize={5} />
                  <Text fontSize="xl" fontWeight="bold">
                    {tour.ratingsAverage?.toFixed(1) || '4.9'}
                  </Text>
                  <Text color="gray.500">/ 5</Text>
                </HStack>
              </HStack>
              {reviews.length ? (
                reviews.map((r) => <ReviewCard key={r._id} review={r} />)
              ) : (
                <Text color="gray.500">No reviews yet for this tour.</Text>
              )}
            </Box>
          </GridItem>

          {/* Booking Sidebar */}
          <GridItem>
            <Box
              position="sticky"
              top="100px"
              bg={cardBg}
              borderRadius="lg"
              boxShadow="sm"
              p={8}
            >
              <Text fontSize="3xl" fontWeight="bold">
                ${tour.price}{' '}
                <Text
                  as="span"
                  fontWeight="medium"
                  color="gray.500"
                  fontSize="lg"
                >
                  / person
                </Text>
              </Text>

              <Text mt={6} fontWeight="semibold">
                Select Start Date
              </Text>
              <VStack mt={4} spacing={3} align="stretch">
                {tour.startDates?.map((date) => {
                  const formatted = new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const isSelected = selectedDate === date;
                  return (
                    <Button
                      key={date}
                      bg={isSelected ? 'black' : 'white'}
                      color={isSelected ? 'white' : 'gray.800'}
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ bg: isSelected ? 'black' : 'gray.100' }}
                      justifyContent="space-between"
                      rightIcon={isSelected ? <Icon as={FiCheck} /> : null}
                      onClick={() => setSelectedDate(date)}
                    >
                      {formatted}
                    </Button>
                  );
                })}
              </VStack>

              <Divider my={6} />

              <HStack justify="space-between" mb={2}>
                <Text color="gray.600">Duration</Text>
                <Text fontWeight="medium">{tour.duration} days</Text>
              </HStack>
              <HStack justify="space-between" mb={2}>
                <Text color="gray.600">Max Group Size</Text>
                <Text fontWeight="medium">{tour.maxGroupSize} people</Text>
              </HStack>
              <HStack justify="space-between" mb={4}>
                <Text color="gray.600">Difficulty</Text>
                <Badge colorScheme="red" px={2}>
                  {tour.difficulty}
                </Badge>
              </HStack>

              <Button
                size="lg"
                bg={!selectedDate ? 'gray.400' : 'black'}
                color="white"
                w="100%"
                isDisabled={!selectedDate}
                _hover={!selectedDate ? {} : { bg: 'gray.800' }}
                onClick={() => bookTour(tour._id, selectedDate)}
              >
                {selectedDate ? 'Confirm Booking' : 'Select a Date First'}
              </Button>

              <VStack spacing={1} fontSize="sm" color="gray.500" mt={4}>
                <HStack>
                  <Icon as={FiCheck} />
                  <Text>Free cancellation up to 24 hours before</Text>
                </HStack>
                <HStack>
                  <Icon as={FiClock} />
                  <Text>Reserve now, pay later</Text>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
