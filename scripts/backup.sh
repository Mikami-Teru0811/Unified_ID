#!/bin/bash

# Smart-ID Backup Script
# Automated backup for MongoDB Atlas database

set -e

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env.backup" 2>/dev/null || true

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
MONGO_URI="${MONGO_URI}"
ATLAS_PROJECT_ID="${ATLAS_PROJECT_ID}"
ATLAS_PUBLIC_KEY="${ATLAS_PUBLIC_KEY}"
ATLAS_PRIVATE_KEY="${ATLAS_PRIVATE_KEY}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET}"
S3_REGION="${S3_REGION:-us-east-1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Build backup filename
BACKUP_FILENAME="smartid_backup_${TIMESTAMP}.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

log "Starting Smart-ID database backup..."

# Check MongoDB URI
if [ -z "$MONGO_URI" ]; then
    error "MONGO_URI not set. Please configure your MongoDB Atlas connection string."
    exit 1
fi

# Method 1: MongoDB Atlas Snapshots (for Atlas Pro clusters)
backup_atlas_snapshot() {
    if [ -z "$ATLAS_PROJECT_ID" ] || [ -z "$ATLAS_PUBLIC_KEY" ] || [ -z "$ATLAS_PRIVATE_KEY" ]; then
        warn "Atlas credentials not configured. Skipping Atlas snapshot backup."
        return 1
    fi

    log "Creating Atlas snapshot..."

    RESPONSE=$(curl -s -u "$ATLAS_PUBLIC_KEY:$ATLAS_PRIVATE_KEY" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        --request POST \
        "https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_PROJECT_ID}/clusters/Cluster0/snapshots")

    if echo "$RESPONSE" | grep -q "created"; then
        success "Atlas snapshot created successfully"
        return 0
    else
        warn "Failed to create Atlas snapshot: $RESPONSE"
        return 1
    fi
}

# Method 2: mongodump via mongosh
backup_mongodump() {
    log "Running mongodump backup..."

    if command -v mongodump &> /dev/null; then
        mongodump \
            --uri="$MONGO_URI" \
            --archive="$BACKUP_PATH" \
            --gzip \
            --oplog \
            2>&1

        if [ -f "$BACKUP_PATH" ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
            success "mongodump backup completed: $BACKUP_FILENAME ($BACKUP_SIZE)"
            return 0
        else
            error "mongodump backup failed"
            return 1
        fi
    else
        warn "mongodump not installed. Please install MongoDB Database Tools."
        return 1
    fi
}

# Method 3: mongodump via Docker
backup_docker() {
    log "Running backup via Docker..."

    if command -v docker &> /dev/null; then
        CONTAINER_NAME="smartid_mongo_backup"

        docker run --rm \
            --network host \
            -e MONGO_URI="$MONGO_URI" \
            --name "$CONTAINER_NAME" \
            mongo:latest mongodump \
            --uri="$MONGO_URI" \
            --archive=/archive.gz \
            --gzip \
            --oplog \
            --out=/dump 2>&1 || true

        if [ -d "./dump" ]; then
            tar -czf "$BACKUP_PATH" -C ./dump .
            rm -rf ./dump
            BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
            success "Docker backup completed: $BACKUP_FILENAME ($BACKUP_SIZE)"
            return 0
        else
            warn "Docker backup failed"
            return 1
        fi
    else
        warn "Docker not installed. Skipping Docker backup method."
        return 1
    fi
}

# Upload to S3
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        warn "S3_BUCKET not configured. Skipping S3 upload."
        return 1
    fi

    log "Uploading backup to S3..."

    if command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_PATH" "s3://${S3_BUCKET}/backups/${BACKUP_FILENAME}" \
            --region "$S3_REGION"

        success "Backup uploaded to S3: s3://${S3_BUCKET}/backups/${BACKUP_FILENAME}"
        return 0
    else
        warn "AWS CLI not installed. Skipping S3 upload."
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."

    find "$BACKUP_DIR" -name "smartid_backup_*.gz" -mtime +$RETENTION_DAYS -delete

    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        aws s3 ls "s3://${S3_BUCKET}/backups/" | while read -r line; do
            create_date=$(echo $line | awk '{print $1}')
            file_name=$(echo $line | awk '{print $4}')
            if [[ $(date -d "$create_date" +%s) < $(date -d "$RETENTION_DAYS days ago" +%s) ]]; then
                aws s3 rm "s3://${S3_BUCKET}/backups/${file_name}"
                success "Deleted old S3 backup: $file_name"
            fi
        done
    fi

    success "Cleanup completed"
}

# Verify backup
verify_backup() {
    log "Verifying backup integrity..."

    if [ -f "$BACKUP_PATH" ]; then
        if file "$BACKUP_PATH" | grep -q "gzip compressed data"; then
            success "Backup file verified: $BACKUP_PATH"
            return 0
        else
            error "Backup file is corrupted"
            return 1
        fi
    else
        error "Backup file not found"
        return 1
    fi
}

# Main execution
main() {
    START_TIME=$(date +%s)

    # Attempt backup methods in order
    BACKUP_SUCCESS=false

    backup_mongodump && BACKUP_SUCCESS=true
    if [ "$BACKUP_SUCCESS" = false ]; then
        backup_docker && BACKUP_SUCCESS=true
    fi

    if [ "$BACKUP_SUCCESS" = false ]; then
        backup_atlas_snapshot && BACKUP_SUCCESS=true
    fi

    if [ "$BACKUP_SUCCESS" = true ]; then
        verify_backup
        upload_to_s3
        cleanup_old_backups
    else
        error "All backup methods failed"
        exit 1
    fi

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    success "Backup completed in ${DURATION} seconds"

    # Print summary
    echo ""
    echo "========================================="
    echo "  Smart-ID Backup Summary"
    echo "========================================="
    echo "  Timestamp: $TIMESTAMP"
    echo "  Backup: $BACKUP_PATH"
    echo "  Duration: ${DURATION}s"
    echo "  Retention: ${RETENTION_DAYS} days"
    echo "========================================="
}

main "$@"
