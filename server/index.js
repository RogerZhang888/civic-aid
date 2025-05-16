import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Mount routers
import queryRoutes from './routes/queryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import govRoutes from './routes/govRoutes.js';
import translatorRoutes from './routes/translatorRoutes.js';

const app = express();

app.use(cors({
   origin: `http://${process.env.CLIENT_HOSTNAME}:${process.env.CLIENT_PORT}`, // Explicitly allow your frontend origin
   credentials: true, // Allow credentials
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed methods
   allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));
app.use(express.json());
app.use(cookieParser());

if (process.argv.includes("--use_https")) {
	// In dev, we are testing on localhost, so we need to manually specify keys for https.
	var fs = require("fs"),
		https = require("https");

	var options = {
		key: fs.readFileSync("./certs/localhost-key.pem"),
		cert: fs.readFileSync("./certs/localhost.pem"),
	};

	server = https.createServer(options, app).listen(port, serverCallback);
}

// Health check
app.get('/health', async (req, res) => {
  try {
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Backend connection failed' });
  }
});

app.use('/api/files', express.static('uploads'))

app.use('/api', authRoutes);
app.use('/api', queryRoutes);
app.use('/api', reportRoutes);
app.use('/api', chatRoutes);
app.use('/api', govRoutes);
app.use('/api', translatorRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
// Stop the server
function stopServer(callback) {
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      callback();
    });
  } else {
    callback();
  }
}
process.on('exit', () => stopServer(() => {}));
process.on('SIGINT', () => stopServer(() => process.exit(0)));
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  stopServer(() => process.exit(1));
});