import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

import fs from 'fs';

// Handle SPA routing - serve index.html for all routes, injecting runtime env vars
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const scriptTag = `<script>
      window.ENV = {
        VITE_CLERK_PUBLISHABLE_KEY: "${process.env.VITE_CLERK_PUBLISHABLE_KEY || ''}",
        VITE_API_BASE_URL: "${process.env.VITE_API_BASE_URL || ''}"
      };
    </script>`;
    html = html.replace('<head>', '<head>' + scriptTag);
    res.send(html);
  } else {
    res.status(404).send("App not built yet.");
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

