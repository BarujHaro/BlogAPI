/*
Passport es el middleware de autenticacion mas popular de node.
Es modular y flexible que usa estrategias para identifica rusuarios como
usuario/contraseña, tokens, google o github
*/

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";   //Estrategia para autenticar usando credenciales tradicionales almacenadas en tu propia base de datos (email y contraseña).
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";  //• Herramientas para proteger rutas mediante JSON Web Tokens (JWT). ExtractJwt ayuda a capturar el token desde dónde elijas (en este caso, las cabeceras HTTP).
import bcrypt from "bcrypt";
import prisma from '../db/db.js'; 

//Estrategia local: Solo sirve para validar el incio de sesión inicial
//Defines the strategy of authentication (email+password) 
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, //The username is the "email" field
    async (email, password, done) => {
      try {
        //Look for the user in the DB by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false); //If it doesnt exist, login fail
        //It compare the password with the saved hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false);
        //If everything is fine, return the user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);


//Estrategia con JWT: Sirve para proteger rutas
//Esta estrategia se ejecuta en cada petición subsiguiente a rutas protegidas. El usuario ya se logueó, ya tiene un token, y ahora quiere consumir tu API.

passport.use(
  new JWTStrategy(
    {
      // Indica a Passport que busque el token en la cabecera "Authorization" como un "Bearer Token"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Clave secreta con la que se firmó el token para verificar que sea auténtico y no haya sido alterado
      secretOrKey: process.env.JWT_SECRET 
    },
    async(jwtPayload, done) => {
      try{
         // El 'jwtPayload' contiene los datos que guardaste dentro del token al crearlo (ej: id, email)
        // Buscamos al usuario en la BD usando el ID del payload
        const user = await prisma.user.findUnique({where: {id: jwtPayload.id}})
      
        if(user){
          return done(null, user);
        }else{
          return done(null, false);
        }
      }catch(err){
        return done(err,false);
      }
    }
  )
)

export default passport;