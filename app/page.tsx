import { Box, Typography, Stack } from "@mui/material";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function HomePage() {
  return (
    <Box
      component="main"
      sx={{
        p: 4,
      }}
    >
      <Stack spacing={3}>
        <LoginForm />
      </Stack>
    </Box>
  );
}