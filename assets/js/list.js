(() => {
    async function displayList(listSection) {
        const listId = window.location.pathname.split('/')[2];
        const listResponse = await getListAPI(listId);
        if (listResponse.message === "success") {
            const list = generateListElement(listResponse.list);

            listSection.appendChild(list);
        }else {
            alert("message: " + listResponse.message);
        }
    }

    const listSection = document.getElementById("list-section");
    if (listSection) {
        displayList(listSection);
    }
})();