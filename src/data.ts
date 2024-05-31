import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import fg from 'fast-glob'

export function getVscodeCache() {
  const userStoragePath = path.join(process.env.APPDATA!, '/Code/User/globalStorage/storage.json')

  const userStorage = JSON.parse(fs.readFileSync(userStoragePath, 'utf-8'))

  return Object.keys(userStorage.profileAssociations.workspaces)
    .filter(f => f.startsWith('file://'))
    .map(url.fileURLToPath)
    .filter(p => fs.existsSync(p))
    .reverse() // 取最近的
}

export function buildIndex() {
  const projects = fg.sync('d:/Workspace/**/*', { onlyDirectories: true, deep: 2, ignore: ['node_modules', '.git', 'dist'] }).map(item => path.resolve(item))

  fs.writeFileSync('./index.json', JSON.stringify(projects), 'utf-8')
  console.log(projects)
}

export function getIndexData() {
  return JSON.parse(fs.readFileSync('./index.json', 'utf-8') || '[]')
}

// buildIndex()
