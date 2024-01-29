import { LightningElement } from 'lwc';
import fetch from '@salesforce/apex/AccountBatchFetchRequest.fetch';

export default class AccountBatchFetch extends LightningElement {
    message;
    error;
    handleOnClick(event) {
        fetch().then(result => {
            console.log(result);
            this.error = result.includes('Error');
            this.message = result;
        }).catch(error => {
            console.log(error);
        });
    }
}