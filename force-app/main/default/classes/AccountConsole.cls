public with sharing class AccountConsole {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccount(String name, String type, List<String> owners, String revenue, String row, String cursor) {
      
       String query = 'SELECT Id, Name, Owner.Id, Owner.Name, Phone, LastModifiedDate, AnnualRevenue FROM Account'; 
       List<String> conditions = new List<String>();
       if (String.isNotEmpty(name)) {
          conditions.add(' Name  LIKE \'%' + name.trim() + '%\' ');
       }

       if ('- NULL -'.equals(type)) {
         conditions.add(' Type = NULL ');
       }
       else if (String.isNotEmpty(type)) {
         conditions.add(' Type = \''+ type + '\' ');
       }

       if (owners.size() > 0) {
          conditions.add(' Owner.Id IN: owners ');
       }

       if (String.isNotEmpty(revenue)) {
          conditions.add(' ( AnnualRevenue < ' + revenue + ' OR AnnualRevenue = NULL ) ');
       }

       if (conditions.size() > 0){
          query += ' WHERE ' + String.join(conditions, ' AND ');
       }

       return Database.Query(query);
   }
}