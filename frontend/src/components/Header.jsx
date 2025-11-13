import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Avatar,
  HStack,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassBox from './GlassBox';

export default function Header() {
  const { user, logout } = useAuth?.() || { user: null, logout: null };

  return (
    <Box
      bg="WHITE"
      px={8}
      py={4}
      color="black"
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="100"
    >
      <Flex align="center">
        {/* Left nav */}
        <HStack spacing={6}>
          <ChakraLink
            as={Link}
            to="/"
            fontWeight="medium"
            _hover={{ textDecoration: 'none', color: 'blue.200' }}
          >
            All Tours
          </ChakraLink>
        </HStack>

        <Spacer />

        {/* Center logo */}
        <Link to="/">
          <Heading size="md" letterSpacing="wide">
            <img
              src="/img/logo-white.png"
              alt="Natours logo"
              style={{ height: '35px', margin: 'auto' }}
            />
          </Heading>
        </Link>

        <Spacer />

        {/* Right nav */}
        <HStack spacing={4}>
          {user ? (
            <>
              <Button
                variant="outline"
                colorScheme="whiteAlpha"
                size="sm"
                onClick={logout}
              >
                Log out
              </Button>
              <Link to="/me">
                <Flex align="center" gap={2}>
                  <Avatar
                    size="sm"
                    name={user.name}
                    src={`/img/users/${user.photo}`}
                    border="2px solid white"
                  />
                  <Box>{user.name.split(' ')[0]}</Box>
                </Flex>
              </Link>
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/login"
                size="sm"
                colorScheme=""
                variant="outline"
              >
                Log in
              </Button>
              <Button
                as={Link}
                to="/signup"
                size="sm"
                bg="white"
                _hover={{ bg: 'blue.200' }}
              >
                Sign up
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
