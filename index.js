const { execSync } = require('child_process');

try {
  console.log('Building the Next.js project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Starting the Next.js server...');
  execSync('npm run start', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start:', error);
  process.exit(1);
}
