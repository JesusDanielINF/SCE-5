import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Rate limiting
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Demasiados intentos de login, intenta de nuevo en 15 minutos",
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (much higher for development)
  message: "Demasiadas solicitudes, intenta de nuevo más tarde",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust proxy headers
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV === 'development';
  }
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Input sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// Authentication middleware
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Usuario no válido" });
    }

    // Check if user is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      return res.status(401).json({ message: "Usuario bloqueado temporalmente" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Error de autenticación" });
  }
};

// Role-based authorization
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos para esta acción" });
    }
    next();
  };
};

// Audit logging middleware
export const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function(body) {
      // Log the action after successful response
      if (res.statusCode < 400) {
        storage.createAuditLog({
          userId: req.user?.id || null,
          action,
          resource,
          resourceId: req.params.id || "",
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== "GET" ? req.body : undefined,
          },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent") || "",
        }).catch(console.error);
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

// CSRF protection
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  const token = req.headers["x-csrf-token"] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ message: "Token CSRF inválido" });
  }

  next();
};

// Session validation
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    // Check session timeout
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours
    if (req.session.lastAccess && (Date.now() - req.session.lastAccess) > maxAge) {
      req.session.destroy(() => {
        return res.status(401).json({ message: "Sesión expirada" });
      });
      return;
    }

    req.session.lastAccess = Date.now();
  }

  next();
};
