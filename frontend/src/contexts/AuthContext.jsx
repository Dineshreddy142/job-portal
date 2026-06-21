import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const normalizeRole = (role) => {
    if (!role) return '';
    const raw = typeof role === 'string' ? role : (role.name || role.role || '');
    return raw.replace(/^ROLE_/, '').toUpperCase();
};

/**
 * Decode a JWT token and return its payload.
 * Returns null if the token is invalid.
 */
const decodeToken = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch {
        return null;
    }
};

/**
 * Check if a JWT token is expired.
 * Returns true if expired or invalid.
 */
const isTokenExpired = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= payload.exp * 1000;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            // Check if token is expired before restoring the session
            if (isTokenExpired(token)) {
                // Token expired — clean up
                logout();
            } else {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, [logout]);

    // Periodic token expiry check (every 60 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token && isTokenExpired(token)) {
                logout();
                window.location.href = '/login';
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [logout]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;
        const normalizedRole = normalizeRole(data.role);
        localStorage.setItem('token', data.token);
        const userData = { id: data.id, name: data.name, email: data.email, role: normalizedRole, position: data.position, profilePicture: data.profilePicture, companyIdCard: data.companyIdCard, isVerified: data.isVerified };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { ...data, role: normalizedRole };
    };

    const register = async (name, email, password, role, otp) => {
        const response = await api.post('/auth/register', { name, email, password, role, otp });
        const data = response.data;
        const normalizedRole = normalizeRole(data.role);
        localStorage.setItem('token', data.token);
        const userData = { id: data.id, name: data.name, email: data.email, role: normalizedRole, position: data.position, profilePicture: data.profilePicture, companyIdCard: data.companyIdCard, isVerified: data.isVerified };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { ...data, role: normalizedRole };
    };

    const updateUser = (userData) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
