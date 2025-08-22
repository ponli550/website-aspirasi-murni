import { createContext, useState, useContext, useEffect } from 'react';

// Import both API service implementations
import * as standardApi from '../services/api';
import * as directApi from '../services/direct-api';

// Create context
const ApiContext = createContext();

// Custom hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Provider component
export const ApiProvider = ({ children }) => {
  // Always use direct API without showing selector
  const api = directApi;
  
  // Dummy function to maintain API compatibility
  const toggleApiImplementation = () => {};

  // The value that will be provided to consumers
  const value = {
    api,
    useDirectApi: true, // Always true
    toggleApiImplementation
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};