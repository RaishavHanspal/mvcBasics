//CUSTOM EVENT EMITTER

class EventEmitter {
    static events = {};
    emit(name, data) {
        if (!EventEmitter.events[name])
            console.log(`${name} is not subcribed anywhere`);
        else
            EventEmitter.events[name].forEach(callback => {
                callback(data);
            });
    }

    subscribe(name, callback) {
        if (!EventEmitter.events[name])
            EventEmitter.events[name] = [callback];
        else
            EventEmitter.events[name].push(callback);
    }
}

class UniversalModel {
    navOptionData = {
        'Bored': {
            URL: 'https://www.boredapi.com/api/activity',
            CLASS: BoredView,
        },
        'BitCoin': {
            URL: 'https://api.coindesk.com/v1/bpi/currentprice.json',
            CLASS: BitCoinView,
        },
        'Dogs': {
            URL: 'https://dog.ceo/api/breeds/image/random',
            CLASS: DogsView,
        }
    };

    static navViewData = {};

    getNavURLByName(name) {
        return this.navOptionData[name].URL;
    }

    getNavCLASSByName(name) {
        return this.navOptionData[name].CLASS;
    }

    setNavDATAByName(name, data) {
        UniversalModel.navViewData[name] = data;
    }

    getNavDATAByName(name) {
        return UniversalModel.navViewData[name];
    }
}

//DATA SERVICE CLASS

class DataService {
    model = new UniversalModel();
    constructor() {
        _navigator.subscribe(CONSTANTS.NAV_OPTION_CLICKED, (option) => {
            this.fetchData(this.model.getNavURLByName(option), option);
        });
    }

    fetchData(URL, option) {
        fetch(URL).then(response => response.json()).then(data => {
            this.model.setNavDATAByName(option, data);
            _navigator.emit(CONSTANTS.VIEW_DATA_UPDATED, option);
        });
    }
}

//LANDING

class LandingModel extends UniversalModel {
    //getter and setter of all the dynamic models.
    options = ['Bored', 'BitCoin', 'Dogs'];
    getOptions() {
        return this.options;
    };
}

class LandingView {
    //setting up and altering the DOM. 
    model; navBody;
    constructor(model) {
        this.model = model;
        this.navBody = document.createElement('div');
    }

    addNavButtons(option) {
        let button = document.createElement('button');
        button.innerText = option;
        this.navBody.appendChild(button);
        return button;
    }

    appendNavBody() {
        document.querySelector('body').appendChild(this.navBody);
    }
}

class LandingController {
    //execution of the flow i.e. main logic.
    view; model;
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.init();
    }

    init() {
        this.initializeNavigation();
        this.initializeViews();
    }

    initializeNavigation() {
        this.model.getOptions().forEach((option) => {
            let button = this.view.addNavButtons(option);
            button.addEventListener('click', () => {
                _navigator.emit(CONSTANTS.NAV_OPTION_CLICKED, option);
            })
        });
        this.view.appendNavBody();
    }

    initializeViews() {
        this.model.getOptions().forEach((option) => {
            let view = new (this.model.getNavCLASSByName(option))(this.model);
            view.initializeView(option);
        })
    }
}

class BoredView {
    view;
    constructor(model) {
        this.model = model;
        this.updateData();
    }

    initializeView(option) {
        this.view = document.createElement('div');
        this.view.setAttribute('id', option);
        this.view.style.display = 'none';
        document.querySelector('body').appendChild(this.view);
    }

    updateData() {
        _navigator.subscribe(CONSTANTS.VIEW_DATA_UPDATED, (viewActive) => {
            if (this.view.id === viewActive) {
                this.view.style.display = 'block';
                const data = this.model.getNavDATAByName(this.view.id);
                const entry = document.createElement('div');
                entry.innerHTML = `<strong>${data.activity}</strong> (${data.type}) <a href="${data.link}">${data.link}</a>`;
                this.view.prepend(entry);
            }
            else
                this.view.style.display = 'none';
        });
    }
}

class BitCoinView {
    view; 
    constructor(model) {
        this.model = model;
        this.updateData();

    }
    initializeView(option) {
        this.view = document.createElement('div');
        this.view.setAttribute('id', option);
        this.view.style.display = 'none';
        document.querySelector('body').appendChild(this.view);
    }

    updateData() {
        _navigator.subscribe(CONSTANTS.VIEW_DATA_UPDATED, (viewActive) => {
            if (this.view.id === viewActive) {
                this.view.style.display = 'block';
                const data = this.model.getNavDATAByName(this.view.id);
                const entry = document.createElement('div');
                entry.innerHTML = `<strong>${data.bpi.USD.symbol}  ${data.bpi.USD.rate}</strong> (${data.bpi.USD.description})`;
                this.view.prepend(entry);
            }
            else
                this.view.style.display = 'none';
        });
    }
}

class DogsView {
    view; model;
    constructor(model) {
        this.model = model;
        this.updateData();
    }

    initializeView(option) {
        this.view = document.createElement('div');
        this.view.setAttribute('id', option);
        this.view.style.display = 'none';
        document.querySelector('body').appendChild(this.view);
    }

    updateData() {
        _navigator.subscribe(CONSTANTS.VIEW_DATA_UPDATED, (viewActive) => {
            if (this.view.id === viewActive) {
                this.view.style.display = 'block';
                const data = this.model.getNavDATAByName(this.view.id);
                const entry = document.createElement('span');
                entry.innerHTML = `<img src="${data.message}">`;
                this.view.prepend(entry);
            }
            else
                this.view.style.display = 'none';
        });
    }
}
const CONSTANTS = {
    NAV_OPTION_CLICKED: 'NAV_OPTION_CLICKED',
    VIEW_DATA_UPDATED: 'VIEW_DATA_UPDATED'
}

window.addEventListener('DOMContentLoaded', () => {
    _navigator = new EventEmitter();
    _dataService = new DataService();
    const landingModel = new LandingModel();
    const landingView = new LandingView(landingModel);
    new LandingController(landingView, landingModel);
})
