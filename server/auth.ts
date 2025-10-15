import { pool } from "./db";
import { Express } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string) {
  if (!password) {
    throw new Error('Password is required');
  }
  return await bcrypt.hash(password, 12);
}

async function comparePasswords(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) {
    throw new Error('Password and stored hash are required');
  }
  return await bcrypt.compare(password, storedHash);
}

export function setupAuth(app: Express) {
  app.post("/api/register", async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: "REQUEST_BODY_MISSING",
          message: "Request body is required",
          details: "Please provide user details in JSON format"
        });
      }

      const { email, password, ...rest } = req.body;

      if (!email || !password) {
        const missingFields = [];
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        
        return res.status(400).json({
          success: false,
          error: "MISSING_REQUIRED_FIELDS",
          message: "Validation failed",
          details: `The following fields are required: ${missingFields.join(", ")}`,
          missingFields
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: "PASSWORD_TOO_SHORT",
          message: "Password doesn't meet requirements",
          details: "Password must be at least 8 characters long"
        });
      }

      // Verificar existencia del usuario por email
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "EMAIL_EXISTS",
          message: "Registration failed",
          details: "The email is already registered",
          suggestion: "Please use a different email"
        });
      }

      // Crear nuevo usuario
      const newUser = await storage.createUser({
        email,
        ...rest,
        contrasena: await hashPassword(password)
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        user: newUser
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorResponse: any = {
        success: false,
        error: "REGISTRATION_FAILED",
        message: "Internal server error during registration"
      };

      if (error.message.includes('Password')) {
        errorResponse.error = "PASSWORD_VALIDATION_FAILED";
        errorResponse.message = error.message;
      } else if (error.message.includes('database') || error.message.includes('storage')) {
        errorResponse.error = "DATABASE_ERROR";
      }

      res.status(500).json({
        ...errorResponse,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,  // Línea corregida
        errorType: error.constructor.name
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: "Usuario no encontrado" });
      }
      const isPasswordValid = await comparePasswords(password, user.contrasena);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
      }
      // Aquí puedes generar una sesión o token si es necesario
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: "Error interno", error: error.message });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.status(200).json({ success: true, message: "Sesión cerrada" });
  });

  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json(req.user);
  });
}
