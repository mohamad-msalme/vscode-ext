export enum TokenType {
  PWD = 0,
  GITHUB,
  GOOGLE,
  AZURE,
}
export interface AuthToken {
  type: TokenType;
  token: string;
}
