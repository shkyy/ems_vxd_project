import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// interface to define the user object
export interface User {
    userId: number;
    userName: string;
    email: string;
    role: string;
    status: string;
    employee?: {
        employeeId: number;
        firstName: string;
        lastName: string;
    };
}

// interface to define the authetication context
interface AuthContextType {
    user: User | null; // currently logged in user
    loading: boolean; // shows if auth state is being initialized
    login: (username: string, password: string) => Promise<void>; // function tologin
    logout: () => void; // funtion to logout
    isAuthenticated: boolean; // flag indicating if the user is authenticated or not
}

// creating the authcontext with default values
export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    logout: () => {},
    isAuthenticated: false
});

// authprovider component to wrap around parts of the app that need authentication
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // check for stored auth on load
        const storedUser= localStorage.getItem('user');
        if(storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user data', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // function to log in the user
    const login = async(username: string, password: string)  => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const userdata = await response.json();
            setUser(userdata);
            localStorage.setItem('user', JSON.stringify(userdata));
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error,' , error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // function to logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/login');
    }
    
    // provide authentication context values to children components
    return (
       <AuthContext.Provider value={{
            user, loading, login, logout, isAuthenticated: !!user 
       }}>
        {children}
       </AuthContext.Provider>
    );
};

// custom hook to use authcontext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};