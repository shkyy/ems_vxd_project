'use client';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Paper, TextField, Typography } from "@mui/material";
import { LockOutline } from "@mui/icons-material";


export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] =useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Username and password are required');
            return;
        }

        try {
            setError('');
            setIsLoading(true);
            await login(username, password);
            router.push('/employees');
        } catch( err ) {
            setError('Invalid credentials. Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component='main' maxWidth='lg'>
            <Grid container component='main' sx={{ height: '100vh' }}>
                <CssBaseline/>
                <Grid sx={{
                    backgroundImage: 'url(/api/placeholder/1200/800)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                />
                <Grid component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                            <LockOutline/>
                        </Avatar>
                        <Typography component='h1' variant="h5">
                            Employee Management System
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Sign in to your account
                        </Typography>
                        <Box component='form' noValidate onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                label="Password"
                                name="password"
                                autoComplete="password"
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoading}
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit"/>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    )
}