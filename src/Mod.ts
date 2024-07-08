// libraries
import { DependencyContainer, Lifecycle } from "tsyringe";

// spt types
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";

// mod classes
import { KokoConfig } from "./utils/Config";
import { KokoTraderGenerator } from "./utils/TraderGenerator";
import { KokoItemValidator } from "./utils/ItemValidator";
import { KokoAssortGenerator } from "./utils/AssortGenerator";
import { KokoHekmatyar } from "./KokoHekmatyar";

class Mod implements IPreSptLoadMod, IPostDBLoadMod
{
    public preSptLoad(container: DependencyContainer): void
    {
        container.register<KokoConfig>("KokoConfig", KokoConfig, { lifecycle: Lifecycle.Singleton });
        container.register<KokoTraderGenerator>("KokoTraderGenerator", KokoTraderGenerator, { lifecycle: Lifecycle.Singleton });
        container.register<KokoItemValidator>("KokoItemValidator", KokoItemValidator, { lifecycle: Lifecycle.Singleton });
        container.register<KokoAssortGenerator>("KokoAssortGenerator", KokoAssortGenerator, { lifecycle: Lifecycle.Singleton });
        container.register<KokoHekmatyar>("KokoHekmatyar", KokoHekmatyar, { lifecycle: Lifecycle.Singleton });
    }

    public postDBLoad(container: DependencyContainer): void
    {
        container.resolve<KokoHekmatyar>("KokoHekmatyar").postDBLoad();
    }
}

module.exports = { mod: new Mod() }
