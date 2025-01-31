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
    blacklist: IItemCategoryList;
    whitelist: IItemCategoryList;
}
