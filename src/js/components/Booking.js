//import { CartProduct } from './CartProduct.js';
import { utils } from '../utils.js';
import { select, templates } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
export class Booking {
    constructor() {
        const self = this;
        console.log('class Booking', self);
        self.render();
        self.initWidgets();
    }
    render(){
        const self = this;
        const generatedHTML = templates.bookingWidget();
        //console.log('generatedHTML Booking', generatedHTML);
        self.dom = {};
        self.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
        console.log('Booking-render wrapper', self.dom.wrapper);
        //console.log('self.dom', self.dom);
        self.dom.peopleAmount = self.dom.wrapper.querySelector(select.booking.peopleAmount);
        self.dom.hoursAmount = self.dom.wrapper.querySelector(select.booking.hoursAmount);
        //console.log('Booking.peopleAmount', self.dom.peopleAmount);
        //wrapper.innerHTML = self.dom.wrapper;
    }
    initWidgets(){
        const self = this;
        self.peopleAmount = new AmountWidget(self.dom.peopleAmount);
        self.hoursAmount = new AmountWidget(self.dom.hoursAmount);
        //console.log('self.peopleAmount', self.peopleAmount);
        //console.log('self.hoursAmount', self.hoursAmount);
    }
}
