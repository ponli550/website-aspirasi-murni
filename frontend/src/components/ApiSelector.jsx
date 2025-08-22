import { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Switch, FormControlLabel } from '@mui/material';

// This component allows switching between the original API and direct MongoDB API
const ApiSelector = ({ onChange }) => {
  const [useDirectApi, setUseDirectApi] = useState(() => {
    // Check if there's a saved preference in localStorage
    const saved = localStorage.getItem('useDirectApi');
    return saved ? JSON.parse(saved) : true; // Default to direct API
  });

  // When the switch changes, update state and notify parent
  const handleChange = (event) => {
    const newValue = event.target.checked;
    setUseDirectApi(newValue);
    localStorage.setItem('useDirectApi', JSON.stringify(newValue));
    onChange(newValue);
  };

  // Call onChange with initial value on mount
  useEffect(() => {
    onChange(useDirectApi);
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={useDirectApi}
            onChange={handleChange}
            color="primary"
          />
        }
        label={
          <Typography variant="body2" color="textSecondary">
            {useDirectApi ? 'Using Direct MongoDB API' : 'Using Standard API'}
          </Typography>
        }
      />
    </Box>
  );
};

export default ApiSelector;