'use client';

import { FC } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Switch,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Public as LanguageIcon,
  Settings as SettingsIcon,
  LightMode,
  DarkMode,
} from '@mui/icons-material';

interface HeaderProps {
  collectionIndex: number;
  totalProducts: number;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const Header: FC<HeaderProps> = ({
  collectionIndex,
  totalProducts,
  onThemeToggle,
  isDarkMode,
}) => {
  return (
    <Box width="100%">
      <Box
        width="80%"
        ml="20%" // Sayfanın sağ %80'ini kaplasın
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={2}
        borderBottom="1px solid #ddd"
      >
        {/* Left */}
        <Box>
          <Typography fontWeight="bold">Sabitleri Düzenle</Typography>
          <Typography variant="body2">
            Koleksiyon – {collectionIndex} / {totalProducts} Ürün
          </Typography>
        </Box>

        {/* Theme Switch */}
        <Box display="flex" alignItems="center" gap={1}>
          <LightMode fontSize="small" />
          <Switch checked={isDarkMode} onChange={onThemeToggle} size="small" />
          <DarkMode fontSize="small" />
        </Box>

        {/* Right */}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton><LanguageIcon /></IconButton>
          <IconButton>
            <Badge badgeContent={12} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton><MailIcon /></IconButton>
          <IconButton><SettingsIcon /></IconButton>
          <Avatar sx={{ width: 36, height: 36 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;