angular.module('app.filters', []).filter('filterPinned', function() {
   function isPinned(obj) {
       return obj && obj.pinned;
   }

   return function(objs, showPinnedOnly) {
     // if it is to show all, we just return the original array,
     // if not, we go on and filter the boxes in the same way.
     return !showPinnedOnly ? objs : objs.filter(isPinned);
   };
})