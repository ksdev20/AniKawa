const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

export default function chb() {
    function mainAction(data: any) {
        const msg = data.success ? 'Successfully cleared history✅' : 'Failed to clear history❌';
        alert(msg);
        window.location.reload();
    }

    const clearHistory = async () => {
        await fetch(`${backendUrl}/api/clearHistory`, {
            method: 'GET',
            credentials: 'include'
        }).then(res => res.json()).then(data => {
            mainAction(data);
        }).catch(e => {
            console.log(e);
        });
    }

    return (
        <div onClick={clearHistory} className="clear-history">
            CLEAR HISTORY
        </div>
    )
}