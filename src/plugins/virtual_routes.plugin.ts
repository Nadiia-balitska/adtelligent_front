import fs from "node:fs";
import path from "node:path";

function toRoutePath(absFile: string, pagesDir: string) {
	let p = absFile.replace(pagesDir, "").replace(/\\/g, "/");
	p = p.replace(/\.(t|j)sx?$/, "");
	p = p.replace(/\/index$/i, "");
	p = p.replace(/\[(.+?)\]/g, ":$1");
	if (p === "") p = "/";
	if (!p.startsWith("/")) p = `/${p}`;
	return p;
}

function walk(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	const out: string[] = [];
	for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
		const fp = path.join(dir, d.name);
		if (d.isDirectory()) out.push(...walk(fp));
		else if (/\.(t|j)sx?$/.test(d.name) && !/\.d\.ts$/.test(d.name))
			out.push(fp);
	}
	return out;
}

export default function virtualRoutes() {
	const VIRTUAL_ID = "virtual:routes";
	return {
		name: "virtual-routes",
		resolveId(id: string) {
			return id === VIRTUAL_ID ? VIRTUAL_ID : null;
		},
		load(id: string) {
			if (id !== VIRTUAL_ID) return null;

			const pagesDir = path.resolve(process.cwd(), "src/pages");
			if (!fs.existsSync(pagesDir)) {
				return `export const routes = [];`;
			}

			const files = walk(pagesDir);
			const records = files.map((abs) => {
				const rel = `../pages${abs.replace(pagesDir, "").replace(/\\/g, "/")}`;
				const routePath = toRoutePath(abs, pagesDir);
				return `{ path: ${JSON.stringify(routePath)}, loader: () => import(${JSON.stringify(rel)}) }`;
			});

			return `
        export const routes = [${records.join(",")}];
      `;
		},
	};
}
