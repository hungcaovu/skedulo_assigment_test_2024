public with sharing class ReusableMultiSelectLookupCtrl {

    public class Option {
        @AuraEnabled
        public String Id;
        @AuraEnabled
        public String Name;
    }

    @AuraEnabled(cacheable=true)
    public static List<Option> retriveSearchData(String value, List<String> selectedRecId) {
        List<Option> resultList = new List<Option>();
        if(selectedRecId == null)
            selectedRecId = new List<String>();

        if(String.isNotEmpty(value)) {
            String query = 'SELECT Owner.Id, Owner.Name, COUNT(Id) FROM Account Where Owner.Name LIKE \'%' + value.trim() + '%\' and Owner.Id NOT IN: selectedRecId  GROUP BY Owner.Id, Owner.Name ';

            for(AggregateResult ar : Database.Query(query)) {
                System.debug('ar: ' + ar);
                Option op = new Option();
                op.Id = (String)ar.get('Id');
                op.Name = (String)ar.get('Name');
                resultList.add(op);
            }   
        }
        return resultList;
    }
}