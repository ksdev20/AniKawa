export interface userData {
    profileName: string,
    profilePic: string
}

export type ALNames = 'watchlist' | 'history';

export interface AfterLoginProps{
    userData: userData | null;
    clickHandler: (name: ALNames) => void;
}