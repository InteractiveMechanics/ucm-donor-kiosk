import express from 'express';
import next from 'next';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

const server = express();

// Initialize Next.js
app.prepare().then(() => {
  // API Routes
  server.get('/api/stories', async (req, res) => {
    try {
      const response = await fetch('http://localhost:1337/api/stories?populate=*&pagination[page]=1&pagination[pageSize]=200');
      if (!response.ok) throw new Error('Failed to fetch stories from Strapi');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
      res.status(500).json({ error: error.message });
    }
  });

  server.get('/api/help', async (req, res) => {
    try {
      const response = await fetch('http://localhost:1337/api/how-to-give?populate=*');
      if (!response.ok) throw new Error('Failed to fetch help from Strapi');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching help:', error);
      res.status(500).json({ error: error.message });
    }
  });

  server.get('/api/donors', async (req, res) => {
    try {
      const response = await fetch('http://localhost:1337/api/donors?pagination[page]=1&pagination[pageSize]=3000&sort=DonorName');
      if (!response.ok) throw new Error('Failed to fetch donors from Strapi');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching donors:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Function to start server with retry logic
  const startServer = (retries = 3) => {
    server.listen(port, hostname, (err) => {
      if (err) {
        if (err.code === 'EADDRINUSE' && retries > 0) {
          console.log(`Port ${port} is in use, retrying in 1 second... (${retries} retries left)`);
          setTimeout(() => startServer(retries - 1), 1000);
        } else {
          console.error('Failed to start server:', err);
          process.exit(1);
        }
      } else {
        console.log(`> Ready on http://${hostname}:${port}`);
      }
    });
  };

  startServer();
}); 