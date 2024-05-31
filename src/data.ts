import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import fg from 'fast-glob'

export function buildIndex() {
  const projects = fg.sync('d:/Workspace/**/*', { onlyDirectories: true, deep: 1, ignore: ['node_modules', '.git', 'dist'] }).map(p => path.resolve(p))

  const userStoragePath = path.join(process.env.APPDATA!, '/Code/User/globalStorage/storage.json')

  const userStorage = JSON.parse(fs.readFileSync(userStoragePath, 'utf-8'))

  const vscodeCache = Object.keys(userStorage.profileAssociations.workspaces)
    .filter(f => f.startsWith('file://'))
    .map(url.fileURLToPath)
    .filter(p => fs.existsSync(p))

  const uniques = Array.from(new Set([...projects, ...vscodeCache]))
    .map((f) => {
      return {
        name: path.basename(f),
        path: f,
      }
    }).reverse()

  fs.writeFileSync('./index.json', JSON.stringify(uniques), 'utf-8')
}
