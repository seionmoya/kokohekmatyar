import path from "node:path";
import { inject, injectable } from "tsyringe";

import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { IKokoConfig } from "../Models";

import packageJson from "../../package.json";
import { VFS } from "@spt/utils/VFS";

@injectable()
export class KokoConfig
{
    protected modAuthor: string;
    protected modName: string;
    protected modPath: string;
    protected config: IKokoConfig;

    constructor(
        @inject("PreSptModLoader") protected preSptModLoader: PreSptModLoader,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("VFS") protected vfs: VFS,
        @inject("JsonUtil") protected jsonUtil: JsonUtil)
    {
        this.modAuthor = packageJson.author;
        this.modName = packageJson.name;
        this.modPath = this.preSptModLoader.getModPath(`${this.modAuthor}-${this.modName}`);

        const filepath = path.join(this.modPath, "configs/config.jsonc");
        const file = this.vfs.readFile(filepath);
        this.config = this.jsonUtil.deserializeJsonC(file);
    }

    public getConfig(): IKokoConfig
    {
        return this.config;
    }
}