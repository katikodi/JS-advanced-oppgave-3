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
    U: '#E3FBFF',
    B: '#E6D9EB',
    R: '#FFE3E3',
    G: '#F3FFEA',
    C: 'gray'
}

const writtenMana = {
    W: {word: 'white', amount: 0},
    U: {word: 'blue', amount: 0},
    B: {word: 'black', amount: 0},
    R: {word: 'red', amount: 0},
    G: {word: 'green', amount: 0},
    X: {word: 'X', amount: 0},
    N: {word: 'of any color', amount: 0},
    C: {word: 'colorless', amount: 0},
    S: {word: 'snow', amount: 0},
    'W/U': {word: 'white/blue', amount: 0},
    'W/B': {word: 'white/black', amount: 0},
    'B/R': {word: 'black/red', amount: 0},
    'B/G': {word: 'black/green', amount: 0},
    'U/B': {word: 'blue/black', amount: 0},
    'U/R': {word: 'blue/red', amount: 0},
    'R/G': {word: 'red/green', amount: 0},
    'R/W': {word: 'red/white', amount: 0},
    'G/W': {word: 'green/white', amount: 0},
    'G/B': {word: 'green/blue', amount: 0},
}

//-------------------------------------------------------------------------

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
    - filterfunksjonalitet for å unngå kort som er illegal i standard og/eller commander
    - ENTEN query layout:normal, ELLER lag custom targeting for transform/saga/adventure
    - lag complicatedMana og kanskje kondenser basicMana eller merge dem om mulig
TO MAYBE DO:
    - fade 0.5s fra loading placeholder til lasta bilde
    - finn og add symboler til ting ({T} = tapsymbol, manasymbol, osv.)
    - color teksten til manaen i samme farge, da må manaInfo være i div
DONE:
    - splitt opp getdata sånn at all currentCard mappingen er i sin egen funksjon under
    - FIKS manaCostArray is null på land
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
    // currentCard.manaCost = data.mana_cost;
    // if (!data.mana_cost) {
    //     currentCard.manaCost = '';
    // }
    currentCard.manaCost = data.mana_cost ?? '';
    // currentCard.manaCost = data.mana_cost.match(/(?<={)[^}]+(?=})/g) ?? '';

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

// function formatMana() {
//     return currentCard.manaCost.match(/\d+|[WUBRGXC]/g);
// }
// ---------------------------------------------------------
// function formatCardText(text) {
//     // if (text.includes('{')) {
//     //     const bracketlessText = text.pop().shift();
//     //     if (bracketlessText === 'T' || 'Q') {
//     //         return 'T' ? 'Tap' : 'Untap';
//     //     } else if (/*number*/) {
//     //         return /* number Any */
//     //     }
    
//         //map til writtenMana arrayet og lag ny const som bruker words fra det
//         //return den nye consten
//     }
// }
// ---------------------------------------------------------
// function formatCardText(text) {
//     let temp;
//     text.matchAll(/{([0-9]+|[TQ])}/gm).forEach((match) => {
//         temp += match[1];
//     })
//     return temp;
// }
// ---------------------------------------------------------
function formatCardText(text) {
    const abilityCostGroups = text.match(/\{[^{}]*\}(?:\{[^{}]*\})*/g);
    console.log(abilityCostGroups);

    if (abilityCostGroups) {
        let formattedGroups = []

        abilityCostGroups.forEach((costGroup) => {
            let formattedCosts = []

            for (let outerKey in writtenMana) {
                for (let innerKey in writtenMana[outerKey]) {
                    if (innerKey === 'amount') {
                        writtenMana[outerKey][innerKey] = 0;
                    }
                }
                console.log(writtenMana[outerKey].amount);
            }

            costGroup.match(/(?<={)[^}]+(?=})/g).forEach(cost => {
                //formattedCosts.push(cost);
                // gjør dette om til proper formatering med ting fra previous attempt
                if (writtenMana[cost]) {
                    writtenMana[cost].amount++;
                    if (writtenMana[cost].amount > 1) {
                        formattedCosts.pop();
                    }
                    formattedCosts.push(`${writtenMana[cost].amount} ${writtenMana[cost].word}`);
                    console.log(writtenMana[cost].amount);
                    // Object.keys(writtenMana).forEach(key => {
                    //     if (key === 'amount') {writtenMana[key] = 0};
                    // });
                    
                } else if (cost.match(/(\d)/g)) {
                    formattedCosts.push(`${cost} of any color`);
                } else if (cost === 'T' || cost === 'Q') {
                    formattedCosts.push(cost === 'T' ? 'Tap' : 'Untap');
                } else {
                    return;
                }
                
            })

            const formattedGroup = formattedCosts.join(' + ');
            formattedGroups.push(formattedGroup);
        })

        const formattedCardText = formattedGroups.join(', ');
        // ^ gjør dette om til funksjon som går over alle group matches og replacer med tilsvarende index av formattedGroupss
        
        console.log(formattedCardText)
    }

    return text;

