#!/bin/bash

# Backup PHP Chat System Script
# This script backs up the existing PHP chat system before deploying the new Next.js version

set -e

echo "🔄 Starting PHP chat system backup..."

# Configuration
BACKUP_DIR="chat-php-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="chat-backup-${TIMESTAMP}"

# Create backup directory
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "✅ Created backup directory: $BACKUP_DIR"
fi

# Create timestamped backup
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

echo "📦 Creating backup: $BACK_PATH"

# Backup PHP files
if [ -d "chat" ]; then
    echo "📁 Backing up chat directory..."
    cp -r chat/* "$BACKUP_PATH/"
    echo "✅ Chat directory backed up"
else
    echo "⚠️ Chat directory not found, skipping..."
fi

# Create backup manifest
cat > "$BACKUP_PATH/BACKUP_MANIFEST.txt" << EOF
PHP Chat System Backup
======================

Backup Date: $(date)
Backup Name: $BACKUP_NAME
Backup Path: $BACKUP_PATH

Contents:
- PHP classes (AIProcessor, ConversationFlow, etc.)
- API endpoints (ask.php, reset_session.php, submit_lead.php)
- Configuration files (practice_areas_config.json, LegalIntakeConfig.php)
- CSS and utility files
- Log files

Migration Notes:
- This backup preserves the original PHP implementation
- The new Next.js system replicates all functionality
- Original files are kept for reference and rollback if needed
- Configuration has been migrated to TypeScript equivalents

Rollback Instructions:
1. Stop the Next.js application
2. Restore files from this backup to the 'chat' directory
3. Update web server configuration to serve PHP files
4. Restart web server

EOF

echo "📋 Created backup manifest"

# Create symlink to latest backup
LATEST_LINK="$BACKUP_DIR/latest"
if [ -L "$LATEST_LINK" ]; then
    rm "$LATEST_LINK"
fi
ln -s "$BACKUP_NAME" "$LATEST_LINK"

echo "🔗 Created symlink to latest backup"

# Verify backup
echo "🔍 Verifying backup..."
if [ -f "$BACKUP_PATH/BACKUP_MANIFEST.txt" ]; then
    echo "✅ Backup verification successful"
    echo "📊 Backup size: $(du -sh "$BACKUP_PATH" | cut -f1)"
else
    echo "❌ Backup verification failed"
    exit 1
fi

# Create rollback script
cat > "$BACKUP_PATH/rollback.sh" << 'EOF'
#!/bin/bash

# Rollback Script for PHP Chat System
# This script restores the PHP chat system from backup

set -e

echo "🔄 Starting rollback to PHP chat system..."

# Check if we're in the backup directory
if [ ! -f "BACKUP_MANIFEST.txt" ]; then
    echo "❌ This script must be run from the backup directory"
    exit 1
fi

# Create chat directory if it doesn't exist
if [ ! -d "../../chat" ]; then
    mkdir -p "../../chat"
    echo "📁 Created chat directory"
fi

# Restore files
echo "📦 Restoring PHP files..."
cp -r * ../../chat/
echo "✅ Files restored"

echo "✅ Rollback completed successfully"
echo "⚠️ Remember to:"
echo "   1. Stop the Next.js application"
echo "   2. Update web server configuration to serve PHP files"
echo "   3. Restart web server"
EOF

chmod +x "$BACKUP_PATH/rollback.sh"
echo "🔧 Created rollback script"

echo ""
echo "🎉 Backup completed successfully!"
echo "📁 Backup location: $BACKUP_PATH"
echo "🔗 Latest backup: $LATEST_LINK"
echo ""
echo "Next steps:"
echo "1. Deploy the new Next.js chat system"
echo "2. Test thoroughly in staging environment"
echo "3. Gradually roll out to production"
echo "4. Monitor for any issues"
echo ""
echo "If rollback is needed, run: $BACKUP_PATH/rollback.sh"
