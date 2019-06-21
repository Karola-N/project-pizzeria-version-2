/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
            cartProduct: '#template-cart-product', // CODE ADDED
        },
        containerOf: {
            menu: '#product-list',
            cart: '#cart',
        },
        all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
        },
        menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
        },
        widgets: {
            amount: {
                input: 'input.amount', // CODE CHANGED
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
        // CODE ADDED START
        cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',
        },
        cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
        },
        // CODE ADDED END
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
        // CODE ADDED START
        cart: {
            wrapperActive: 'active',
        },
        // CODE ADDED END
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }, // CODE CHANGED
        // CODE ADDED START
        cart: {
            defaultDeliveryFee: 20,
        },
        // CODE ADDED END
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
        // CODE ADDED START
        cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
        // CODE ADDED END
    };

    class Product {
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
            app.cart.add(self);
        }
    }
    class AmountWidget {
        constructor(element) {
            /* self == thisWidget */
            const self = this;
            self.getElements(element);
            self.value = settings.amountWidget.defaultValue;
            self.setValue(self.input.value);
            self.initActions();
            //console.log('AmountWidget', self);
            //console.log('constructor arguments: ', element);
        }
        getElements(element) {
            const self = this;
            self.element = element;
            self.input = self.element.querySelector(select.widgets.amount.input);
            self.linkDecrease = self.element.querySelector(select.widgets.amount.linkDecrease);
            self.linkIncrease = self.element.querySelector(select.widgets.amount.linkIncrease);
        }
        setValue(value) {
            const self = this;
            const newValue = parseInt(value);
            /* newValue validation */
            if (newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
                self.value = newValue;
                self.announce();
            }
            self.input.value = self.value;
        }
        initActions() {
            const self = this;
            self.input.addEventListener('change', function() {
                self.setValue(self.input.value);
            });
            self.linkDecrease.addEventListener('click', function(event) {
                event.preventDefault();
                self.setValue(self.value - 1);
            });
            self.linkIncrease.addEventListener('click', function(event) {
                event.preventDefault();
                self.setValue(self.value + 1);
            });
        }
        announce() {
            const self = this;
            const event = new CustomEvent('updated', {
                bubbles: true
            });
            self.element.dispatchEvent(event);
        }
    }
    class Cart {
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
            self.dom = {};
            self.dom.wrapper = element;
            self.dom.toggleTrigger = self.dom.wrapper.querySelector(select.cart.toggleTrigger);
            //console.log('Cart toggleTrigger: ', self.dom.toggleTrigger);
            self.dom.productList = document.querySelector(select.cart.productList);
            self.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
            for (let key of self.renderTotalsKeys) {
                self.dom[key] = self.dom.wrapper.querySelectorAll(select.cart[key]);
            }
        }
        initActions() {
            const self = this;
            self.dom.toggleTrigger.addEventListener('click', function(event) {
                event.preventDefault();
                self.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
            });
            self.dom.productList.addEventListener('updated', function() {
                self.uptade();
            });
            self.dom.productList.addEventListener('remove', function() {
                self.remove(event.detail.cartProduct);
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
            console.log('self.products', self.products);
            self.uptade();
        }
        uptade() {
            const self = this;
            self.totalNumber = 0;
            self.subtotalPrice = 0;
            self.totalPrice = self.price;
            console.log('update self.products', self.products);
            for (let p of self.products) {
                self.subtotalPrice = self.subtotalPrice + p.price;
                self.totalNumber = self.totalNumber + p.amount;
                //console.log('p.subtotalPrice', self.subtotalPrice);
                //console.log('p.totalNumber', self.totalNumber);
            }
            self.totalPrice = self.subtotalPrice + self.deliveryFee;
            console.log('self.totalPrice', self.totalPrice);
            for (let key of self.renderTotalsKeys) {
                for (let elem of self.dom[key]) {
                    elem.innerHTML = self[key];
                }
            }
        }
        remove(cartProduct) {
            const self = this;
            const index = self.products.indexOf(cartProduct);
            const removeElem = self.products.splice(index);
            //console.log('cartProduct', cartProduct);
            //console.log('index', index);
            //console.log('removeElem', removeElem);
            //console.log('cartProduct.dom.wrapper', cartProduct.dom.wrapper);
            //console.log('self.dom.wrapper', self.dom.wrapper);
            cartProduct.dom.wrapper.remove();
            self.uptade();
        }
    }
    class CartProduct {
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
            console.log('new CartProduct', self);
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
            console.log('remove');
        }
        initActions() {
            const self = this;
            /*self.dom.edit.addEventListener('click', function(event) {
                event.preventDefault();

            });*/
            self.dom.remove.addEventListener('click', function() {
                event.preventDefault();
                self.remove();
            });
        }
    }
    const app = {
        initMenu: function() {
            const thisApp = this;
            //console.log('thisApp.data: ', thisApp.data);
            for (let productData in thisApp.data.products) {
                new Product(productData, thisApp.data.products[productData]);
            }

        },
        initData: function() {
            const thisApp = this;
            thisApp.data = dataSource;
        },
        initCart: function() {
            const self = this;
            const cartElem = document.querySelector(select.containerOf.cart);
            self.cart = new Cart(cartElem);
        },
        init: function() {
            const thisApp = this;
            //console.log('*** App starting ***');
            //console.log('thisApp:', thisApp);
            //console.log('classNames:', classNames);
            //console.log('settings:', settings);
            //console.log('templates:', templates);
            thisApp.initData();
            thisApp.initMenu();
            thisApp.initCart();
        },
    };

    app.init();
}
