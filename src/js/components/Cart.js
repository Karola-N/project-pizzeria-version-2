import { select, settings, classNames, templates } from '../settings.js';
import { CartProduct } from './CartProduct.js';
import { utils } from '../utils.js';
export class Cart {
    constructor(element) {
        const self = this;
        self.products = [];
        self.deliveryFee = settings.cart.defaultDeliveryFee;
        self.getElements(element);
        self.initActions();
        //console.log('new Cart: ', self);
    }
    getElements(element) {
        const self = this;
        //console.log('self', self);
        self.dom = {};
        self.dom.wrapper = element;
        self.dom.toggleTrigger = self.dom.wrapper.querySelector(select.cart.toggleTrigger);
        //console.log('Cart toggleTrigger: ', self.dom.toggleTrigger);
        self.dom.productList = document.querySelector(select.cart.productList);
        self.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
        for (let key of self.renderTotalsKeys) {
            self.dom[key] = self.dom.wrapper.querySelectorAll(select.cart[key]);
        }
        self.dom.form = self.dom.wrapper.querySelector(select.cart.form);
        self.dom.phone = self.dom.wrapper.querySelector(select.cart.phone);
        self.dom.address = self.dom.wrapper.querySelector(select.cart.address);
        //console.log('self.dom.form', self.dom.form);
        //console.log('self.dom.phone', self.dom.phone);
        //console.log('self.dom.address', self.dom.address);
    }
    initActions() {
        const self = this;
        self.dom.toggleTrigger.addEventListener('click', function(event) {
            event.preventDefault();
            self.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });
        self.dom.productList.addEventListener('updated', function() {
            self.update();
        });
        self.dom.productList.addEventListener('remove', function(event) {
            self.remove(event.detail.cartProduct);
        });
        /* prevent page reload after cklicking ORDER button and initiate sendOrder method*/
        self.dom.form.addEventListener('submit', function(event) {
            event.preventDefault();
            self.sendOrder();
        });
    }
    add(menuProduct) {
        const self = this;
        //console.log('adding product', menuProduct);
        const generatedHTML = templates.cartProduct(menuProduct);
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        self.dom.productList.appendChild(generatedDOM);
        //console.log('generatedHTML', generatedHTML);
        //console.log('generatedDOM', generatedDOM);
        //console.log('self.dom', self.dom);
        //console.log('self.dom.productList', self.dom.productList);
        self.products.push(new CartProduct(menuProduct, generatedDOM));
        //onsole.log('self.products', self.products);
        self.update();
    }
    update() {
        const self = this;
        self.totalNumber = 0;
        self.subtotalPrice = 0;
        self.totalPrice = self.price;
        //console.log('update self.products', self.products);
        for (let p of self.products) {
            self.subtotalPrice = self.subtotalPrice + p.price;
            self.totalNumber = self.totalNumber + p.amount;
            //console.log('p.subtotalPrice', self.subtotalPrice);
            //console.log('p.totalNumber', self.totalNumber);
        }
        self.totalPrice = self.subtotalPrice + self.deliveryFee;
        //console.log('self.totalPrice', self.totalPrice);
        for (let key of self.renderTotalsKeys) {
            for (let elem of self.dom[key]) {
                elem.innerHTML = self[key];
            }
        }
    }
    remove(cartProduct) {
        const self = this;
        const index = self.products.indexOf(cartProduct);
        self.products.splice(index, 1);
        cartProduct.dom.wrapper.remove();
        self.update();
    }
    sendOrder() {
        const self = this;
        const url = settings.db.url + '/' + settings.db.order;
        /* payload consists of data send to server */
        const payload = {
            phone: self.dom.phone.value,
            address: self.dom.address.value,
            totalNumber: self.totalNumber,
            subtotalPrice: self.subtotalPrice,
            deliveryFee: self.deliveryFee,
            totalPrice: self.totalPrice,
            products: self.products,
        };
        for (let p of self.products) {
            p.getData();
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };
        fetch(url, options)
            .then(function(response) {
                return response.json();
            }).then(function(parsedResponse) {
                console.log('parsedResponse', parsedResponse);
            });
    }
}
