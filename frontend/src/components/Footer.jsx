import { Box, Flex, Text, HStack, Icon, Link } from '@chakra-ui/react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <Box bg="gray.100" py={8} borderTop="1px solid" borderColor="gray.200">
      <Flex
        direction={['column', 'row']}
        justify="space-between"
        align="center"
        maxW="6xl"
        mx="auto"
        px={4}
      >
        {/* Brand / Copy */}
        <Text color="gray.600" fontSize="sm">
          © {new Date().getFullYear()} Natours. All rights reserved.
        </Text>

        {/* Social icons */}
        <HStack spacing={4} mt={[4, 0]}>
          <Link href="#" isExternal>
            <Icon
              as={FaFacebook}
              w={5}
              h={5}
              color="teal.600"
              _hover={{ color: 'teal.800' }}
            />
          </Link>
          <Link href="#" isExternal>
            <Icon
              as={FaInstagram}
              w={5}
              h={5}
              color="teal.600"
              _hover={{ color: 'teal.800' }}
            />
          </Link>
          <Link href="#" isExternal>
            <Icon
              as={FaTwitter}
              w={5}
              h={5}
              color="teal.600"
              _hover={{ color: 'teal.800' }}
            />
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
