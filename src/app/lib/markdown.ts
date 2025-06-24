import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export async function getMarkdown(fileName: string, fileDir: string = '.') {
  const fileFetch = await fetch(`${fileDir}/${fileName}`)
  const fileStr = await fileFetch.text()

  // parse leading metadata with gray-matter
  const matterMeta = matter(fileStr)

  // compile md to document object DOM
  const fileDom = await remark().use(remarkHtml).process(matterMeta.content)
  // format DOM as html
  const fileHtml = fileDom.toString()

  return {
    fileHtml,
    fileMeta: matterMeta.data
  }
}