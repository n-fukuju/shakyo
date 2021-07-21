/** 見出し */
export interface MenuHead {
    /** 見出しID */
    id: string;
    /** 見出しテキスト */
    label: string;
    /** 詳細項目一覧 */
    children: CommentaryDetails[];
}
/** 詳細項目 */
export interface CommentaryDetails{
    /** 詳細ID */
    id: string;
    /** 詳細テキスト */
    label: string;
    /** 詳細コンテンツ */
    content: string;
    /** サンプルUMLコード */
    sample: string;
    /** 例題一覧 */
    questions: string[];
}