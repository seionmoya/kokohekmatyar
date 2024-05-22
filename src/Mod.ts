// libraries
import { DependencyContainer, Lifecycle } from "tsyringe";

// aki types
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";

// mod classes
import { KokoConfig } from "./utils/Config";
import { KokoTraderGenerator } from "./utils/TraderGenerator";
import { KokoItemValidator } from "./utils/ItemValidator";
import { KokoAssortGenerator } from "./utils/AssortGenerator";
import { KokoHekmatyar } from "./KokoHekmatyar";

class Mod implements IPreAkiLoadMod, IPostDBLoadMod
{
    public preAkiLoad(container: DependencyContainer): void
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
