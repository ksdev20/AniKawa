import { useEffect } from 'react';

export default async function HandleECClick({ animenanoid, slug }: { animenanoid: string | undefined, slug: string | undefined }) {

    async function handleClick(){
        if (localStorage.getItem('isLoggedIn') == 'false') {
            return;
        } else {
            await fetch(`http://localhost:20000/api/addToList?item=${animenanoid},${slug}&field=history`, {
                method: 'GET',
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        console.log('Failed to add to history');
                    }
                })
                .catch(e => {
                    console.log(e.message);
                });
        }
    }

    useEffect(() => {
        (async () => {
            await handleClick();
        })();
    }, []);

    return null;
}