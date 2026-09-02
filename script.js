const randomBtn = document.getElementById("get-random-btn");
const cardContainer = document.getElementById("random-card-container");
const image = document.getElementById("image");
const infoContainer = document.getElementById("card-attributes-container");
const imgLoading = "src/card-image-loading.png";
const imgMissing = "src/card-image-missing.png";

// -------------------------------------------------------------------------------------
// --------------------------------Global objects---------------------------------------
// -------------------------------------------------------------------------------------

// const writtenMana = {
//     W: 'White',
//     U: 'Blue',
//     B: 'Black',
//     R: 'Red',
//     G: 'Green',
//     X: 'X',
//     N: 'Any',
//     C: 'Colorless',
//     'W/U': 'White or Blue',
//     'W/B': 'White or Black',
//     'W/R': 'White or Red',
//     'W/G': 'White or Green'
// }

let currentCard = {
    imageUrl: "",
    scryfallUrl: "",
    name: "",
    manaCost: "",
    colorIdentity: [],
    typeLine: "",
    types: [],
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

const manaPastels = {
    W: '#FFFFFF',
    U: '#E3FBFF', //done
    B: '#E6D9EB', //done
    R: '#FFE3E3', //done
    G: '#F3FFEA', //done
    C: 'gray'
}


const writtenMana = {
    W: {word: 'White', amount: 0},
    U: {word: 'Blue', amount: 0},
    B: {word: 'Black', amount: 0},
    R: {word: 'Red', amount: 0},
    G: {word: 'Green', amount: 0},
    X: {word: 'X', amount: 0},
    N: {word: 'Any', amount: 0},
    C: {word: 'Colorless', amount: 0},
    'W/U': {word: 'White/Blue', amount: 0},
    'W/B': {word: 'White/Black', amount: 0},
    'W/R': {word: 'White/Red', amount: 0},
    'W/G': {word: 'White/Green', amount: 0}
}

document.addEventListener("DOMContentLoaded", async () => {
    await buildPage();
})

randomBtn.addEventListener('click', async () => {

    for (const manaObjectKey in writtenMana) {
        writtenMana[manaObjectKey].amount = 0;
    }

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
    - FIKS manaCostArray is null på land
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
    const encoded = encodeURIComponent("lang:en " + queryInput.value);
    // https://scryfall.com/docs/syntax
    // -----------------
    const result = await fetch(`https://api.scryfall.com/cards/random?q=${encoded}`, {
        headers:{
            "User-Agent": "Å",
            "Accept":"application/json"
        }
    });
    const data = await result.json();

    console.log("------------------------------------------------------");
    console.log(data);

    await setData(data);
}

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------

async function setData(data) {
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
    currentCard.scryfallUrl = data.scryfall_uri;
    currentCard.name = data.name;
    currentCard.colorIdentity = data.color_identity;

    /*
    currentCard.manaCost = data.mana_cost;
    if (!data.mana_cost) {
        currentCard.manaCost = '';
    }
    */

    currentCard.manaCost = data.mana_cost ?? '';

    currentCard.typeLine = data.type_line;
    currentCard.types = currentCard.typeLine.split(' ');
    currentCard.keywords = data.keywords;
    currentCard.cardText = data.oracle_text;
        
    console.log("---------");
    console.log(currentCard);
}

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
function getGradient(gradientVersion) {
    return currentCard.colorIdentity.map(identity => {
        return gradientVersion[identity];
    });
}
// ---------------------------------------------------------
function makeTitle() {
    const cardNameDiv = document.createElement('div');
    cardNameDiv.id = 'card-name-div';
    
    const borderColors = getGradient(manaColors);

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
    // if (currentCard.manaCost.includes("/")) {
    //     return complicatedMana();
    // } else {
    //     return basicMana();
    // }
    return complicatedMana();
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
    const manaCostArray = currentCard.manaCost.match(/(?<={)[^}]+(?=})/g);
    
    let manaText = [];

    manaCostArray.forEach((manaKey) => {

        if (!writtenMana[manaKey]) {
            manaText.push(`${manaKey} Any`);
            return;
        }


        writtenMana[manaKey].amount++;
        manaText.push(`${writtenMana[manaKey].amount} ${writtenMana[manaKey].word}`);
        console.log(manaText);

        if (writtenMana[manaKey].amount >= 1) {
            manaText.pop();
            manaText.push(`${writtenMana[manaKey].amount} ${writtenMana[manaKey].word}`);
            console.log(manaText);
            return;
        }

        console.log(writtenMana[manaKey].amount);

    });


    console.log(manaText);


    const manaInfo = document.createElement('p');
    manaInfo.textContent = `Cost: ${manaText.join(' + ')}`;

    return manaInfo;

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

        const backgroundColors = getGradient(manaPastels);
        cardTextContainer.style.setProperty(
            "--mana-border",
            `linear-gradient(to right, ${backgroundColors.join(", ")})`
        );
    })
    return cardTextContainer;
}