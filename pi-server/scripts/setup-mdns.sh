#!/bin/bash
# Smart-ID mDNS Setup for Raspberry Pi
# Run this on your Raspberry Pi to ensure avahi-daemon is configured

echo "=========================================="
echo "Smart-ID mDNS Hostname Setup"
echo "=========================================="
echo ""

# Check if avahi-daemon is installed
echo "[1/4] Checking avahi-daemon installation..."
if command -v avahi-daemon &> /dev/null; then
    echo "  ✓ avahi-daemon is installed"
else
    echo "  ✗ avahi-daemon not found. Installing..."
    sudo apt update
    sudo apt install -y avahi-daemon
fi

# Check if avahi-daemon is running
echo ""
echo "[2/4] Checking avahi-daemon status..."
if systemctl is-active --quiet avahi-daemon; then
    echo "  ✓ avahi-daemon is running"
else
    echo "  ! avahi-daemon not running. Starting..."
    sudo systemctl start avahi-daemon
    sudo systemctl enable avahi-daemon
    echo "  ✓ avahi-daemon started and enabled"
fi

# Get current hostname
echo ""
echo "[3/4] Current hostname:"
hostname=$(hostname)
fullname="${hostname}.local"
echo "  Hostname: $hostname"
echo "  mDNS name: $fullname"

# Test mDNS resolution
echo ""
echo "[4/4] Testing mDNS resolution..."
if command -v avahi-resolve &> /dev/null; then
    resolved=$(avahi-resolve -n "$fullname" -4 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "  ✓ mDNS resolves to: $resolved"
    else
        echo "  ! mDNS test failed (may be because you're on this Pi)"
    fi
else
    echo "  ! avahi-resolve not available, skipping test"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Your Pi is now accessible via:"
echo "  http://$fullname:5001"
echo ""
echo "From any device on your network, use:"
echo "  http://raspberrypi.local:5001"
echo ""
echo "To change the hostname (optional):"
echo "  sudo hostnamectl set-hostname smartid-pi"
echo "  sudo nano /etc/hosts"
echo "  # Change 'raspberrypi' to your new hostname"
echo ""
