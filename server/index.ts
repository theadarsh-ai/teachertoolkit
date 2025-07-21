import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getPlatformConfig, logPlatformInfo } from "./platform-config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get platform-specific configuration
  const config = getPlatformConfig();
  
  // Function to try different ports if the primary port is busy
  const tryPort = (port: number, callback: () => void) => {
    server.listen({
      port,
      host: config.host,
      reusePort: true,
    })
    .on('listening', () => {
      logPlatformInfo();
      log(`serving on port ${port}`);
      callback();
    })
    .on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} is busy, trying port ${port + 1}`);
        tryPort(port + 1, callback);
      } else {
        throw err;
      }
    });
  };

  tryPort(config.port, () => {});
})();
