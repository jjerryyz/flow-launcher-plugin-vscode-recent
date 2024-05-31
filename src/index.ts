import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { buildIndex, getIndexData, getVscodeCache } from './data'
import { Flow } from './lib/flow'
import logger from './lib/logger'

// The events are the custom events that you define in the flow.on() method.
const events = ['search'] as const
type Events = (typeof events)[number]

const flow = new Flow<Events>()

const vscodeCache = getVscodeCache()

const indexData = getIndexData()

const buildIndexCommand = {
  Title: '✨Build Index',
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

function getResult(query: string) {
  let collection: string[] = []
  if (!query) {
    collection = vscodeCache.slice(0, 5)
  }
  else {
    collection = Array.from(new Set([...indexData, ...vscodeCache]))
    // logger.info(result.map(f=> f.Title.slice(0,5)).join(','))
  }

  return collection
    // .filter(item => new RegExp(`${query}`, 'i').test(item))
    .map((p) => {
      const f = path.resolve(p)
      return {
        name: path.basename(f),
        path: f,
      }
    })
}

flow.on('query', (params = []) => {
  const [query] = params as string[]

  if (query === 'bi') {
    console.log(JSON.stringify({ result: [buildIndexCommand] }))
    return
  }

  const result = getResult(query)
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
