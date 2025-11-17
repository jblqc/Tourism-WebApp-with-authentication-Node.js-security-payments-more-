import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Grid,
  GridItem,
  Avatar,
  VStack,
  HStack,
  Container,
  Heading,
  Text,
  Input,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Flex,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

import { FiUser, FiLock, FiSettings, FiPhone } from "react-icons/fi";
import { useToastMessage } from "../utils/toast";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function Account() {
  const {
    user,
    updateProfile,
    updatePassword,
    sendPhoneVerificationOtp,
    verifyPhoneVerificationOtp,
    checkPhoneUnique,
  } = useAuth();
  const { showSuccess, showError } = useToastMessage();

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [phoneVerified, setPhoneVerified] = useState(user?.phoneVerified);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Colors
  const glassBg = useColorModeValue(
    "rgba(255,255,255,0.6)",
    "rgba(50,50,70,0.3)"
  );
  const cardBorder = useColorModeValue("whiteAlpha.700", "whiteAlpha.300");

  const glass = {
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRadius: "22px",
    border: `1px solid ${cardBorder}`,
    boxShadow:
      "0 8px 20px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.15)",
  };

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */
  const formatPhone = (num) => {
    let n = num.replace(/\D/g, "");

    if (!n.startsWith("63")) n = "63" + n.replace(/^0+/, "");
    return "+" + n;
  };

  /* ---------------------------------------------------------
     PHONE UNIQUE CHECK
  --------------------------------------------------------- */
  const handleCheckPhoneUnique = async () => {
    if (!phone) return;

    try {
      await checkPhoneUnique(formatPhone(phone));
    } catch (err) {
      showError("Phone number already in use");
      setPhone(user.phoneNumber || "");
    }
  };

  /* ---------------------------------------------------------
     UPDATE PROFILE
  --------------------------------------------------------- */
  const handleUserData = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    try {
      await updateProfile(form);
      showSuccess("Profile updated");
    } catch {
      showError("Error updating profile");
    }
  };

  /* ---------------------------------------------------------
     UPDATE PASSWORD
     (Google users cannot change password)
  --------------------------------------------------------- */
  const handlePassword = async (e) => {
    e.preventDefault();
    if (user.provider === "google") {
      showError("Google accounts cannot change password");
      return;
    }

    const data = new FormData(e.target);
    const payload = Object.fromEntries(data);

    try {
      await updatePassword(payload);
      showSuccess("Password changed");
      e.target.reset();
    } catch {
      showError("Error updating password");
    }
  };

  /* ---------------------------------------------------------
     PHONE VERIFICATION HANDLERS
  --------------------------------------------------------- */
  const handleSendPhoneOtp = async () => {
    setModalLoading(true);
    try {
      await sendPhoneVerificationOtp(formatPhone(phone));
      showSuccess("Verification code sent!");
      setOtpSent(true);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed sending OTP");
    } finally {
      setModalLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpCode) {
      showError("Please enter the OTP code");
      return;
    }

    setModalLoading(true);
    try {
      await verifyPhoneVerificationOtp(otpCode);
      showSuccess("Phone verified!");
      setPhoneVerified(true);
      setIsModalOpen(false);
    } catch (err) {
      showError("Incorrect or expired OTP");
    } finally {
      setModalLoading(false);
    }
  };
  if (!user) return <Text textAlign="center">Loading user…</Text>;

  return (
    <Box
      minH="100vh"
      px={4}
      pt="110px"
      pb={20}
      bg="#F6F1FF"
      position="relative"
      overflow="hidden"
    >
      <Container maxW="7xl" position="relative" zIndex={5}>
        <Grid templateColumns={["1fr", null, "240px 1fr"]} gap={12}>
          {/* -------------------------- SIDEBAR --------------------------- */}
          <GridItem>
            <Flex
              direction="column"
              align="center"
              sx={glass}
              p={6}
              bg={glassBg}
            >
              <Box
                p="6px"
                borderRadius="full"
                bg="whiteAlpha.700"
                border="2px solid #faf7ff51"
                boxShadow="0 0 25px rgba(183,148,244,0.6)"
              >
                <Avatar
                  size="xl"
                  name={user.name}
                  src={`${import.meta.env.VITE_BACKEND_URL}/img/users/${
                    user.photo
                  }`}
                />
              </Box>

              <Text mt={4} fontSize="lg" fontWeight="bold" color="purple.700">
                {user.name}
              </Text>

              <VStack spacing={2} mt={8} w="100%">
                <SidebarLink icon={FiSettings} label="Settings" active />
                <SidebarLink icon={FiUser} label="My Profile" />
                <SidebarLink icon={FiSettings} label="My Bookings" />
                <SidebarLink icon={FiSettings} label="My Reviews" />
              </VStack>
            </Flex>
          </GridItem>

          {/* ------------------------- MAIN CONTENT ------------------------- */}
          <GridItem>
            <VStack spacing={10}>
              {/* PROFILE CARD */}
              <MotionBox sx={glass} bg={glassBg} p={8} w="100%">
                <CardHeader title="Profile Information" icon={FiUser} />

                <form onSubmit={handleUserData}>
                  <VStack spacing={5}>
                    {/* NAME */}
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input
                        name="name"
                        defaultValue={user.name}
                        bg="whiteAlpha.700"
                      />
                    </FormControl>

                    {/* EMAIL */}
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        defaultValue={user.email}
                        bg="whiteAlpha.700"
                      />
                    </FormControl>

                    {/* PHONE NUMBER */}
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        name="phoneNumber"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        onBlur={handleCheckPhoneUnique}
                        bg="whiteAlpha.700"
                        disabled={phoneVerified}
                      />

                      {/* Verify Button */}
                      {!phoneVerified ? (
                        <Button
                          mt={2}
                          size="sm"
                          leftIcon={<FiPhone />}
                          colorScheme="purple"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Verify Phone Number
                        </Button>
                      ) : (
                        <Text mt={2} fontSize="sm" color="green.500">
                          ✔ Phone Verified
                        </Text>
                      )}
                    </FormControl>

                    {/* PHOTO */}
                    <FormControl>
                      <FormLabel>Profile Photo</FormLabel>

                      <Flex
                        align="center"
                        as="label"
                        htmlFor="photoUpload"
                        cursor="pointer"
                        gap={4}
                        p={3}
                        bg="whiteAlpha.700"
                        borderRadius="md"
                      >
                        <Button colorScheme="purple" size="sm">
                          Upload Photo
                        </Button>
                        <Text id="uploadFilename">No file chosen</Text>
                      </Flex>

                      <Input
                        id="photoUpload"
                        name="photo"
                        type="file"
                        accept="image/*"
                        display="none"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          document.getElementById(
                            "uploadFilename"
                          ).textContent = file?.name || "No file chosen";
                        }}
                      />
                    </FormControl>

                    <Button colorScheme="purple" w="160px" type="submit">
                      Save Changes
                    </Button>
                  </VStack>
                </form>
              </MotionBox>

              {/* PASSWORD CARD */}
              <MotionBox sx={glass} bg={glassBg} p={8} w="100%">
                <CardHeader title="Change Password" icon={FiLock} />

                <form onSubmit={handlePassword}>
                  <VStack
                    spacing={5}
                    opacity={user.provider === "google" ? 0.5 : 1}
                  >
                    <FormControl isRequired>
                      <FormLabel>Current Password</FormLabel>
                      <Input
                        name="passwordCurrent"
                        type="password"
                        disabled={user.provider === "google"}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>New Password</FormLabel>
                      <Input
                        name="password"
                        type="password"
                        disabled={user.provider === "google"}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        name="passwordConfirm"
                        type="password"
                        disabled={user.provider === "google"}
                      />
                    </FormControl>

                    <Button
                      mt={3}
                      colorScheme="purple"
                      w="180px"
                      type="submit"
                      disabled={user.provider === "google"}
                    >
                      Update Password
                    </Button>

                    {user.provider === "google" && (
                      <Text fontSize="sm" color="red.400">
                        Google accounts cannot change password
                      </Text>
                    )}
                  </VStack>
                </form>
              </MotionBox>
            </VStack>
          </GridItem>
        </Grid>
      </Container>

      {/* MODAL: VERIFY PHONE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verify Phone Number</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {!otpSent ? (
              <VStack spacing={4}>
                <Text fontSize="sm">Send a verification code to:</Text>
                <Text fontWeight="bold">{formatPhone(phone)}</Text>

                <Button
                  colorScheme="purple"
                  w="100%"
                  isLoading={modalLoading}
                  onClick={handleSendPhoneOtp}
                >
                  Send Verification Code
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Text fontSize="sm">
                  Enter the 6-digit code sent to your phone.
                </Text>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />

                <Button
                  colorScheme="purple"
                  w="100%"
                  isLoading={modalLoading}
                  onClick={handleVerifyPhoneOtp}
                >
                  Verify
                </Button>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

/* -------------------------- COMPONENTS -------------------------- */

function SidebarLink({ icon, label, active = false }) {
  return (
    <Flex
      w="100%"
      align="center"
      gap={3}
      px={4}
      py={2}
      borderRadius="md"
      cursor="pointer"
      bg={active ? "purple.200" : "whiteAlpha.500"}
      _hover={{ bg: "purple.100" }}
    >
      {icon && <Icon as={icon} color="purple.600" />}
      <Text>{label}</Text>
    </Flex>
  );
}

function CardHeader({ icon, title }) {
  return (
    <HStack mb={6}>
      <Icon as={icon} w={6} h={6} color="purple.500" />
      <Heading fontSize="xl">{title}</Heading>
    </HStack>
  );
}
