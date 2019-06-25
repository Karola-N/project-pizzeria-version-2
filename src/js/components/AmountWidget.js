import { select, settings } from '../settings.js';
export class AmountWidget {
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
