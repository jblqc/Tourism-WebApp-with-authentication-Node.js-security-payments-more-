// src/pages/AuthPage.jsx
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Heading,
  Flex,
  Text,
  Button,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiArrowRight,
  FiHeart,
} from 'react-icons/fi';
import { useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [bgIndex, setBgIndex] = useState(1);
  const bg = useColorModeValue('gray.50', 'gray.900');

  const toggleBg = (dir) => {
    setBgIndex((prev) => {
      const next = dir === 'next' ? prev + 1 : prev - 1;
      if (next > 3) return 1;
      if (next < 1) return 3;
      return next;
    });
  };

  return (
    <Flex
      minH="100vh"
      bgGradient="linear(to-br, teal.500, green.400)" // or solid bg
      align="center"
      justify="center"
      p={8} // space from edges of viewport
    >
      <Grid
        templateColumns={['1fr', null, '1fr 1fr']}
        h="80vh"
        w={['95%', '85%', '80%', '70%']} // responsive width
        bg="white"
        borderRadius="3xl" // use 3xl instead of full for smoother corners
        overflow="hidden" // ensures inner elements don’t spill
        boxShadow="2xl"
      >
        {/* LEFT PANEL */}
        <GridItem
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={[6, 10]}
        >
          <VStack spacing={8} align="stretch" w="full" maxW="sm">
            <Box textAlign="center">
              <Heading fontFamily="Playfair Display" mb={2}>
                Travel Voyanix
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Explore More. Experience Life.
              </Text>
            </Box>

            {/* Toggle */}
            <HStack
              justify="center"
              bg={useColorModeValue('gray.100', 'gray.700')}
              borderRadius="full"
              p={1.5}
              boxShadow="inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.6)"
            >
              <Button
                flex="1"
                borderRadius="full"
                bg={isLogin ? 'white' : 'transparent'}
                boxShadow={isLogin ? 'md' : 'none'}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                flex="1"
                borderRadius="full"
                bg={!isLogin ? 'white' : 'transparent'}
                boxShadow={!isLogin ? 'md' : 'none'}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </HStack>

            {/* Form content */}
            {isLogin ? (
              <VStack align="stretch" spacing={5}>
                <Heading size="md" textAlign="center">
                  Journey Begins
                </Heading>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Choose a login method:
                </Text>

                <HStack spacing={3} justify="center">
                  <Button
                    leftIcon={
                      <img src="/img/icons/google.svg" alt="" width={18} />
                    }
                    variant="outline"
                  >
                    Gmail
                  </Button>
                  <Button variant="outline">Email Code</Button>
                  <Button variant="outline">SMS Code</Button>
                </HStack>

                <HStack my={2}>
                  <Divider />
                  <Text fontSize="sm" color="gray.400">
                    or
                  </Text>
                  <Divider />
                </HStack>

                <Input
                  placeholder="Email address"
                  size="lg"
                  borderRadius="lg"
                />
                <InputGroup size="lg">
                  <Input
                    placeholder="Password"
                    type={showPass ? 'text' : 'password'}
                    borderRadius="lg"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      icon={showPass ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPass(!showPass)}
                    />
                  </InputRightElement>
                </InputGroup>
                <Text
                  fontSize="sm"
                  color="teal.500"
                  textAlign="right"
                  cursor="pointer"
                >
                  Forgot Password?
                </Text>
                <Button colorScheme="teal" size="lg" borderRadius="lg">
                  Log In
                </Button>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={5}>
                <Heading size="md" textAlign="center">
                  Create Your Account
                </Heading>
                <Input placeholder="Full Name" size="lg" borderRadius="lg" />
                <Input
                  placeholder="Email address"
                  size="lg"
                  borderRadius="lg"
                />
                <InputGroup size="lg">
                  <Input
                    placeholder="Password"
                    type={showPass ? 'text' : 'password'}
                    borderRadius="lg"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      icon={showPass ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPass(!showPass)}
                    />
                  </InputRightElement>
                </InputGroup>
                <Button colorScheme="teal" size="lg" borderRadius="lg">
                  Sign Up
                </Button>
              </VStack>
            )}
          </VStack>
        </GridItem>

        {/* RIGHT PANEL */}
        <GridItem
          position="relative"
          overflow="hidden"
          bg={`url(/img/lbg-${bgIndex}.jpg) center/cover no-repeat`}
          clipPath="path('M0,0 h100% v100% q-30,0 -60,30 t-60,60 v-100% h-100% z')" // decorative shape
        >
          {/* Overlay text box */}
          <Box
            position="absolute"
            top="6"
            right="20" // ✅ stick to rightmost edge
            transform="translateX(22%)" // small visual push out for balance
          >
            <Box
              position="relative"
              bg="white"
              p={6}
              borderRadius="2xl"
              shadow="xl"
              w="260px"
              clipPath="path('M0 0 h240 a8 10 40 40 1 40 20 v60 a20 20 0 0 1 -20 20 h-240 a20 20 0 0 1 -20 -20 v-60 a20 20 0 0 1 20 -20 z M240 40 a20 20 0 1 0 0.01 0')"
              // 👆 creates the inverted circle notch on the right edge
            >
              {/* soft faded layer behind */}
              <Box
                position="absolute"
                inset="0"
                borderRadius="2xl"
                bg="whiteAlpha.400"
                transform="translate(8px,8px)"
                zIndex={-1}
                filter="blur(3px)"
              />

              <Heading fontSize="md" mb={2}>
                Wander, Explore, Experience.
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Discover new places, embrace adventures, & create unforgettable
                travel memories worldwide.
              </Text>

              {/* Heart circle overlay */}
              <Box
                position="absolute"
                top="50%"
                right="-25px" // ✅ perfectly overlaps the notch
                transform="translateY(-50%)"
                bg="white"
                borderRadius="full"
                p="3"
                shadow="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiHeart color="red" />
              </Box>
            </Box>
          </Box>

          {/* Bottom-right quote */}
          <Box
            position="absolute"
            bottom="10"
            right="10"
            color="white"
            textAlign="right"
          >
            <Heading fontSize="xl" mb={3}>
              Escape the Ordinary, <br />
              Embrace the Journey!
            </Heading>
            <Box
              bg="rgba(255,255,255,0.15)"
              borderRadius="xl"
              px={5}
              py={2}
              backdropFilter="blur(10px)"
              fontSize="sm"
            >
              Experience the world your way
            </Box>
          </Box>

          {/* Left/right arrows */}
          <HStack position="absolute" bottom="8" left="8" spacing={4}>
            <IconButton
              icon={<FiArrowLeft />}
              variant="ghost"
              color="white"
              onClick={() => toggleBg('prev')}
            />
            <IconButton
              icon={<FiArrowRight />}
              variant="ghost"
              color="white"
              onClick={() => toggleBg('next')}
            />
          </HStack>
        </GridItem>
      </Grid>
    </Flex>
  );
}
