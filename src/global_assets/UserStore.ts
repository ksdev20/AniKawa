import { atom } from 'nanostores';
console.log("Userstore called");
interface userData{
    profileName: string,
    profilePic: string
}

export const isLoggedIn = atom<boolean>(false);
export const userData = atom<userData | null>(null);
export const watchlist = atom<String[]>([]);
export const history = atom<String[]>([]);
export const fetchedOnce = atom<boolean>(false);

// export async function fetchUserDetails(forced: boolean = false) {
//     console.log("FetchUserDetails called.");
//     if (fetchedOnce.get() && !forced) return;
//     try {
//         console.log("Database fetch made.");
//         const res = await fetch('http://localhost:20000/api/user', {
//             method: 'GET',
//             credentials: 'include'
//         });

//         if (res.ok) {
//             const data = await res.json();
//             if (data.success && data.userData && data.watchlist) {    
//                 isLoggedIn.set(true);            
//                 userData.set(data.userData);
//                 watchlist.set(data.watchlist);
//                 fetchedOnce.set(true);
//             }
//         } else {
//             isLoggedIn.set(false);
//             userData.set(null);
//             watchlist.set([]);
//             fetchedOnce.set(true);
//         }
//     } catch (e) {
//         console.error("Error : ", e);
//     }
// }