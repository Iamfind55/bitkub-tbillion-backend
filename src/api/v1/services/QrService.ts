import { AppDataSource } from "../../../config/DataSource";
import moment from "moment";
import { Statuses } from "../entities/enums";
import { QrCodes } from "../entities/QrCodes";

export class QrService {
  private db = AppDataSource.getRepository(QrCodes);

  async all(pageSize, page, sortBy, order, startDate, endDate) {
    const queryBuilder = this.db.createQueryBuilder("QrCodes");

    if (startDate && endDate) {
      queryBuilder.where("createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    const all = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy(`${sortBy}`, order)
      .getMany();
    const total = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy(`${sortBy}`, order)
      .getCount();
    try {
      return { all, total };
    } catch (error) {
      throw new Error(error);
    }
  }

  async one(id): Promise<QrCodes[]> {
    const one = await this.db
      .createQueryBuilder("QrCodes")
      .where("qrId = :id", { id })
      .getMany();
    try {
      return one;
    } catch (error) {
      throw new Error(error);
    }
  }

  async add(userId, images, body): Promise<QrCodes> {
    const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

    const name = body.name;
    const accountNumber = body.accountNumber;
    const createdBy = userId;

    let successfulCreated = null;

    for (const image of images) {
      const { filename, path } = image;

      // Add coin
      const insertResult = await this.db
        .createQueryBuilder("QrCodes")
        .insert()
        .into(QrCodes)
        .values({
          name,
          accountNumber,
          qr: filename,
          path,
          status: Statuses.ACTIVE,
          createdAt,
          createdBy,
        })
        .execute();
      successfulCreated = insertResult.identifiers[0].coinId;

      // Returning
      const wasCreated = await this.db
        .createQueryBuilder("QrCodes")
        .orderBy("createdAt", "DESC")
        .getOne();

      try {
        return wasCreated;
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  async update(id, images, body): Promise<QrCodes> {
    const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
    const status = body.status;
    const accountNumber = body.accountNumber;
    const name = body.name;
    // Update
    if (!images || images.length === 0) {
      await this.db
        .createQueryBuilder("QrCodes")
        .update(QrCodes)
        .set({ name, accountNumber, status, updatedAt })
        .where("qrId = :id", { id })
        .execute();
    } else {
      for (const image of images) {
        const { filename, path } = image;
        await this.db
          .createQueryBuilder("QrCodes")
          .update(QrCodes)
          .set({ name, accountNumber, qr: filename, path, status, updatedAt })
          .where("qrId = :id", { id })
          .execute();
      }
    }

    // Returning
    const wasUpdated = await this.db
      .createQueryBuilder("QrCodes")
      .where("qrId = :id", { id })
      .getOne();

    try {
      return wasUpdated;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id) {
    await this.db.delete(id);
    try {
      return await this.one(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
