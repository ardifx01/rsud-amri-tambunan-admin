// apiClient.ts - Improved version
import axios, { AxiosError, AxiosResponse } from 'axios';
import Cookies from "js-cookie";

// Create axios instance
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-rsud-amritambunan.fanscosa.co.id',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get("authToken");
        
        // Debug logging
        console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
        console.log('Token present:', token ? 'Yes' : 'No');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Debug successful responses
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error: AxiosError) => {
        const { response, config } = error;
        
        console.error(`❌ ${config?.method?.toUpperCase()} ${config?.url} - Error:`, {
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
            message: error.message
        });

        // Handle specific error codes
        if (response?.status === 401 || response?.status === 403) {
            console.log('Authentication error - clearing token and redirecting');
            
            // Clear invalid token
            Cookies.remove("authToken");
            
            // Redirect to login (only if we're in browser)
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Enhanced method implementations with better error handling

// Method GET
export const getRequest = async (url: string, params?: any) => {
    try {
        const config = params ? { params } : {};
        const response = await apiClient.get(url, config);
        return response.data;
    } catch (error: any) {
        console.error(`GET ${url} failed:`, error);
        
        // Handle specific errors
        if (error.response?.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
        }
        if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please login again.');
        }
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Please try again.');
        }
        
        throw error;
    }
};

// Method POST
export const postRequest = async (url: string, data: any) => {
    try {
        const response = await apiClient.post(url, data);
        return response.data;
    } catch (error: any) {
        console.error(`POST ${url} failed:`, error);
        
        if (error.response?.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
        }
        if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please login again.');
        }
        if (error.response?.status === 422) {
            throw new Error('Validation error. Please check your input.');
        }
        
        throw error;
    }
};

// Method PUT
export const putRequest = async (url: string, data: any) => {
    try {
        const response = await apiClient.put(url, data);
        return response.data;
    } catch (error: any) {
        console.error(`PUT ${url} failed:`, error);
        
        if (error.response?.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
        }
        if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please login again.');
        }
        
        throw error;
    }
};

// Method DELETE
export const deleteRequest = async (url: string) => {
    try {
        const response = await apiClient.delete(url);
        return response.data;
    } catch (error: any) {
        console.error(`DELETE ${url} failed:`, error);
        
        if (error.response?.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
        }
        if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please login again.');
        }
        
        throw error;
    }
};

// Utility function to test API connection
export const testApiConnection = async () => {
    try {
        console.log('Testing API connection...');
        const response = await getRequest('/auth/verify-token');
        console.log('✅ API connection successful:', response);
        return true;
    } catch (error) {
        console.error('❌ API connection failed:', error);
        return false;
    }
};

// Utility function to check if token is valid
export const verifyToken = async () => {
    try {
        const token = Cookies.get("authToken");
        
        if (!token) {
            console.log('No token found');
            return false;
        }
        
        console.log('Verifying token...');
        const response = await getRequest('/auth/verify-token');
        
        if (response.status === 'success') {
            console.log('✅ Token is valid');
            return true;
        }
        
        console.log('❌ Token verification failed:', response);
        return false;
        
    } catch (error) {
        console.error('❌ Token verification error:', error);
        return false;
    }
};

// Enhanced error handling for dashboard
export const fetchDashboardData = async () => {
    try {
        // First verify token
        const isTokenValid = await verifyToken();
        if (!isTokenValid) {
            throw new Error('Invalid token');
        }

        console.log('Fetching dashboard data...');
        
        // Fetch data sequentially to identify which endpoint fails
        const results = {
            patients: null,
            totalResults: null,
            validationDone: null,
            validationNotDone: null,
            glucoseResults: null,
            connectionStatus: null,
            settings: null,
        };

        try {
            results.patients = await getRequest("/api/patients/counts");
            console.log('✅ Patients data fetched');
        } catch (error) {
            console.error('❌ Failed to fetch patients:', error);
        }

        try {
            results.totalResults = await getRequest("/api/test-glucosa/counts_total_results");
            console.log('✅ Total results data fetched');
        } catch (error) {
            console.error('❌ Failed to fetch total results:', error);
        }

        try {
            results.validationDone = await getRequest("/api/test-glucosa/counts_is_validation_done");
            console.log('✅ Validation done data fetched');
        } catch (error) {
            console.error('❌ Failed to fetch validation done:', error);
        }

        try {
            results.validationNotDone = await getRequest("/api/test-glucosa/counts_is_validation_not_done");
            console.log('✅ Validation not done data fetched');
        } catch (error) {
            console.error('❌ Failed to fetch validation not done:', error);
        }

        try {
            const currentYear = new Date().getFullYear();
            results.glucoseResults = await getRequest(`/api/test-glucosa/counts_total_results_month?year=${currentYear}`);
            console.log('✅ Glucose results data fetched');
        } catch (error) {
            console.error('❌ Failed to fetch glucose results:', error);
        }

        try {
            results.connectionStatus = await getRequest("/api/connection-status/all-devices-status");
            console.log('✅ Connection status data fetched');
        } catch (error) {
            console.error('❌ Failed to fetch connection status:', error);
        }

        try {
            results.settings = await getRequest("/api/setting");
            console.log('✅ Settings data fetched');
        } catch (error) {
            console.error('❌ Failed to fetch settings:', error);
        }

        return results;

    } catch (error) {
        console.error('❌ Dashboard data fetch failed:', error);
        throw error;
    }
};

export default apiClient;