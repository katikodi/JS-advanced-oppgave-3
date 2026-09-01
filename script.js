const randomBtn = document.getElementById("get-random-btn");
const cardContainer = document.getElementById("random-card-container");
const image = document.getElementById("image");
const infoContainer = document.getElementById("card-attributes-container");
const imgLoading = "src/card-image-loading.png";
const imgMissing = "src/card-image-missing.png";

// -------------------------------------------------------------------------------------
// --------------------------------Global objects---------------------------------------
// -------------------------------------------------------------------------------------

let currentCard = {
    imageUrl: "",
    scryfallUrl: "",
    name: "",
    manaCost: "",
    colorIdentity: [],
    typeLine: "",
    types: [],
    /*
    subtypes: [],
    */
    keywords: [],
    cardText: "",
    legalities: {
        standard: "",
        commander: "",
    },
}

const manaColors = {
    W: '#D6D4C2',
    U: '#0475B1',
    B: '#393335',
    R: '#BE2E2E',
    G: '#2C6E3C',
    C: 'gray'
}

const writtenMana = {
    W: 'White',
    U: 'Blue',
    B: 'Black',
    R: 'Red',
    G: 'Green',
    X: 'X',
    N: 'Any',
    C: 'Colorless'
}

document.addEventListener("DOMContentLoaded", async () => {
    await buildPage();
})

randomBtn.addEventListener('click', async () => {
    await buildPage();
})

//-------------------------------------------------------------------------
//---------------------------------TEMP------------------------------------
//-------------------------------------------------------------------------

const queryInput = document.getElementById('query');
/*
TO DO:
    - splitt opp getdata sånn at all currentCard mappingen er i sin egen funksjon under
    - filterfunksjonalitet for å unngå kort som er illegal i standard og/eller commander
    - ENTEN query layout:normal, ELLER lag custom targeting for transform/saga/adventure
    - lag complicatedMana og kanskje kondenser basicMana eller merge dem om mulig
TO MAYBE DO:
    - fade 0.5s fra loading placeholder til lasta bilde
    - finn og add symboler til ting ({T} = tapsymbol, manasymbol, osv.)
    - color teksten til manaen i samme farge, da må manaInfo være i div
*/
// HUSK å fjerne queryInput consten over ^ og fjern queryInput.value fra encoded under v

// -------------------------------------------------------------------------------------
// ---------------------------------Main functions--------------------------------------
// -------------------------------------------------------------------------------------

async function getData() {
    const encoded = encodeURIComponent("lang:en" + queryInput.value);
    // https://scryfall.com/docs/syntax
    // -----------------
    const result = await fetch(`https://api.scryfall.com/cards/random?q=${encoded}`, {
        headers:{
            "User-Agent": "Æ",
            "Accept":"application/json"
        }
    });
    const data = await result.json();
    
    console.log("------------------------------------------------------");
    console.log(data);

    currentCard.scryfallUrl = data.scryfall_uri;
    (() => {
        if (data.image_uris) {
            if (data.image_uris.png) {
                currentCard.imageUrl = data.image_uris.png;
            } else if (data.image_uris.large) {
                currentCard.imageUrl = data.image_uris.large;
            } else {
                currentCard.imageUrl = data.image_uris.normal;
            }
        }
        else {
            currentCard.imageUrl = imgMissing;
        }
    })();

    currentCard.name = data.name;
    currentCard.colorIdentity = data.color_identity;
    currentCard.manaCost = data.mana_cost;
    if (!data.mana_cost) {
        currentCard.manaCost = '';
    }
    currentCard.typeLine = data.type_line;
    currentCard.types = currentCard.typeLine.split(' ');
    currentCard.keywords = data.keywords;
    currentCard.cardText = data.oracle_text;
    /*
    const uniqueManaColors = new Set(formatMana());
    uniqueManaColors.forEach((entry) => {
        if(entry.match(/\d+|[X]/g) || entry === "X") {
            uniqueManaColors.delete(entry);
        }
    });
    currentCard.colorIdentity = Array.from(uniqueManaColors);   // alt det her var så unødvendig omg
    */
    console.log("---------");
    console.log(currentCard);
}

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------

// async function setData() {   insert mapping-data-to-currentCard-function here   }

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------

async function buildPage() {
    image.src = imgLoading;
    await getData();

    // ---------------------------------------------------------------
    // image half:
    // -----------
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

    // ---------------------------------------------------------------
    // info half:
    // -----------
    infoContainer.replaceChildren();

    const title = makeTitle();
    const manaInfo = makeManaInfo();
    const cardTypeInfo = makeCardTypeInfo();
    const cardText = makeCardText();

    const cardAttributes = document.createElement('div');
    cardAttributes.className = 'card-attributes-inner-container';
    cardAttributes.append(manaInfo, cardTypeInfo, cardText);

    infoContainer.append(title, cardAttributes);
}

// -------------------------------------------------------------------------------------
// --------------------------------Helper functions-------------------------------------
// -------------------------------------------------------------------------------------

