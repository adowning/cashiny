// import { PlatformSession } from "../index";
import { Session } from "better-auth";

export interface SigninRequestData {
  username: string;
  password: string;
}
export interface authRequestData {}
export type GetSigninResponseData = {
  code: number;
  token: string;
  message: string;
};
export type GetSession = {
  token: string;
  code: number;
  session: Session;
};
