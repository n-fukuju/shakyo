import { FC, MouseEvent, useState } from 'react';
import Link from 'next/link';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import plantUmlEncoder from 'plantuml-encoder'

import LayoutComponent from '../components/LayoutComponent';
import { MenuHead } from '../modules/Commentary';

const urlbase = "http://www.plantuml.com/plantuml/img/";

// /** ツリービュー項目 */
// interface TextHead {
//     /** 見出しID */
//     id: string;
//     /** 見出しテキスト */
//     label: string;
//     /** 詳細メニュー */
//     children: Text[];
// }
// /** ツリービュー詳細項目 */
// interface Text {
//     /** 詳細ID */
//     id: string;
//     /** 詳細テキスト */
//     label: string;
//     /** 詳細コンテンツ */
//     content: string;
//     /** サンプルUMLコード */
//     sample: string;
//     /** 例題コレクション */
//     questions: string[];
// }
// String.raw() を使用することで、改行文字（\n）をそのまま出力する。
const texts: MenuHead[] = [
    {
        label: "シーケンス図", id: "1", children: [
            {
                id: "1", label: "基本的な例",
                content: String.raw`
                シーケンス '->' を、2つの分類子間のメッセージを描画するために使います。分類子を、明示的に宣言する必要はありません。
                点線の矢印を使う場合は、'-->' とします。
                また、 '<-' や、 '<--' を使うこともできます。これらによって図の見た目が変わることはありませんが、可読性を高めることができます。
                ただし、以上の方法はシーケンス図だけに当てはまります。ほかの種類の図には当てはまりません。`,
                sample: String.raw`
                @startuml
                Alice -> Bob: Authentication Request
                Bob --> Alice: Authentication Response
                
                Alice -> Bob: Another authentication Request
                Alice <-- Bob: another authentication Response
                @enduml`,
                questions: ['A->B:send()']
            },
            {
                id: "2", label: "分類子の宣言",
                content: String.raw`
                キーワードparticipantを使って分類詞を宣言すると、分類子の表示を調整することができます。
                宣言した順序が、デフォルトの表示順になります。
                分類子の宣言に別のキーワードを使用すると、分類子の形を変えることができます。`,
                sample: String.raw`
                @startuml
                participant participant as Foo
                actor       actor       as Foo1
                boundary    boundary    as Foo2
                control     control     as Foo3
                entity      entity      as Foo4
                database    database    as Foo5
                collections collections as Foo6
                queue       queue       as Foo7
                Foo -> Foo1 : To actor 
                Foo -> Foo2 : To boundary
                Foo -> Foo3 : To control
                Foo -> Foo4 : To entity
                Foo -> Foo5 : To database
                Foo -> Foo6 : To collections
                Foo -> Foo7: To queue
                @enduml`,
                questions: ['participant p']
            },
            {
                id: "3", label: "別名",
                content: String.raw`
                キーワード as を使って、分類子の名前を変更することができます。
                アクターや分類子の背景色を、HTML コードや色名を使って変更することもできます。`,
                sample: String.raw`
                @startuml
                actor Bob #red
                ' The only difference between actor
                'and participant is the drawing
                participant Alice
                participant "I have a really\nlong name" as L #99FF99
                /' You can also declare:
                participant L as "I have a really\nlong name"  #99FF99
                '/

                Alice->Bob: Authentication Request
                Bob->Alice: Authentication Response
                Bob->L: Log transaction
                @enduml`, 
                questions: [] 
            },
            {
                id:"4", label: "分類子のorder",
                content: String.raw`order キーワードを使って、分類子が表示される順序を変更することもできます。`,
                sample: String.raw`
                @startuml
                participant Last order 30
                participant Middle order 20
                participant First order 10
                @enduml`,
                questions: []
            },
            {
                id:"5", label: "別名2",
                content: String.raw`分類子を定義するときに引用符を使用することができます。そして、分類子にエイリアスを与えるためにキーワード as を使用することができます。`,
                sample: String.raw`
                @startuml
                Alice -> "Bob()" : Hello
                "Bob()" -> "This is very\nlong" as Long
                ' You can also declare:
                ' "Bob()" -> Long as "This is very\nlong"
                Long --> "Bob()" : ok
                @enduml`,
                questions: []
            },
            {
                id:"6", label: "自分自身へのメッセージ",
                content: String.raw`
                分類子は自分自身へメッセージを送信できます。
                \n を使用して、複数行のテキストを扱えます。`,
                sample: String.raw`
                @startuml
                Alice->Alice: This is a signal to self.\nIt also demonstrates\nmultiline \ntext
                @enduml`,
                questions: []
            },
            {
                id:"7", label: "Text alignment",
                content: String.raw`
                skinparam responseMessageBelowArrow trueコマンドを使うことで、応答メッセージの矢印の下に文字を配置することができます。`,
                sample: String.raw`
                @startuml
                skinparam responseMessageBelowArrow true
                Bob -> Alice : hello
                Alice -> Bob : ok
                @enduml`,
                questions: []
            },
            {
                id:"8", label: "矢印の見た目",
                content: String.raw`
                矢印の見た目をいくつかの方法によって変更できます。
                ・メッセージの消失を示す最後の x を追加
                ・\ や / を < や > の代わりに使うと
                ・矢印の先端が上側だけまたは下側だけになります。
                ・矢印の先端を繰り返す (たとえば >> や //) と、矢印の先端が細くなります。
                ・-- を - の代わりに使うと、矢印が点線になります。
                ・矢じりに最後の "O" を追加
                ・双方向の矢印を使用する`,
                sample: String.raw`
                @startuml
                Bob ->x Alice
                Bob -> Alice
                Bob ->> Alice
                Bob -\ Alice
                Bob \\- Alice
                Bob //-- Alice

                Bob ->o Alice
                Bob o\\-- Alice

                Bob <-> Alice
                Bob <->o Alice
                @enduml`, 
                questions: []
            },
            {
                id:"9", label: "矢印の色",
                content: String.raw`以下の表記を使って、個々の矢印の色を変えることができます。`,
                sample: String.raw`
                @startuml
                Bob -[#red]> Alice : hello
                Alice -[#0000FF]->Bob : ok
                @enduml`,
                questions: []
            },
            {
                id:"10", label: "シーケンスの番号付け",
                content: String.raw`
                メッセージへ自動で番号を振るために、キーワード autonumber を使います。
                autonumber //開始// で開始番号を、また、autonumber //開始// //増分// で増分も指定することができます。`,
                sample: String.raw`
                @startuml
                autonumber
                Bob -> Alice : Authentication Request
                Bob <- Alice : Authentication Response

                autonumber 15
                Bob -> Alice : Another authentication Request
                Bob <- Alice : Another authentication Response

                autonumber 40 10
                Bob -> Alice : Yet another authentication Request
                Bob <- Alice : Yet another authentication Response

                @enduml`,
                questions: []
            },
            {
                id: "11", label: "シーケンスの番号付け2",
                content: String.raw`
                二重引用符で囲って番号の書式を指定することができます。
                その書式指定は Java の DecimalFormat 方式で行う（0 は桁を表し, # は存在しない場合は 0 で埋める桁を意味する）。
                HTMLタグを書式に使うこともできます。
                autonumber stop と autonumber resume //増分// //書式// を自動採番の一時停止と再開にそれぞれを使用することができます。`,
                sample: String.raw`
                autonumber "<b>[000]"
                Bob -> Alice : Authentication Request
                Bob <- Alice : Authentication Response

                autonumber 15 "<b>(<u>##</u>)"
                Bob -> Alice : Another authentication Request
                Bob <- Alice : Another authentication Response

                autonumber 40 10 "<font color=red><b>Message 0  "
                Bob -> Alice : Yet another authentication Request
                Bob <- Alice : Yet another authentication Response
                
                autonumber stop
                Bob -> Alice : dummy

                autonumber resume "<font color=red><b>Message 0  "
                Bob -> Alice : Yet another authentication Request
                Bob <- Alice : Yet another authentication Response

                autonumber stop
                Bob -> Alice : dummy

                autonumber resume 1 "<font color=blue><b>Message 0  "
                Bob -> Alice : Yet another authentication Request
                Bob <- Alice : Yet another authentication Response`,
                questions: []
            },
            {
                id: "12", label: "タイトル",
                content: String.raw`
                titleキーワードはページにタイトルをつけるのに使われます。
                headerやfooterを使うことにより、ページにヘッダーやフッターをつけて表示することができます。`,
                sample: String.raw`
                @startuml

                header Page Header
                footer Page %page% of %lastpage%

                title Example Title

                Alice -> Bob : message 1
                Alice -> Bob : message 2

                @enduml`,
                questions: []
            },
            {
                id: "13", label: "図の分割",
                content: String.raw`
                図を複数の画像に分けるためにキーワード newpage を使います。
                新しいページのタイトルをキーワード newpage の直後に書くことができます。
                これは、複数ページにわたる長い図を書くときに便利な機能です。`,
                sample: String.raw`
                @startuml

                Alice -> Bob : message 1
                Alice -> Bob : message 2

                newpage

                Alice -> Bob : message 3
                Alice -> Bob : message 4

                newpage A title for the\nlast page

                Alice -> Bob : message 5
                Alice -> Bob : message 6
                @enduml`,
                questions: []
            },
            {
                id: "14", label: "メッセージのグループ化",
                content: String.raw`
                次のキーワードを使えば、メッセージをまとめてグループ化できます。
                alt/else
                opt
                loop
                par
                break
                critical
                group表示するテキスト
                ヘッダ部分に文字列を追加することが可能です。(groupについては、後述の「groupの2つ目のラベル」を参照)
                グループを閉じるにはキーワード end を使用します。
                注：グループはネスト可能です。`,
                sample: String.raw`
                @startuml
                Alice -> Bob: Authentication Request

                alt successful case

                    Bob -> Alice: Authentication Accepted

                else some kind of failure

                    Bob -> Alice: Authentication Failure
                    group My own label
                    Alice -> Log : Log attack start
                        loop 1000 times
                            Alice -> Bob: DNS Attack
                        end
                    Alice -> Log : Log attack end
                    end

                else Another type of failure

                Bob -> Alice: Please repeat

                end
                @enduml`,
                questions: []
            },
            {
                id: "15", label: "groupの2つ目のラベル",
                content: String.raw`groupでは、[と]の間に2つ目のラベルを設定し、ヘッダに表示させることができます。`,
                sample: String.raw`
                @startuml
                Alice -> Bob: Authentication Request
                Bob -> Alice: Authentication Failure
                group My own label [My own label 2]
                    Alice -> Log : Log attack start
                    loop 1000 times
                        Alice -> Bob: DNS Attack
                    end
                    Alice -> Log : Log attack end
                end
                @enduml`,
                questions: []
            },
            {
                id: "16", label: "ノート",
                content: String.raw`
                メッセージのすぐ後ろにキーワード note left または note right を使用し、メッセージにノートを付けることが可能です。
                end note キーワードを使って、複数行のノートを作ることができます。`,
                sample: String.raw`
                @startuml
                Alice->Bob : hello
                note left: this is a first note

                Bob->Alice : ok
                note right: this is another note

                Bob->Bob : I am thinking
                note left
                a note
                can also be defined
                on several lines
                end note
                @enduml`,
                questions: []
            },
            {
                id: "17", label: "その他のノート",
                content: String.raw`
                note left of、note right of、note overのキーワードを使って、分類子からの相対位置を指定してノートを配置することもできます。
                ノートを目立たせるために、背景色を変えることができます。
                また、キーワード end note を使って複数行のノートを作ることができます。`,
                sample: String.raw`
                @startuml
                participant Alice
                participant Bob
                note left of Alice #aqua
                This is displayed
                left of Alice.
                end note

                note right of Alice: This is displayed right of Alice.

                note over Alice: This is displayed over Alice.

                note over Alice, Bob #FFAAAA: This is displayed\n over Bob and Alice.

                note over Bob, Alice
                This is yet another
                example of
                a long note.
                end note
                @enduml`,
                questions: []
            },
            {
                id: "18", label: "ノートの形",
                content: String.raw`
                キーワード hnote と rnote を使ってノートの形を変更できます。
                ・hnoteで六角形のノートになります
                ・rnoteで四角形のノートになります`,
                sample: String.raw`
                @startuml
                caller -> server : conReq
                hnote over caller : idle
                caller <- server : conConf
                rnote over server
                "r" as rectangle
                "h" as hexagon
                endrnote
                rnote over server
                this is
                on several
                lines
                endrnote
                hnote over caller
                this is
                on several
                lines
                endhnote
                @enduml`,
                questions: []
            },
            {
                id: "19", label: "すべての分類子にまたがるノート",
                content: String.raw`
                次の構文で、すべての分類子にまたがるノートを直接作ることができます：
                ・note across: ノートの記述`,
                sample: String.raw`
                @startuml
                Alice->Bob:m1
                Bob->Charlie:m2
                note over Alice, Charlie: Old method for note over all part. with:\n ""note over //FirstPart, LastPart//"".
                note across: New method with:\n""note across""
                Bob->Alice
                hnote across:Note across all part.
                @enduml`,
                questions: []
            },
            {
                id: "20", label: "複数のノートを同じレベルに並べる",
                content: String.raw`
                /を使って、複数のノートを同じレベルに並べることができます：
                /を使わない場合（デフォルトでは、ノートは整列されません）`,
                sample: String.raw`
                @startuml
                note over Alice : initial state of Alice
                note over Bob : initial state of Bob
                Bob -> Alice : hello

                note over Alice : initial state of Alice
                / note over Bob : initial state of Bob
                Bob -> Alice : hello
                @enduml`,
                questions: []
            },
            {
                id: "21", label: "CreoleとHTML",
                content: String.raw`PlantUML では creole フォーマットを使うこともできます。`,
                sample: String.raw`
                @startuml
                participant Alice
                participant "The **Famous** Bob" as Bob

                Alice -> Bob : hello --there--
                ... Some ~~long delay~~ ...
                Bob -> Alice : ok
                note left
                This is **bold**
                This is //italics//
                This is ""monospaced""
                This is --stroked--
                This is __underlined__
                This is ~~waved~~
                end note

                Alice -> Bob : A //well formatted// message
                note right of Alice
                This is <back:cadetblue><size:18>displayed</size></back>
                __left of__ Alice.
                end note
                note left of Bob
                <u:red>This</u> is <color #118888>displayed</color>
                **<color purple>left of</color> <s:red>Alice</strike> Bob**.
                end note
                note over Alice, Bob
                <w:#FF33FF>This is hosted</w> by <img sourceforge.jpg>
                end note
                @enduml`,
                questions: []
            },
            {
                id: "22", label: "境界線（区切り線）",
                content: String.raw`== を使って、図を論理的なステップに分けることも出来ます。`,
                sample: String.raw`
                @startuml

                == Initialization ==

                Alice -> Bob: Authentication Request
                Bob --> Alice: Authentication Response

                == Repetition ==

                Alice -> Bob: Another authentication Request
                Alice <-- Bob: another authentication Response

                @enduml`,
                questions: []
            },
            {
                id: "23", label: "リファレンス",
                content: String.raw`キーワード ref over を使用して、図中にリファレンスを挿入できます。`,
                sample: String.raw`
                @startuml
                participant Alice
                actor Bob

                ref over Alice, Bob : init

                Alice -> Bob : hello

                ref over Bob
                This can be on
                several lines
                end ref
                @enduml`,
                questions: []
            },
            {
                id: "24", label: "遅延",
                content: String.raw`処理の遅延を表すために ... が使えます。また、作成した遅延にコメントを付けることもできます。`,
                sample: String.raw`
                @startuml

                Alice -> Bob: Authentication Request
                ...
                Bob --> Alice: Authentication Response
                ...5 minutes later...
                Bob --> Alice: Good Bye !

                @enduml`,
                questions: []
            },
            {
                id: "25", label: "テキストの折り返し",
                content: String.raw`
                \nを使って改行することで、長いメッセージを折り返すことができます。
                また、maxMessageSizeを設定するという方法もあります。`,
                sample: String.raw`
                @startuml
                skinparam maxMessageSize 50
                participant a
                participant b
                a -> b :this\nis\nmanually\ndone
                a -> b :this is a very long message on several words
                @enduml`,
                questions: []
            },
            {
                id: "26", label: "間隔",
                content: String.raw`
                図の間隔を調整するために、記号|||を使用することができます。
                さらにピクセル数を指定することもできます。`,
                sample: String.raw`
                @startuml

                Alice -> Bob: message 1
                Bob --> Alice: ok
                |||
                Alice -> Bob: message 2
                Bob --> Alice: ok
                ||45||
                Alice -> Bob: message 3
                Bob --> Alice: ok

                @enduml`,
                questions: []
            },
            {
                id: "27", label: "ライフラインの活性化と破棄",
                content: String.raw`
                activate と deactivate を使って分類子の活性化を表します。
                分類子の活性化はライフラインで表されます。
                activate と deactivate は直前のメッセージに適用されます。
                destroy は分類子のライフラインが終わったことを表します。`,
                sample: String.raw`
                @startuml
                participant User

                User -> A: DoWork
                activate A

                A -> B: << createRequest >>
                activate B

                B -> C: DoWork
                activate C
                C --> B: WorkDone
                destroy C

                B --> A: RequestCreated
                deactivate B

                A -> User: Done
                deactivate A

                @enduml`,
                questions: []
            },
            {
                id: "28", label: "ライフラインのネスト、色",
                content: String.raw`ライフラインはネスト(入れ子に)することができ、色をつけることもできます。`,
                sample: String.raw`
                @startuml
                participant User

                User -> A: DoWork
                activate A #FFBBBB

                A -> A: Internal call
                activate A #DarkSalmon

                A -> B: << createRequest >>
                activate B

                B --> A: RequestCreated
                deactivate B
                deactivate A
                A -> User: Done
                deactivate A

                @enduml`,
                questions: []
            },
            {
                id: "29", label: "ライフラインの自動的な活性化",
                content: String.raw`自動的に活性化(autoactivate)することもできます。この場合はreturnキーワードを使用します。`,
                sample: String.raw`
                @startuml
                autoactivate on
                alice -> bob : hello
                bob -> bob : self call
                bill -> bob #005500 : hello from thread 2
                bob -> george ** : create
                return done in thread 2
                return rc
                bob -> george !! : delete
                return success

                @enduml`,
                questions: []
            },
            {
                id: "30", label: "Return",
                content: String.raw`
                returnは、リターンメッセージを生成し、オプションでテキストラベルをつけることができます。 リターンする先は最も最近活性化したライフラインです。 構文は単純にreturn ラベルです。ラベルを与える場合には、通常のメッセージに与えることが可能な文字列を何でも与えることができます。`,
                sample: String.raw`
                @startuml
                Bob -> Alice : hello
                activate Alice
                Alice -> Alice : some action
                return bye
                @enduml`,
                questions: []
            },
            {
                id: "31", label: "分類子の生成",
                content: String.raw`キーワード create を、オブジェクトが最初のメッセージを受信する直前に置くことにより、このメッセージがオブジェクトを新しく 生成 していることを強調して表現できます。`,
                sample: String.raw`
                @startuml
                Bob -> Alice : hello

                create Other
                Alice -> Other : new

                create control String
                Alice -> String
                note right : You can also put notes!

                Alice --> Bob : ok

                @enduml`,
                questions: []
            },
            {
                id: "32", label: "活性化、非活性化、生成のショートカット",
                content: String.raw`
                対象の分類子を記述した直後に、次の記法を使うことができます。
                ・++ 対象を活性化する (続けて#colorのように色を記述することもできます)
                ・-- 起点側を非活性化する
                ・** 対象のインスタンスを生成する
                ・!! 対象のインスタンスを破棄する`,
                sample: String.raw`
                @startuml
                alice -> bob ++ : hello
                bob -> bob ++ : self call
                bob -> bib ++  #005500 : hello
                bob -> george ** : create
                return done
                return rc
                bob -> george !! : delete
                return success
                @enduml`,
                questions: []
            },
            {
                id: "33", label: "インとアウトのメッセージ",
                content: String.raw`
                図の一部だけにフォーカスを当てたい場合には、「外から入ってくる」または「外に出ていく」メッセージを使えます。
                左角括弧 "[" を使って図の左端、 右角括弧 "]" を使って図の右側を表せます。`,
                sample: String.raw`
                @startuml
                [-> A: DoWork

                activate A

                A -> A: Internal call
                activate A

                A ->] : << createRequest >>

                A<--] : RequestCreated
                deactivate A
                [<- A: Done
                deactivate A
                @enduml`,
                questions: []
            },
            {
                id: "34", label: "インとアウトのメッセージ2",
                content: String.raw``,
                sample: String.raw`
                @startuml
                participant Alice
                participant Bob #lightblue
                Alice -> Bob
                Bob -> Carol
                ...
                [-> Bob
                [o-> Bob
                [o->o Bob
                [x-> Bob
                ...
                [<- Bob
                [x<- Bob
                ...
                Bob ->]
                Bob ->o]
                Bob o->o]
                Bob ->x]
                ...
                Bob <-]
                Bob x<-]

                @enduml`,
                questions: []
            },
            {
                id: "35", label: "インとアウトのメッセージ3",
                content: String.raw`?で短い矢印を使用することができます。`,
                sample: String.raw`
                @startuml
                ?-> Alice    : ""?->""\n**short** to actor1
                [-> Alice    : ""[->""\n**from start** to actor1
                [-> Bob      : ""[->""\n**from start** to actor2
                ?-> Bob      : ""?->""\n**short** to actor2
                Alice ->]    : ""->]""\nfrom actor1 **to end**
                Alice ->?    : ""->?""\n**short** from actor1
                Alice -> Bob : ""->"" \nfrom actor1 to actor2
                @enduml`,
                questions: []
            },
            {
                id: "36", label: "アンカーと持続時間",
                content: String.raw`teozを使用するとダイアグラムにアンカーを追加することができ、それによって持続時間を表現することができます。`,
                sample: String.raw`
                @startuml
                !pragma teoz true

                {start} Alice -> Bob : start doing things during duration
                Bob -> Max : something
                Max -> Bob : something else
                {end} Bob -> Alice : finish

                {start} <-> {end} : some time

                @enduml`,
                questions: []
            },
            {
                id: "37", label: "ステレオタイプとスポット",
                content: String.raw`
                << と >> を使い分類子にステレオタイプをつけることができます。
                (X,color) と記述することによりステレオタイプに色付きの文字と円のアイコンをつけることができます。`,
                sample: String.raw`
                @startuml

                participant "Famous Bob" as Bob << Generated >>
                participant Alice << (C,#ADD1B2) Testable >>

                Bob->Alice: First message

                @enduml`,
                questions: []
            },
            {
                id: "38", label: "ステレオタイプ2",
                content: String.raw`デフォルトでは guillemet キャラクターがステレオタイプを表示するために使用されます。 スキンパラメータ guillemet を使用してこの動作を変更することができます：`,
                sample: String.raw`
                @startuml

                skinparam guillemet false
                participant "Famous Bob" as Bob << Generated >>
                participant Alice << (C,#ADD1B2) Testable >>

                Bob->Alice: First message


                participant Bob << (C,#ADD1B2) >>
                participant Alice << (C,#ADD1B2) >>

                Bob->Alice: First message

                @enduml`,
                questions: []
            },
            {
                id: "39", label: "タイトルについての詳細",
                content: String.raw`タイトルには creole フォーマットが使用できます。`,
                sample: String.raw`
                @startuml

                title __Simple__ **communication** example

                Alice -> Bob: Authentication Request
                Bob -> Alice: Authentication Response

                @enduml`,
                questions: []
            },
            {
                id: "40", label: "タイトルについての詳細2",
                content: String.raw`タイトルの記述では \n を使用して新しい行を追加することができます。`,
                sample: String.raw`
                @startuml

                title __Simple__ communication example\non several lines

                Alice -> Bob: Authentication Request
                Bob -> Alice: Authentication Response

                @enduml`,
                questions: []
            },
            {
                id: "41", label: "タイトルについての詳細3",
                content: String.raw`また、キーワード title と end title を使うことにより、タイトルを複数行にわたって記述できます。`,
                sample: String.raw`
                @startuml

                title
                <u>Simple</u> communication example
                on <i>several</i> lines and using <font color=red>html</font>
                This is hosted by <img:sourceforge.jpg>
                end title

                Alice -> Bob: Authentication Request
                Bob -> Alice: Authentication Response

                @enduml`,
                questions: []
            },
            {
                id: "42", label: "分類子の囲み",
                content: String.raw`
                キーワード box と end box を使い、分類子のまわりにボックスを描くことができます。
                タイトルや背景色をキーワード box に続けて任意で追加できます。`,
                sample: String.raw`
                @startuml

                box "Internal Service" #LightBlue
                participant Bob
                participant Alice
                end box
                participant Other

                Bob -> Alice : hello
                Alice -> Other : hello

                @enduml`,
                questions: []
            },
            {
                id: "43", label: "フッターの除去",
                content: String.raw`図からフッターを削除するにはキーワード hide footbox を使います。`,
                sample: String.raw`
                @startuml

                hide footbox
                title Foot Box removed

                Alice -> Bob: Authentication Request
                Bob --> Alice: Authentication Response

                @enduml`,
                questions: []
            },
            {
                id: "44", label: "スキンパラメータ",
                content: String.raw`
                ダイアグラムの色やフォントを変更するには skinparam コマンドを使用します。
                このコマンドは以下の場面で使用できます。
                ・ダイアグラム定義内で他のコマンドを同様に。
                ・インクルードされたファイル内。
                ・設定ファイルのコマンドライン内やANTタスク内。
                次の例のように他のパラメータを変えることもできます。`,
                sample: String.raw`
                @startuml
                skinparam backgroundColor #EEEBDC
                skinparam handwritten true

                skinparam sequence {
                ArrowColor DeepSkyBlue
                ActorBorderColor DeepSkyBlue
                LifeLineBorderColor blue
                LifeLineBackgroundColor #A9DCDF

                ParticipantBorderColor DeepSkyBlue
                ParticipantBackgroundColor DodgerBlue
                ParticipantFontName Impact
                ParticipantFontSize 17
                ParticipantFontColor #A9DCDF

                ActorBackgroundColor aqua
                ActorFontColor DeepSkyBlue
                ActorFontSize 17
                ActorFontName Aapex
                }

                actor User
                participant "First Class" as A
                participant "Second Class" as B
                participant "Last Class" as C

                User -> A: DoWork
                activate A

                A -> B: Create Request
                activate B

                B -> C: DoWork
                activate C
                C --> B: WorkDone
                destroy C

                B --> A: Request Created
                deactivate B

                A --> User: Done
                deactivate A

                @enduml`,
                questions: []
            },
            {
                id: "45", label: "パディングの変更",
                content: String.raw`パディングの設定を変更することができます。`,
                sample: String.raw`
                @startuml
                skinparam ParticipantPadding 20
                skinparam BoxPadding 10

                box "Foo1"
                participant Alice1
                participant Alice2
                end box
                box "Foo2"
                participant Bob1
                participant Bob2
                end box
                Alice1 -> Bob1 : hello
                Alice1 -> Out : out
                @enduml`,
                questions: []
            },
            {
                id: "46", label: "付録：全種類の矢印の例",
                content: String.raw``,
                sample: String.raw`
                @startuml
                participant Alice as a
                participant Bob   as b
                note right of b: 通常の矢印
                a ->     b : ""->   ""
                a ->>    b : ""->>  ""
                a -\     b : ""-\   ""
                a -\\    b : ""-\\\\""
                a -/     b : ""-/   ""
                a -//    b : ""-//  ""
                a ->x    b : ""->x  ""
                a x->    b : ""x->  ""
                a o->    b : ""o->  ""
                a ->o    b : ""->o  ""
                a o->o   b : ""o->o ""
                a <->    b : ""<->  ""
                a o<->o  b : ""o<->o""
                a x<->x  b : ""x<->x""
                a ->>o   b : ""->>o ""
                a -\o    b : ""-\o  ""
                a -\\o   b : ""-\\\\o""
                a -/o    b : ""-/o  ""
                a -//o   b : ""-//o ""
                a x->o   b : ""x->o ""
                note right of b: インのメッセージ
                [->      b : ""[->   ""
                [->>     b : ""[->>  ""
                [-\      b : ""[-\   ""
                [-\\     b : ""[-\\\\""
                [-/      b : ""[-/   ""
                [-//     b : ""[-//  ""
                [->x     b : ""[->x  ""
                [x->     b : ""[x->  ""
                [o->     b : ""[o->  ""
                [->o     b : ""[->o  ""
                [o->o    b : ""[o->o ""
                [<->     b : ""[<->  ""
                [o<->o   b : ""[o<->o""
                [x<->x   b : ""[x<->x""
                [->>o    b : ""[->>o ""
                [-\o     b : ""[-\o  ""
                [-\\o    b : ""[-\\\\o""
                [-/o     b : ""[-/o  ""
                [-//o    b : ""[-//o ""
                [x->o    b : ""[x->o ""
                note right of b: アウトのメッセージ
                a ->]      : ""->]   ""
                a ->>]     : ""->>]  ""
                a -\]      : ""-\]   ""
                a -\\]     : ""-\\\\]""
                a -/]      : ""-/]   ""
                a -//]     : ""-//]  ""
                a ->x]     : ""->x]  ""
                a x->]     : ""x->]  ""
                a o->]     : ""o->]  ""
                a ->o]     : ""->o]  ""
                a o->o]    : ""o->o] ""
                a <->]     : ""<->]  ""
                a o<->o]   : ""o<->o]""
                a x<->x]   : ""x<->x]""
                a ->>o]    : ""->>o] ""
                a -\o]     : ""-\o]  ""
                a -\\o]    : ""-\\\\o]""
                a -/o]     : ""-/o]  ""
                a -//o]    : ""-//o] ""
                a x->o]    : ""x->o] ""
                @enduml`,
                questions: []
            },
            {
                id: "47", label: "付録：全種類の矢印の例2",
                content: String.raw``,
                sample: String.raw`
                @startuml
                participant Alice as a
                participant Bob   as b
                note right of b: 短いイン
                a ->     b : //Long long label//
                ?->      b : ""?->   ""
                ?->>     b : ""?->>  ""
                ?-\      b : ""?-\   ""
                ?-\\     b : ""?-\\\\""
                ?-/      b : ""?-/   ""
                ?-//     b : ""?-//  ""
                ?->x     b : ""?->x  ""
                ?x->     b : ""?x->  ""
                ?o->     b : ""?o->  ""
                ?->o     b : ""?->o  ""
                ?o->o    b : ""?o->o ""
                ?<->     b : ""?<->  ""
                ?o<->o   b : ""?o<->o""
                ?x<->x   b : ""?x<->x""
                ?->>o    b : ""?->>o ""
                ?-\o     b : ""?-\o  ""
                ?-\\o    b : ""?-\\\\o ""
                ?-/o     b : ""?-/o  ""
                ?-//o    b : ""?-//o ""
                ?x->o    b : ""?x->o ""
                note right of b: 短いアウト
                a ->     b : //Long long label//
                a ->?      : ""->?   ""
                a ->>?     : ""->>?  ""
                a -\?      : ""-\?   ""
                a -\\?     : ""-\\\\?""
                a -/?      : ""-/?   ""
                a -//?     : ""-//?  ""
                a ->x?     : ""->x?  ""
                a x->?     : ""x->?  ""
                a o->?     : ""o->?  ""
                a ->o?     : ""->o?  ""
                a o->o?    : ""o->o? ""
                a <->?     : ""<->?  ""
                a o<->o?   : ""o<->o?""
                a x<->x?   : ""x<->x?""
                a ->>o?    : ""->>o? ""
                a -\o?     : ""-\o?  ""
                a -\\o?    : ""-\\\\o?""
                a -/o?     : ""-/o?  ""
                a -//o?    : ""-//o? ""
                a x->o?    : ""x->o? ""
                @enduml`,
                questions: []
            },
            {
                id: "48", label: "特有のskinparam",
                content: String.raw`シーケンス図のライフラインを実線で表示するには、skinparam lifelineStrategy solidを設定します`,
                sample: String.raw`
                @startuml
                skinparam lifelineStrategy solid
                Bob -> Alice : hello
                Alice -> Bob : ok
                @enduml`,
                questions: []
            },
            {
                id: "49", label: "厳密なUMLスタイル",
                content: String.raw`
                厳密なUMLに準拠する（矢印の端を矢じり形ではなく三角形にする等）には、次のようにします：
                ・skinparam style strictuml`,
                sample: String.raw`
                @startuml
                skinparam style strictuml
                Bob -> Alice : hello
                Alice -> Bob : ok
                @enduml`,
                questions: []
            },
            {
                id: "50", label: "未接続の分類子を表示しない",
                content: String.raw`
                デフォルトでは、すべての分類子が表示されます。
                hide unlinkedを指定すると、接続されていない分類子を非表示にできます。`,
                sample: String.raw`
                @startuml
                hide unlinked
                participant Alice
                participant Bob
                participant Carol

                Alice -> Bob : hello
                @enduml`,
                questions: []
            },
            {
                id: "51", label: "グループの色",
                content: String.raw`グループに色付けできます`,
                sample: String.raw`
                @startuml
                Alice -> Bob: Authentication Request
                alt#Gold #LightBlue Successful case
                    Bob -> Alice: Authentication Accepted
                else #Pink Failure
                    Bob -> Alice: Authentication Rejected
                end
                @enduml`,
                questions: []
            },
            {
                id: "52", label: "Mainframe",
                content: String.raw``,
                sample: String.raw`
                @startuml
                mainframe This is a **mainframe**
                Alice->Bob : Hello
                @enduml`,
                questions: []
            },
        ]
    },
    {
        label: "ユースケース図", id: "2", children: [
            {
                id: "1", label: "基本", 
                content: String.raw`
                ユースケースは丸括弧で囲んで使います(丸括弧の対は 楕円に似ているからです)。
                usecase キーワードを使ってユースケースを定義することもできます。 as キーワードを使ってエイリアスを定義することもできます。このエイリアスは あとで、ユースケースの関係を定義するために使います。`,
                sample: String.raw`
                @startuml

                (First usecase)
                (Another usecase) as (UC2)
                usecase UC3
                usecase (Last\nusecase) as UC4

                @enduml`,
                questions: []
            },
            {
                id: "2", label: "アクター",
                content: String.raw`
                アクターは2つのコロンで囲まれます。
                actor キーワードを使ってアクターを定義することもできます。 as キーワードを使ってエイリアスを定義することもできます。このエイリアスはあとで、ユースケースの関係を定義するために使います。
                後から説明しますが、アクターの定義は必須ではありません。`,
                sample: String.raw`
                @startuml

                :First Actor:
                :Another\nactor: as Men2
                actor Men3
                actor :Last actor: as Men4

                @enduml`,
                questions: []
            },
            {
                id: "3", label: "アクターのスタイルを変更する",
                content: String.raw`
                アクターのスタイルを、デフォルトの棒人間以外に変更できます：
                ・skinparam actorStyle awesomeコマンドで、awesome manスタイル
                ・skinparam actorStyle hollow コマンドで、hollow manスタイル`,
                sample: String.raw`
                @startuml
                :default:
                skinparam actorStyle awesome
                :awesome:
                skinparam actorStyle Hollow
                :hollow:
                @enduml`,
                questions: []
            },
            {
                id: "4", label: "ユースケースの説明",
                content: String.raw`
                クオート記号を使うことにより、複数行にわたる説明を記述できます。
                また、次の区切り記号を使用できます：
                ・-- (ダッシュ)
                ・.. (ピリオド)
                ・== (イコール)
                ・__ (アンダースコア)
                これらのペアで囲んで、その間にテキストを記述することで、区切り記号の中にタイトルを記入できます。`,
                sample: String.raw`
                @startuml

                usecase UC1 as "You can use
                several lines to define your usecase.
                You can also use separators.
                --
                Several separators are possible.
                ==
                And you can add titles:
                ..Conclusion..
                This allows large description."

                @enduml`,
                questions: []
            },
            {
                id: "5", label: "パッケージ",
                content: String.raw`
                パッケージを使用して、アクターやユースケースをグループ化できます。
                rectangleを使用するとパッケージの見た目を変更できます。`,
                sample: String.raw`
                @startuml
                left to right direction
                actor Guest as g
                package Professional {
                actor Chef as c
                actor "Food Critic" as fc
                }
                rectangle Restaurant {
                usecase "Eat Food" as UC1
                usecase "Pay for Food" as UC2
                usecase "Drink" as UC3
                usecase "Review" as UC4
                }
                fc --> UC4
                g --> UC1
                g --> UC2
                g --> UC3
                @enduml`,
                questions: []
            },
            {
                id: "6", label: " 簡単な例",
                content: String.raw`
                アクターとユースケースを繋げるには --> 矢印を使います。
                矢印に使うハイフン - の数を増やすと矢印を長くできます。 矢印の定義に : を使うことにより矢印にラベルをつけることができます。
                以下の例では User は定義なしにアクターとして使われています。`,
                sample: String.raw`
                @startuml

                User -> (Start)
                User --> (Use the application) : A small label

                :Main Admin: ---> (Use the application) : This is\nyet another\nlabel

                @enduml`,
                questions: []
            },
            {
                id: "7", label: "継承",
                content: String.raw`もしアクターやユースケースが継承をする場合には、 <|-- 記号を使います。`,
                sample: String.raw`
                @startuml
                :Main Admin: as Admin
                (Use the application) as (Use)

                User <|-- Admin
                (Start) <|-- (Use)

                @enduml`,
                questions: []
            },
            {
                id: "8", label: "ノートの使用方法",
                content: String.raw`
                オブジェクトに関連のあるノートを作成するには note left of 、 note right of 、 note top of 、 note bottom of キーワードを使います。
                または note キーワードを使ってノートを作成し、 .. 記号を使ってオブジェクトに紐づけることができます。`,
                sample: String.raw`
                @startuml
                :Main Admin: as Admin
                (Use the application) as (Use)

                User -> (Start)
                User --> (Use)

                Admin ---> (Use)

                note right of Admin : This is an example.

                note right of (Use)
                A note can also
                be on several lines
                end note

                note "This note is connected\nto several objects." as N2
                (Start) .. N2
                N2 .. (Use)
                @enduml`,
                questions: []
            },
            {
                id: "9", label: "ステレオタイプ",
                content: String.raw`<< と >> を使い、アクターとユースケースを定義中にステレオタイプを追加できます。`,
                sample: String.raw`
                @startuml
                User << Human >>
                :Main Database: as MySql << Application >>
                (Start) << One Shot >>
                (Use the application) as (Use) << Main >>

                User -> (Start)
                User --> (Use)

                MySql --> (Use)

                @enduml`,
                questions: []
            },
            {
                id: "10", label: "矢印の方向を変えるには",
                content: String.raw`
                デフォルトでは、クラス間の線は2個のハイフン -- で表され、縦方向につながります。横方向の線を描くには以下のようにハイフン1つかドット1つを書きます。
                線を反対にすることでも方向を変えることができます。
                矢印の内側に left、 right、 up、 down を書くことによっても線の方向を変えられます。
                例えば、 -down- ではなく -d- など、各方向の頭文字、または頭2文字（ -do- ）だけ使って矢印を短く記述することも出来ます。
                ただし、この機能の使いすぎには注意しましょう。ほとんどの場合、特別なことをしなくても Graphviz がその場にあった表示を選びます。`,
                sample: String.raw`
                @startuml
                :user: --> (Use case 1)
                :user: -> (Use case 2)
                (Use case 3) <.. :user:
                (Use case 4) <- :user:
                :user2: -left-> (dummyLeft)
                :user2: -right-> (dummyRight)
                :user2: -up-> (dummyUp)
                :user2: -down-> (dummyDown)
                @enduml`,
                questions: []
            },
            {
                id: "11", label: "図を分割する",
                content: String.raw`newpage キーワードは、いくつかのページや画像に図を分割します。`,
                sample: String.raw`
                @startuml
                :actor1: --> (Usecase1)
                newpage
                :actor2: --> (Usecase2)
                @enduml`,
                questions: []
            },
            {
                id: "12", label: "左から右に描画する",
                content: String.raw`
                デフォルトの作図方向は top to bottom となっています。
                作図方向を left to right に変更するには left to right direction コマンドを使います。`,
                sample: String.raw`
                @startuml

                left to right direction
                user1 --> (Usecase 1)
                user2 --> (Usecase 2)

                @enduml`,
                questions: []
            },
            {
                id: "13", label: "スキン設定",
                content: String.raw`
                ダイアグラムの色やフォントを変更するには skinparam コマンドを使用します。
                このコマンドは以下の場面で使用できます。
                ダイアグラム定義内で他のコマンドを同様に。
                インクルードされたファイル内。
                設定ファイルのコマンドライン内やANTタスク内。
                個別のステレオタイプ付きアクターやユースケースにそれぞれ色やフォントを定義することができます。`,
                sample: String.raw`
                @startuml
                skinparam handwritten true

                skinparam usecase {
                BackgroundColor DarkSeaGreen
                BorderColor DarkSlateGray

                BackgroundColor<< Main >> YellowGreen
                BorderColor<< Main >> YellowGreen

                ArrowColor Olive
                ActorBorderColor black
                ActorFontName Courier

                ActorBackgroundColor<< Human >> Gold
                }

                User << Human >>
                :Main Database: as MySql << Application >>
                (Start) << One Shot >>
                (Use the application) as (Use) << Main >>

                User -> (Start)
                User --> (Use)

                MySql --> (Use)

                @enduml`,
                questions: []
            },
            {
                id: "14", label: "完全な例",
                content: String.raw``,
                sample: String.raw`
                @startuml
                left to right direction
                skinparam packageStyle rectangle
                actor customer
                actor clerk
                rectangle checkout {
                customer -- (checkout)
                (checkout) .> (payment) : include
                (help) .> (checkout) : extends
                (checkout) -- clerk
                }
                @enduml`,
                questions: []
            },
            {
                id: "15", label: "ビジネスユースケース",
                content: String.raw`/を加えると、ビジネスユースケースを作成できます。`,
                sample: String.raw`
                @startuml

                (First usecase)/
                (Another usecase)/ as (UC2)
                usecase/ UC3
                usecase/ (Last\nusecase) as UC4

                :First Actor:/
                :Another\nactor:/ as Man2
                actor/ Woman3
                actor/ :Last actor: as Person1

                @enduml`,
                questions: []
            },
            {
                id: "15", label: "矢印の色とスタイルを変更する",
                content: String.raw`
                個別の矢印ごとに色とスタイルを変更するには、次の記法を使用します：
                ・#color;line.[bold|dashed|dotted];text:color`,
                sample: String.raw`
                @startuml
                actor foo
                foo --> (bar) : normal
                foo --> (bar1) #line:red;line.bold;text:red  : red bold
                foo --> (bar2) #green;line.dashed;text:green : green dashed 
                foo --> (bar3) #blue;line.dotted;text:blue   : blue dotted
                @enduml`,
                questions: []
            },
            {
                id: "16", label: "要素の色とスタイルを変更する",
                content: String.raw`
                個別の要素ごとに色とスタイルを変更するには、次の記法を使用します：
                ・#[color|back:color];line:color;line.[bold|dashed|dotted];text:color`,
                sample: String.raw`
                @startuml
                actor a
                actor b #pink;line:red;line.bold;text:red
                usecase c #palegreen;line:green;line.dashed;text:green
                usecase d #aliceblue;line:blue;line.dotted;text:blue
                @enduml`,
                questions: []
            },
            {
                id: "", label: "",
                content: String.raw``,
                sample: String.raw``,
                questions: []
            },
        ]
    },
    {
        label: "クラス図 (x)", id: "3", children: []
    },
    {
        label: "オブジェクト図 (x)", id: "4", children: []
    },
    {
        label: "アクティビティ図 (x)", id: "5", children: []
    },
    {
        label: "コンポーネント図", id: "6", children: [
            {
                id: "1", label: "基本",
                content: String.raw`
                コンポーネントは括弧でくくります。
                また、 component キーワードでもコンポーネントを定義できます。 そして、コンポーネントには as キーワードにより別名をつけることができます。 この別名は、後でリレーションを定義するときに使えます。`,
                sample: String.raw`
                @startuml

                [First component]
                [Another component] as Comp2
                component Comp3
                component [Last\ncomponent] as Comp4

                @enduml`,
                questions: []
            },
            {
                id: "2", label: "インタフェース",
                content: String.raw`
                インタフェースは丸括弧 () でシンボルを囲うことで定義できます。 (何故なら見た目が丸いからです。)
                もちろん interface キーワードを使って定義することもできます。 as キーワードでエイリアスを定義できます。 このエイリアスは後で、関係を定義する時に使えます。
                後で説明されますが、インタフェースの定義は省略可能です。`,
                sample: String.raw`
                @startuml

                () "First Interface"
                () "Another interface" as Interf2
                interface Interf3
                interface "Last\ninterface" as Interf4

                [component]
                footer //Adding "component" to force diagram to be a **component diagram**//
                @enduml`,
                questions: []
            },
            {
                id: "3", label: "要素感の関係",
                content: String.raw`要素間の関係は、破線 (..)、直線 (--), 矢印 (-->) の組合せで構成されます。`,
                sample: String.raw`
                @startuml
                
                DataAccess - [First Component]
                [First Component] ..> HTTP : use
                
                @enduml`,
                questions: []
            },
            {
                id: "4", label: "ノート",
                content: String.raw`オブジェクトに関連のあるノートを作成するにはnote left of 、note right of 、note top of 、 note bottom of キーワードを使います。 note left of , note right of , note top of , note bottom of
                または note キーワードを使ってノートを作成し、.. 記号を使ってオブジェクトに紐づけること ができます。`,
                sample: String.raw`
                @startuml
                
                interface "Data Access" as DA
                
                DA - [First Component]
                [First Component] ..> HTTP : use
                
                note left of HTTP : Web Service only
                
                note right of [First Component]
                  A note can also
                  be on several lines
                end note
                
                @enduml`,
                questions: []
            },
            {
                id: "5", label: "グループ化",
                content: String.raw`
                いくつかのキーワードをグループコンポーネントやインタフェースに使用することができます：
                * package
                * node
                * folder
                * frame
                * cloud
                * database`,
                sample: String.raw`
                @startuml

                package "Some Group" {
                HTTP - [First Component]
                [Another Component]
                }

                node "Other Groups" {
                FTP - [Second Component]
                [First Component] --> FTP
                }

                cloud {
                [Example 1]
                }


                database "MySql" {
                folder "This is my folder" {
                    [Folder 3]
                }
                frame "Foo" {
                    [Frame 4]
                }
                }


                [Another Component] --> [Example 1]
                [Example 1] --> [Folder 3]
                [Folder 3] --> [Frame 4]

                @enduml`,
                questions: []
            },
            {
                id: "6", label: "矢印の方向 (x)",
                content: String.raw``,
                sample: String.raw``,
                questions: []
            },
        ]
    },
    {
        label: "配置図 (x)", id: "7", children: []
    },
    {
        label: "状態遷移図（ステートマシン図） (x)", id: "8", children: []
    },
    {
        label: "タイミング図 (x)", id: "9", children: []
    },
];
interface Help{
    head:string;
    text:string;
    ref:any;
}
const helps:Help[] = [
    {head: 'メニュー（1/3）', text: 'メニュー項目を選択して説明を表示します。', ref: null},
    {head: '入力エリア（2/3）', text: '入力エリアにコードを入力後、実行ボタンを押下して結果を得ることができます。', ref: null},
    {head: '出題（3/3）', text: '出題に対する回答を入力後、回答ボタンを押下して結果を得ることができます。', ref: null},
];