// -------------------------------- previous attempt --------------------------------------

    // const formattedText = text.replaceAll(/({[\d\D]})/g, bracketedKey => {
    //     const key = bracketedKey.slice(1, -1);

    //     if (writtenMana[key]) {
    //         return writtenMana[key].word;
    //     } else if (key.match(/(\d)/g)) {
    //         return `${key} of any color`;
    //     } else if (key === 'T' || key === 'Q') {
    //         const tappyWordFromKey = key === 'T' ? 'Tap' : 'Untap';
    //         return tappyWordFromKey;
    //     } else {return key;}
    // })
    // return formattedText;

    //----------------------- first attempt ------------------------------

    // const keys = text.match(/(?<={)[^}]+(?=})/g);
    // const convertedWord = keys.map((key) => {
    //     if (writtenMana[key]) {
    //         return writtenMana[key].word;
    //     } else if (key.match(/(?<={)\d+(?=})/g)) {
    //         return `${key} of any color`;
    //     } else if (key === 'T' || key === 'Q') {
    //         const tappyWordFromKey = key === 'T' ? 'Tap' : 'Untap';
    //         return tappyWordFromKey;
    //     } else {return key;}
    // })
    // const formattedText = text.replaceAll(keys, convertedWord);
    // return formattedText;
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
// the old makeManaInfo:
/*
function makeManaInfo() {
    // if (currentCard.manaCost.includes("/")) {
    //     return complicatedMana();
    // } else {
    //     return basicMana();
    // }
    return complicatedMana();
}
*/
// ---------------------------------------------------------
/*
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
    */
// ---------------------------------------------------------
function makeManaInfo() {
    const manaCostArray = currentCard.manaCost.match(/(?<={)[^}]+(?=})/g);
    let manaText = [];

    if (manaCostArray) {
        manaCostArray.forEach((manaKey) => {
            if (!writtenMana[manaKey]) {
                manaText.push(`${manaKey} of any color`);
                return;
            }

            writtenMana[manaKey].amount++;
            if (writtenMana[manaKey].amount > 1) {
                manaText.pop();
            }

            manaText.push(`${writtenMana[manaKey].amount} ${writtenMana[manaKey].word}`);

            console.log(writtenMana[manaKey].amount);
        });
    }
    
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
    console.log('---sss-s-s-s-------s-s-s-----');
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

    //console.log(formatCardText("Multikicker {1}{U} (You may pay an additional {1}{U} any number of times as you cast this spell.)\nCounter target spell unless its controller pays {2}. Draw a card for each time Spell Contortion was kicked."));
    //const formattedCardText = formatCardText(currentCard.cardText);
    //const formattedCardText = formatCardText("Scavenge {4}{G}{G} ({4}{G}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)")
    const formattedCardText = formatCardText("This land enters tapped.\n{T}: Add {B}.\n{1}{B}{R}{R}, {T}, Sacrifice this land: It deals 3 damage to target player. That player discards a card. Activate only as a sorcery.");
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    console.log(formattedCardText);

    const cardTextLines = formattedCardText.split('\n');
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