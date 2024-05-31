import { exec } from 'node:child_process'
import fs from 'node:fs'
import { buildIndex } from './data'
import { Flow } from './lib/flow'
import logger from './lib/logger'

// The events are the custom events that you define in the flow.on() method.
const events = ['search'] as const
type Events = (typeof events)[number]

const flow = new Flow<Events>()

const indexData: { name: string, path: string }[] = JSON.parse(fs.readFileSync('./index.json', 'utf-8') || '[]')

const buildIndexCommand = {
  Title: 'Build Index',
  Subtitle: '',
  JsonRPCAction: {
    method: 'search',
    parameters: ['buildIndex', true],
    dontHideAfterAction: false,
  },
  ContextData: [],
  IcoPath: `assets\\app.png`,
  Score: 0,
}

flow.on('query', (params = []) => {
  const [query] = params as string[]

  let result = []
  if (!query) {
    result = [buildIndexCommand]
  }
  else {
    result = indexData
      .filter(item => new RegExp(`${query}`, 'i').test(item.path))
      .map((item: any) => {
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
      })
    // logger.info(result.map(f=> f.Title.slice(0,5)).join(','))
  }

  console.log(JSON.stringify({ result }))
})

flow.on('search', (params) => {
  logger.info('Search', { path: process.env.PATH })
  const [prjPath] = params

  if (prjPath === 'buildIndex') {
    buildIndex()
  }
  else if (prjPath) {
    exec(`code ${prjPath}`, { env: { ...process.env } })
  }
})

flow.run()
