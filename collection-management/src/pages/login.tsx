import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const username = data.get("username")?.toString().trim() || "";
    const password = data.get("password")?.toString().trim() || "";

    if (!username || !password) {
      setError("Lütfen kullanıcı adı ve şifre girin.");
      return;
    }

    setError(""); // Hata varsa temizle

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.ok) {
     setTimeout(() => router.push("/collections"), 100);
    } else {
      setError("Kullanıcı adı veya şifre hatalı.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Giriş Yap
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            name="username"
            label="Kullanıcı Adı"
            type="text"
            margin="normal"
            autoComplete="username"
            required
          />
          <TextField
            fullWidth
            name="password"
            label="Şifre"
            type="password"
            margin="normal"
            autoComplete="current-password"
            required
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }}>
            Giriş
          </Button>
        </form>
      </Box>
    </Container>
  );
}