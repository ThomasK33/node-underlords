# Node-Underlords

![GitHub package.json version](https://img.shields.io/github/package-json/v/ThomasK33/node-underlords)
![Node.js CI](https://github.com/ThomasK33/node-underlords/workflows/Node.js%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/ThomasK33/node-underlords/badge.svg?branch=master)](https://coveralls.io/github/ThomasK33/node-underlords?branch=master)
![node-current](https://img.shields.io/node/v/underlords)
![NPM](https://img.shields.io/npm/l/underlords)

TypeScript / JavaScript library for Dota Underlords.

---

## Features

- Share code parsing
- Share code encoding

## Installation

This is a [Node.js](https://nodejs.org/) module available through the [NPM registry](https://www.npmjs.com/) and [GitHub Packages](https://github.com/features/packages).

Before installing, please download and install a Node.js version greater or equal to 10.0.

Installation of the module is done using the npm install command:

```bash
npm install underlords
```

## Quick Start

```javascript
import { ShareCodeV8 } from "underlords";

// Parse an Underlords share code to a ShareCodeV8 instance
const shareCodeString =
	"8qAMAAP4BAK4BAATjJ/5uAEZuAAAgEVM0LgAAAG0AbQAACwAAAP8BDAABCRsI/wAJARcBAQAOAQUBAQAGES0QbUBHOlcBEmoBAAFIACABaBABAyAAEAEpLAIgIAAwAAAGAgEgAAWCAHUR2gB0EQkBAQRjAAVyLBAAAgABBAMGdycAdy4fAK4BAA==";
const shareCode = ShareCodeV8.fromBase64String(shareCodeString);

// Log board unit at index 0x0
console.log(shareCode.boardUnitIDs[0][0]);
// -> 32 (Abaddon)

// Log unit item at index 4x4
console.log(shareCode.unitItems[4][4].itemID);
// -> 10211 (maelstrom_rot1)

// Change unit at 0x0 to unit id 46 (Alchemist)
shareCode.boardUnitIDs[0][0] = 46;

const resultingShareCode = shareCode.toBase64String();
// -> 8qAMAAP4BAK4BAATjJ/5uAEZuAAAuEVMBCThtAG0AAAsAAAD/AABtAAEJGwj/AAkBFwEBAA4BBQEBBAYAASEcbQAAbUBHOlcBEmoBAAFIJCAgAAAAAQMgABABKTACICAAMAAABgIBIAAAARoAdRHaAHQRCQEBBGMABXIsEAACAAEEAwZ3JwB3Lh8ArgEA
```

For all available fields, visit the API Docs of the [current share code](https://thomask33.github.io/node-underlords/classes/sharecodev8.html).

For unit and items ids, visit the [Fortify Repo](https://github.com/Fortify-Labs/Fortify/tree/master/services/shared/src/assets).

## Docs & Community

- [API Docs](https://thomask33.github.io/node-underlords/)
- [Discord Server](https://discord.gg/u9qJxzQ) (I'm Grey#1214)

## Contributing

[Contributing Guide](https://github.com/ThomasK33/node-underlords/blob/master/CONTRIBUTING.md)

## License

[MIT](https://github.com/ThomasK33/node-underlords/blob/master/LICENSE)

## Disclaimer

This project is not affiliated with Valve Corporation.
Dota Underlords, Dota and Steam are registered trademarks of Valve Corporation.
