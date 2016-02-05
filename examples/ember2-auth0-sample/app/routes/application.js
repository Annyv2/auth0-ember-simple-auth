import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  
  //This example implements redirect mode https://auth0.com/docs/libraries/lock/authentication-modes
  // You can delete the init function if you want to use popup mode
  init:function(){
      var lockOptions = {popup:false,clicked:false};
      this.get('session').authenticate('simple-auth-authenticator:lock', lockOptions);
  },

  actions: {
    login () {
      //For popup mode. just put popup:true, you can delete the clicked option
      //For redirect mode. popup:false, clicked:true
      var lockOptions = {popup:false,clicked:true,authParams:{scope: 'openid'}};
      this.get('session').authenticate('simple-auth-authenticator:lock', lockOptions);
    },

    logout () {
      this.get('session').invalidate();
    }
  }
});
