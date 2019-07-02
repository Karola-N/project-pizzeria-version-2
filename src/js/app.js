import { Product } from './components/Product.js';
import { Cart } from './components/Cart.js';
import { Booking } from './components/Booking.js';
import { select, settings, classNames } from './settings.js';

const app = {
    initMenu: function() {
        const thisApp = this;
        //console.log('thisApp.data: ', thisApp.data);
        for (let productData in thisApp.data.products) {
            new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        }

    },
    initData: function() {
        const thisApp = this;
        thisApp.data = {};
        const url = settings.db.url + '/' + settings.db.product;
        fetch(url)
            .then(function(rawResponse) {
                return rawResponse.json();
            })
            /*change rawResponse.json to table */
            .then(function(parsedResponse) {
                console.log('parsedResponse: ', parsedResponse);
                /*save parsedResponse as thisApp.data.products */
                thisApp.data.products = parsedResponse;
                /*execute initMenu method */
                thisApp.initMenu();

            });
        console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    },
    initCart: function() {
        const self = this;
        const cartElem = document.querySelector(select.containerOf.cart);
        self.cart = new Cart(cartElem);
        self.productList = document.querySelector(select.containerOf.menu);
        self.productList.addEventListener('add-to-cart', function(event) {
            app.cart.add(event.detail.product);
        });
    },
    initPages: function() {
        const self = this;
        self.pages = Array.from(document.querySelector(select.containerOf.pages).children);
        //console.log('subpage wrapper', document.querySelector(select.containerOf.pages));
        //console.log('self.pages', self.pages);
        self.navLinks = Array.from(document.querySelectorAll(select.nav.links));
        //self.activatePage(self.pages[0].id);
        let pagesMachingHash = [];
        if (window.location.hash.length > 2) {
            const idFromHash = window.location.hash.replace('#/', '');
            pagesMachingHash = self.pages.filter(function(page){
                return page.id == idFromHash;
            });
        }
        self.activatePage(pagesMachingHash.length ? pagesMachingHash[0].id : self.pages[0].id);
        for (let link of self.navLinks) {
            link.addEventListener('click', function(event) {
                const clickedElement = this;
                event.preventDefault();
                /* DONE: get page id from href */
                const hrefClicked = clickedElement.getAttribute('href');
                const pageID = hrefClicked.replace('#', '');
                /* DONE: activate page */
                self.activatePage(pageID);
            });
        }
    },
    activatePage: function(pageId) {
        const self = this;
        for (let link of self.navLinks) {
            link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
        }
        for (let page of self.pages) {
            page.classList.toggle(classNames.nav.active, page.getAttribute('id') == pageId);
        }
        window.location.hash = '#/' + pageId;
    },
    initBooking: function(){
        const self = this;
        console.log('initBooking self',self);
        self.bookingWrapper = document.querySelector(select.containerOf.booking);
        console.log('Booking Wrapper', self.bookingWrapper);
        new Booking(self.bookingWrapper);
        self.navLinks[1].addEventListener('click', function(event) {
            event.preventDefault();
            self.bookingWrapper.innerHTML = 'Booking.dom.wrapper';
            console.log('self.bookingWrapper.innerHTML', self.bookingWrapper.innerHTML);
        });
    },
    init: function() {
        const thisApp = this;
        //console.log('*** App starting ***');
        //console.log('thisApp:', thisApp);
        //console.log('classNames:', classNames);
        //console.log('settings:', settings);
        //console.log('templates:', templates);
        thisApp.initPages();
        thisApp.initData();
        thisApp.initCart();
        thisApp.initBooking();
    },
};

app.init();
