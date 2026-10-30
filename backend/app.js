import express from "express"; 
import path from "node:path";  
import cors from 'cors';
import 'dotenv/config';  
 
import passport from "./src/config/passport.js";

import postRoutes from "./src/routes/postRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();

//CORS configurado para los dos frontends
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN1,
  process.env.ALLOWED_ORIGIN2,
];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1){
      const msg = 'The server does not allow the access from this origin';
      return callback(new Error(msg), false);
    }
    returncallback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(passport.initialize()); 

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
// app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Blog API is working successfully');
});
// --- Manejo de errores global ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error in the server',
    },
  });
});

app.get('/', (req, res) => {
  res.send('Api is working');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {   
  if (error) {
    throw error;
  }else{
    console.log(`Express app listening on port ${PORT}!`);
  }
  
});