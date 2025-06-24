'use client'

import { Github, QuestionCircle } from 'react-bootstrap-icons'
import { About } from '@component/about/about'
import { useState } from 'react'

export default function Header(
  { githubUrl }: {
    githubUrl: string
  }
) {
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <>
      <header className='border-b'>
        <nav className='mx-auto flex items-center justify-between p-6'>
          <div className='flex'>
            <a href={githubUrl}>
              <Github/>
            </a>
          </div>
          
          <div className='flex'>
            <button 
              title='Help'
              type='button' onClick={() => {
                setAboutOpen(!aboutOpen)
              }} >
                <QuestionCircle className='hover:scale-105'/>
            </button>
          </div>
        </nav>
      </header>

      <About open={aboutOpen} setOpen={setAboutOpen}/>
    </>
  )
}
