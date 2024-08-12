# Codegen Mapper Loader

A TypeScript utility for loading and mapping code generation mappers from TypeScript files.

## Overview

This script scans a directory for TypeScript files that match the `.mappers.ts` pattern. It extracts and maps interfaces, type aliases, and class declarations with names ending in `Mapper` for use in code generation.

## Installation

```bash
npm i -D https://github.com/ifeanyi-ugwu/codegen-mappers-loader.git
```

## Usage

In your codegen configuration file:

```typescript
import type { CodegenConfig } from "@graphql-codegen/cli";
import { loadMappers } from "codegen-mappers-loader";

const mappers = loadMappers("src/types");

const config: CodegenConfig = {
  // ... other config options
  generates: {
    "src/types/resolvers-types.generated.ts": {
      config: {
        mappers,
        // ... other config options
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
```

In your .mappers.ts files:
Create files with the .mappers.ts extension and export your mappers:

```typescript
// user.mappers.ts
export { IUserDocument as UserMapper } from "./models";
```

This exports IUserDocument under the name UserMapper, which matches the pattern the loadMappers function is looking for.

## Options

The `loadMappers` function accepts two parameters:

1. `outputDir` (string): The base directory for resolving relative paths in the generated mapper object.

2. `options` (optional): An object with the following properties:
   - `currentDir` (string): The directory to start scanning. Defaults to the current working directory.
   - `ignoreList` (string[]): List of directories to ignore. Default is `[".git", ".vscode", "node_modules"]`.
   - `removeExtension` (boolean): Whether to remove the .ts extension from file paths. Defaults to true.

Example usage with options:

```typescript
import { loadMappers } from "codegen-mappers-loader";

const outputDir = "src/types";
const options = {
  currentDir: "src/models",
  ignoreList: [".git", ".vscode", "node_modules", "tests"],
  removeExtension: false,
};

const mappers = loadMappers(outputDir, options);
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.
