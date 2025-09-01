import { type Dispatch, type SetStateAction, type KeyboardEvent } from "react";

export interface UserData {
    profileName: string,
    profilePic: string
}

export type closeFnType = (e: KeyboardEvent<HTMLButtonElement>) => void;
export type closeFnAnchor = (e: KeyboardEvent<HTMLAnchorElement>) => void;

export interface AfterLoginProps {
    userData: UserData | null;
    clickHandler: (name: string) => void;
    closeFn: closeFnType;
}

export interface BeforeLoginProps{
    closeFn: closeFnAnchor;
}

export type RefNames = 'navbar' | 'sidebar' | 'category';