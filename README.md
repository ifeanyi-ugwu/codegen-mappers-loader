# Codegen Mapper Loader

A TypeScript utility that creates mappings between GraphQL types and TypeScript implementations for GraphQL Code Generator.

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

### In your `.mappers.ts` files

Create files with the `.mappers.ts` extension and export your mappers:

```typescript
// user.mappers.ts
export { IUserDocument as UserMapper } from "./models";
```

This exports `IUserDocument` under the name `UserMapper`. The `loadMappers` function will create a mapping between the `User` GraphQL type and the `UserMapper` implementation.

## How It Works

The `loadMappers` function scans a specified directory (current working directory by default) for `.mappers.ts` files. It looks for:

1. **Interfaces**, **type aliases**, or **class declarations** with names ending in `Mapper`.
2. **Named exports** with names ending in `Mapper`.

For each found mapper, it creates an entry in the `mappers` object. The key is the name without the `Mapper` suffix, and the value is the relative path to the file and the exported name. This generated mapper object can be directly used in your GraphQL Code Generator configuration.

---

## Options

The `loadMappers` function accepts two parameters:

### 1. `outputDir` (string)

This is the directory where the GraphQL Code Generator outputs the generated files, such as the resolver type definitions. The paths in the `mappers` object will be relative to this directory.

For example:

- If `outputDir` is `"src/types"`, the generated mappers will look like `"./user.mappers#UserMapper"`, assuming `user.mappers.ts` is in the same directory as the output file.
- If the `.mappers.ts` file is located in `"src/models"`, the path in the `mappers` object will correctly adjust to `"../models/user.mappers#UserMapper"`.

### 2. `options` (optional)

An object with the following properties:

| Option                | Type     | Default                               | Description                                                                           |
| --------------------- | -------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `currentDir`          | string   | `process.cwd()`                       | Directory to start scanning for `.mappers.ts` files.                                  |
| `ignoreList`          | string[] | `[".git", ".vscode", "node_modules"]` | Directories to ignore during the scan.                                                |
| `removeExtension`     | boolean  | `true`                                | Whether to remove the `.ts` extension from file paths in the `mappers` object.        |
| `mapperFilesPattern`  | RegExp   | `/\.mappers\.ts$/`                    | Pattern to match mapper files.                                                        |
| `mapperSuffixPattern` | RegExp   | `/Mapper$/`                           | Pattern to identify valid mapper names in interfaces, type aliases, or named exports. |

---

## Example Usage with Options

```typescript
import { loadMappers } from "codegen-mappers-loader";

const outputDir = "src/types"; // Directory where Codegen outputs files
const options = {
  currentDir: "src/models", // Start scanning in src/models
  ignoreList: [".git", ".vscode", "node_modules", "tests"], // Ignore these directories
  removeExtension: false, // Keep the .ts extension in generated paths
};

const mappers = loadMappers(outputDir, options);
```

### How Paths Are Resolved

Suppose you have the following directory structure:

```plaintext
src/
├── types/
│   ├── resolvers-types.generated.ts
│   └── user.mappers.ts
├── models/
│   ├── order.mappers.ts
│   └── product.mappers.ts
```

- If `outputDir` is `"src/types"`, the generated mappers will look like:
  - `User: "./user.mappers#UserMapper"`
  - `Order: "../models/order.mappers#OrderMapper"`
  - `Product: "../models/product.mappers#ProductMapper"`

If `removeExtension` is set to `false`, the paths will retain the `.ts` extension:

- `User: "./user.mappers.ts#UserMapper"`

---

## How It Handles `.mappers.ts` Files

1. For **interfaces, type aliases, or classes**:

   ```typescript
   // order.mappers.ts
   export interface OrderMapper { ... }
   ```

   The mapper key will be `Order`, and the value will include the relative path and the export name:

   ```json
   { "Order": "./order.mappers#OrderMapper" }
   ```

2. For **named exports**:

   ```typescript
   // product.mappers.ts
   export { IProductDocument as ProductMapper } from "./models";
   ```

   The mapper key will be `Product`, and the value will reflect the export:

   ```json
   { "Product": "./product.mappers#ProductMapper" }
   ```

---

## License

MIT License - see the [LICENSE](LICENSE) file for details.
