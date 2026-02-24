import React from "react";
import { Box, Image, Heading, Text, Badge, Button, Flex } from "@chakra-ui/react";

interface TicketCardProps {
  title: string;
  date?: string;
  venue?: string;
  status?: string;
  onView?: () => void;
  onTransfer?: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ title, date, venue, status, onView, onTransfer }) => {
  return (
    <Box bg="white" boxShadow="sm" borderRadius="md" overflow="hidden">
      <Image src="/placeholder-event.jpg" alt={title} objectFit="cover" w="100%" h="160px" />
      <Box p={4}>
        <Heading size="sm">{title}</Heading>
        {date && <Text fontSize="sm" color="gray.600">{date}</Text>}
        {venue && <Text fontSize="sm" color="gray.600">{venue}</Text>}

        <Flex mt={3} gap={3} align="center">
          {status && (
            <Badge colorScheme={status === "VALID" ? "green" : "yellow"}>{status}</Badge>
          )}

          <Button size="sm" onClick={onView} variant="outline">
            View
          </Button>
          <Button size="sm" onClick={onTransfer} colorScheme="brand">
            Transfer
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default TicketCard;
