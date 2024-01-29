public with sharing class AccountTypeOptions {
    @AuraEnabled(cacheable=true)
    public static List<String> getTypeOptions() {
        List<String> options = new List<String>();

        for (AggregateResult ar : [SELECT Type FROM Account GROUP BY Type]) {
            String type = (String)ar.get('Type');
            if (type == NULL) {
                options.add('- NULL -');
            }
            else {
                options.add(type);
            }
        }
        return options;
    }
}