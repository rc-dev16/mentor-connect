#!/usr/bin/env node

/**
 * Utility script to kill processes using a specific port
 * Usage: node kill-port.cjs [port]
 * Default: port 5001
 */

const { execSync } = require('child_process');

const port = process.argv[2] || '5001';

try {
  console.log(`Checking for processes on port ${port}...`);
  
  // Find processes using the port
  const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  
  if (result.trim()) {
    const pids = result.trim().split('\n').filter(Boolean);
    console.log(`Found ${pids.length} process(es) using port ${port}:`);
    pids.forEach(pid => console.log(`  - PID: ${pid}`));
    
    // Kill all processes
    pids.forEach(pid => {
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`✓ Killed process ${pid}`);
      } catch (error) {
        console.log(`✗ Failed to kill process ${pid}`);
      }
    });
    
    console.log(`\n✅ Port ${port} is now free!`);
  } else {
    console.log(`✓ Port ${port} is already free.`);
  }
} catch (error) {
  // If lsof returns no results, it means port is free (exit code 1)
  if (error.status === 1) {
    console.log(`✓ Port ${port} is free (no processes found).`);
  } else {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

