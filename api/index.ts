// Vercel serverless entry point — wraps the Express app
import '../server/db.js'; // ensure db module is loaded
export { app as default } from '../server/app.js';
