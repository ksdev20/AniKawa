import { type KeyboardEvent } from "react";

export type closeFnButton = (e: KeyboardEvent<HTMLButtonElement>) => void;

export interface AfterLoginProps {
    userData: any | null;
    clickHandler: (name: string) => void;
    closeFn: closeFnButton;
}