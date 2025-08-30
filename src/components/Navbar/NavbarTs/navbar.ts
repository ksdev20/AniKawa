export interface UserData {
    profileName: string,
    profilePic: string
}

export interface AfterLoginProps{
    userData: UserData | null;
    clickHandler: (name: string) => void;
}

export type RefNames = 'navbar' | 'sidebar' | 'category';