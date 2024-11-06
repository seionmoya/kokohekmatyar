// spt types
import { MinMax } from "@spt/models/common/MinMax";

export interface IItemCategoryList
{
    items: string[];
    categories: string[];
}

export interface IKokoConfig
{
    currency: string;
    priceMultiplier: MinMax;
    priceLimits: MinMax;
    isStockInfinite: boolean;
    stockLimits: MinMax;
    buyBlacklist: IItemCategoryList;
    buyWhitelist: IItemCategoryList;
    sellWhitelist: IItemCategoryList;
    sellBlacklist: IItemCategoryList;
}
