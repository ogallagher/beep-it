import { Plugin } from 'react-bootstrap-icons'

export default function RejoinGame(

) {
  return (
    <div
      className={
        'flex flex-col justify-center '
      } >
      <button
        className='cursor-pointer hover:scale-105'
        type='button' onClick={
          // TODO rejoin
          undefined
        }
        title='Rejoin game' >
        <Plugin />
      </button>
    </div>
  )
}