import fs from 'fs';
import path from 'path';
import { Flow } from "./lib/flow";
import logger from "./lib/logger";
import url from 'url'
import { exec } from 'child_process';

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


flow.on("query", (params = []) => {

	const [query] = params as string[];

	let results: typeof projectList = []


	if (!query) {
		return flow.showInputHint();
	}

	try {
		results = projectList.filter(f => {
			if (f.name.toLowerCase().includes(query.toLowerCase())) {
				return true
			}
		})
	} catch (error) {
	}

	const result = results.map(r => {
		return {
			Title: r.name,
			Subtitle: '',
			JsonRPCAction: {
				method: 'search',
				parameters: [r.path],
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
