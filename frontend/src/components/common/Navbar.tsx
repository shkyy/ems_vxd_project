'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { AppBar, Container, Toolbar, Typography, Button, Menu, MenuItem, Divider, Box, Tooltip, Avatar, IconButton } from "@mui/material";
import { BusinessCenter } from "@mui/icons-material";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    if (pathname === '/login') return null;

    const navigationPaths = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Employees', href: '/employees' },
        { name: 'Departments', href: '/departments' },
        { name: 'Attendance', href: '/attendance' },
        { name: 'Leaves', href: '/leave' },
    ];

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = (): void => {
        setAnchorElUser(null);
    };

    const handleLogout = (): void => {
        handleCloseUserMenu();
        logout();
    };

    const toggleDrawer = (open: boolean) => {
        (event: React.KeyboardEvent | React.MouseEvent) => {
            if (
                event.type === 'keydown' && 
                ((event as React.KeyboardEvent).key === 'Tab' || 
                (event as React.KeyboardEvent).key === 'Shift')
            ) {
                return;
            }

            setIsOpen(open);
        } 
    }

    return (
        <AppBar position="static" color="primary">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <BusinessCenter sx={{ display: { xs: 'none', md: 'flex' }}}/>
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        href='/dashboard'
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        EMS
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }}}>
                        {navigationPaths.map((item) => (
                            <Button
                                key={item.name}
                                LinkComponent={Link}
                                href={item.href}
                                sx={{
                                    my: 2,
                                    color: 'white',
                                    display: 'block',
                                    backgroundColor: isActive(item.href) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </Box>

                    {user && (
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title='Open settings'>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt={user.userName}>
                                        {user.userName?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem disabled>
                                    <Typography textAlign='center'>{user.userName}</Typography>
                                    <Divider/>
                                    <MenuItem onClick={handleLogout}>
                                        <Typography textAlign='center'>Logout</Typography>
                                    </MenuItem>
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}