Meteor.startup(function() {
  // code to run on server at startup

});

Meteor.publish("Items", function() {
  return Items.find();
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