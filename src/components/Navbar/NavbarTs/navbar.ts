import { type Dispatch, type SetStateAction, type KeyboardEvent } from "react";

export interface UserData {
    profileName: string,
    profilePic: string
}

export type closeFnType = (e: KeyboardEvent<HTMLButtonElement>) => void;

export interface AfterLoginProps {
    userData: UserData | null;
    clickHandler: (name: string) => void;
    closeFn: closeFnType;
}

export type RefNames = 'navbar' | 'sidebar' | 'category';