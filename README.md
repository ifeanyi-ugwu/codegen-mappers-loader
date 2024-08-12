# Codegen Mapper Loader

A TypeScript utility for loading and mapping code generation mappers from TypeScript files.

## Overview

This script scans a directory for TypeScript files that match the `.mappers.ts` pattern. It extracts and maps interfaces, type aliases, and class declarations with names ending in `Mapper` for use in code generation.

## Installation

```bash
git clone https://github.com/yourusername/codegen-mapper-loader.git
```

## Usage

To use the loadMappers function:

```typescript
import { loadMappers } from "codegen-mappers-loader";

// Define output directory and options
const outputDir = "path/to/output/dir";

//optional
const options = {
  currentDir: "path/to/current/dir",
  ignoreList: [".git", ".vscode"],
  removeExtension: true,
};

// Load mappers
const mappers = loadMappers(outputDir, options);
console.log(mappers);
```

## Options

- currentDir (string): The directory to start scanning. Defaults to the current working directory.
- ignoreList (string[]): List of directories to ignore. (Default is [".git", ".vscode", "node_modules"]"
- removeExtension (boolean): Whether to remove the .ts extension from file paths. Defaults to true.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
