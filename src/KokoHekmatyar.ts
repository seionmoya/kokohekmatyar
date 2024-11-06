import path from "node:path";
import { inject, injectable } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ITraderBase } from "@spt/models/eft/common/tables/ITrader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { VFS } from "@spt/utils/VFS";
import { JsonUtil } from "@spt/utils/JsonUtil";

import { KokoConfig } from "./utils/Config";
import { KokoTraderGenerator } from "./utils/TraderGenerator";
import { KokoAssortGenerator } from "./utils/AssortGenerator";

import packageJson from "../package.json";

@injectable()
export class KokoHekmatyar
{
    protected modAuthor: string;
    protected modName: string;
    protected modPath: string;
    protected baseTrader: ITraderBase;

    constructor(
        @inject("PreSptModLoader") protected preSptModLoader: PreSptModLoader,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("VFS") protected vfs: VFS,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("KokoConfig") protected kokoConfig: KokoConfig,
        @inject("KokoTraderGenerator") protected traderGenerator: KokoTraderGenerator,
        @inject("KokoAssortGenerator") protected assortGenerator: KokoAssortGenerator
    )
    {
        this.modAuthor = packageJson.author;
        this.modName = packageJson.name;
        this.modPath = this.preSptModLoader.getModPath(`${this.modAuthor}-${this.modName}`);

        this.baseTrader = this.jsonUtil.deserializeJsonC(this.vfs.readFile(path.join(this.modPath + "/db/base.jsonc")));
    }

    public postDBLoad()
    {
        this.logger.debug(`[${this.modAuthor}-${this.modName}] postDb Loading...`);

        const config = this.kokoConfig.getConfig();
        this.baseTrader.items_buy.id_list = config.sellWhitelist.items;
        this.baseTrader.items_buy.category = config.sellWhitelist.categories;
        this.baseTrader.items_buy_prohibited.id_list = config.sellBlacklist.items;
        this.baseTrader.items_buy_prohibited.category = config.sellBlacklist.categories;

        this.traderGenerator.addTraderToRagfair(this.baseTrader._id, true);
        this.traderGenerator.setTraderImage(this.baseTrader, path.join(`${this.modPath}/res/kokohekmatyar.png`));

        this.traderGenerator.setInsuranceConfig(this.baseTrader._id, { insuranceMultiplier: 1, returnChancePercent: 100});
        this.traderGenerator.setTraderConfig(this.baseTrader._id, 3600);

        this.traderGenerator.setTraderProps(this.baseTrader._id, {
            assort: {
                nextResupply: 0,
                items: [],
                barter_scheme: {},
                loyal_level_items: {}
            },
            base: this.baseTrader,
            dialogue: {
                "insuranceStart": [
                    "5914451a86f7744c2d7102f9 0"
                ],
                "insuranceFound": [
                    "58fe0e3486f77471f772c3f2 0"
                ],
                "insuranceExpired": [
                    "5900a72286f7742daa4835d6 0"
                ],
                "insuranceComplete": [
                    "59008bd186f77459395f4d63 0"
                ],
                "insuranceFailed": [
                    "595f996586f774767d03cbea 0"
                ],
                "insuranceFailedLabs": [
                    "5c1a3e2a86f77476ad6d23b0 0"
                ]   
            }
        });
        this.traderGenerator.setTraderLocales(this.baseTrader._id, {
            FullName: "Koko Hekmatyar",
            FirstName: "Koko",
            Nickname: "Koko",
            Location: "Wherever war might be",
            Description: "Belongs to HCLI's European and African Logistics Division. She is extremely charismatic and bold, which earned her great success in her business as well as the fierce loyalty of her subordinates."
        });

        // generate assort
        this.assortGenerator.generate(this.baseTrader._id);

        this.logger.debug(`[${this.modAuthor}-${this.modName}] postDb Loaded`);
    }
}
