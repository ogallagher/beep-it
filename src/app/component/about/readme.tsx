import { use } from 'react'

export default function Readme(
  { fileHtmlPromise }: {
    fileHtmlPromise: Promise<{ fileHtml: string }>
  }
) {
  const { fileHtml } = use(fileHtmlPromise)

  return (
    <div id='readme' dangerouslySetInnerHTML={{ __html: fileHtml }}/>
  )
}