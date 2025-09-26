import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001/api";

const ReviewPost = ({ token }) => {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch flagged/removed posts
  const fetchFlaggedPosts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/posts/flagged`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (error) {
      toast({
        title: "Failed to fetch flagged posts",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFlaggedPosts();
  }, [token]);

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Removed Posts ({posts.length})
      </Heading>

      {isLoading ? (
        <Spinner size="xl" />
      ) : posts.length === 0 ? (
        <Text>No removed posts found. Your posts are safe!</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {posts.map((post) => (
            <Card
              key={post.id}
              variant="outline"
              bg="gray.800"
              borderLeft="4px solid red"
              p={3}
            >
              <CardHeader>
                <Heading size="sm">
                  Post by: {post.author?.email || "Unknown"}
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  {new Date(post.createdAt).toLocaleString()}
                </Text>
              </CardHeader>
              <CardBody>
                <Text mb={2}>{post.content}</Text>
                {post.aiReason && (
                  <>
                    <Badge colorScheme="red" mb={1}>
                      Reason:
                    </Badge>
                    <Text fontSize="sm" fontStyle="italic" mb={2}>
                      {post.aiReason}
                    </Text>
                  </>
                )}
                {!post.aiReason && (
                  <Text fontSize="sm" fontStyle="italic" color="gray.400">
                    This post was removed due to inappropriate content
                  </Text>
                )}
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ReviewPost;
