import fs from 'fs';
import path from 'path';
import { Flow } from "./lib/flow";
import logger from "./lib/logger";
import url from 'url'
import { exec } from 'child_process';
import Fuse from 'fuse.js';

// The events are the custom events that you define in the flow.on() method.
const events = ["search"] as const;
type Events = (typeof events)[number];

const flow = new Flow<Events>();

const userStoragePath = path.resolve("C:/Users/jerry/AppData/Roaming/Code/User/globalStorage/storage.json")

const userStorage = JSON.parse(fs.readFileSync(userStoragePath, 'utf-8'))

const projectList = Object.keys(userStorage.profileAssociations.workspaces)
	.filter(f => {
		if (!f.startsWith('file://')) return false;
		if (fs.existsSync(url.fileURLToPath(f))) {
			return true;
		}
	})
	.map(f => {
		const _path = url.fileURLToPath(f)
		return {
			name: path.basename(_path),
			path: _path
		}
	}).reverse();

const fuse = new Fuse(projectList, {
	keys: ['name']
});

const map2Item = (item: any) => {
	return {
		Title: item.name,
		Subtitle: item.path,
		JsonRPCAction: {
			method: 'search',
			parameters: [item.path, true],
			dontHideAfterAction: false,
		},
		ContextData: [],
		IcoPath: 'assets\\app.png',
		Score: 0,
	}
}

flow.on("query", (params = []) => {

	const [query] = params as string[];

	if (!query) {
		if (projectList.length > 0) {
			console.log(JSON.stringify({ result: projectList.slice(0, 5).map(map2Item) }))
		} else {
			return flow.showInputHint();
		}
	} else {
		const result = fuse.search(query).map(({ item }) => map2Item(item));

		logger.info(result.map(f=> f.Title.slice(0,5)).join(','))

		console.log(JSON.stringify({ result }));
	}
});

flow.on("search", (params) => {
	logger.info('Search', { path: process.env.PATH })
	const [prjPath] = params

	if (prjPath) {
		exec(`code ${prjPath}`, { env: { ...process.env } })
	}

});

flow.run();
