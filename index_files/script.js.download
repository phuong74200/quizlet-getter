document.getElementsByTagName('input')[0].addEventListener('keyup', (e) => {
    const children = [...document.querySelectorAll('tr[item]')];
    children.forEach((child) => {
        if(child.textContent.toLowerCase().includes(e.target.value.toLowerCase())) {
            child.style.display = 'table-row';
        } else {
            child.style.display = 'none';
        }
    })
})