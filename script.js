//all items filter-topic start

window.onload = async function () {
    let busket = localStorage.getItem("busket");
    if (busket === null) {
        localStorage.setItem("busket", JSON.stringify({}));
    }
    const listItems = document.querySelectorAll("ul.block-filer-topic li");
    const galleryItem = document.querySelectorAll(".fox");
    let items = await getItemsFromJSONFile();
    let allItems = document.getElementById("foxes")
    populateItems(allItems, items);

    function toggleActiveClass(t) {
        listItems.forEach((t) => {
            t.classList.remove("active");
        }),
            t.classList.add("active");
    }

    function toggleProjects(t) {

        if ("all" === t)
            galleryItem.forEach(item => {
                item.style.display = "block";
            });
        else
            galleryItem.forEach(item => {
                item.dataset.class === t
                    ? (item.style.display = "block")
                    : (item.style.display = "none");
            });
    }

    for (let t = 0; t < listItems.length; t++)
        listItems[t].addEventListener("click", function () {
            toggleActiveClass(listItems[t]),
                toggleProjects(listItems[t].dataset.class);
        });
};

const listItems = document.querySelectorAll('li');

function handleItemClick(event) {
    listItems.forEach(item => item.classList.remove('clicked'));
    event.target.classList.add('clicked');
}

listItems.forEach(item => {
    item.addEventListener('click', handleItemClick);
});

function clearMain() {
    let main = document.getElementById('foxes');
    main.innerHTML = '';
}

async function filterFoxesByTopic(filterValue) {
    clearMain();
    let foxes = await getItemsFromJSONFile();
    if (filterValue != 'All') {
        foxes = foxes.filter((x) => x.topic === filterValue);
    }
    let allItems = document.getElementById("foxes")
    populateItems(allItems, foxes);
}

//all items, filter-topic end

function debounce(func, ms) {
    let timeout;
    return async function () {
        clearTimeout(timeout);
        timeout = setTimeout(async () => await func.apply(this, arguments), ms);
    };
}

//all items, filter by name start
async function filterFoxesByName() {
    debounce(async () => {
        await getItemsFromJSONFile().then((foxes) => {
            clearMain();
            let inputName = document.getElementById('inputSearch').value;
            let allItems = document.getElementById("foxes")
            if (inputName == "") {
                populateItems(allItems, foxes);
            }
            else {
                foxes = foxes.filter((x) => x.name.toLowerCase().startsWith(inputName.toLowerCase()));
                populateItems(allItems, foxes);
            }
        });
    }, 1000)();

}

//button all foxes
function setDefaultFilters() {
    document.getElementById('price').value = 75;
    setValueLabel("");
    const listItems = document.querySelectorAll("ul.block-filer-topic li");
    listItems.forEach(item => item.classList.remove('clicked'));
    let allFoxesTopic = document.getElementById("item1");
    allFoxesTopic.classList.add('clicked');
    let inputSearch = document.getElementById('inputSearch');
    inputSearch.value = "";
}

async function showAllFoxes() {
    clearMain();
    setDefaultFilters();
    let foxes = await getItemsFromJSONFile();
    let allItems = document.getElementById('foxes');

    populateItems(allItems, foxes);
}

//filter price
async function price() {
    let value = document.getElementById('price').value;
    setValueLabel(value);
    let allItems = document.getElementById('foxes');
    debounce(async () => {
        await getItemsFromJSONFile().then((x) => {
            clearMain();
            let filteredByPrice = x.filter((x) => x.price <= value);
            populateItems(allItems, filteredByPrice);
        });
    }, 500)();

}

function setValueLabel(value) {
    const valueText = document.querySelector("#value");
    valueText.textContent = value;
}

//all items, add foxes on the page
async function getItemsFromJSONFile() {
    return await fetch("foxes.json")
        .then((res) => {
            return res.json();
        })
}

function populateItems(mainBlock, items) {
    items.forEach(element => {
        let template = getFoxesHtmlTemplate(element);
        mainBlock.innerHTML += template;
    });
}

function getFoxesHtmlTemplate(item) {
    return `<div class="fox" id="fox">
    <div class="img-block">
        <img src="${item.img}" alt="#" class="img-fox">
        <button class="img-busket"><img id="imgAddToBusket" onclick="changeImgButtonAddToBusket(this, ${item.id}, ${item.price});" src="${item.imgBusket}" alt=""></button>
    </div>
    <div class="info-block">
        <h3 class="fox-name">${item.name}</h3>
        <p class="price">$${item.price}</p>
        <img src="${item.imgStars}">
        <p class="topic" id="topic">${item.topic}</p>
    </div>
</div>`
}


function countItemsInBusket(arr) {
    return arr.reduce((result, current) => {
        if (result[current]) {
            result[current]++;
        } else {
            result[current] = 1;
        }

        return result;
    }, {});
}

//change img button add to busket oncklick

function changeImgButtonAddToBusket(imgAddToBusket, id, price) {
    imgAddToBusket.src = "./img/addOnclick.png";
    addToBusket(id, price);
}

function addToBusket(id, price) {
    let busket = JSON.parse(localStorage.getItem("busket")) ?? {};
    let keys = Object.keys(busket);
    if (keys.includes(id.toString())) {
        busket[id].count++;
    }
    else {
        busket[id] = { "count": 1, "price": price };
    }
    busket["sum"] = calculateSum(busket);
    localStorage.setItem("busket", JSON.stringify(busket));

}

