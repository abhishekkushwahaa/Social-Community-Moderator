import {
  Box,
  Button,
  Container,
  Flex,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import ReviewPost from "./components/Review";

const API_URL = "http://localhost:3001/api";
const socket = io("http://localhost:3001");

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchQueue = useCallback(
    async (authToken) => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/posts/flagged`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch flagged posts", error);
        toast({
          title: "Could not fetch queue.",
          status: "error",
          duration: 2000,
          position: "top-right",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      toast({
        title: "Logged in successfully.",
        status: "success",
        duration: 2000,
        position: "top-right",
      });
      window.history.replaceState({}, document.title, "/");
      fetchQueue(tokenFromUrl);
    } else if (token) {
      fetchQueue(token);
    }
  }, [toast, fetchQueue, token]);

  useEffect(() => {
    const handleNewPost = (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
      toast({
        title: "New post flagged for review!",
        status: "info",
        isClosable: true,
        duration: 2000,
        position: "top-right",
      });
    };
    socket.on("new_flagged_post", handleNewPost);
    return () => {
      socket.off("new_flagged_post", handleNewPost);
    };
  }, [toast]);

  const handleLoginSuccess = (authToken) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    fetchQueue(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPosts([]);
    toast({ title: "Logged out.", duration: 2000, position: "top-right" });
  };

  if (!token) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  let decoded = {};
  if (token) {
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }
  return (
    <Box bg="gray.900" minH="100vh">
      {/* Fixed Top Bar */}
      <Flex
        justify="space-between"
        align="center"
        px={{ base: 4, md: 10 }}
        py={4}
        borderBottom="1px"
        borderColor="gray.700"
        position="sticky"
        top="0"
        bg="gray.900"
        zIndex="10"
      >
        <Box color="white" fontWeight="bold" fontSize="xl">
          ✨ Social Community Moderator ✨
        </Box>
        <Button
          colorScheme="red"
          variant="outline"
          onClick={handleLogout}
          _hover={{ bg: "red.600", color: "white" }}
        >
          Logout
        </Button>
      </Flex>

      <Container maxW="container.lg" pt={8} pb={16}>
        <VStack spacing={8} align="stretch">
          <Dashboard token={token} displayName={decoded.email || "M"} />

          <ReviewPost
            posts={posts}
            setPosts={setPosts}
            isLoading={isLoading}
            token={token}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default App;
