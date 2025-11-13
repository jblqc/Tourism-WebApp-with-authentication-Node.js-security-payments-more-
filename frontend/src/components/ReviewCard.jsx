import {
  HStack,
  VStack,
  Avatar,
  Text,
  Icon,
  useColorModeValue,
  Box,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ReviewCard({ review }) {
  if (!review || !review.user) return null;

  const starColor = useColorModeValue('yellow.400', 'yellow.300');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const MotionBox = motion(Box);

  return (
    <>
      {/* Review Row */}
      <MotionBox
        whileHover={{
          backgroundColor: useColorModeValue('#f9fafb', '#1a202c'),
        }}
        borderRadius="md"
        py={4}
        px={2}
        cursor="pointer"
        onClick={onOpen}
        transition="0.2s"
      >
        <HStack w="100%" align="center" justify="space-between" spacing={6}>
          <HStack spacing={4} flex="1">
            <Avatar
              src={`/img/users/${review.user.photo}`}
              name={review.user.name}
              size="md"
              bg="teal.500"
              color="white"
            />
            <VStack align="flex-start" spacing={0}>
              <Text fontWeight="bold">{review.user.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </VStack>

            <Text
              fontSize="md"
              color={textColor}
              lineHeight="1.6"
              ml={6}
              flex="1"
              noOfLines={1}
            >
              {review.review}
            </Text>
          </HStack>

          {/* Stars */}
          <HStack spacing={1} minW="120px" justify="flex-end">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                as={FiStar}
                key={star}
                boxSize={5}
                color={review.rating >= star ? starColor : 'gray.300'}
                fill={review.rating >= star ? starColor : 'none'}
              />
            ))}
          </HStack>
        </HStack>
      </MotionBox>
      <Divider />

      {/* Expanded Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" overflow="hidden">
          <ModalHeader bg="teal.500" color="white">
            Review by {review.user.name}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            <HStack align="center" spacing={4} mb={4}>
              <Avatar
                src={`/img/users/${review.user.photo}`}
                name={review.user.name}
                size="lg"
                bg="teal.500"
                color="white"
              />
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg">
                  {review.user.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </VStack>
              <HStack spacing={1} ml="auto">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    as={FiStar}
                    key={star}
                    boxSize={5}
                    color={review.rating >= star ? starColor : 'gray.300'}
                    fill={review.rating >= star ? starColor : 'none'}
                  />
                ))}
              </HStack>
            </HStack>

            <Text fontSize="md" color={textColor} lineHeight="1.8">
              {review.review}
            </Text>

            <Box mt={6} textAlign="right">
              <Button onClick={onClose} colorScheme="teal" size="sm">
                Close
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
