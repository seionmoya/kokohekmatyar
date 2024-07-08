import path from "node:path";
import { inject, injectable } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ITraderBase } from "@spt/models/eft/common/tables/ITrader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { VFS } from "@spt/utils/VFS";
import { JsonUtil } from "@spt/utils/JsonUtil";

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

        this.traderGenerator.addTraderToRagfair(this.baseTrader._id, true);
        this.traderGenerator.setTraderImage(this.baseTrader._id, path.join(`${this.modPath}res/kokohekmatyar.png`));

        this.traderGenerator.setInsuranceConfig(this.baseTrader._id, {});
        this.traderGenerator.setTraderConfig(this.baseTrader._id, 3600);

        this.traderGenerator.setTraderProps(this.baseTrader._id, {
            assort: {
                nextResupply: 0,
                items: [],
                barter_scheme: {},
                loyal_level_items: {}
            },
            base: this.baseTrader,
            questassort: {
                started: {},
                success: {},
                fail: {}
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
        this.assortGenerator.generate("kokohekmatyar");

        this.logger.debug(`[${this.modAuthor}-${this.modName}] postDb Loaded`);
    }
}
