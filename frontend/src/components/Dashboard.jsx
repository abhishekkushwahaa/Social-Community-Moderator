import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiEdit, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";

const API_URL = "http://localhost:3001/api";

const Dashboard = ({ token, displayName }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [feed, setFeed] = useState([]);
  const toast = useToast();
  const textareaRef = useRef(null);
  const MAX_CHARS = 280;

  const firstLetter = displayName.charAt(0).toUpperCase();

  const fetchAllPosts = useCallback(
    async (authToken) => {
      try {
        const res = await axios.get(`${API_URL}/posts`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setFeed(res.data); // <-- use feed state
      } catch (error) {
        console.error("Failed to fetch posts", error);
        toast({
          title: "Could not fetch posts.",
          status: "error",
          duration: 2000,
          position: "top-right",
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    if (token) {
      fetchAllPosts(token);
    }
  }, [token, fetchAllPosts]);

  const handleInput = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setContent(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some text before posting.",
        status: "warning",
        duration: 2000,
        position: "top-right",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (editingPostId) {
        res = await axios.put(
          `${API_URL}/posts/${editingPostId}`,
          { content },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFeed((prevFeed) =>
          prevFeed.map((p) => (p.id === editingPostId ? res.data : p))
        );
        setEditingPostId(null); // reset after editing
      } else {
        res = await axios.post(
          `${API_URL}/posts`,
          { content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFeed([res.data, ...feed]);
      }

      setContent("");
      toast({
        title: editingPostId ? "Post updated!" : "Posted successfully!",
        status: "success",
        duration: 2000,
        position: "top-right",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not post content.",
        status: "error",
        duration: 2000,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = feed.find((p) => p.id === postId);
    if (postToEdit) {
      setContent(postToEdit.content);
      setEditingPostId(postId);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeed((prevFeed) => prevFeed.filter((p) => p.id !== postId));
      toast({
        title: "Post deleted",
        status: "success",
        duration: 2000,
        position: "top-right",
      });
    } catch {
      toast({
        title: "Error deleting post",
        status: "error",
        duration: 2000,
        position: "top-right",
      });
    }
  };

  return (
    <Box bg="gray.900" minH="50vh">
      <Center px={4} pt={6}>
        <VStack w="100%" maxW="600px" spacing={6} align="stretch">
          {/* Post Box */}
          <Box
            bg="gray.800"
            borderRadius="xl"
            p={4}
            boxShadow="md"
            transition="all 0.2s"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          >
            <HStack align="start" spacing={3}>
              <Avatar name={firstLetter} />
              <VStack w="100%" align="stretch" spacing={3}>
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleInput}
                  placeholder="What's happening?"
                  bg="gray.700"
                  color="white"
                  resize="none"
                  overflow="hidden"
                  minH="80px"
                  borderRadius="md"
                  focusBorderColor="blue.300"
                  _hover={{ bg: "gray.600" }}
                  transition="all 0.2s"
                />
                <Flex justify="space-between" align="center">
                  <Text
                    color={content.length > MAX_CHARS ? "red.400" : "gray.400"}
                    fontSize="sm"
                  >
                    {content.length}/{MAX_CHARS}
                  </Text>
                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={isSubmitting}
                    isDisabled={!content.trim()}
                    borderRadius="full"
                    px={6}
                    onClick={handleCreatePost}
                  >
                    Post
                  </Button>
                </Flex>
              </VStack>
            </HStack>
          </Box>

          {/* Feed */}
          {feed.length === 0 && (
            <Text color="gray.400" textAlign="center">
              No posts yet. Start posting!
            </Text>
          )}

          {feed.map((post) => {
            const postAuthor = post?.author?.email || "Unknown";
            const firstLetter = postAuthor.charAt(0).toUpperCase();

            return (
              <Box
                key={post.id}
                bg="gray.800"
                borderRadius="xl"
                p={4}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                position="relative"
              >
                <HStack align="start" spacing={3}>
                  <Avatar name={firstLetter} size="sm" />
                  <VStack align="start" spacing={1} w="100%">
                    <Flex justify="space-between" w="100%">
                      <Text color="white" fontWeight="bold">
                        {postAuthor}
                      </Text>

                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<FiMoreHorizontal />}
                          variant="ghost"
                          size="md"
                          color="gray.400"
                          _hover={{
                            bg: "gray.700",
                            color: "white",
                            transform: "scale(1.1)",
                          }}
                          transition="all 0.2s"
                          // ✅ safe check here
                          isDisabled={postAuthor !== displayName}
                        />
                        <MenuList bg="gray.800" borderColor="gray.700" p={0}>
                          {postAuthor === displayName && (
                            <>
                              <MenuItem
                                icon={<FiEdit />}
                                _hover={{ bg: "blue.600", color: "white" }}
                                onClick={() => handleEditPost(post.id)}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem
                                icon={<FiTrash2 />}
                                _hover={{ bg: "red.600", color: "white" }}
                                onClick={() => handleDeletePost(post.id)}
                              >
                                Delete
                              </MenuItem>
                            </>
                          )}
                        </MenuList>
                      </Menu>
                    </Flex>

                    <Text color="gray.200">{post.content}</Text>
                    <Divider borderColor="gray.700" mt={2} />
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Center>
    </Box>
  );
};

export default Dashboard;
