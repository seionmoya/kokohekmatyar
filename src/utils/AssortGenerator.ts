import { inject, injectable } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { HandbookHelper } from "@spt/helpers/HandbookHelper";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { IBarterScheme, ITraderAssort } from "@spt/models/eft/common/tables/ITrader";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { Item, Upd } from "@spt/models/eft/common/tables/IItem";
import { Money } from "@spt/models/enums/Money";
import { PresetHelper } from "@spt/helpers/PresetHelper";

import { KokoConfig } from "./Config";
import { KokoItemValidator } from "./ItemValidator";
import { IPreset } from "@spt/models/eft/common/IGlobals";
import { HashUtil } from "@spt/utils/HashUtil";
import { PresetController } from "@spt/controllers/PresetController";

@injectable()
export class KokoAssortGenerator {
    constructor(
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("HandbookHelper") protected handbookHelper: HandbookHelper,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("KokoConfig") protected kokoConfig: KokoConfig,
        @inject("KokoItemValidator") protected itemValidator: KokoItemValidator,
        @inject("PresetHelper") protected presetHelper: PresetHelper,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("PresetController") protected presetController: PresetController
    )
    {
        // empty
    }

    private getCurrency(): string
    {
        const kokoConfig = this.kokoConfig.getConfig();

        let currency = "";

        switch (kokoConfig.currency)
        {
            case "usd": currency = Money.DOLLARS; break;
            case "eur": currency = Money.EUROS; break;
            case "rub":
            default:
                currency = Money.ROUBLES;
                break;
        }

        return currency;
    }

    private getPrice(itemID: string): number
    {
        const kokoConfig = this.kokoConfig.getConfig();

        const priceMultiplier = kokoConfig.priceMultiplier;
        let price = this.handbookHelper.getTemplatePrice(itemID);

        // multiply price
        price *= this.randomUtil.getFloat(priceMultiplier.min, priceMultiplier.max);

        // cap prices
        if (price < kokoConfig.priceLimits.min)
        {
            price = kokoConfig.priceLimits.min;
        }

        if (price > kokoConfig.priceLimits.max)
        {
            price = kokoConfig.priceLimits.max;
        }

        return price;
    }

    private getPresetPrice(preset: IPreset ): number
    {
        const kokoConfig = this.kokoConfig.getConfig();
        const priceMultiplier = kokoConfig.priceMultiplier;

        let price = 0;

        for( const item of preset._items )
        {
            price += this.handbookHelper.getTemplatePrice(item._tpl);
        }

        // multiply price
        price *= this.randomUtil.getFloat(priceMultiplier.min, priceMultiplier.max);

        // cap prices
        if (price < kokoConfig.priceLimits.min)
        {
            price = kokoConfig.priceLimits.min;
        }

        if (price > kokoConfig.priceLimits.max)
        {
            price = kokoConfig.priceLimits.max;
        }

        return price;
    }

    private getStock(): Upd
    {
        const kokoConfig = this.kokoConfig.getConfig();

        const stockLimits = kokoConfig.stockLimits;

        const limited: Upd = {
            StackObjectsCount: this.randomUtil.getFloat(stockLimits.min, stockLimits.max)
        };

        const infinite: Upd = {
            StackObjectsCount: 9999999,
            UnlimitedCount: true
        };

        return kokoConfig.isStockInfinite === true ? infinite : limited;
    }

    private generateAssortItem(assort: ITraderAssort, item: ITemplateItem): void
    {
        // Create barter scheme object
        const barterSchemeToAdd: IBarterScheme = {
            count: this.getPrice(item._id),
            _tpl: this.getCurrency()
        };

        // Create item object
        const itemToAdd: Item = {
            _id: item._id,
            _tpl: item._id,
            parentId: "hideout",
            slotId: "hideout",
            upd: this.getStock()
        };

        if (item._parent === "543be5cb4bdc2deb348b4568")
        {
            // Create ammo box
            const cartridges: Item[] = [
                itemToAdd
            ];

            this.itemHelper.addCartridgesToAmmoBox(cartridges, item);
            assort.items = assort.items.concat(cartridges);
        }
        else
        {
            // add normal item
            assort.items.push(itemToAdd);
        }

        // Add item to assort
        assort.barter_scheme[item._id] = [[barterSchemeToAdd]];
        assort.loyal_level_items[item._id] = 1;
    }

    private generatePresetAssortItem(assort: ITraderAssort, preset: IPreset): void
    {
        // Create barter scheme object
        const barterSchemeToAdd: IBarterScheme = {
            count: this.getPresetPrice(preset),
            _tpl: this.getCurrency()
        };

        const presetCopy = structuredClone(preset);
        this.generateNewItemIds( presetCopy._items );

        const newID = presetCopy._items[0]._id;
        const newTPL = presetCopy._items[0]._tpl;

        // Create item object
        const itemToAdd: Item = {
            _id: newID,
            _tpl: newTPL,
            parentId: "hideout",
            slotId: "hideout",
            upd: this.getStock()
        };

        // Add item to assort
        assort.items.push(itemToAdd);

        // we skip the first element, because its the itemToAdd
        for( let i = 1; i < presetCopy._items.length; i++ ) 
        {
            assort.items.push( presetCopy._items[i] );
        }

        assort.barter_scheme[newID] = [[barterSchemeToAdd]];
        assort.loyal_level_items[newID] = 1;
    }

    public generate(traderId: string)
    {
        // get tables
        const assort = this.databaseServer.getTables().traders[traderId].assort;
        const dbItems = Object.values(this.databaseServer.getTables().templates.items);

        // init so we can check for presets
        this.presetController.initialize();

        // get valid items
        const validItems = dbItems.filter(x => this.itemValidator.isValid(x, dbItems));

        // generate assort for items
        for (const item of validItems)
        {
            this.generateAssortItem(assort, item);
        }

        // add presets
        for (const preset of this.presetHelper.getAllPresets())
        {
            this.generatePresetAssortItem(assort, preset);
        }
    }

    private generateNewItemIds ( items: Item[] )
    {
        let ids = {}; // this is a dictionary

        for ( const item of items )
        {
            if ( !ids[ item._id ] )
            {
                // add item id to change
                ids[ item._id ] = this.hashUtil.generate();
            }
        }

        // replace the item ids
        for ( const oldId in ids )
        {
            for ( let item of items )
            {
                // update node id
                if ( item._id === oldId )
                {
                    item._id = ids[ oldId ];
                }

                if ( item.parentId && item.parentId === oldId )
                {
                    // update parent node id (if it exists)
                    item.parentId = ids[ oldId ];
                }
            }
        }
    }
}
