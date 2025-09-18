import fs from "fs";
import path from "path";

function virtualModules() {
	return {
		name: "virtual-modules",

		resolveId(id: string) {
			if (id === "virtual:plugins") {
				return id;
			}
			return null;
		},

		load(id: string) {
			if (id === "virtual:plugins") {
				const modulesDir = path.resolve(process.cwd(), "src/modules");
				const files = fs.readdirSync(modulesDir);

				const imports = files
					.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
					.map((f) => `import "../modules/${f}";`);

				return imports.join("\n");
			}
			return null;
		},
	};
}

export default virtualModules;
