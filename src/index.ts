import * as fs from "fs";
import * as path from "path";
import ts from "typescript";

interface LoadMappersOptions {
  currentDir?: string;
  ignoreList?: string[];
  removeExtension?: boolean;
  mapperFilesPattern?: RegExp;
  mapperSuffixPattern?: RegExp;
}

interface Mappers {
  [key: string]: string;
}

const defaultOptions: Required<LoadMappersOptions> = {
  currentDir: process.cwd(),
  ignoreList: [".git", ".vscode", "node_modules"],
  removeExtension: true,
  mapperFilesPattern: /\.mappers\.ts$/,
  mapperSuffixPattern: /Mapper$/,
};

export function loadMappers(
  outputDir: string,
  options?: LoadMappersOptions
): Mappers {
  const {
    currentDir,
    ignoreList,
    removeExtension,
    mapperFilesPattern,
    mapperSuffixPattern,
  } = {
    ...defaultOptions,
    ...options,
  };

  let mappers: Mappers = {};
  const files = fs.readdirSync(currentDir);

  files.forEach((file) => {
    const filePath = path.join(currentDir, file);
    let fileRelativePath = path
      .relative(outputDir, filePath)
      .replace(/\\/g, "/");
    //.replace(/\.ts$/, ""); // Remove the .ts extension

    // Optionally remove .ts extension based on configuration
    fileRelativePath = removeExtension
      ? fileRelativePath.replace(/\.ts$/, "")
      : fileRelativePath;

    const stats = fs.statSync(filePath);
    if (stats.isDirectory() && !ignoreList.includes(path.basename(filePath))) {
      // Recursively scan directories, excluding those in ignoreList
      mappers = {
        ...mappers,
        ...loadMappers(outputDir, {
          currentDir: filePath,
          ignoreList,
          removeExtension,
          mapperFilesPattern,
          mapperSuffixPattern,
        }),
      };
    } else if (stats.isFile() && mapperFilesPattern.test(file)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      const sourceFile = ts.createSourceFile(
        filePath,
        fileContents,
        ts.ScriptTarget.Latest,
        true
      );

      ts.forEachChild(sourceFile, (node) => {
        if (
          (ts.isInterfaceDeclaration(node) ||
            ts.isTypeAliasDeclaration(node) ||
            ts.isClassDeclaration(node)) &&
          node.name &&
          mapperSuffixPattern.test(node.name.text)
        ) {
          const modelName = node.name.text.replace(mapperSuffixPattern, "");
          mappers[modelName] = `./${fileRelativePath}#${node.name.text}`;
        } else if (
          ts.isExportDeclaration(node) &&
          node.exportClause &&
          ts.isNamedExports(node.exportClause)
        ) {
          node.exportClause.elements.forEach((element) => {
            const exportName = element.name.text;
            if (mapperSuffixPattern.test(exportName)) {
              const modelName = exportName.replace(mapperSuffixPattern, "");
              mappers[modelName] = `./${fileRelativePath}#${exportName}`;
            }
          });
        }
      });
    }
  });

  return mappers;
}
