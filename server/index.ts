import express from 'express';
import cors from 'cors';
import emailRoutes from './routes/emailRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
}); 