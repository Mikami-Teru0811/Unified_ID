#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo ./setup.sh"
  exit 1
fi

echo "==================================="
echo "Smart Health Pi Server Setup"
echo "==================================="

# Check if running on Raspberry Pi
if [ ! -f /proc/cpuinfo ]; then
    echo "ERROR: This script must be run on a Raspberry Pi"
    exit 1
fi

if ! grep -q "Raspberry" /proc/cpuinfo 2>/dev/null; then
    echo "WARNING: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install system dependencies
echo "Installing system dependencies..."
sudo apt-get install -y python3-pip python3-venv libffi-dev libssl-dev avahi-daemon

# Enable and start avahi-daemon for mDNS (.local hostname resolution)
echo "Configuring mDNS (avahi-daemon)..."
sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon

# Create virtual environment
echo "Creating virtual environment..."
if [ -d "smarthealth_env" ]; then
    echo "Virtual environment already exists. Removing..."
    rm -rf smarthealth_env
fi

python3 -m venv smarthealth_env

# Activate virtual environment
source smarthealth_env/bin/activate

# Install Python dependencies
echo "Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Enable serial port (required for fingerprint sensor)
echo "Configuring serial port..."
if grep -q "enable_uart=1" /boot/config.txt; then
    echo "  Serial already enabled"
else
    echo "  Adding enable_uart=1 to /boot/config.txt"
    echo "enable_uart=1" | sudo tee -a /boot/config.txt
fi

# Disable serial console
if grep -q "console=serial0,115200" /boot/cmdline.txt; then
    echo "  Disabling serial console..."
    sudo sed -i 's/console=serial0,115200 //' /boot/cmdline.txt
fi

# Add user to gpio group
echo "Configuring GPIO permissions..."
sudo usermod -a -G gpio $USER 2>/dev/null || true

echo ""
echo "==================================="
echo "Setup complete!"
echo "==================================="
echo ""
echo "To run the server:"
echo "  source smarthealth_env/bin/activate"
echo "  python server.py"
echo ""
echo "Or for production with systemd:"
echo "  sudo cp smart-health.service /etc/systemd/system/"
echo "  sudo systemctl enable smart-health"
echo "  sudo systemctl start smart-health"
echo ""
echo "Hardware connections:"
echo "  - Fingerprint sensor: GPIO 14/15 (TX/RX)"
echo "  - NFC Reader: SPI pins"
echo "  - GSM Module: USB or GPIO"
echo ""
echo "mDNS Hostname:"
echo "  Access from other devices via: http://$(hostname).local:5001"
echo "  Default hostname: raspberrypi.local"
echo "  To change hostname: sudo hostnamectl set-hostname <newname>"
echo ""
