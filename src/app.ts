import express, { Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

// Set default timezone
process.env.TZ = "Asia/Bangkok";

import http from "http";
import { Server } from "socket.io";

// Route
import { Routes } from "./api/v1/routes/index";
import { authRoutes } from "./api/v1/routes/authRoutes";
import { publicRoutes } from "./api/v1/routes/publicRoutes";
import { authenticateToken } from "./api/v1/middleware/authenticateToken";
import { AppDataSource } from "./config/DataSource";
import { Trades } from "./api/v1/entities/Trades";
import { TradeStatus } from "./api/v1/entities/enums";

const app = express();
app.use(express.json());
const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use('/api/v1/images', express.static('uploads'));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // console.log("Connected");
  socket.on("message", (data) => {
    console.log(data);
  });
  // setInterval(() => {
  //   socket.emit('currentDate', { currentDate: new Date() });
  // }, 1000);
});


// Main routes
Routes.forEach((route) => {
  (app as any)[route.method](
    "/api/v1" + route.route,
    authenticateToken,
    (req: Request, res: Response, next: Function) => {
      const result = new (route.controller as any)()[route.action](
        req,
        res,
        next
      );
    }
  );
});

// Authenticate route
authRoutes.forEach((route) => {
  (app as any)[route.method](
    "/api/v1/auth" + route.route,
    (req: Request, res: Response, next: Function) => {
      const result = new (route.controller as any)()[route.action](
        req,
        res,
        next
      );
    }
  );
});

// Public route
publicRoutes.forEach((route) => {
  (app as any)[route.method](
    "/api/v1/public" + route.route,
    (req: Request, res: Response, next: Function) => {
      const result = new (route.controller as any)()[route.action](
        req,
        res,
        next
      );
    }
  );
});


app.use((req: Request, res: Response) => {
  res.status(404).json({ status: 404, message: "Resource not found" });
});


// Auto update trade
setInterval(async () => {
  const tradeRepository = AppDataSource.getRepository(Trades);

  // Get trading
  const trading = await tradeRepository
    .createQueryBuilder("Trades")
    // .where('status = :status', { status: "pending" })
    .where('isTrade = :isTrade', { isTrade: true })
    .getOne();

  // Set trading data
  const now = new Date();
  var endDate = null;
  var tradeId = null;
  var tradeStatus = null;
  var endTime = null;
  if (trading) {
    tradeId = trading.tradeId;
    endDate = trading.endDate;
    tradeStatus = trading.status;
    const unit = trading.unit;
    const number = trading.number;
    endTime = trading.endDate;
  }

  if (now > endTime) {
    if (tradeId && tradeStatus === "win") {
      await tradeRepository
        .createQueryBuilder("Trades")
        .update("Trades")
        .set({ isTrade: false })
        .where('tradeId = :tradeId', { tradeId })
        .execute();
    } else {
      await tradeRepository
        .createQueryBuilder("Trades")
        .update("Trades")
        .set({ status: TradeStatus.LOST, isTrade: false })
        .where('tradeId = :tradeId', { tradeId })
        .execute();
    }
  }
}, 1000);

export { app, server, io };
