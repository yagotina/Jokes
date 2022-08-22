const searchForm = document.getElementById('searchForm');
const searchFormList = document.querySelector('.search-form__list');
const jokesContainer = document.querySelector('.jokes');
const favouriteContainer = document.querySelector('.favourite__content');
const favBtn = document.querySelector('.fav-title__btn');
const favourite = document.querySelector('.favourite');
const favTitle = document.querySelector('.fav-title');

const formItems = {
    random: 'Random',
    caterogy: 'From caterogies',
    search: 'Search',
};

const localStorageArr = () => JSON.parse(localStorage.getItem('favouriteJokes')) || [];

const controller = url => fetch(url)
    .then(response => response.json());

for(let key in formItems) {
    const searchFormItem = document.createElement('li');
    searchFormItem.classList.add('search-form__item');

    searchFormItem.innerHTML = `
        <input class="search-form__input" type="radio" name="form-input" id='${key}'/>
        <label class="search-form__label" for='${key}'>${formItems[key]}</label>`;

    if(key === 'caterogy') 
        searchFormItem.innerHTML += '<ul class="caterogies" id="caterogies"></ul>';

    if(key === 'search') 
        searchFormItem.innerHTML += '<input class="search-input" type="search" name="search-input" id="searchInput" placeholder="Free text search...">';

    searchFormList.append(searchFormItem);
};

controller('https://api.chucknorris.io/jokes/categories')
    .then(caterogies => {caterogies.forEach(caterogy => {
        const caterogiesList = document.getElementById('caterogies');
        const li = document.createElement('li');
        li.classList.add('caterogies__item');
        li.innerHTML = `<input type="radio" name="category-input" value=${caterogy} id=${caterogy}>
                        <label class="caterogies__label" for=${caterogy}>${caterogy}</label>`;
        caterogiesList.append(li);
    })});

favBtn.addEventListener('click', () => {
    favBtn.classList.toggle('fav-animation');
    favourite.classList.toggle('favourite_show');
    favTitle.classList.toggle('fav-title_checked');
});

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const searchInput = document.getElementById('searchInput');
    const checkedCategory = document.querySelector('.caterogies__item > input:checked');
    const checkedInput = document.querySelector('.search-form__input:checked');

    const form = {
        random: 'random',
        caterogy: `random?category=${checkedCategory ? checkedCategory.id : null}`,
        search: `search?query=${searchInput.value}`,
    };
    
    if(checkedInput) {
        let API = `https://api.chucknorris.io/jokes/${form[checkedInput.id]}`;
        controller(API)
            .then(data => renderJoke(data));
    };
});

function renderJoke(data) {
    if(data.total) {
        data.result.forEach(joke => {
            let card = createCard(joke);
            jokesContainer.append(card);
        });
    } else if(data.id) {
        let card = createCard(data);
        jokesContainer.append(card);
    }
};

function renderFavJoke(joke) {
    if(!checkJokeinLocalStorage(joke)) addToLocalStorage(joke);
    let card = createCard(joke, true);
    favouriteContainer.append(card);
};

function removeFavJoke(joke) {
    const favJoke = document.getElementById(joke.id);
    if(favJoke) favJoke.remove();
    removeFromLocalStorage(joke);
};

function addToLocalStorage(joke) {
    let jokes = localStorageArr();
    jokes.push(joke);
    localStorage.setItem('favouriteJokes', JSON.stringify(jokes));
};

function removeFromLocalStorage(joke) {
    let jokes = localStorageArr();
    jokes.forEach((item, i) => {
        if(item.id === joke.id) jokes.splice(i, 1);
    })
    localStorage.setItem('favouriteJokes', JSON.stringify(jokes)); 
};

function checkJokeinLocalStorage(joke) {
    let jokes = localStorageArr();
    return jokes.some(item => joke.id === item.id);
};

function renderFavourites() {
    let jokes = localStorageArr();
    jokes.forEach(joke => renderFavJoke(joke));
}

