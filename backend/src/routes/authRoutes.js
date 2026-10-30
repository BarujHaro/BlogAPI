import jwt from "jsonwebtoken";
import express from 'express';
import passport from 'passport'; 

const router = express.Router();
import * as authController from '../controllers/authController.js';

router.post('/sign-up', authController.createUser);
router.post('/login', authController.loginUser)
router.get('/profile', passport.authenticate("jwt", {session: false}), authController.getUser);
router.put('/profile/:id', passport.authenticate("jwt", { session: false }), authController.updateProfile);
router.delete('/profile/:id', passport.authenticate("jwt", { session: false }), authController.deleteProfile);
router.post('/logout', passport.authenticate("jwt", { session: false }), authController.logout);


export default router;

/*
passport.authenticate("jwt", {session: false})
Va a Headers de HTTP y extrae el token del formato
Lo desencripta
*/