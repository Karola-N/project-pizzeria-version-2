import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
export class Product {
    constructor(id, data) {
        const thisProduct = this;
        thisProduct.id = id;
        thisProduct.data = data;
        thisProduct.renderInMenu();
        thisProduct.getElements();
        thisProduct.initAccordion();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget();
        thisProduct.processOrder();
        //console.log('new Product: ', thisProduct);
    }
    renderInMenu() {
        const thisProduct = this;
        /* generate HTML based on template */
        const generatedHTML = templates.menuProduct(thisProduct.data);
        // console.log('generatedHTML: ', generatedHTML);
        /* create element using utils.createElementFromHTML */
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        //console.log('thisProduct.element: ', thisProduct.element);
        /* find menu container */
        const menuContainer = document.querySelector(select.containerOf.menu);
        /* add element to menu */
        menuContainer.appendChild(thisProduct.element);
        //console.log('menuContainer: ', menuContainer);
    }
    getElements() {
        const thisProduct = this;
        thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
        thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); /* find order options */
        thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
        thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
        thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
        thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
        //console.log('thisProduct.form', thisProduct.form);
        //console.log('thisProduct.formInputs', thisProduct.formInputs);
        //console.log('thisProduct.cartButton', thisProduct.cartButton);
        //console.log('thisProduct.priceElem', thisProduct.priceElem);
        //console.log('thisProduct.imageWrapper', thisProduct.imageWrapper);
        //console.log('thisProduct.amountWidgetElem', thisProduct.amountWidgetElem);
    }
    initAccordion() {
        const thisProduct = this;
        /* find the clickable trigger (the element that should react to clicking) */
        const clickableTrigger = thisProduct.accordionTrigger;
        //console.log('clickableTrigger', clickableTrigger);
        /* START: click event listener to trigger */
        clickableTrigger.addEventListener('click', function(event) {
            /* prevent default action for event */
            event.preventDefault();
            /* toggle active class on element of thisProduct */
            thisProduct.element.classList.toggle('active');
            //console.log('thisProduct.element', thisProduct.element);
            /* find all active products */
            const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
            //console.log('activeProducts', activeProducts);
            /* START LOOP: for each active product */
            for (let activeProduct of activeProducts) {
                /* START: if the active product isn't the element of thisProduct */
                if (activeProduct != thisProduct.element) {
                    /* remove class active for the active product */
                    activeProduct.classList.remove('active');
                    /* END: if the active product isn't the element of thisProduct */
                }
                /* END LOOP: for each active product */
            }
            /* END: click event listener to trigger */
        });
    }
    initOrderForm() {
        const thisProduct = this;
        //console.log('--- Project.initOrderForm --- ');
        thisProduct.form.addEventListener('submit', function(event) {
            event.preventDefault();
            thisProduct.processOrder();
        });
        for (let input of thisProduct.formInputs) {
            input.addEventListener('change', function() {
                thisProduct.processOrder();
            });
        }
        thisProduct.cartButton.addEventListener('click', function(event) {
            event.preventDefault();
            thisProduct.processOrder();
            thisProduct.addToCart();
        });
    }
    processOrder() {
        const thisProduct = this;
        //console.log('thisProduct --------', thisProduct);
        //console.log('--- Project.processOrder ---- ');
        const formData = utils.serializeFormToObject(thisProduct.form);
        //console.log('formData: ', formData);
        thisProduct.params = {};
        var price = thisProduct.data.price;
        //console.log('price: ', price);

        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];
            //console.log('paramId: ', paramId);
            //console.log('param: ', param);
            for (let optionId in param.options) {
                const option = param.options[optionId];
                //console.log('optionId: ', optionId);
                //console.log('option: ', option);
                /* START IF: if option is selected but is not default */
                const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
                if (optionSelected && !option.default) {
                    /* add price of option to variable price */
                    price = price + option.price;
                    /* START ELSE IF: if option is not selected but is default */
                } else if (!optionSelected && option.default) {
                    /* remove price of option from price */
                    price = price - option.price;
                }
                /* START IF ELSE: add/remove class active from image based on chosen option in param*/
                const className = '.' + paramId + '-' + optionId;
                const img = thisProduct.imageWrapper.querySelectorAll(className);
                //console.log('className: ', className);
                if (optionSelected) {
                    if (!thisProduct.params[paramId]) {
                        thisProduct.params[paramId] = {
                            label: param.label,
                            options: {},
                        };
                    }
                    thisProduct.params[paramId].options[optionId] = option.label;
                    for (let i of img) {
                        i.classList.add(classNames.menuProduct.imageVisible);
                    }
                } else {
                    for (let i of img) {
                        i.classList.remove(classNames.menuProduct.imageVisible);
                    }
                }
            }
        }
        //console.log('thisProduct.params', thisProduct.data.params);
        /* multiply price by amount */
        thisProduct.priceSingle = price;
        thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
        thisProduct.priceElem.innerHTML = thisProduct.price;
        //console.log('thisProduct.priceElem: ', thisProduct.priceElem);
    }
    initAmountWidget() {
        /* self == thisProduct*/
        const self = this;
        self.amountWidget = new AmountWidget(self.amountWidgetElem);
        self.amountWidgetElem.addEventListener('updated', function() {
            self.processOrder();
        });
    }
    addToCart() {
        const self = this;
        self.name = self.data.name;
        self.amount = self.amountWidget.value;
        /* change "app.cart.add(self);" to event*/
        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: self,
            },
        });
        self.element.dispatchEvent(event);
    }
}
