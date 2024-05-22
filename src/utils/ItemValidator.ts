import { inject, injectable } from "tsyringe";

import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { PresetHelper } from "@spt-aki/helpers/PresetHelper";

import { KokoConfig } from "./Config";

@injectable()
export class KokoItemValidator
{
    constructor(
        @inject("KokoConfig") protected kokoConfig: KokoConfig,
        @inject("PresetHelper") protected presetHelper: PresetHelper
    )
    {
        // empty
    }

    private isValidItemTemplate(item: ITemplateItem): boolean
    {
        return item._type === "Item";
    }

    private isValidBlacklistItem(item: ITemplateItem): boolean
    {
        const kokoConfig = this.kokoConfig.getConfig();

        // Item must not appear in koko's item blacklist
        for (const blacklistId in kokoConfig.blacklist.items)
        {
            if (item._id == blacklistId)
            {
                return false;
            }
        }

        return true;
    }

    private isValidWhitelistItem(item: ITemplateItem): boolean
    {
        const kokoConfig = this.kokoConfig.getConfig();

        // Item appearing in koko's item whitelist must appear
        for (const whitelistId in kokoConfig.whitelist.items)
        {
            if (item._id == whitelistId)
            {
                return true;
            }
        }

        return false;
    }

    public isValid(item: ITemplateItem): boolean
    {
        let result = this.isValidItemTemplate(item);

        if (result === true)
        {
            // item found, we might need to blacklist it
            result = this.isValidBlacklistItem(item);
        }

        if (result === false)
        {
            // item not found, we might need to whitelist it
            result = this.isValidWhitelistItem(item);
        }

        return result;
    }
}
