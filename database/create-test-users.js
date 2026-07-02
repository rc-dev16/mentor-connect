import { createRequire } from 'module';

const require = createRequire(import.meta.url);

console.log('Delegating to create-2-test-users.cjs for Clerk-based test user provisioning...');
require('./create-2-test-users.cjs');
