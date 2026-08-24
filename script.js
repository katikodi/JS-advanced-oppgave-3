// har lyst å kunne filtrere vekk illegal for standard og/eller commander
const randomBtn = document.getElementById("get-random-btn");
const cardContainer = document.getElementById("random-card-container");
const image = document.getElementById('image');
const infoContainer = document.getElementById("card-attributes-container");
const imgPlaceholder = "src/blankcardplaceholder.png";
//-------------------------------------------------------------------------
// hente annen versjon av bildet uten kanter

let currentCard = {
    imageUrl: "",
    name: "",
    manaCost: "",
    colorIdentity: [],
    type: "",
    subtypes: [],
    scryfallUrl: "",
    colorIdentity: [],
    keywords: [],
    legalities: {
        standard: "",
        commander: "",
    },
}

document.addEventListener("DOMContentLoaded", async () => {
    await buildPage();
})

randomBtn.addEventListener('click', async () => {
    await buildPage();
})

//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------

async function getData() {
    const encoded = encodeURIComponent("lang:en");
    const result = await fetch(`https://api.scryfall.com/cards/random?q=${encoded}`, {
        headers:{
            "User-Agent": "Æ",
            "Accept":"application/json"
        }
    });
    const data = await result.json();
    
    console.log("------------------------------------------------------");
    console.log(data);
    currentCard.imageUrl = data.image_uris.large;
    currentCard.name = data.name;
    const typesAndSubtypes = data.type_line;
    const onlyTypes = typesAndSubtypes.split('—')[0].trim();
    currentCard.type = onlyTypes;
    currentCard.scryfallUrl = data.scryfall_uri;
    currentCard.manaCost = data.mana_cost;

    const formattedManas = currentCard.manaCost.match(/[A-Z]/g);
    const manas = new Set(formattedManas);
    currentCard.colorIdentity = Array.from(manas);

    console.log("---------");
    console.log(currentCard);
}
// -------------------------------------------------------------------------------------

async function buildPage() {
    image.src = imgPlaceholder;
    await getData();

    // -------------------------------------------------
    // image half:
/* TO CHANGE:
fade the default picture
*/
    image.src = currentCard.imageUrl;
    image.setAttribute('title', 'Click to view card on the Scryfall website');

    image.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (e.button === 2) {
            return;
        }
        window.open(currentCard.scryfallUrl);
    })

    cardContainer.append(image);
    console.log(cardContainer);
    
    // -------------------------------------------------
    // info half:
/* TO ADD:
<span id="card-title"></span>
<span id="mana"></span>
<span id="card-text"></span>
<span id="misc"></span>
*/

    infoContainer.replaceChildren();
    const cardName = document.createElement('h2');
    cardName.textContent = currentCard.name;

    infoContainer.append(cardName);
}
// -------------------------------------------------------------------------------------

