var Items = new Meteor.Collection("Items");

if (Meteor.isClient) {

  Meteor.Router.add({
    '/': 'home',
    '/search/:term': function(term) {
      Session.set('term', term);
      return 'search';
    },
    '/i/:id': function(id) {
      Session.set('id', id);
      return 'single';
    },
    '*': '404'
  });

  $(document).on('keyup', function(e) {
    if (e.keyCode == 27) {
      $('.submitForm').hide();
    }
  });

  var notif = function(msg) {
    $('.notification').text(msg).slideDown();
    setTimeout(function() {
      $('.notification').slideUp();
    }, 1500);
  };

  var dsq = function() {
    $.ajaxSetup({
      cache: true
    });
    $.getScript("http://thrift-app.disqus.com/embed.js");
    $.ajaxSetup({
      cache: false
    });
    $("#disqus_loader").remove();
  };

  var gaq = function() {
    (function(i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r;
      i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date();
      a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-40509837-1', 'thrift.im');
    ga('send', 'pageview');

  };

  Template.submit.events({
    'click .submitTrigger': function() {
      $('.submitForm').toggle();
    }
  });

  Template.submitForm.events({
    'click #submit': function() {
      var title = $('#newTitle').val();
      var description = $('#newDescription').val();
      var gitHubURL = $('#newGitHubURL').val();
      if (!title) {
        notif('Please fill in a title');
        return;
      }
      if (!description) {
        notif('Please fill in a description');
        return;
      }
      Meteor.saveItem({
        title: title,
        description: description,
        gitHubURL: gitHubURL
      });
    },
    'click #cancel': function() {
      $('.submitForm').hide();
    }
  });

  Template.items.events({
    'click .permalink': function() {
      Meteor.Router.to('/i/' + this._id);
    }
  });

  Template.item.events({
    'click .delete': function() {
      Items.remove({
        _id: this._id
      }, function() {
        Meteor.Router.to('/');
      });
    }
  });

  Template.search.events({

  });

  Template.header.events({
    'click h1': function() {
      Meteor.Router.to('/');
    },
    'keyup #search': function(e) {
      if (e.which == 13) {
        var v = e.currentTarget.value;
        if (v) {

          Meteor.Router.to('/search/' + v);
          window.location.href = '';
        }
      }
    }
  });

  Template.items.items = function() {
    return Items.find({

    }, {
      sort: {
        timestamp: -1
      },
      limit: 100
    });
  };

  Template.search.results = function() {
    var re = new RegExp(Session.get('term'), "ig");
    return Items.find({
      title: {
        $regex: re
      }
    }, {
      limit: 25,
      sort: {
        title: 1
      }
    });
  };

  Template.items.date = function(date) {
    return dateF(date);
  };

  Template.items.rendered = function() {
    gaq();
  };

  Template.item.rendered = function() {
    dsq();
    gaq();
  };

  Template.item.items = function() {
    return Items.find({
      _id: Session.get("id")
    }, {});
  };

  Template.item.author = function() {
    return (Meteor.user() && Meteor.user()._id) == this.userId;
  };

  Template.search.rendered = function() {

    $('.permalink').on('click', function(e) {
      Meteor.Router.to('/i/' + e.currentTarget.getAttribute('data-id'));
    });

    gaq();

  };

  Meteor.saveItem = function(content) {
    var title = content.title;
    var desc = content.description;
    var gitHubURL = content.gitHubURL;
    if (title.length > 1500 || desc > 2500 || gitHubURL > 1500) {
      return;
    }
    var user = Meteor.user();
    if (user) {
      Items.insert({
        userId: (user) ? user._id : 0,
        name: (user) ? user.profile.name : '',
        description: desc,
        title: title,
        gitHubURL: gitHubURL,
        timestamp: Date.now()
      }, function(err, id) {
        if (id) {
          $('.submitTrigger').trigger('click');
          notif('Saved successfully!');
        }
      });
    }
  };

  Meteor.autorun(function() {
    Meteor.subscribe("Items");
  });


}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
    Meteor.publish("Items", function() {
      return Items.find({

      }, {
        sort: {
          timestamp: -1
        },
        limit: 100
      });
    });

  });

  Items.allow({
    'insert': function(userId, doc) {
      return true;
    },
    'remove': function(userId, doc) {
      if (userId == doc.userId) {
        return true;
      }
    }
  });
}