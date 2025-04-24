import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] =useState(false);

    const { login} =useAuth();
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
            router.push('/dashboard');
        } catch( err ) {
            setError('Invalid credentials. Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <div>
                    <h2>
                        Employee Management System
                    </h2>
                    <p>
                        Sign in to your account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="rounded-none relative"
                                placeholder="Username"
                                value={username}
                                onChange={(e) =>  setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="text"
                                autoComplete="current-password"
                                required
                                className="rounded-none relative"
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>  setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    { error && (
                        <div>{error}</div>
                    )}

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex relative">
                            {isLoading ? 'Signing in..' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;