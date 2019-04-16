//// Service Name: clickOutsideService
//// Description: This service has the methods to make invisible of the method when we click outside
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
angular.module('CCApp').factory('clickOutsideService', function ($document) {
  var tracker = [];

  return function ($scope, expr) {
    var i, t, len;
    for (i = 0, len = tracker.length; i < len; i++) {
      t = tracker[i];
      if (t.expr === expr && t.scope === $scope) {
        return t;
      }
    }
    var handler = function () {
      $scope.$apply(expr);
    };

    $document.on('click', handler);

    // IMPORTANT! Tear down this event handler when the scope is destroyed.
    $scope.$on('$destroy', function () {
      $document.off('click', handler);
    });

    t = { scope: $scope, expr: expr };
    tracker.push(t);
    return t;
  };
});