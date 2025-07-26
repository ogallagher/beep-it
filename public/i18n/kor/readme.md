# 삐기

<img alt="삐기 아이콘" src="doc/icon0.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 6em;" />

핵심으로 기본 개념 (선수들이 점점 가속하게 정확한 순서로 해야 될 입력장치 세트가 보드 위 배치된다는)에서 **삐기**는 더 이상 단계에 이른다. 구체적으로는 **복수의 기기**가 같은 경기를 할 수 있고, **게임 설정**이 많이 수정할 수 있다.

<br style="clear: right;" />

_이 번역을 개선해주시려면 github에서 pull request로 제안하시면 도움이 되겠다._

# 게임 접속

웹사이트를 방문할 때 고객 기기/브라우저마다 각각 게임 `id`와 `deviceId`를 배정받다. 이들이 웹주소 조회에 보인다.

`https://` `subd.domain.tld` `?` `id=`**g1** `&` `deviceId=`**가지**

사이트를 떠났다가 얼마 안 된 후에 같은 게임 `id` 가지고 돌아오면 ([game delete delay] 참고), 같은 설정 값이 회복될 것이다.
또한 다른 선수 기기를 초대하려면, 게임 링크를 복사하러 공유 단추를 누르세요. 링크가 `deviceId`를 제외한다.

# 기기 자판 종유

웹페이지가 자동으로 이 기기가 물질적인 자판을 가지는지 감지하려고 나서 게임 설정 막대기의 해당하는 버튼에 반영시킬 거다. 이용자가 같은 이 버튼으로 수동으로 자판 종류를 바꿀 수 있기도 한다. 

<img alt="물질적 자판" src="doc/game-controls_device-feature_keyboard.png" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

물질적 자판 이용.

<br style="clear: right;" />

<img alt="터치스크린 자판" src="doc/game-controls_device-feature_keytouch.png" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

터치스크린 자판 이용.

<br style="clear: right" />

# 기기 관리

<img alt="기기 관리소" src="doc/game-controls_devices.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

게임 설정 막대기 중 다음은 기기 개수다. 이 곁에 있는 기기 관리소로는 게임에서 참가 기기를, 자기 기기도 포함하며, 뺄 수 있다.

첫째 열은 기기 ID(식별자)이고, 둘째는 수정 가능한 일명이고, 셋째는 제거 단추다.

<img alt="재접속 단추" src="doc/game-controls_rejoin.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

자기 기기가 제거되거나 연결 끊길 경우, 게임 설정 막대기 끝머리 쯤에 재접속 단추가 나타난다.
다시 연결/접속하려면 이 단추를 누르세요.

<br style="clear: left" />

# 게임 설정

## 선수 인원 설정

게임 설정 막대기 중 다음은 선수 인원이다. 선수 몇 명이 참가하는지와 기기 몇 대가 사용되는지는 독립적이라서 선수 인원이 기기 목록에서 분리된다. **삐기**는 아직 선수 인원을 참작하지 않는다.

## 보드 모드 설정

<img alt="보드 모드 = 복제" src="doc/game-controls_mirror.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

보드 모드는 참가 기기 모두가 같은 입력장치를 보든지 (**복제**)

<br style="clear: right;" />

<img alt="보드 모드 = 확장" src="doc/game-controls_extend.jpeg" style="display: block; float: right; clear: right; padding-left: 1em; padding-bottom: 1em;" />

다른 입력장치를 보든지 (**확장**)을 수정한다. **확장** 모드는 입력장치가 다른 기기의 화면 중에 고르게 분배된다.

<br style="clear: right;" />

## 차례 모드 설정

차례 모드는 선수가 각각의 차례를 기다리든지 (**경쟁**; 아직 적용되지 못하는) 무두 언제나 동시에 행동하든지 (**공동**)를 수정한다.

## 입력장치 추가

<img alt="입력장치 서랍 열기" src="doc/game-controls_widgets-drawer_open.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

게임 설정 막대기 중 다음은 입력장치 서랍 버튼이니 누르면 입력장치 서랍이 열린다.

<img alt="입력장치 서랍 닫기" src="doc/game-controls_widgets-drawer_close.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

다시 누르면 닫힌다.

<br style="clear: left" />

이 서랍은 입력장치의 모든 종류가 보드에 추가하기 위해 제공된다. 종류 설명을 다 보려면 [입력장치 종류](#readme-widget-types)를 참고하세요. 서랍에 있는 입력장치 종류마다는 설정이 가능한다. 보드 (서랍 아래)에 추가하려면 입력장치 아이콘을 누르세요.
입력장치 사례마다 보드에 덧붙인 후 아직도 설정 (추가의 옵션 포함하며) 바꿀 수 있다.

<img alt="손쉬운 임의 입력장치" src="doc/game-controls_random-widget.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

빨리 임의 입력장치를 보드에 추가하려면 손쉬운/임의 입력장치 버튼을 누르세요.

보드에 있는 입력장치는 각각 제거 (`X`) 단추가 있고, 임의 대체 단추가 (손쉬운 임의 입력장치 아이콘과 같은) 있다, 아래 오른쪽 구석에.

<br style="clear: right" />

### 입력장치 설정

| 속성 | 설명 |
| --- | --- |
| `명함` | ... |
| `색깔` |  |
| `크기` |  |
| `기간` |  |
| `명령 문자` |  |
| `명령 녹음` |  |

## 보드 미리보기

<img alt="보드 미리보기" src="doc/game-controls_preview-yes.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

...

<img alt="보드 설정하기" src="doc/game-controls_preview-no.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

...

<br style="clear: left" />

# 경기 시작

...

<img alt="경기 시작" src="doc/game-controls_play.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

...

<br style="clear: left" />

<h1 id="readme-widget-types">입력장치 종류</h1>

<img alt="단추" src="public/widgetIcon/button.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**단추 / 버튼**

...

<br style="clear: right" />
<img alt="손잡이" src="public/widgetIcon/twist.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**손잡이**

...

<br style="clear: right" />
<img alt="지렛대" src="public/widgetIcon/lever.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**지렛대**

...

<br style="clear: right" />
<img alt="키" src="public/widgetIcon/key.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**키**

...

<br style="clear: right" />
<img alt="정지" src="public/widgetIcon/wait.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**정지**

...

<br style="clear: right" />
<img alt="동선" src="public/widgetIcon/path.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**동선 / 그림**

...

<br style="clear: right" />
<img alt="자판" src="doc/widget-icon_keypad.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**자판 / 키패드**

...