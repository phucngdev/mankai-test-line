/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ToggleReactionDto = {
  type: ToggleReactionDto.type;
};

export namespace ToggleReactionDto {
  export enum type {
    LIKE = 'LIKE',
    FLOWER = 'FLOWER',
  }
}
