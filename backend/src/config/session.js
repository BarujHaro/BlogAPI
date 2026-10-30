import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default session({
  secret: process.env.SESSION_SECRET,        
  resave: false,                             
  saveUninitialized: false,                  
  
  // 1 H 
  cookie: {
    maxAge: 60 * 60 * 1000,                 // La sesión expira en 1 hora exacta
    httpOnly: true,                         // Protege la cookie contra ataques XSS
    secure: process.env.NODE_ENV === 'production'  
  },

  store: new PrismaSessionStore(prisma, {
    checkPeriod: 5 * 60 * 1000,             
  }),
});