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
	});

const fuse = new Fuse(projectList, {
	keys: ['name']
});


flow.on("query", (params = []) => {

	const [query] = params as string[];

	if (!query) {
		return flow.showInputHint();
	}

	const result = fuse.search(query).map(({ item }) => {
		return {
			Title: item.name,
			Subtitle: '',
			JsonRPCAction: {
				method: 'search',
				parameters: [item.path],
				dontHideAfterAction: false,
			},
			ContextData: [],
			IcoPath: 'assets\\app.png',
			Score: 0,
		};
	});

	return console.log(JSON.stringify({ result }));

});

flow.on("search", (params) => {
	logger.info('Search', params)
	const [prjPath] = params

	if (prjPath) {
		exec(`code ${prjPath}`)
	}

});

flow.run();
