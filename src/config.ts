import * as fs from "fs";
import * as path from "path";
import { GuildsConfig } from "./types";

const configFile = path.join("config.json");
export const config: GuildsConfig = JSON.parse(
  fs.readFileSync(configFile, "utf-8")
);
