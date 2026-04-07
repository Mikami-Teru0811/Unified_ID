#!/bin/bash

# Smart-ID Restore Script
# Restore MongoDB Atlas database from backup

set -e

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env.backup" 2>/dev/null || true

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
MONGO_URI="${MONGO_URI}"
S3_BUCKET="${S3_BUCKET}"
S3_REGION="${S3_REGION:-us-east-1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

success() {
    log "${GREEN}✓ $1${NC}"
}

warn() {
    log "${YELLOW}⚠ $1${NC}"
}

error() {
    log "${RED}✗ $1${NC}"
}

info() {
    log "${BLUE}ℹ $1${NC}"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -f, --file FILE     Restore from specific backup file"
    echo "  -l, --list          List available backups"
    echo "  -s, --s3            Restore from S3 backup"
    echo "  -d, --date DATE     Restore from backup by date (YYYYMMDD)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -l                           # List available backups"
    echo "  $0 -f ./backups/backup_20240101.gz   # Restore from file"
    echo "  $0 -s backup_20240101.gz       # Restore from S3"
    echo "  $0 -d 20240101                  # Restore from date"
}

# List available backups
list_backups() {
    info "Local Backups:"
    echo ""

    if [ -d "$BACKUP_DIR" ]; then
        ls -lah "$BACKUP_DIR"/*.gz 2>/dev/null | awk '{print $9, $5, $6, $7, $8}' | while read -r file size date time year; do
            echo "  📄 $file ($size) - $date $time $year"
        done

        if [ -z "$(ls -A "$BACKUP_DIR"/*.gz 2>/dev/null)" ]; then
            warn "No local backups found in $BACKUP_DIR"
        fi
    else
        warn "Backup directory $BACKUP_DIR does not exist"
    fi

    echo ""

    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        info "S3 Backups:"
        echo ""

        aws s3 ls "s3://${S3_BUCKET}/backups/" 2>/dev/null | while read -r line; do
            size=$(echo $line | awk '{print $3}')
            date=$(echo $line | awk '{print $1}')
            time=$(echo $line | awk '{print $2}')
            name=$(echo $line | awk '{print $4}')
            echo "  📄 s3://${S3_BUCKET}/backups/$name ($size) - $date $time"
        done
    fi
}

# Download from S3
download_from_s3() {
    local file_name="$1"
    local local_path="${BACKUP_DIR}/${file_name}"

    mkdir -p "$BACKUP_DIR"

    info "Downloading from S3: $file_name"

    aws s3 cp "s3://${S3_BUCKET}/backups/${file_name}" "$local_path" \
        --region "$S3_REGION"

    echo "$local_path"
}

# Restore from mongodump
restore_mongodump() {
    local backup_file="$1"

    if [ -z "$MONGO_URI" ]; then
        error "MONGO_URI not set. Cannot restore."
        exit 1
    fi

    info "Restoring from: $backup_file"

    # Check if backup file exists
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi

    # Confirm restoration
    warn "This will overwrite the current database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        info "Restore cancelled"
        exit 0
    fi

    # Create pre-restore backup
    log "Creating pre-restore backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    PRE_RESTORE="${BACKUP_DIR}/pre_restore_${TIMESTAMP}.gz"

    if command -v mongodump &> /dev/null; then
        mongodump --uri="$MONGO_URI" --archive="$PRE_RESTORE" --gzip 2>&1 || true
        success "Pre-restore backup created: $PRE_RESTORE"
    fi

    # Restore
    log "Starting restoration..."

    if command -v mongorestore &> /dev/null; then
        mongorestore \
            --uri="$MONGO_URI" \
            --archive="$backup_file" \
            --gzip \
            --drop \
            2>&1

        success "Database restored successfully"
    elif command -v docker &> /dev/null; then
        docker run --rm \
            --network host \
            -e MONGO_URI="$MONGO_URI" \
            mongo:latest mongorestore \
            --uri="$MONGO_URI" \
            --archive="$backup_file" \
            --gzip \
            --drop 2>&1

        success "Database restored successfully (via Docker)"
    else
        error "Neither mongorestore nor Docker available. Cannot restore."
        exit 1
    fi
}

# Find backup by date
find_backup_by_date() {
    local date="$1"
    local backup_file="${BACKUP_DIR}/smartid_backup_${date}"*.gz

    if ls $backup_file 2>/dev/null | head -n1; then
        ls $backup_file 2>/dev/null | head -n1
    else
        error "No backup found for date: $date"
        exit 1
    fi
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        usage
        exit 0
    fi

    while [ $# -gt 0 ]; do
        case "$1" in
            -f|--file)
                restore_mongodump "$2"
                shift 2
                ;;
            -l|--list)
                list_backups
                shift
                ;;
            -s|--s3)
                backup_path=$(download_from_s3 "$2")
                restore_mongodump "$backup_path"
                shift 2
                ;;
            -d|--date)
                backup_file=$(find_backup_by_date "$2")
                restore_mongodump "$backup_file"
                shift 2
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

main "$@"
