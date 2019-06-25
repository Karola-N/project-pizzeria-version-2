import { select } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
export class CartProduct {
    constructor(menuProduct, element) {
        const self = this;
        self.id = menuProduct.id;
        self.name = menuProduct.name;
        self.price = menuProduct.price;
        self.priceSingle = menuProduct.priceSingle;
        self.amount = menuProduct.amountWidget.value;
        self.params = JSON.parse(JSON.stringify(menuProduct.params));
        self.getElements(element);
        self.initAmountWidget();
        self.initActions();
        //console.log('new CartProduct', self);
        //console.log('Product Data', menuProduct);
    }
    getElements(element) {
        const self = this;
        self.dom = {};
        self.dom.wrapper = element;
        self.dom.amountWidget = self.dom.wrapper.querySelector(select.cartProduct.amountWidget);
        //console.log('self.dom.amountWidget', self.dom.amountWidget);
        self.dom.price = self.dom.wrapper.querySelector(select.cartProduct.price);
        self.dom.edit = self.dom.wrapper.querySelector(select.cartProduct.edit);
        self.dom.remove = self.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    initAmountWidget() {
        const self = this;
        self.amountWidget = new AmountWidget(self.dom.amountWidget);
        self.dom.amountWidget.addEventListener('updated', function() {
            self.amount = self.amountWidget.value;
            self.price = self.priceSingle * self.amount;
            self.dom.price.innerHTML = self.price;
            //console.log('self.price', self.price);
        });
    }
    remove() {
        const self = this;
        const event = new CustomEvent('remove', {
            bubbles: true,
            detail: {
                cartProduct: self,
            },
        });
        self.dom.wrapper.dispatchEvent(event);
        //console.log('Method remove');
    }
    initActions() {
        const self = this;
        /*self.dom.edit.addEventListener('click', function(event) {
            event.preventDefault();

        });*/
        self.dom.remove.addEventListener('click', function(event) {
            event.preventDefault();
            self.remove();
        });
    }
    getData() {
        const self = this;
        const data = [self.id, self.amount, self.priceSingle, self.params];
        return (data);
    }
}
