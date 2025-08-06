import { useEffect } from 'react';
import fetchUserDetails, { checkCookie } from '../../global_assets/FetchUserDetails';

export default function FetchFromDb() {
    useEffect(() => {
        (async () => {
            await main();
        })();
    }, []);

    async function main(){
        // const fetchedOnce = localStorage.getItem('fetchedOnce');
        // if (fetchedOnce && fetchedOnce == 'true') return;
        await checkCookie();
        await fetchUserDetails();
    }

    return null;
}