function formatMana() {
    return currentCard.manaCost.match(/\d+|[WUBRGXC]/g);
}
// ---------------------------------------------------------
function makeTitle() {
    const cardNameDiv = document.createElement('div');
    cardNameDiv.id = 'card-name-div';
    
    const borderColors = currentCard.colorIdentity.map(identity => {
        return manaColors[identity];
    });

    cardNameDiv.style.setProperty(
        "--mana-border",
        `linear-gradient(to right, ${borderColors.join(", ")})`
    )
    if (currentCard.colorIdentity.length <= 0) {
        cardNameDiv.classList.add('colorless');
    }

    const cardName = document.createElement('h2');
    cardName.textContent = currentCard.name;
    cardNameDiv.append(cardName);
    return cardNameDiv;
}
// ---------------------------------------------------------
function makeManaInfo() {
    if (currentCard.manaCost.includes("/")) {
        return complicatedMana();
    } else {
        return basicMana();
    }
}
// ---------------------------------------------------------
function basicMana() {
    const writtenManaCost = formatMana();
    if (!writtenManaCost) {
        return '';
    }

    const manaTextWithDuplicates = writtenManaCost.map(color => {
        if (color === '{0}') {
            return;
        }
        return writtenMana[color] ?? `${color} Any`;
    })

// Kombinere duplicates. Eks. white | white | blue blir til 2 white | blue i stedet
    let manaText = [];
    let trackedWords = {
        White: 0,
        Blue: 0,
        Black: 0,
        Red: 0,
        Green: 0,
        X: 0,
        Colorless: 0
    }

    manaTextWithDuplicates.forEach((word) => {
        if (!trackedWords[word]) {
            manaText.push(word);
        }

        trackedWords[word]++;
        if (trackedWords[word] >= 1) {
            manaText.pop();
            manaText.push(`${trackedWords[word]} ${word}`);
        }
    });

    const manaInfo = document.createElement('p');
    manaInfo.textContent = `Cost: ${manaText.join(' + ')}`;

    return manaInfo;
}
// ---------------------------------------------------------
function complicatedMana() {
    const manaCostArray = currentCard.manaInfo.match(/(?<={)[^}](?=})/g);
    console.log(manaCostArray);
}
// ---------------------------------------------------------
function makeCardTypeInfo() {
    console.log(currentCard.typeLine);
    console.log('-------------');
    console.log(currentCard.types);

    const cardTypeInfo = document.createElement('div');
    cardTypeInfo.id = "type-div";

    currentCard.types.forEach((type) => {
        if (type === '—') {
            const hyphen = document.createElement('p');
            hyphen.textContent = type;
            cardTypeInfo.append(hyphen);
        } else {
            const typeLink = document.createElement('a');
            typeLink.textContent = type;
            typeLink.href = `https://scryfall.com/search?q=type%3A${type}`;
            typeLink.target = '_blank';
            cardTypeInfo.append(typeLink);
        }
    });

    return cardTypeInfo;
}
// ---------------------------------------------------------
/*
function makeCardKeywords() {
    const keywordSpan = document.createElement('span');
    keywordSpan.id = "keyword-span";

    currentCard.keywords.forEach((keyword) => {
        const keywordLink = document.createElement('a');

        const specifier = () => {
            const cleanedKeyword = keyword.replaceAll('?', '\\?');

            if (currentCard.cardText.includes(`${keyword} {`)) {
                try {
                    const dynamicExpression = `(?<=${cleanedKeyword} {)([^}]+)(?=})`;
                    const dynamicRegex = new RegExp(dynamicExpression, 'g');

                    const s = currentCard.cardText.match(dynamicRegex);
                    return s ? s.join(', ') : '';

                } catch (error) {
                    return '';
                }
            }
            return '';
        }
        keywordLink.textContent = `${keyword} ${specifier()}`;
        keywordLink.href = `https://scryfall.com/search?q=kw%3A%22${keyword}%22`;
        keywordLink.target = '_blank';
        keywordSpan.append(keywordLink);
        if (currentCard.cardText.includes(keyword)) {
            currentCard.cardText = currentCard.cardText.replace(keyword, '');
        }
    })
    return keywordSpan;
} */
// ---------------------------------------------------------
function makeCardText() {
    const cardTextContainer = document.createElement('div');
    cardTextContainer.id = 'card-text-container';

    const cardTextLines = currentCard.cardText.split('\n');
    cardTextLines.forEach((textLine) => {
        
        const textLineDiv = document.createElement('div');
        textLineDiv.className = 'text-line-div';

        const cardTextArray = textLine.split(' ');
        cardTextArray.forEach((cardWord) => {

            if (currentCard.keywords.includes(cardWord)) {
                const keywordLink = document.createElement('a');
                keywordLink.textContent = cardWord;
                keywordLink.href = `https://scryfall.com/search?q=kw%3A%22${cardWord}%22`;
                keywordLink.target = '_blank';
                textLineDiv.append(keywordLink);
            } else {
                const normalWord = document.createElement('p');
                normalWord.textContent = cardWord;
                textLineDiv.append(normalWord);
            }
        })
        cardTextContainer.append(textLineDiv);
    })
    return cardTextContainer;
}