function calculateSum(busket) {
    let keys = Object.keys(busket);
    let sum = 0;
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (key === "sum") {
            continue;
        }
        let price = busket[key].price * busket[key].count;
        sum += price;
    }
    return sum;

}

function getTemplateForBusket(item, count) {
    return `<div class="foxInBusketElements" id="foxInBusketElements">
    <div class="foxes">
        <div>
            <div class="img-block">
              <img src="${item.img}" alt="#" class="img-fox-in-busket">
            </div>
            <div class="info-block">
                <h3 class="fox-name-in-busket">${item.name}</h3>
                 <p class="price-in-busket">$${item.price}</p>
            </div>
        </div>
        <div class="countFoxes">
            <div class="countFoxesInBusket">
                <button class="buttonCount" id="buttonRemoveCount-${item.id}" onclick="removeFoxFromBusket(${item.id})" disabled>-</button>
                <p class="countInBusket" id="fox-${item.id}-count">${count}</p>
                <button class="buttonCount" onclick="addFoxToBusket(${item.id})">+</button>
            </div>
            <div class="removeAllElement"> 
                <p class="wordRemove">Remove</p>
                <img src="img/close-circle.png" alt="" id="buttonRemove" onclick="deleteItemFromBusket(${item.id})">
            </div>
        </div>
    </div>
</div>`
}


function deleteItemFromBusket(id) {
    let busket = JSON.parse(localStorage.getItem("busket"));
    delete busket[id.toString()]
    busket["sum"] = calculateSum(busket);
    localStorage.setItem("busket", JSON.stringify(busket));
    setBusketTemplate();
    let total = document.getElementById("total")
    total.innerHTML = `Total: $${busket["sum"]}`;

}

function refreshFoxInBusket(id, newValue) {
    let foxInBusketElements = document.getElementById("fox-" + id + "-count");
    foxInBusketElements.innerText = newValue;
}

function addFoxToBusket(id) {
    let busket = JSON.parse(localStorage.getItem("busket")) ?? {};
    busket[id.toString()].count++;
    busket["sum"] = calculateSum(busket);
    localStorage.setItem("busket", JSON.stringify(busket));
    refreshFoxInBusket(id, busket[id.toString()].count);
    disableRemoveButton(busket[id.toString()].count, id);
    let total = document.getElementById("total")
    total.innerHTML = `Total: $${busket["sum"]}`;

}

function removeFoxFromBusket(id) {
    let busket = JSON.parse(localStorage.getItem("busket")) ?? {};
    busket[id.toString()].count--;
    busket["sum"] = calculateSum(busket);
    localStorage.setItem("busket", JSON.stringify(busket));
    refreshFoxInBusket(id, busket[id.toString()].count);
    disableRemoveButton(busket[id.toString()].count, id);
    let total = document.getElementById("total")
    total.innerHTML = `Total: $${busket["sum"]}`;
}

function disableRemoveButton(count, id) {
    let buttonRemoveCount = document.getElementById(`buttonRemoveCount-${id}`);
    if (count == 1) {
        buttonRemoveCount.disabled = true;
    }
    else {
        buttonRemoveCount.disabled = false;
    }
}


async function setBusketTemplate() {
    let busket = JSON.parse(localStorage.getItem("busket")) ?? {};
    let idsInBusket = Object.keys(busket);
    let foxes = await getItemsFromJSONFile();
    let foxesInBusket = document.getElementById("foxesInBusket");
    foxesInBusket.innerHTML = "";
    idsInBusket.forEach(element => {
        let foxInBusket = busket[element];
        let fox = foxes.filter((x) => x.id === element)[0];
        let template = getTemplateForBusket(fox, foxInBusket.count);
        foxesInBusket.innerHTML += template;
    });
}


//open and close busket on click button
function openCloseBasket() {
    Blur();
    let item = document.getElementById("mySidepanel");
    let isOpened = item?.getAttribute('isOpened');
    if (item === null || isOpened === "false") {
        let busket = JSON.parse(localStorage.getItem("busket")) ?? {};
        document.body.innerHTML += this.getBasketMenu(busket["sum"]);
        item = document.getElementById("mySidepanel");
        item.setAttribute('isOpened', true);
        item.style.width = "300px";
        setBusketTemplate();
        return;
    }
    item.setAttribute('isOpened', false);
    item.style.width = "0px";
    document.body.removeChild(document.body.lastChild);
}

function getBasketMenu(total) {
    return `<div id="mySidepanel" class="sidepanel">
    <div id="closeBusketPage">
        <a id="buttonCloseBusketPage" onclick="openCloseBasket()">X</a>
    </div>
    <div class="header">
        <p id="header-box">box</p>
        <h3 id="header-name">Your Bag</h3>
        <div id="foxesInBusket">
        </div>
    </div>
    <div class="total-block">
        <p id="total">Total: $${total}</p>
        <button class="buttonCheckout">Checkout</button>
    </div>
</div>`
}

//blur main page when busket is open
function Blur() {
    let header = document.getElementsByTagName("header")[0];
    let main = document.getElementsByTagName("main")[0];
    let footer = document.getElementsByTagName("footer")[0];
    if (header.style.filter === '') {
        header.style.filter = 'blur(5px)';
        main.style.filter = 'blur(5px)';
        footer.style.filter = 'blur(5px)';
    }
    else {
        header.style.filter = '';
        main.style.filter = '';
        footer.style.filter = '';
    }

}

