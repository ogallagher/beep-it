# Beep It

<img alt="logo beep it" src="doc/icon0.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 6em;" />

Beep It inicia con un concepto básico- haber un conjunto de controles en un tablero/consola que el jugador tiene que hacer en orden y acelerando- y lo lleva al siguiente nivel. En particular, maneja **varios dispositivos/pantallas** por juego, y es muy **configurable**.

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

Siguiente en la barra de config de juego es el número de jugadoes. Está separado de la lista de dispositivos porque la cantidad de gente jugando puede ser independiente de la de los dispositivos que usamos. Beep It aún no usa el número de jugadores.

## Fijar modo de tablero

<img alt="modo tablero = espejo" src="doc/game-controls_mirror.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

El modo de tablero controla si cada una de los dispositivos clientes ve los mismos controles (**espejo**),

<br style="clear: right;" />

<img alt="modo tablero = extensión" src="doc/game-controls_extend.jpeg" style="display: block; float: right; clear: right; padding-left: 1em; padding-bottom: 1em;" />

o controles diferentes (**extensión**). En modo extensión, los controles se distribuyen uniformemente entre las varias pantallas.

<br style="clear: right;" />

## Fijar modo de turno

El modo de turno determina si jugadores esperan turnos (competitivo; aún no funciona) o no (colaborativo).

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
| `label` |  |
| `color` |  |
| `size` |  |
| `duration` |  |
| `command text` |  |
| `command audio` |  |

## Vista previa del tablero

<img alt="vista previa de controles en tablero" src="doc/game-controls_preview-yes.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

...

<img alt="configurar controles en tablero" src="doc/game-controls_preview-no.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

...

<br style="clear: left" />

# Arrancar a jugar

...

<img alt="jugar partida" src="doc/game-controls_play.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

...

<br style="clear: left" />

<h1 id="readme-widget-types">Tipos de controles</h1>

<img alt="button" src="public/widgetIcon/button.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Botón**

...

<br style="clear: right" />
<img alt="knob" src="public/widgetIcon/twist.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Perilla**

...

<br style="clear: right" />
<img alt="lever" src="public/widgetIcon/lever.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Palanca**

...

<br style="clear: right" />
<img alt="key" src="public/widgetIcon/key.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Tecla**

...

<br style="clear: right" />
<img alt="wait" src="public/widgetIcon/wait.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Demora / Espera**

...

<br style="clear: right" />
<img alt="path" src="public/widgetIcon/path.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Trayecto / Dibujo**

...

<br style="clear: right" />
<img alt="path" src="doc/widget-icon_keypad.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Teclado / Keypad**

...