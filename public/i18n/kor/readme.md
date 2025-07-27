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
| `명함` | 입력장치 패 상단에 이름을 정할 문자입력이 있다. 비어 있어도 된다. 게임이 명령을 낼 때, 이 `명함`은 객체다. |
| `색깔` | 입력장치들 다 기본값으로 하얀색인 전경이라, 색깔 입력이 전경을 바꾼다. |
| `크기` | 입력장치 기기 화면 밖으로 빠져나가면 이 입력이 아이콘을 축소한다. |
| `기간` | 선수가 이 입력하기 위한 추가의 기간. |
| `명령 문자` | 게임 명령 낼 때, 이건 동사다. |
| `명령 녹음` | 브라우서 속 마이크 단추로 녹음 (어떤 기기에서 무효) 하거나 녹음 파일을 올린다. 해당 명령할 때 이 오디오는 재생할 거다. |

## 보드 미리보기

<img alt="보드 미리보기" src="doc/game-controls_preview-yes.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

대부분의 입력장치 설정 항목을 숨기려면, 게임 설정 막대기 끝머리 쯤의 미리보기 버튼은 누르세요.

<img alt="보드 설정하기" src="doc/game-controls_preview-no.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

입력장치 설정하기 재개하려면, 다시 누르세요.

<br style="clear: left" />

# 경기 시작

경기 시작하려면 게임 설정 막대기 끝머리 쯤의 **경기 시작** 버튼을 누르세요.

<img alt="경기 시작" src="doc/game-controls_play.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

그다음 게임이 명령을 발표하고서 어느 참가 기기가 해당 입력하기를 기다릴 거다. 입력이 잘못이거나, 아무 입력도 기한 전 안 하면, 경기 끝나다. 맞은 입력하면, 득점이고 다음 명령이 발표된다.  

<br style="clear: left" />

<h1 id="readme-widget-types">입력장치 종류</h1>

<img alt="단추" src="public/widgetIcon/button.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**단추 / 버튼**

입력은 마우스 클릭이나 누르기며, 제출이 **누르기** (놔두기 않은) 할 때 된다.

<br style="clear: right" />
<img alt="손잡이" src="public/widgetIcon/twist.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**손잡이**

입력은 동그라미로 끌기이다. 정확히 말하자면, 끌 동선이 중앙 둘레 사분역 **3/4** (원형 4분의 3) 으로 통과해야 된다.

<br style="clear: right" />
<img alt="지렛대" src="public/widgetIcon/lever.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**지렛대**

입력은 해당 방향으로 끌기이며, 제출은 끌 동선 길이가 아이콘 크기(=너비=높이)의 **50%** 이상 넘어설 때 된다.

설정 가능한 `방향`은 그쪽으로 당겨야 될 기본방향 네 중 하나다.
값은 다음 중 하나: `U`(위쪽) `D`(아래쪽) `L`(왼쪽) `R`(오른쪽).

<br style="clear: right" />
<img alt="키" src="public/widgetIcon/key.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**키**

입력은 물질적 자판 이용하면 ([기기 자판 종류](#기기-자판-종유) 참고) 해당 자판 키를 치기거나, **단추**처럼 아이콘을 누르기다.

설정 가능한 `키`는 대문자/소문자 구분하고, 아무 쓰일 수 있는 글자 (한글은 아직 예외), 복수의 근원 키 필요해도, 유효일 거다.

<br style="clear: right" />
<img alt="정지" src="public/widgetIcon/wait.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**정지**

입력은 **없다**. 제출은 대기 기간 만료할 때 된다. 이전 아무 입력이나 하면 경기 마무리된다.

<br style="clear: right" />
<img alt="동선" src="public/widgetIcon/path.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**동선 / 그림**

입력은 단수의 이어진 동선을 따라, 아무 종점부터, 덧그림이다.

설정 가능한 덧그려야겠단 `동선`은 [`svg.path.d` 포맷](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d)이다. 입력장치 아이콘 구역에서 끌어당김으로 동선을 정한다. 문자입력은 수동으로 구성 요소 점 수정 가능하게 한다. 좌표는 아이콘 보임창 공간에 속한다 (90x90).

<br style="clear: right" />
<img alt="자판" src="doc/widget-icon_keypad.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**자판 / 키패드**

입력은 `문자`로 설정 가능한 키 배열/어구를 치기이다. **키**처럼 임력 방식이 [기기 자판 종류](#기기-자판-종유)에 의한다.