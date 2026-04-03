/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type HandWritingDto = {
  charCode?: string;
  value: string;
  kind: HandWritingDto.kind;
};

export namespace HandWritingDto {
  export enum kind {
    HIRAGANA = 'HIRAGANA',
    KATAKANA = 'KATAKANA',
    KANJI = 'KANJI',
  }
}
