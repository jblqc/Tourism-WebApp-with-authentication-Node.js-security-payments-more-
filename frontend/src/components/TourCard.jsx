import {
  Box,
  Image,
  Heading,
  Text,
  Stack,
  Flex,
  Icon,
  Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiFlag, FiUsers, FiStar } from 'react-icons/fi';
import { useTourStore } from '../store/useTourStore';

export default function TourCard({ tour }) {
  const navigate = useNavigate();
  const { setCurrentTour } = useTourStore();

  const handleClick = () => {
    setCurrentTour(tour); // ✅ Save clicked tour in Zustand
    navigate(`/tour/${tour.slug}`); // ✅ Navigate to details page
  };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="lg"
      transition="all 0.3s"
      _hover={{ transform: 'scale(1.02)', boxShadow: 'xl' }}
    >
      {/* --- IMAGE HEADER --- */}
      <Box
        position="relative"
        h="240px"
        overflow="hidden"
        onClick={handleClick}
        cursor="pointer"
      >
        <Image
          src={tour.imageCover}
          alt={tour.name}
          w="100%"
          h="100%"
          objectFit="cover"
          transition="0.4s"
          _hover={{ transform: 'scale(1.05)' }}
        />
        <Box position="absolute" inset="0" bg="rgba(0,0,0,0.25)" zIndex="1" />
        <Heading
          position="absolute"
          bottom="4"
          left="4"
          zIndex="2"
          size="md"
          color="white"
          fontWeight="semibold"
          textShadow="0px 2px 4px rgba(0,0,0,0.6)"
        >
          {tour.name}
        </Heading>
      </Box>

      {/* --- DETAILS --- */}
      <Box p={5}>
        <Text fontSize="sm" color="gray.500" mb={2}>
          {tour.difficulty} • {tour.duration}-day tour
        </Text>

        <Text noOfLines={2} fontSize="sm" color="gray.700" mb={4}>
          {tour.summary}
        </Text>

        {/* --- ICONS SECTION --- */}
        <Stack spacing={2} fontSize="sm" color="gray.600">
          <Flex align="center" gap={2}>
            <Icon as={FiMapPin} color="teal.500" />
            <Text>{tour.startLocation?.description}</Text>
          </Flex>

          <Flex align="center" gap={2}>
            <Icon as={FiCalendar} color="teal.500" />
            <Text>
              {new Date(tour.startDates[0]).toLocaleString('en-us', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </Flex>

          <Flex align="center" gap={2}>
            <Icon as={FiFlag} color="teal.500" />
            <Text>{tour.locations.length} stops</Text>
          </Flex>

          <Flex align="center" gap={2}>
            <Icon as={FiUsers} color="teal.500" />
            <Text>{tour.maxGroupSize} people</Text>
          </Flex>
        </Stack>
      </Box>

      {/* --- FOOTER --- */}
      <Flex
        justify="space-between"
        align="center"
        p={5}
        bg="gray.50"
        borderTop="1px solid"
        borderColor="gray.100"
      >
        <Box>
          <Text fontWeight="bold" fontSize="lg" color="teal.600">
            ${tour.price}{' '}
            <Text as="span" color="gray.500" fontSize="sm">
              per person
            </Text>
          </Text>
          <Flex align="center" mt={1} gap={1} color="yellow.500">
            <Icon as={FiStar} />
            <Text fontWeight="medium" color="gray.700">
              {tour.ratingsAverage} rating ({tour.ratingsQuantity})
            </Text>
          </Flex>
        </Box>

        <Button onClick={handleClick} colorScheme="teal" size="sm">
          Details
        </Button>
      </Flex>
    </Box>
  );
}
