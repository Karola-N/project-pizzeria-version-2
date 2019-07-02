//import { CartProduct } from './CartProduct.js';
import { utils } from '../utils.js';
import { select, templates } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
export class Booking {
    constructor(wrapper) {
        const self = this;
        const BookingWrapper = wrapper;
        console.log('BookingWrapper', BookingWrapper);
        self.render(BookingWrapper);
        self.initWidgets();
    }
    render(BookingWrapper){
        const self = this;
        const generatedHTML = templates.bookingWidget();
        BookingWrapper.innerHTML = generatedHTML;
        //console.log('Booking-widget HTML', generatedHTML);
        self.dom = {};
        self.dom.wrapper = BookingWrapper;
        //console.log('Booking-widget wrapper', self.dom.wrapper);
        //console.log('self.dom', self.dom);
        self.dom.peopleAmount = self.dom.wrapper.querySelector(select.booking.peopleAmount);
        self.dom.hoursAmount = self.dom.wrapper.querySelector(select.booking.hoursAmount);
        //console.log('Booking.peopleAmount', self.dom.peopleAmount);
        //wrapper.innerHTML = generatedHTML;
    }
    initWidgets(){
        const self = this;
        self.peopleAmount = new AmountWidget(self.dom.peopleAmount);
        self.hoursAmount = new AmountWidget(self.dom.hoursAmount);
        //console.log('self.peopleAmount', self.peopleAmount);
        //console.log('self.hoursAmount', self.hoursAmount);
    }
}
