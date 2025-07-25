import { LocaleCtx } from '@component/context'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import getStrings, { StringsNamespace } from '@lib/strings'
import { WidgetExport } from '@lib/widget/const'
import { generateRandomWidget } from '@lib/widget/random'
import { RefObject, useContext } from 'react'
import { LightningFill } from 'react-bootstrap-icons'

export default function WidgetReplaceRandom(
  { game, widget, deviceId }: {
    game: RefObject<Game> | StaticRef<Game>
    widget: WidgetExport
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.WidgetReplaceRandom)

  function randomReplaceWidget() {
    const width = game.current.config.widgets.get(widget.id)?.width
    const widgetIds = [...game.current.config.widgets.keys()]
    const widgetIdx = widgetIds.indexOf(widget.id)

    game.current.deleteWidget(widget.id)
    generateRandomWidget(game, deviceId, widgetIdx, width, locale)
  }

  return (
    <button type='button'
      className={
        'cursor-pointer hover:scale-105 text-4xl '
      }
      title={s('title')}
      onClick={randomReplaceWidget} >
      <LightningFill />
    </button>
  )
}