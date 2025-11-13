import { Box } from '@chakra-ui/react';

const defaultGlassStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  borderRadius: '16px',
  boxShadow: '0 4px 30px rgba(210, 210, 210, 0.27)',
  backdropFilter: 'blur(9.4px)',
  WebkitBackdropFilter: 'blur(13.4px)',
  border: '1px solid rgba(255, 255, 255, 0.22)',
};

/**
 * A reusable glassmorphism-style container that:
 * - Keeps default paddings, width, and style
 * - Allows props from parent to override or extend them
 * - Falls back to defaults if props aren’t provided
 */
export default function GlassBox({ children, sx = {}, px, py, w, ...props }) {
  return (
    <Box
      px={px ?? 6}
      py={py ?? 4}
      w={w ?? ['90%', '80%', '60%']}
      sx={{ ...defaultGlassStyle, ...sx }}
      {...props}
    >
      {children}
    </Box>
  );
}
