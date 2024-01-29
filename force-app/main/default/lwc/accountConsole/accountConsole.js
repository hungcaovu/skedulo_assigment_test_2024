import { LightningElement, track, wire } from 'lwc';
import getTypeOptions from '@salesforce/apex/AccountTypeOptions.getTypeOptions';
import searchAccount from '@salesforce/apex/AccountConsole.searchAccount';


export default class AccountConsole extends LightningElement {

    clickedButtonLabel;
    nameValue = ''; // Name 
    typeValue = ''; // Type
    @track
    typeOptions = [];
    
    ownerLengthValue = 0;
    ownerValues = []; // Selected Owner
    annualRevenueValue = 1000000000; // Annual
    rowPerPageValue='10';
    startCursor = '';
    endCursor = '';
    
    @track page = 0; 
    @track items = []; 
    @track data = []; 
    @track startingRecord = 0;
    @track endingRecord = 0; 
    @track pageSize = 10; 
    @track totalRecountCount = 0;
    @track totalPage = 0;

    handleNameInputChange(event){
        this.nameValue = event.detail.value;
    }

    @wire(getTypeOptions)
    typeWireOptions({ error, data }) {
        if (data) {
            this.typeOptions = data.map(record => ({
                value: record,
                label: record
            }));
            console.log("getTypeOptions "  + data.length);
        } else if (error) {
            // handle error
            console.log(error);
        }
        
    }

    handleTypeChange(event) {
        this.typeValue = event.detail.value;
    }

    handleselectedOwnerRecords(event) {
        console.log('handleselectedOwnerRecords');
        var values = [...event.detail.selRecords]
        this.ownerLengthValue = values.length;
        
        this.ownerValues = [];
        for (let i = 0; i < values.length; i++) {
            console.log('this.ownerValues[i].Id--------->' + values[i].Id);
            this.ownerValues.push(values[i].Id)
        }

        console.log(this.ownerValues);

    }

    handleAnnualRevenueChange(event){
        this.annualRevenueValue = event.detail.value;
    }

    get rowPerPageOptions() {
        return [
            { label: '10', value: '10' },
            { label: '20', value: '20' },
            { label: '50', value: '50' },
        ];
    }

    handleRowPerPageChange(event){
        this.rowPerPageValue = event.detail.value;
        this.pageSize = parseInt(this.rowPerPageValue);
    }

    handleSearchClick(event) {
        this.clickedButtonLabel = event.target.label;
        console.log("handleSearchClick");
        console.log(this.ownerValues);
        this.searchField(this.startCursor);
    }

    searchField(cursor) {
        console.log("searchField");
        console.log(this);
        searchAccount({
            name: this.nameValue, 
            type: this.typeValue, 
            owners: this.ownerValues, 
            revenue: this.annualRevenueValue, 
            row: this.pageSize, 
            cursor: cursor
            })
            .then(result => {
                this.processRecords(result);
                console.log(result);
            }).catch(error => {
                console.log(error);
            });
    }

    handleGenerateCSVClick(event) {
        console.log('handleGenerateCSVClick');
        this.clickedButtonLabel = event.target.label;
        let csvData = []

        csvData.push(
            [
                'No',
                'Account Name',
                'Owner',
                'Phone Number',
                'Annual Revenue',
                'Last Modified Date'
            ]
        );

        const cleanData = function (field) {
            if (field === undefined) {
                return ''; // Handle null and undefined
            }
            return (typeof field === 'string' && field.includes(',')) ? '\"' + field + '\"' : field;
          };

        this.items.forEach((item) => {
            csvData.push([
                item.Index,
                cleanData(item.AccountName),
                cleanData(item.OwnerName),
                cleanData(item.PhoneNumber),
                cleanData(item.AnnualRevenue),
                cleanData(item.LastModifiedDate)
            ]);
        })
        let csvFile = csvData.map(e => e.join(",")).join("\n");
        this.createLinkForDownload(csvFile);
    }

    createLinkForDownload(csvFile) {
        const downLink = document.createElement("a");
        downLink.href = "data:text/csv;charset=utf-8," + encodeURI(csvFile);
        downLink.target = '_blank';
        downLink.download = "Account_Record_Data.csv"
        downLink.click();
    }
    
    timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now - date);
        const seconds = Math.round(diff / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
        const months = Math.round(days / 30);
        const years = Math.round(months / 12);
    
        if (seconds < 60) {
            return 'just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (days < 30) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (months < 12) {
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else if (years >= 1) {
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    }

    processRecords(data){
        console.log("processRecords");
        let items = [];
        data.forEach((item, index) => {
            console.log(item);
            let colourClass = 'greenColor';
            if (item.AnnualRevenue === undefined || item.AnnualRevenue <= 10000){
                colourClass = "redColor";
            }  
            else if (item.AnnualRevenue <= 50000) {
                colourClass = "yellowColor";
            }
            items.push({
                'Index': index + 1,
                'AccountName': item.Name,
                'AccountId': item.Id,
                'OwnerName': item.Owner.Name,
                'OwnerId': item.Owner.Id,
                'AccountUrlView': '/lightning/r/Account/' + item.Id + '/view',
                'OwnerUrlView': '/lightning/r/User/'+ item.Owner.Id +'/view',
                'PhoneNumber': item.Phone,
                'AnnualRevenue': item.AnnualRevenue,
                'ColourClass': colourClass,
                'LastModifiedDate': this.timeAgo(item.LastModifiedDate)
            });
        });
        this.items = items;
        this.totalRecountCount = data.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        
        this.data = this.items.slice(0,this.pageSize); 

        if (this.totalPage > 0) {
            this.page = 1;
        } else {
            this.page = 0;
        }
        this.endingRecord = this.pageSize;
    }

    previousHandler() {
        console.log("previousHandler");
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }

    }

    nextHandler() {
        console.log("previousHandler");
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }
    }

    displayRecordPerPage(page){
        console.log("displayRecordPerPage");
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }    
}
    