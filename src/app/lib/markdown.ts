import matter from 'gray-matter'
import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'

export async function getMarkdown(fileName: string, fileDir: string = '.') {
  const fileFetch = await fetch(`${fileDir}/${fileName}`)
  const fileStr = await fileFetch.text()

  // parse leading metadata with gray-matter
  const matterMeta = matter(fileStr)

  // compile md to document object DOM
  const fileDom = (
    await remark()
    // default parser
    .use(remarkParse)
    // github flavor extensions (ex. tables)
    .use(remarkGfm)
    // to html
    .use(remarkRehype, {allowDangerousHtml: true})
    // with embedded html
    .use(rehypeRaw)
    // to string
    .use(rehypeStringify)
    .process(matterMeta.content)
  )
  // format DOM as html
  const fileHtml = fileDom.toString()

  return {
    fileHtml,
    fileMeta: matterMeta.data
  }
}