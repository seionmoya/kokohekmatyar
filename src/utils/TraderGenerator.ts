import { inject, injectable } from "tsyringe";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { IRagfairConfig } from "@spt/models/spt/config/IRagfairConfig";
import { IInsuranceConfig } from "@spt/models/spt/config/IInsuranceConfig";
import { ITraderConfig } from "@spt/models/spt/config/ITraderConfig";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { ITrader } from "@spt/models/eft/common/tables/ITrader";

interface ILocales {
    FullName: string;
    FirstName: string;
    Nickname: string;
    Location: string;
    Description: string;
}

@injectable()
export class KokoTraderGenerator {
    constructor(
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("ImageRouter") protected imageRouter: ImageRouter
    )
    { }

    public addTraderToRagfair(traderId: string, ragfair: boolean)
    {
        const ragfairConfig = this.configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);

        ragfairConfig.traders[traderId] = ragfair;
    }

    public setTraderImage(traderId: string, imagePath: string)
    {
        this.imageRouter.addRoute(`/files/trader/avatar/${traderId}`, imagePath);
    }

    public setInsuranceConfig(traderId: string, insurance: { insuranceMultiplier?: number, returnChancePercent?: number })
    {
        const insuranceConfig = this.configServer.getConfig<IInsuranceConfig>(ConfigTypes.INSURANCE);
        insuranceConfig.returnChancePercent[traderId] ??= insurance.returnChancePercent;
    }

    public setTraderConfig(traderId: string, updateTime: number)
    {
        const traderConfig = this.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);

        traderConfig.updateTime.push({
            traderId: traderId,
            seconds: {
                min: updateTime,
                max: updateTime
            }
        });
    }

    public setTraderProps(traderId: string, traderProps: ITrader)
    {
        const database = this.databaseServer.getTables();

        database.traders[traderId] = traderProps;
    }

    public setTraderLocales(traderId: string, newLocale: ILocales)
    {
        const database = this.databaseServer.getTables();

        const formattedNewlocale: Record<string, string> = {};

        for (const [localeKey, localeVal] of Object.entries(newLocale))
        {
            formattedNewlocale[`${traderId} ${localeKey}`] = localeVal;
        }

        for (const locale in database.locales.global)
        {
            database.locales.global[locale] = {
                ...database.locales.global[locale],
                ...formattedNewlocale
            };
        }
    }
}
