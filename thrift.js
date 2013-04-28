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
      return 'item';
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
    });
  };

  Template.items.date = function(date) {
    return dateF(date);
  };

  Template.items.rendered = function() {
    setTimeout(function() {
      $('#loader').fadeOut();
    }, 750);
  };

  Template.item.rendered = function() {
    dsq();
  };

  Template.item.items = function() {
    return Items.find({
      _id: Session.get("id")
    }, {});
  };

  Template.search.rendered = function() {

    $('.permalink').on('click', function(e){
      Meteor.Router.to('/i/' + e.currentTarget.getAttribute('data-id'));
    });

  };

  Meteor.saveItem = function(content) {
    var title = content.title;
    var desc = content.description;
    var gitHubURL = content.gitHubURL;
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
      return Items.find();
    });

  });

  Items.allow({
    'insert': function(userId, doc) {
      return true;
    }
  });
}