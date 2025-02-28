(() => {
    function displayList(listSection) {
        const listId = window.location.pathname.split('-')[1];
        const listResponse = getListAPI(listId);
        if (listResponse.message == "success") {
            const list = generateListElement(listResponse.list);

            listSection.appendChild(list);
        }else {
            alert(listResponse.message);
        }
    }

    const listSection = document.getElementById("list-section");
    if (listSection) {
        displayList(listSection);
    }
})();