function createCard(data, isFavourite) {
    const isInLocalStorage = checkJokeinLocalStorage(data);
    const hours = getUpdate(data.updated_at);
    
    const jokeCard = document.createElement('div');
    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const heartBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const heartFill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const cardId = document.createElement('p');
    const cardIdLink = document.createElement('a');
    const jokesCardText = document.createElement('p');
    const cardInfo = document.createElement('div');
    const cardInfoUpdate = document.createElement('p');
    const cardInfoCategory = document.createElement('div');
    const jokesCardIcon = document.createElement('div');

    if(isFavourite) jokeCard.id = data.id;

    jokeCard.classList.add('jokes-card', isFavourite ? 'favourite__card' : 'jokes__card');
    heart.classList.add('jokes-card__heart');
    heartBorder.classList.add('jokes-card__heart-border');
    heartFill.classList.add('jokes-card__heart-fill');
    if(isInLocalStorage) heartFill.classList.add('jokes-card__heart-fill_checked');
    cardId.classList.add('jokes-card__id', 'card-id');
    cardIdLink.classList.add('card-id__link');
    jokesCardText.classList.add('jokes-card__text');
    cardInfo.classList.add('jokes-card__info', 'card-info');
    cardInfoUpdate.classList.add('card-info__update');
    cardInfoCategory.classList.add('card-info__category');
    jokesCardIcon.classList.add('jokes-card__icon');

    heart.setAttribute('viewBox', '0 0 20 17');
    heartBorder.setAttribute('d', 'M10 17C9.71527 17 9.44077 16.9015 9.22684 16.7224C8.41888 16.0475 7.63992 15.4132 6.95267 14.8536L6.94916 14.8507C4.93423 13.2102 3.19427 11.7935 1.98364 10.3979C0.630341 8.83778 0 7.35852 0 5.74252C0 4.17244 0.563507 2.72395 1.58661 1.66367C2.62192 0.590857 4.04251 0 5.58716 0C6.74164 0 7.79892 0.348712 8.72955 1.03637C9.19922 1.38348 9.62494 1.80829 10 2.3038C10.3752 1.80829 10.8008 1.38348 11.2706 1.03637C12.2012 0.348712 13.2585 0 14.413 0C15.9575 0 17.3782 0.590857 18.4135 1.66367C19.4366 2.72395 20 4.17244 20 5.74252C20 7.35852 19.3698 8.83778 18.0165 10.3978C16.8059 11.7935 15.0661 13.2101 13.0515 14.8504C12.363 15.4108 11.5828 16.0461 10.773 16.7227C10.5592 16.9015 10.2846 17 10 17ZM5.58716 1.11932C4.37363 1.11932 3.25882 1.58203 2.44781 2.42232C1.62476 3.2753 1.17142 4.45439 1.17142 5.74252C1.17142 7.10165 1.70013 8.31719 2.88559 9.68375C4.03137 11.0047 5.73563 12.3923 7.70889 13.9989L7.71255 14.0018C8.4024 14.5635 9.18442 15.2003 9.99832 15.8802C10.8171 15.199 11.6003 14.5612 12.2916 13.9986C14.2647 12.392 15.9688 11.0047 17.1146 9.68375C18.2999 8.31719 18.8286 7.10165 18.8286 5.74252C18.8286 4.45439 18.3752 3.2753 17.5522 2.42232C16.7413 1.58203 15.6264 1.11932 14.413 1.11932C13.524 1.11932 12.7078 1.38931 11.9872 1.92171C11.3449 2.39637 10.8975 2.99642 10.6352 3.41627C10.5003 3.63217 10.2629 3.76105 10 3.76105C9.73709 3.76105 9.49966 3.63217 9.36478 3.41627C9.10263 2.99642 8.65524 2.39637 8.01285 1.92171C7.29218 1.38931 6.47598 1.11932 5.58716 1.11932Z');
    heartFill.setAttribute('d', 'M18.4134 1.66367C17.3781 0.590857 15.9575 0 14.413 0C13.2585 0 12.2012 0.348712 11.2704 1.03637C10.8008 1.38348 10.3752 1.80814 10 2.3038C9.62494 1.80829 9.19922 1.38348 8.7294 1.03637C7.79877 0.348712 6.74149 0 5.58701 0C4.04251 0 2.62177 0.590857 1.58646 1.66367C0.563507 2.72395 0 4.17244 0 5.74252C0 7.35852 0.630341 8.83778 1.98364 10.3979C3.19427 11.7935 4.93423 13.2102 6.94916 14.8507C7.63718 15.411 8.41705 16.046 9.22684 16.7224C9.44077 16.9015 9.71527 17 10 17C10.2846 17 10.5592 16.9015 10.7729 16.7227C11.5826 16.0461 12.363 15.4108 13.0513 14.8503C15.0659 13.2101 16.8059 11.7935 18.0165 10.3978C19.3698 8.83778 20 7.35852 20 5.74238C20 4.17244 19.4365 2.72395 18.4134 1.66367Z');
    cardIdLink.setAttribute('href', data.url);
    cardIdLink.setAttribute('target', '_blank');

    cardId.innerText = 'ID:';
    cardIdLink.innerHTML = `${data.id}  
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.54539 0H5.90903C5.65799 0 5.45448 0.203515 5.45448 0.45455C5.45448 0.705585 5.65799 0.9091 5.90903 0.9091H8.44803L3.76946 5.58768C3.59198 5.76516 3.59198 6.05298 3.76946 6.2305C3.85819 6.31923 3.97452 6.36362 4.09085 6.36362C4.20718 6.36362 4.32352 6.31923 4.41223 6.23048L9.09086 1.55191V4.09091C9.09086 4.34194 9.29437 4.54546 9.54541 4.54546C9.79644 4.54546 9.99996 4.34194 9.99996 4.09091V0.45455C9.99994 0.203515 9.79642 0 9.54539 0Z"/>
            <path d="M7.72725 4.54543C7.47622 4.54543 7.2727 4.74894 7.2727 4.99998V9.09089H0.90908V2.72725H4.99999C5.25103 2.72725 5.45454 2.52373 5.45454 2.2727C5.45454 2.02166 5.25103 1.81817 4.99999 1.81817H0.45455C0.203515 1.81817 0 2.02168 0 2.27272V9.54544C0 9.79645 0.203515 9.99997 0.45455 9.99997H7.72727C7.97831 9.99997 8.18182 9.79645 8.18182 9.54542V4.99998C8.1818 4.74894 7.97829 4.54543 7.72725 4.54543Z"/>
        </svg>`;
    jokesCardText.innerText = data.value;
    cardInfoUpdate.innerHTML = `<span>Last update:</span> ${hours} hours ago`;
    cardInfoCategory.innerText = data.categories[0];
    jokesCardIcon.innerHTML = `
        <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.2504 0H2.74963C1.23352 0 0 1.23328 0 2.74963V11.6238C0 13.1367 1.22815 14.368 2.73987 14.3734V18.4004L8.5271 14.3734H17.2504C18.7665 14.3734 20 13.1399 20 11.6238V2.74963C20 1.23328 18.7665 0 17.2504 0ZM18.8281 11.6238C18.8281 12.4937 18.1204 13.2015 17.2504 13.2015H8.15942L3.91174 16.1573V13.2015H2.74963C1.87964 13.2015 1.17188 12.4937 1.17188 11.6238V2.74963C1.17188 1.87952 1.87964 1.17188 2.74963 1.17188H17.2504C18.1204 1.17188 18.8281 1.87952 18.8281 2.74963V11.6238Z" fill="#ABABAB"/>
            <path d="M5.35303 4.14075H14.6472V5.31262H5.35303V4.14075Z" fill="#ABABAB"/>
            <path d="M5.35303 6.64075H14.6472V7.81262H5.35303V6.64075Z" fill="#ABABAB"/>
            <path d="M5.35303 9.14075H14.6472V10.3126H5.35303V9.14075Z" fill="#ABABAB"/>
        </svg>`;

    jokeCard.append(heart);
    jokeCard.append(cardId);
    heart.append(heartBorder);
    heart.append(heartFill);
    cardId.append(cardIdLink);
    jokeCard.append(jokesCardText);
    jokeCard.append(cardInfo);
    cardInfo.append(cardInfoUpdate);
    if(data.categories.length && !isFavourite) 
        cardInfo.append(cardInfoCategory);
    jokeCard.append(jokesCardIcon);

    heartFill.addEventListener('click', () => {
        heartFill.classList.toggle('jokes-card__heart-fill_checked');

        heartFill.classList.contains('jokes-card__heart-fill_checked') 
        ? renderFavJoke(data)
        : removeFavJoke(data);
    });

    return jokeCard;
};

function getUpdate(date) {
    let currentDate = new Date().getTime();
    let updateDate = new Date(date).getTime();
    let hours = (currentDate - updateDate) / 3600000;
    return parseInt(hours);
};

renderFavourites();