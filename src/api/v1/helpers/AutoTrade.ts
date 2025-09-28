import { AppDataSource } from "../../../config/DataSource";
import { Trades } from "../entities/Trades";
import { TradeStatus } from "../entities/enums";


export class AutoUpdateService {
    private tradeRepository = AppDataSource.getRepository(Trades);

    async autoUpdate() {
        
        await this.tradeRepository
            .createQueryBuilder("Trades")
            .update("Trades")
            .setParameters({ status: TradeStatus.WIN })
            .where('endDate < :endDate', { endDate: new Date(Date.now() - 60 * 1000) })
            .execute();

        console.log('Auto update completed successfully.');
    }
}