const PlantumlComponent: FC = () => {
    const [umltext, setUmltext] = useState(`header OAuth
actor "リソースオーナー" as owner
participant "サードパーティ\\nクライアント" as client
box "個別、または同一サーバ" #LightBlue
participant "認可サーバ" as auth
participant "リソースサーバ" as resource
end box
owner -> client: 操作
activate client
client -> auth: 認証要求
activate auth
auth -> owner: 認証要求
activate owner
owner -> auth: 認証情報入力
deactivate owner
auth -> owner: 認可グラントの要求
activate owner
owner -> auth: 権限委譲を認可
deactivate owner
auth -> client: アクセストークン返却
deactivate auth
client -> resource: リクエスト（アクセストークン）
activate resource
resource -> client: 応答
deactivate resource
client -> owner: 応答
deactivate client`);
    const [umlImage, setUmlImage] = useState<string>('');
    const [expanded, setExpanded] = useState(false);
    const [disableTest, setDisableTest] = useState(false);
    const [takeTest, setTakeTest] = useState(false);
    const [text, setText] = useState<JSX.Element>();
    const [uml, setUml] = useState<JSX.Element>();
    const [diagram, setDiagram] = useState<JSX.Element>();
    const [test, setTest] = useState<JSX.Element>();
    const [question, setQuestion] = useState('');
    const [helpOpen, setHelpOpen] = useState(false);
    const [helpIndex, setHelpIndex] = useState(0);
    const [helpAnchor, setHelpAnchor] = useState(null);
    const [helpHead, setHelpHead] = useState('');
    const [helpText, setHelpText] = useState('');
    const [resultOpen, setResultOpen] = useState(false);
    const [resultTitle, setResultTitle] = useState('Title');
    const [resultContent, setResultContent] = useState('Content');
    // let helpIndex:number=0;
    /** UML生成の実行*/
    const handleExecute = async () => {
        let url = urlbase + plantUmlEncoder.encode(umltext);
        setUmlImage(url);
    };
    /** ツリーアイテムの選択 */
    const handleTreeItemClick = (nodeId: string) => {
        // console.log('nodeId: ', nodeId);
        const nodes = nodeId.split('_');
        if (nodes.length < 2) { return; }

        for (let head of texts) {
            for (let item of head.children) {
                if (head.id == nodes[0] && item.id == nodes[1]) {
                    setText(<>
                        {item.content.split('\n').map( (line, index) => { return (<Typography variant="body2" key={index}>{line}</Typography>) })}
                    </>);
                    setUml(<>
                        {item.sample.split('\n').map( (line, index) => { return (<Typography variant="body2" key={index}>{line}</Typography>) })}
                    </>);
                    if (item.sample !== "") {
                        setDiagram((<img src={urlbase + plantUmlEncoder.encode(item.sample)} />));
                    }else{
                        setDiagram(<></>);
                    }
                    if (item.questions.length > 0) {
                        setQuestion(item.questions[0]);
                        setTest(
                        <>
                            <Typography>出題</Typography>
                            <img src={urlbase + plantUmlEncoder.encode(item.questions[0])}/>
                        </>);
                    }else{
                        setQuestion('');
                        setTest(<></>);
                    }
                    // setDisableTest(prev=>!(takeTest && question !== ''));
                    return;
                }
            }
        }
    }
    /** ヘルプクリック */
    const handleHelp = ()=>{
        // helpIndex=0;
        setHelpIndex(prev=>{
            let value = 0;
            setHelpHead(helps[value].head);
            setHelpText(helps[value].text);
            setHelpAnchor(helps[value].ref);
            setHelpOpen(true);
            return value;
        });
    }
    /** ヘルプを閉じる処理 */
    const handleHelpClose = ()=>{
        setHelpAnchor(null);
        setHelpOpen(false);
    }
    /** 前のヘルプを表示する */
    const handleBackHelp = ()=>{
        setHelpIndex(prev=>{
            let value = (prev > 0) ? prev -1 : helps.length -1;
            setHelpHead(helps[value].head);
            setHelpText(helps[value].text);
            setHelpAnchor(helps[value].ref);
            return value;
        });
    }
    /** 次のヘルプを表示する */
    const handleForwardHelp = ()=>{
        setHelpIndex(prev=>{
            let value = (prev < helps.length -1) ? prev +1 : 0;
            setHelpHead(helps[value].head);
            setHelpText(helps[value].text);
            setHelpAnchor(helps[value].ref);
            return value;
        });
    }
    /** 出題 */
    const handleTakeTest = ()=>{
        setTakeTest(prev=>{
            // setDisableTest(prev=>!(!prev && question !== ''));
            return !prev;
        });
    }
    /** 回答 */
    const handleSubmit = ()=>{
        if(question === ''){return;}
        let code = umltext;
        code = code.replace(/^@startuml/, '');
        code = code.replace(/@enduml$/, '');
        code = code.replace(/ /g, '');
        let q = question.replace(/ /g, '');
        if(code === q){
            setResultTitle('正解');
            setResultContent('正解です！');
        }else{
            setResultTitle('不正解');
            setResultContent('不正解です！');
        }
        setResultOpen(true);
    }
    const handleResultClose = ()=>{
        setResultOpen(false);
    }
    return (
        <LayoutComponent title="PlantUML" page="plantuml" content={<>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    PlantUML (<Link href="https://plantuml.com/ja/">plantuml.com</Link>)
                    <Box display={(!expanded)?'inline':'none'}><IconButton onClick={()=>{setExpanded(true);}}><ExpandMoreIcon/></IconButton></Box>
                    <Box display={(expanded)?'inline':'none'}><IconButton onClick={()=>{setExpanded(false);}}><ExpandLessIcon/></IconButton></Box>
                    {/* ヘルプ */}
                    <Box display={(expanded)?'inline':'none'}><IconButton area-label="help" onClick={handleHelp}><HelpOutlineIcon /></IconButton></Box>
                    <Popover
                        open={helpOpen}
                        anchorEl={helpAnchor}
                        onClose={handleHelpClose}
                        anchorOrigin={{vertical: 'center', horizontal: 'right'}}
                        transformOrigin={{vertical: 'center', horizontal: 'left'}}
                    >
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{helpHead}</Typography>
                                <Typography variant="body1">{helpText}</Typography>
                                <IconButton id="backHelp" area-label="back" onClick={handleBackHelp}><ArrowBackIosIcon fontSize="small"/></IconButton>
                                <IconButton id="forwardHelp" area-label="forward" onClick={handleForwardHelp}><ArrowForwardIosIcon fontSize="small"/></IconButton>
                            </CardContent>
                        </Card>
                    </Popover>
                    <Dialog
                        open={resultOpen}
                        onClose={handleResultClose}
                    >
                        <DialogTitle>{resultTitle}</DialogTitle>
                        <Typography id="resultDescription" variant="body1">{resultContent}</Typography>
                    </Dialog>
                </Grid>
                <Grid item xs={12}>
                    {/* <Box display={(expanded)?'inline':'none'}> */}
                    <Collapse in={expanded}>
                    <Paper>
                        <Grid container spacing={2}>
                            {/* メニュー */}
                            <Grid item xs={3}>
                                <TreeView
                                    ref={tree=> helps[0].ref=tree}
                                    defaultCollapseIcon={<ExpandMoreIcon />}
                                    defaultExpandIcon={<ChevronRightIcon />}
                                    // style={{maxHeight:550, flexGrow:1, overflow: "auto"}}
                                    >
                                    {texts.map(item => (
                                        <TreeItem nodeId={item.id} label={item.label} key={item.id}>
                                            {item.children.map(child => (
                                                <TreeItem nodeId={`${item.id}_${child.id}`} label={child.label} key={`${item.id}_${child.id}`} onLabelClick={() => { handleTreeItemClick(`${item.id}_${child.id}`) }} />
                                            ))}
                                        </TreeItem>
                                    ))}
                                </TreeView>
                            </Grid>
                            {/* テキスト */}
                            <Grid item xs={9}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>{text}</Grid>
                                    <Grid item xs={6}><Paper elevation={3} style={{padding:7}}>{uml}</Paper></Grid>
                                    <Grid item xs={6}><Paper elevation={3}>{diagram}</Paper></Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={<Switch checked={takeTest}
                                                            onChange={handleTakeTest}
                                                            name="challenge"
                                                            color="primary"
                                                            ref={test=> helps[2].ref=test} />
                                            }
                                            label="出題"
                                        />
                                    </Grid>
                                    <Grid item xs={6}><Box display={(takeTest)?'inline':'none'}><Paper>{test}</Paper></Box></Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                    </Collapse>
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={6}>
                            <TextField
                                id="plantuml-text"
                                label="Input Area"
                                fullWidth
                                multiline
                                variant="outlined"
                                value={umltext}
                                onChange={(e) => { setUmltext(e.target.value); }}
                                ref={input=> helps[1].ref=input}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={1}>
                    <Button
                        id="button"
                        variant="outlined"
                        color="primary"
                        onClick={handleExecute}
                    >
                        Run
                    </Button>
                </Grid>
                <Grid item xs={2}>
                    <Box display={(takeTest)?'inline':'none'}>
                    <Button
                        id="submit"
                        variant="outlined"
                        color="secondary"
                        onClick={handleSubmit}
                        disabled={disableTest}
                    >
                        Submit
                    </Button>
                    </Box>
                </Grid>
                <Grid item xs={2}>
                    
                </Grid>
                <Grid item xs={12}>
                    <img src={umlImage} />
                </Grid>
            </Grid>
        </>} />
    );
}
export default PlantumlComponent;