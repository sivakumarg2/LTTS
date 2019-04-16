//// Service Name: routes
//// Description: This has all the routes register in the application
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Routes($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    $stateProvider.state('main', {
      url: "/",
      templateUrl: "views/layouts/mainApp.html"
    });

    $stateProvider.state('app', {
      url: "/",
      templateUrl: "views/layouts/app.html"
    });


    $stateProvider.state('login', {
      url: "login",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/login.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('change-pwd', {
      url: "change-pwd",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/change-password.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('user-profile', {
      url: "user-profile",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/user-profile.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });
    
    /*$stateProvider.state('join-room', {
      url: "join-room?cpuri",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/cp-call.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });*/

    $stateProvider.state('sync-poc', {
      url: "sync-poc",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/sync-poc.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });
    $stateProvider.state('join-room', {
      url: "join-room?cpuri",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/cp-call.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('win-app', {
      url: "win-app?sender",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/winAppView.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('dashboard', {
      url: "dashboard",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/dashboard.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('super-dash', {
      url: "super-dash",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/supervisor-dashboard.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('agent-report', {
      url: "agent-report",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/supervisor-dashboard-report.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('report', {
      url: "report",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/report.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('country-settns', {
      url: "country-settns",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/country-settings.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('call-dispn', {
      url: "call-dispn",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/call-disposition.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('country-call-dispsn', {
      url: "country-call-dispsn",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/country-call-disposition.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('shutdown-reason', {
      url: "shutdown-reason",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/shutdown-reason.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('country-shutdown-reason', {
      url: "country-shutdown-reason",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/country-shutdown-reason.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('question-text', {
      url: "question-text",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/chat.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('country-question-text', {
      url: "country-question-text",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/country-chat.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });
    
    $stateProvider.state('troubleshoot', {
      url: "troubleshoot",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/troubleshoot.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('elevator-call-details', {
      url: "elevator-call-details",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/elevator-call-details.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });

    $stateProvider.state('users-details', {
      url: "users-details",
      parent: "app",
      views: {
        content: {
          templateUrl: "views/partials/user-list.html"
        },
        topBar: {
          templateUrl: "views/partials/topbar.html"
        },
        sideBar: {
          templateUrl: "views/partials/sidebar.html"
        }
      }
    });
  }

  angular.module('CCApp').config(Routes);
  Routes.$inject = ['$stateProvider', '$urlRouterProvider'];

})();
