// Rollback: restore allowedSections from backup for AGENT users only
const fs = require('fs');
console.log('Rollback: restore users-backup-pre-migration.json to DB (agent rows only)');
console.log('Path:', process.cwd());
