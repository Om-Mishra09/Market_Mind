import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('market_mind_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, {
                email,
                password
            });

            const { token, user: userData } = response.data;
            const fullUser = { ...userData, token };

            localStorage.setItem('market_mind_token', token);
            localStorage.setItem('market_mind_user', JSON.stringify(fullUser));

            setUser(fullUser);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            alert(error.response?.data?.error || "Login Failed");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/register`, {
                name,
                email,
                password
            });
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('market_mind_token');
        localStorage.removeItem('market_mind_user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);