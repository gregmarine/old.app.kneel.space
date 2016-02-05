angular.module('app.filters', []).filter('filterPinned', function() {
   function isPinned(list) {
       return list && list.pinned;
   }

   return function(lists, showPinnedOnly) {
     // if it is to show all, we just return the original array,
     // if not, we go on and filter the lists in the same way.
     return !showPinnedOnly ? lists : lists.filter(isPinned);
   };
})