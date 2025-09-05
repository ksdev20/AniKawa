import { type KeyboardEvent } from "react";

export interface UserData {
    profileName: string,
    profilePic: string
}

export type closeFnButton = (e: KeyboardEvent<HTMLButtonElement>) => void;
export type closeFnAnchor = (e: KeyboardEvent<HTMLAnchorElement>) => void;

export interface AfterLoginProps {
    userData: UserData | null;
    clickHandler: (name: string) => void;
    closeFn: closeFnButton;
}

export interface BeforeLoginProps{
    closeFn: closeFnAnchor;
}

export type RefNames = 'navbar' | 'sidebar' | 'category';