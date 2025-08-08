export interface UserData {
    profileName: string,
    profilePic: string
}

export type ALNames = 'watchlist' | 'history';

export interface AfterLoginProps{
    userData: UserData | null;
    clickHandler: (name: ALNames) => void;
}

export type RefNames = 'navbar' | 'sidebar' | 'category';