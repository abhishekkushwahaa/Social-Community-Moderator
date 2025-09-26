import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";

const API_URL = "http://localhost:3001/api";

const AuthScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password.trim()) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (endpoint) => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/auth/${endpoint}`, {
        email,
        password,
      });

      if (endpoint === "login") {
        toast({
          title: "Login successful!",
          status: "success",
          duration: 2000,
          position: "top-right",
        });
        onLoginSuccess(res.data.token);
      } else {
        toast({
          title: "Registration successful.",
          description: "Please log in.",
          status: "success",
          duration: 2000,
          position: "top-right",
        });
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      toast({
        title: "Authentication failed.",
        description: err.response?.data?.message || "Please try again.",
        status: "error",
        duration: 2000,
        position: "top-right",
      });
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <Container centerContent>
      <Box
        p={10}
        mt="20vh"
        borderWidth={1}
        borderRadius="lg"
        boxShadow="xl"
        bg="gray.800"
        w={{ base: "95%", md: "500px" }}
        transition="0.3s"
        _hover={{ boxShadow: "2xl" }}
      >
        <VStack spacing={6} align="stretch">
          <Heading color="white" textAlign="center">
            Moderator Login
          </Heading>

          <FormControl isInvalid={errors.email}>
            <FormLabel color="white">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              bg="gray.700"
              color="white"
              focusBorderColor="blue.400"
            />
            {errors.email && (
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <FormLabel color="white">Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                bg="gray.700"
                color="white"
                focusBorderColor="blue.400"
              />
              <InputRightElement>
                <IconButton
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  aria-label="Toggle Password"
                  variant="ghost"
                  color="white"
                />
              </InputRightElement>
            </InputGroup>
            {errors.password && (
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            )}
          </FormControl>

          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              flex={1}
              onClick={() => handleAuth("login")}
              isDisabled={isSubmitting}
              _hover={{ transform: "scale(1.05)" }}
            >
              Login
            </Button>
            <Button
              colorScheme="green"
              flex={1}
              onClick={() => handleAuth("register")}
              isDisabled={isSubmitting}
              _hover={{ transform: "scale(1.05)" }}
            >
              Register
            </Button>
          </HStack>

          <Button
            colorScheme="red"
            variant="outline"
            w="full"
            onClick={handleGoogleLogin}
            mt={2}
            _hover={{ bg: "red.600", color: "white" }}
          >
            Login with Github
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default AuthScreen;
