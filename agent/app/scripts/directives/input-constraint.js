/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
 (function () {
  'use strict';
 angular.module("CCApp").directive("inputConstraint", function () {
    var isValidMaximumAttribute = function (maxvalue) {
      try {
        if (maxvalue != '' && maxvalue != undefined) {
          parseInt(maxvalue);
          return true;
        } else {
          return false;
        }

      } catch (ex) {
        return false;
      }
    };
    var hasRegxPattern = function (pattern) {
      if (pattern == '' || pattern == undefined) {
        return false;
      } else {
        return true;
      }
    };

    return {
      restrict: "A",
      link: function (scope, elem, attrs) {
        elem.on('paste', function (event) {
          event.preventDefault();
        });

        elem.on('keypress', function (event) {

          if (isValidMaximumAttribute(attrs.max) && this.value.length === parseInt(attrs.max)) {
            event.preventDefault();
            return;
          }

          if (hasRegxPattern(attrs.regex)) {
            var regex = new RegExp(attrs.regex);
            var char = String.fromCharCode(event.which || event.charCode || event.keyCode);
            if (!regex.test(char)) {
              event.preventDefault();
              return;
            }
          }
        });
      }
    };
  });
  })();
