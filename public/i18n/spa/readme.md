# Beep It

<img alt="logo beep it" src="doc/icon0.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 6em;" />

Beep It inicia con un concepto básico- haber un conjunto de controles en un tablero/consola que el jugador tiene que hacer en orden y acelerando- y lo lleva al siguiente nivel. En particular, maneja **varios dispositivos/pantallas** por juego, y es altamente **configurable**.

<br style="clear: right;" />

# Unirse a un juego

Al visitar el sitio, cada dispositivo/navegador cliente es asignado una `id` de juego/partida y `deviceId` de dispositivo. Estos están visibles en la consulta de la dirección web.

`https://` `subd.domain.tld` `?` id=**g1** `&` deviceId=**alcachofa**

Si sale del sitio y vuelve relativamente pronto (consulte [game delete delay]) con la misma `id` de juego, su configuración debe de restaurarse.
Para invitar a otros dispositivos jugadores, toque el botón **compartir** a copiar el enlace. Omite `deviceId`.

# Tipo de teclado en dispositivo local

La página intenta determinar automáticamente si el dispositivo local tiene un teclado físico, y actualizar el botón correspondiente en la barra de config del juego. Podemos manualmente actualizar tipo de teclado usando el mismo botón.

<img alt="teclado físico" src="doc/game-controls_device-feature_keyboard.png" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Usar teclado físico.

<br style="clear: right;" />

<img alt="teclado pantalla táctil" src="doc/game-controls_device-feature_keytouch.png" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Usar teclado de pantalla táctil.

<br style="clear: right" />

# Gestionar dispositivos

<img alt="gestor de dispositivos" src="doc/game-controls_devices.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Siguiente en la barra de config de juego es el número de dispositivos. Al lado está un botón para abrir el gestor de dispositivos, donde uno puede quitar/expulsar dispositivos jugadores del juego, incluyéndose a uno mismo.

Las ids de dispositivo están en la primera columna, luego áliases, luego botones de quitar.

<img alt="boton reconectar" src="doc/game-controls_rejoin.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

Cuando su dispositivo se quita o pierde conexión, el butón de reconectar/enchufe aparece cerca el final de la barra de config de juego.
Púlselo para volver a unirse/conectarse.

<br style="clear: left" />

# Configurar el juego

## Número de jugadores

Siguiente en la barra de config de juego es el número de jugadoes. Está separado de la lista de dispositivos porque la cantidad de gente jugando puede ser independiente de la de los dispositivos que usamos. Actualmente solo se usa para el modo de turno **competitivo**.

## Fijar modo de tablero

<img alt="modo tablero = espejo" src="doc/game-controls_mirror.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

El modo de tablero controla si cada una de los dispositivos clientes ve los mismos controles (**espejo**),

<br style="clear: right;" />

<img alt="modo tablero = extensión" src="doc/game-controls_extend.jpeg" style="display: block; float: right; clear: right; padding-left: 1em; padding-bottom: 1em;" />

o controles diferentes (**extensión**). En modo extensión, los controles se distribuyen uniformemente entre las varias pantallas.

<br style="clear: right;" />

## Fijar modo de turno

El modo de turno determina si jugadores esperan turnos (competitivo) o no (colaborativo).

Si es **competi**, el número de jugador del turno actual se ve junto al puntaje como numerador, y número de jugadores restantes como el denominador. El número total de comandos y actual de commando por turno son dinámicos, y se indican con una barra de progreso. Puntaje igual se comparte entre jugadores, pero quien sea que terminó la ronda en su turno es eliminado.

## Agregar controles

<img alt="abrir cajón controles" src="doc/game-controls_widgets-drawer_open.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Siguiente en la barra de config de juego está el botón para abrir el cajón de controles.

<img alt="cerrar cajón controles" src="doc/game-controls_widgets-drawer_close.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

Púlselo de nuevo para cerrar.

<br style="clear: left" />

