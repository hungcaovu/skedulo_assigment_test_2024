public with sharing class AccountBatchFetchRequest {
    public static Boolean isBatchRunning() {
        for (AsyncApexJob job : [SELECT Id, Status FROM AsyncApexJob WHERE ApexClass.Name = 'AccountBatchFetch' AND (Status = 'Processing' OR Status = 'Queued')]) {
            if (job.Status == 'Processing' || job.Status == 'Queued') {
                return true;
            }
        }
        return false;
    }

    @AuraEnabled(cacheable=true) 
    public static String fetch()
    {
        if (!isBatchRunning()) {
            AccountBatchFetch uca = new AccountBatchFetch();
            Id batchId = Database.executeBatch(uca);
            return 'Batch excuting with Id: ' + batchId;
        } else {
            return 'Error: Account Fetching is running!';
        }
    }
}