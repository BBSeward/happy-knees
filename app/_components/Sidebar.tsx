import React from 'react';
import { Button, TextInput, Select, Stack, Paper } from '@mantine/core';

const SidebarForm: React.FC = () => {
  return (
    <Paper
      shadow="md"
      p="md"
      style={{
        width: 300,
        background: '#1a1b1e', // Dark theme for sidebar
        color: 'white',
      }}
    >
      <Stack gap="lg">
        {/* Record Button */}
        <Button
          fullWidth
          size="lg"
          variant="gradient"
          gradient={{ from: 'teal', to: 'lime', deg: 45 }}
          style={{
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Record
        </Button>

        {/* Session Name Input */}
        <TextInput
          label="Session Name"
          placeholder="Enter session name"
          styles={{
            input: {
              transition: 'box-shadow 0.3s ease',
            },
            // inputHovered: {
            //   boxShadow: '0 4px 15px rgba(0, 255, 128, 0.5)',
            // },
          }}
        />

        {/* Bike Dropdown */}
        <Select
          label="Bike"
          placeholder="Select a bike"
          data={['Mountain Bike', 'Road Bike', 'Gravel Bike']}
          styles={{
            dropdown: {
              transition: 'opacity 0.5s ease',
            },
            // item: {
            //   '&:hover': {
            //     color: 'lime',
            //   },
            // },
          }}
        />

        {/* Rider Input */}
        <TextInput
          label="Rider"
          placeholder="Enter rider name"
          styles={{
            input: {
              transition: 'transform 0.3s ease',
            },
            // inputFocused: {
            //   transform: 'scale(1.02)',
            // },
          }}
        />
      </Stack>
    </Paper>
  );
};

export default SidebarForm;
