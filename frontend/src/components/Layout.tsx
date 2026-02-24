import React from "react";
import { Box, Container, Flex, Heading, Spacer, Button, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box as="header" bg="white" boxShadow="sm">
      <Container maxW="container.xl" py={3}>
        <Flex align="center">
          <RouterLink to="/" style={{ textDecoration: "none" }}>
            <Heading size="md">Rifle</Heading>
          </RouterLink>
          <Spacer />

          <Flex gap={4} align="center">
            <RouterLink to="/events">
              <Text color="gray.700">Events</Text>
            </RouterLink>

            <RouterLink to="/tickets">
              <Text color="gray.700">My Tickets</Text>
            </RouterLink>

            {user ? (
              <>
                {user.role === "organizer" && (
                  <RouterLink to="/create-event">
                    <Text color="gray.700">Create</Text>
                  </RouterLink>
                )}

                <Button size="sm" onClick={handleLogout} ml={3} variant="outline">
                  Logout
                </Button>
                <Text ml={3} fontSize="sm" color="gray.600">
                  {user.name}
                </Text>
              </>
            ) : (
              <>
                <RouterLink to="/login">
                  <Text color="gray.700">Login</Text>
                </RouterLink>
                <Button onClick={() => navigate('/register')} size="sm" ml={3} colorScheme="brand">
                  Sign up
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

const Footer: React.FC = () => (
  <Box as="footer" bg="white" mt={8} py={4} boxShadow="inner">
    <Container maxW="container.xl">
      <Flex justify="center" fontSize="sm" color="gray.600">
        © {new Date().getFullYear()} Rifle. Tous droits réservés.
      </Flex>
    </Container>
  </Box>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Container maxW="container.xl" py={6}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
