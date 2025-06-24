'use client'

import { use } from 'react'

export default function Readme(
  { fileHtmlPromise }: {
    fileHtmlPromise: Promise<{ fileHtml: string }>
  }
) {
  const { fileHtml } = use(fileHtmlPromise)

  return (
    <div dangerouslySetInnerHTML={{ __html: fileHtml }}/>
  )
}