Este cajón es una vista de todos los tipos de controles disponibles para agregar al tablero. Consulte [tipos de controles](#readme-widget-types) para ver una descripción de cada uno. Cada tipo de control en el cajón se puede configurar. Toque el ícono del control para agregarlo al tablero (abajo del cajón).
Cada instancia de control aún puede configurarse (con opciones adicionales) luego de su adición al tablero.

<img alt="control aleatorio rápido" src="doc/game-controls_random-widget.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Toque el botón de control aleatorio rápido para agregar un control aleatorio al tablero.

Cada control en el **tablero** tiene tanto un botón para eliminarse (`X`), como también un botón para sustituirse (mismo ícono que el botón de control aleatorio) en la esquina bajo derecha.

<br style="clear: right;" />

### Configurar controles

| attribute | description |
| --- | --- |
| `nombre` | En la cabecera de la tarjeta de control está una caja de texto para nombrar el control. Puede dejarse en blanco. Cuando el juego emite un comando, este `nombre` es el objeto. |
| `color` | Todo control por defecto tiene el primero plano blanco; use el selector de color para cambiarlo. |
| `tamaño` | Si controles están saliendo del rango de vista de la pantalla, use este para reducir el tamaño del ícono. |
| `duración` | Cantidad de tiempo extra dado para que un jugador haga este control. |
| `comando texto` | Cuando el juego emite un comando, `comando` es el verbo. |
| `comando audio` | Grabar audio en el navegador con el botón de micrófono (puede que no funcione en ciertos dispositivos), o subir un archivo de audio. Este audio se sonará al darse el comando correspondiente. |

## Vista previa del tablero

<img alt="vista previa de controles en tablero" src="doc/game-controls_preview-yes.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Para ocultar la mayor parte de configuración de controles en el tablero, toque el botón de vista previa cerca del final de la barra de config de juego.

<img alt="configurar controles en tablero" src="doc/game-controls_preview-no.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

Tóquelo de nuevo para seguir configurando controles.

<br style="clear: left" />

# Reiniciar juego

Si modo de turno es **competitivo**, pulse este botón de reinicio cerca del final de la barra de config de juego para volver a la primera ronda, con el número de jugadores eliminados en cero.

# Arrancar a jugar

Pulse el botón de jugar cerca del final de la barra de config de juego para iniciar la partida.

<img alt="jugar partida" src="doc/game-controls_play.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

El juego emitirá un comando y esperar a que un jugador haga la acción del control correspondiente. Si se hace el control equivocado, o ninguno se hace a tiempo, la partida termina. Si se hace el control correcto, se incrementa la puntuación y emite el próximo comando.

<br style="clear: left" />

<h1 id="readme-widget-types">Tipos de controles</h1>

<img alt="button" src="widgetIcon/button.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Botón**

Acción es clic de ratón o toque, entregada al **pulsar** (no al soltar).

<br style="clear: right" />
<img alt="knob" src="widgetIcon/twist.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Perilla**

Acción es arrastrar en un círculo. Precisamente, el arrastre debe pasar por **3/4** cuadrantes alrededor del centro (tres cuartos de un círculo).

<br style="clear: right" />
<img alt="lever" src="widgetIcon/lever.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Palanca**

Acción es arrastrar en la dirección que corresponde, entregada cuando el arrastre está más largo que **50%** del tamaño(=ancho=alto) del control.

<br style="clear: right" />
<img alt="key" src="widgetIcon/key.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Tecla**

Acción es tocar la tecla correspondiente del teclado si se usa teclado físico (consulte [tipo de teclado](#tipo-de-teclado-en-dispositivo-local)), o pulsar el ícono, tal como un **botón**.

La `tecla` configurable para tocar distingue minúscula de mayúscula de debe de aceptar cualquier letra (todavía diéresis, acentos son la excepción), incluso si el teclado fuente requiere una combinación de teclas.

<br style="clear: right" />
<img alt="wait" src="widgetIcon/wait.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Demora / Espera**

Acción es **no hacer nada**, entregada cuando se cumple la duración de espera. Tocar este control o hacer cualquier otro control antes termina la partida.

<br style="clear: right" />
<img alt="path" src="widgetIcon/path.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Trayecto / Dibujo**

Acción es trazar el singular trayecto conexo, desde cualquier punto extremo.

El configurable `trayecto` para trazar usa [formato `svg.path.d`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d). Defínalo por arrastrar dentro de la zona del gráfico del control. La caja de texto proporciona acceso para manualmente editar los puntos de control. Sus coordenadas se expresan en el espacio fuente del ícono (90x90).

<br style="clear: right" />
<img alt="path" src="doc/widget-icon_keypad.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Teclado / Keypad**

Acción es escribir una frase/combinación de teclas, configurable con `texto`. Tal como **tecla**, el método de ingreso depende del [tipo de teclado](#tipo-de-teclado-en-dispositivo-local).