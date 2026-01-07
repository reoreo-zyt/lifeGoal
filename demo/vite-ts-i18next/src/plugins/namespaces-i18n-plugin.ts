import fs from "fs";
import path from "path";
import { normalizePath, type Plugin as VitePlugin } from "vite";
import "#plugins/utils-plugins";
import {
  isFileInsideDir,
  namespaceMap,
  objectSwap,
} from "#plugins/utils-plugins";
import { toCamelCase } from "#utils/strings";

const namespaceMapSwap = objectSwap(namespaceMap);

/**
 * 递归遍历一个目录中的 json 文件，并返回它们的名称，格式为驼峰式大小写。
 * 此外，如果文件位于目录中，则返回 dir/fileName 格式
 * @param dir - 要遍历的目录
 */
function getNameSpaces(dir: string): string[] {
  const namespace: string[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(file, filePath, namespace);
    } else if (path.extname(file) === ".json") {
      processJsonFile(file, namespace);
    }
  }

  return namespace;
}

function processDirectory(file: string, filePath: string, namespace: string[]) {
  const subnamespace = getNameSpaces(filePath);
  for (const subNameSpace of subnamespace) {
    let ns = subNameSpace;
    if (namespaceMapSwap[file.replace(".json", "")]) {
      ns = namespaceMapSwap[file.replace(".json", "")];
    } else if (
      toCamelCase(file).replace(".json", "").startsWith("mysteryEncounters")
    ) {
      ns = subNameSpace.replace(/Dialogue$/, "");
    }
    // 对文件夹中的命名空间使用 directory/namespace 格式
    namespace.push(`${toCamelCase(file).replace(".json", "")}/${ns}`);
  }
}

function processJsonFile(file: string, namespace: string[]) {
  let ns = toCamelCase(file).replace(".json", "");
  if (namespaceMapSwap[file.replace(".json", "")]) {
    ns = namespaceMapSwap[file.replace(".json", "")];
  }
  namespace.push(ns);
}

export function LocaleNamespace(): VitePlugin {
  const nsRelativePath = "./locales";
  const nsEn = nsRelativePath + "/en"; // 默认命名空间
  let namespaces = getNameSpaces(nsEn);
  const nsAbsolutePath = path.resolve(process.cwd(), nsRelativePath);

  return {
    name: "namespaces-i18next",
    buildStart() {
      if (process.env.NODE_ENV === "production") {
        console.log("Collect namespaces");
      }
    },
    configureServer(server) {
      const restartHandler = async (file: string, action: string) => {
        /*
         * 如果 nsLocation 中的任何JSON文件被创建/修改。
         * 刷新页面以更新 i18next 的命名空间
         */
        if (isFileInsideDir(file, nsAbsolutePath) && file.endsWith(".json")) {
          const timestamp = new Date().toLocaleTimeString();
          const filePath =
            nsRelativePath.replace(/^\.\/(?=.*)/, "") +
            normalizePath(file.replace(nsAbsolutePath, ""));
          console.info(
            `${timestamp} \x1b[36m\x1b[1m[ns-plugin]\x1b[0m reloading page, \x1b[32m${filePath}\x1b[0m ${action}...`
          );

          namespaces = getNameSpaces(nsEn);
          server.moduleGraph.invalidateAll();
          server.ws.send({
            type: "full-reload",
          });
        }
      };

      server.watcher
        .on("change", (file) => restartHandler(file, "updated"))
        .on("add", (file) => restartHandler(file, "added"))
        .on("unlink", (file) => restartHandler(file, "removed"));
    },
    transform: {
      handler(code, id) {
        if (id.endsWith("i18n.ts")) {
          return code.replace(
            "const nsEn = [];",
            `const nsEn = ${JSON.stringify(namespaces)};`
          );
        }
        return code;
      },
    },
  };
}
