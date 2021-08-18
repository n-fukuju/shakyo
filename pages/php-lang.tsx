import { FC } from 'react';

import PhpEditorComponent from '../components/PhpEditorComponent';

const PhpLangComponent: FC=()=>{
    let code = '```';
    return (
        <PhpEditorComponent pages={[
            {
                title: "型",
                content: String.raw`
[型 - PHP](https://www.php.net/manual/ja/language.types.php)

PHPは10種類の基本型をサポートします。

**4種類のスカラ型**

* 論理値: bool
* 整数: int
* 浮動小数点数: float, double
* 文字列: string

**4種類の複合型**

* 配列: array
* オブジェクト: object
* callable
* iterable

**2種類の特別な型**

* resource
* NULL

double は、歴史的な経緯で残っているもので、float と同じものです。
変数の型は、PHPが実行時に決定するもので、基本的にはコードで明示的に指定するものではありません。

${code}
$a_bool = TRUE;
var_dump($a_bool);
${code}

                `
            },
            {
                title: "見出し2",
                content: String.raw`コンテンツ2-1
                コンテンツ2-2`
            },
            {
                title: "見出し3",
                content: String.raw`コンテンツ3-1
                コンテンツ3-2`
            }
        ]}></PhpEditorComponent>
    );
}
export default PhpLangComponent;