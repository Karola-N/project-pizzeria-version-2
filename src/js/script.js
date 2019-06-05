/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
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
                input: 'input[name="amount"]',
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
            thisProduct.processOrder();
            console.log('new Product: ', thisProduct);
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
            //console.log('thisProduct.form', thisProduct.form);
            //console.log('thisProduct.formInputs', thisProduct.formInputs);
            //console.log('thisProduct.cartButton', thisProduct.cartButton);
            //console.log('thisProduct.priceElem', thisProduct.priceElem);
            console.log('thisProduct.imageWrapper', thisProduct.imageWrapper);
        }
        initAccordion() {
            const thisProduct = this;
            /* find the clickable trigger (the element that should react to clicking) */
            const clickableTrigger = thisProduct.accordionTrigger;
            console.log('clickableTrigger', clickableTrigger);
            /* START: click event listener to trigger */
            clickableTrigger.addEventListener('click', function(event) {
                /* prevent default action for event */
                event.preventDefault();
                /* toggle active class on element of thisProduct */
                thisProduct.element.classList.toggle('active');
                console.log('thisProduct.element', thisProduct.element);
                /* find all active products */
                const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
                console.log('activeProducts', activeProducts);
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
            console.log('--- Project.initOrderForm --- ');
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
            });
        }
        processOrder() {
            const thisProduct = this;
            console.log('thisProduct --------', thisProduct);
            console.log('--- Project.processOrder ---- ');
            const formData = utils.serializeFormToObject(thisProduct.form);
            console.log('formData: ', formData);
            var price = thisProduct.data.price;
            console.log('price: ', price);

            for (let paramId in thisProduct.data.params) {
                const param = thisProduct.data.params[paramId];
                //console.log('paramId: ', paramId);
                //console.log('param: ', param);
                for (let optionId in param.options) {
                    const option = param.options[optionId];
                    //console.log('optionId: ', optionId);
                    console.log('option: ', option);
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
            thisProduct.priceElem.innerHTML = price;
            console.log('thisProduct.priceElem: ', thisProduct.priceElem);
        }
    }
    const app = {
        initMenu: function() {
            const thisApp = this;
            console.log('thisApp.data: ', thisApp.data);
            for (let productData in thisApp.data.products) {
                new Product(productData, thisApp.data.products[productData]);
            }

        },
        initData: function() {
            const thisApp = this;
            thisApp.data = dataSource;
        },
        init: function() {
            const thisApp = this;
            console.log('*** App starting ***');
            console.log('thisApp:', thisApp);
            console.log('classNames:', classNames);
            console.log('settings:', settings);
            console.log('templates:', templates);
            thisApp.initData();
            thisApp.initMenu();
        },
    };

    app.init();
}
