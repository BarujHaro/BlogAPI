import prisma from '../db/db.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import { validationResult } from "express-validator";


export const getUser = async (req, res, next) => {
    try{
       if  (!req.user){
        return res.status(401).json({message: "Not authorized"});
       }

       const user = await prisma.user.findUnique({
        where: {id: req.user.id},
        select:{
            id: true,
            username: true,
            admin: true,
        }
       });

       return res.status(200).json({ user });
    }catch(err){
        next(err);
    }
};

export const createUser = async (req,res, next) => {
    try{
        const {username, password} = req.body;

        if(!username || !password){
            return res.status(400).json({message: "Username and password are required"});

        }

        const existingUser = await prisma.user.findUnique({where: {username}});
        if(existingUser){
            return res.status(400).json({message: "Username are invalid"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                admin: false
            },
            select: {
                id: true,
                username: true,
                admin: true
            }
        });
        return res.status(201).json({
            message: "User created succefully",
            user: newUser
        });
    }catch(err){
        next(err);
    }
};

export const loginUser = (req, res, next) => {
   
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    
    if (!user) {
      return res.status(401).json({ 
        message: info?.message || "Credenciales incorrectas" 
      });
    }

   
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    return res.status(200).json({ 
      message: "Login exitoso",
      user: { id: user.id, username: user.username, admin: user.admin }, 
      token 
    });
  })(req, res, next);  
};

export const updateProfile = async (req, res,next) => {
    try{
        const {username, password} = req.body;
        const userId = req.user.id;

        const updateData = {};

        if(username){
            const existingUser = await prisma.user.findFirst({
                where: {username, NOT: {id: userId}}
            });
            updateData.username = username;
        }

        if(password){
            updateData.password = await bcrypt.hash(password, 10);
        }

        if(Object.keys(updateData).length === 0){
            return res.status(400).json({message: "No data to update"});
        }

        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: updateData,
            select: {id: true, username: true, admin: true}
        });

        return res.status(200).json({
            message: "Profile updated",
            user: updatedUser
        });

    }catch(err){
        next(err);
    }
};

export const deleteProfile = async (req, res, next) => {
    try{
        const userId = req.user.id;
        await prisma. user.delete({
            where: {id:userId}
        });

        return res.status(200).json({
            message: "Account deleted"
        });
    }catch(err){
        next(err);
    }
};

export const logout = (req, res, next) => {
    try{
        return res.status(200).json({
            message: "Logout succesful"
        });
    }catch(err){
        next(err);
    }
};

