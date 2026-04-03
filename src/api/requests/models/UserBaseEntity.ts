/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserBaseEntity = {
  id: string;
  userCode: number;
  email: string;
  avatarUrl: string;
  fullName: string;
  phoneNumber?: string;
  address: string;
  isActive: boolean;
  locale: UserBaseEntity.locale;
  q: string;
};

export namespace UserBaseEntity {
  export enum locale {
    EN = 'en',
    VI = 'vi',
    JP = 'jp',
  }
}
