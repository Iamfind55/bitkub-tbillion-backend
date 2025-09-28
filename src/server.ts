import { AppDataSource } from "./config/DataSource";
import { app, server } from "./app";
import dotenv from 'dotenv';
dotenv.config();

AppDataSource.initialize()
  .then(async () => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT);
    console.log(`Server running on http://localhost:${PORT}`);
  })
  .catch((error) => console.log(error));
