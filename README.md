# Auth0 Ember simple auth
### An ember-cli addon for using [Auth0](https://auth0.com/) with [Ember Simple Auth](https://github.com/simplabs/ember-simple-auth).

Auth0's [lock](https://github.com/auth0/lock) widget, is a nice way to get a fully functional signup and login workflow into your app.

## What does it do?

* it __wires up Auth0's Lock.js to work with ember simple auth__.
* it __lets you work with ember simple auth__ just like you normally do!

## Installation and Setup

### Auth0

If you don't already have an account, go signup at for free: [Auth0](https://auth0.com/)

1. Create a new app through your dashboard.
1. Add `http://localhost:4200` to your Allowed Callback URLs through your dashboard
1. Done!

### Generate a new ember app and install `auth0-ember-simple-auth` using ember-cli (Ember CLI >= 0.2.7)

### (`ember` >= 2.x.x)
```bash
ember new hello-safe-world
cd hello-safe-world
ember install ember-simple-auth
npm install --save git+https://git@github.com/auth0/auth0-ember-simple-auth.git
ember g auth0-ember-simple-auth
```

### (`ember` <= 1.13.x)
```bash
ember new hello-safe-world
cd hello-safe-world
ember install auth0-ember-simple-auth@1.0.4
```

If you want to get up and running right away, you can scaffold all the necessary routes and templates to play with:

```bash
ember generate scaffold-auth0
```

### Configuration

There are two configuration options.

1. (REQUIRED) - _clientID_ - Grab from your Auth0 Dashboard
2. (REQUIRED) - _domain_ - Grab from your Auth0 Dashboard

*The below simple-auth config object works out the box with the scaffold*

```js
// config/environment.js
ENV['auth0-ember-simple-auth'] = {
  clientID: "auth0_client_id",
  domain: "auth0_domain"
};
```

### (`ember` >= 2.x.x)
```js
// config/environment.js
ENV['ember-simple-auth'] = {
  authenticationRoute: 'index',
  routeAfterAuthentication: 'protected',
  routeIfAlreadyAuthenticated: 'protected'
};
```

### (`ember` <= 1.13.x)
```js
// config/environment.js
ENV['simple-auth'] = {
  authenticationRoute: 'index',
  routeAfterAuthentication: 'protected',
  routeIfAlreadyAuthenticated: 'protected'
};
```

Lastly, make sure you update the *Allowed Callback URLs* through your Auth0 dashboard.
*If running ember locally on the default port, this will be: __http://localhost:4200__*

__At this point if you ran *scaffold-auth0*, you can fire up ember server:__

```bash
ember server
```
__The below steps will outline the steps to get up and running with the scaffolding:__

### Suggested security config

Ember uses a [content security policy](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) to manage which resources are allowed to be run on your pages.

```js
// config/environment.js

ENV['contentSecurityPolicy'] = {
    'font-src': "'self' data: https://*.auth0.com",
    'style-src': "'self' 'unsafe-inline'",
    'script-src': "'self' 'unsafe-eval' https://*.auth0.com",
    'img-src': '*.gravatar.com *.wp.com data:',
    'connect-src': "'self' http://localhost:* https://your-app-domain.auth0.com"
  };

```

### Caveats

1. Because ember simple auth listens for local storage changes, updates in one tab will trigger token refreshes in all open tabs of the same domain. This is not critical for long lived JWTs but will be noticeable if there are several tabs of the app running on the same browser with very short lived JWTs.
*I'm open to suggestions on getting around this.*


## Manual Setup

__auth0-ember-simple-auth__ is just a regular __authenticator__ that conforms to the [Ember Simple Auth](https://github.com/simplabs/ember-simple-auth) interface. Please follow the docs to get everything working as usual, and just add the call to the *simple-auth-authenticator:lock* __authenticator__ in your ```authenticate``` call.

### Actions

Once the standard [Ember Simple Auth](https://github.com/simplabs/ember-simple-auth) ```application_route_mixin``` is added to your app route, you will be able to use all the usual actions: [Docs](https://github.com/simplabs/ember-simple-auth)

__Here is an example application route:__

### (`ember` <= 1.13.x)
```js
// app/routes/application.js

import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    sessionRequiresAuthentication: function(){
      // Check out the docs for all the options:
      // https://auth0.com/docs/libraries/lock/customization

      // These options will request a refresh token and launch lock.js in popup mode by default
      var lockOptions = {authParams:{scope: 'openid'}};

      this.get('session').authenticate('simple-auth-authenticator:lock', lockOptions);
    }
  }
});
```

### (`ember` >= 2.x.x)
```js
// app/routes/application.js

import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {

  // This implements redirect mode https://auth0.com/docs/libraries/lock/authentication-modes
  // You can delete the init function if you want to use popup mode
  init:function(){
      var lockOptions = {popup:false,clicked:false};
      this.get('session').authenticate('simple-auth-authenticator:lock', lockOptions);
  },

  actions: {
    login () {
      //For popup mode. just put popup:true, you can delete the clicked option
      // var lockOptions = {popup:true, authParams:{scope: 'openid'}};
      //For redirect mode. popup:false, clicked:true
      var lockOptions = {popup:false,clicked:true,authParams:{scope: 'openid'}};
      this.get('session').authenticate('simple-auth-authenticator:lock', lockOptions);
    },

    logout () {
      this.get('session').invalidate();
    }
  }
});
```

__Then from your template you could trigger the usual actions:__

### (`ember` <= 1.13.x)
```html
// app/templates/application.hbs

{{#if session.isAuthenticated}}
  <a {{ action 'invalidateSession' }}>Logout</a>
{{else}}
  <a {{ action 'sessionRequiresAuthentication' }}>Login</a>
{{/if}}
```

### (`ember` >= 2.x.x)
```html
// app/templates/application.hbs

{{#if session.isAuthenticated}}
  <a {{ action 'logout' }}>Logout</a>
{{else}}
  <a {{ action 'login' }}>Login</a>
{{/if}}
```

### Custom Authenticators

You can easily extend the __Auth0EmberSimpleAuth__ base __authenticator__ to play hooky with some cool __hooks__.

Here's how:

```bash
ember generate authenticator my-cool-authenticator
```

This will create the following stub authenticator:

```js
// app/authenticators/my-cool-authenticator.js

import Base from 'auth0-ember-simple-auth/authenticators/lock';

export default Base.extend({

  /**
   * Hook that gets called after the jwt has expired
   * but before we notify the rest of the system.
   * Great place to add cleanup to expire any third-party
   * tokens or other cleanup.
   *
   * IMPORTANT: You must return a promise, else logout
   * will not continue.
   *
   * @return {Promise}
   */
  beforeExpire () {
    return Ember.RSVP.resolve();
  },

  /**
   * Hook that gets called after Auth0 successfully
   * authenticates the user.
   * Great place to make additional calls to other
   * services, custom db, firebase, etc. then
   * decorate the session object and pass it along.
   *
   * IMPORTANT: You must return a promise with the
   * session data.
   *
   * @param  {Object} data Session object
   * @return {Promise}     Promise with decorated session object
   */
  afterAuth (data) {
    return Ember.RSVP.resolve(data);
  },

  /**
   * Hook called after auth0 refreshes the jwt
   * based on the refreshToken.
   *
   * This only fires if lock.js was passed in
   * the offline_mode scope params
   *
   * IMPORTANT: You must return a promise with the
   * session data.
   *
   * @param  {Object} data The new jwt
   * @return {Promise}     The decorated session object
   */
  afterRestore (data) {
    return Ember.RSVP.resolve(data);
  },

  /**
   * Hook that gets called after Auth0 successfully
   * refreshes the jwt if (refresh token is enabled).
   *
   * Great place to make additional calls to other
   * services, custom db, firebase, etc. then
   * decorate the session object and pass it along.
   *
   * IMPORTANT: You must return a promise with the
   * session data.
   *
   * @param  {Object} data Session object
   * @return {Promise}     Promise with decorated session object
   */
  afterRefresh (data) {
    return Ember.RSVP.resolve(data);
  }

});

```

Once you've made your custom authenticator. Just do the following in your app route:

### (`ember` <= 1.13.x)
```js
import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    sessionRequiresAuthentication () {
      // Check out the docs for all the options:
      // https://auth0.com/docs/libraries/lock/customization

      var lockOptions = {authParams:{scope: 'openid'}};
      this.get('session').authenticate('authenticator:my-cool-authenticator', lockOptions);
    }
  }
});

```

### (`ember` >= 2.x.x)
```js
import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    login () {
      // Check out the docs for all the options:
      // https://auth0.com/docs/libraries/lock/customization

      var lockOptions = {authParams:{scope: 'openid'}};
      this.get('session').authenticate('authenticator:my-cool-authenticator', lockOptions);
    },

    logout () {
      this.get('session').invalidate();
    }
  }
});

```

### Custom Authorizers

You can easily extend the __EmberSimpleAuth__ base __authorizer__ to create custom authorization logic.

Here's how:

```bash
ember generate authorizer my-cool-authorizer
```

This will generate the following authorizer.

```js
// app/authorizers/my-cool-authorizer.js

import Ember from 'ember';
import BaseAuthorizer from 'ember-simple-auth/authorizers/base';
const { isEmpty } = Ember;

export default BaseAuthorizer.extend({
  authorize: function(sessionData, block) {
    const tokenAttributeName = 'jwt';
    const userToken = sessionData[tokenAttributeName];
    if (!isEmpty(userToken)) {

      // Set request headers here.
      // userToken is the jwt from Auth0.

      // Example usage
      // block('Authorization', `Bearer ${userToken}`);

      // Remember to update your session service's authorize method (http://ember-simple-auth.com/api/classes/SessionService.html#method_authorize)
      // this.get('session').authorize('authorizer:my-cool-authenticator', (headerName, headerValue) => {
      //   ...
      // });

      // Alternatively if using Ember Data, update your use DataAdapterMixing provided by Ember Simple Auth (http://ember-simple-auth.com/api/classes/DataAdapterMixin.html)
      //
      // import DS from 'ember-data';
      // import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

      // export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
      //   authorizer: 'authorizer:my-cool-authenticator'
      // });
    }
  }
});

```

To use the new authorizer, just update your session service's authorize method or your adapter if using Ember Data, as described [here](https://github.com/simplabs/ember-simple-auth#implementing-a-custom-authorizer).

Remember, you will also need to update your crossOriginWhitelist if you are making cross domain requests. If not, ember simple auth will not trigger the authorizer's ```authorize``` method.

## Credits

Written by @brancusi (Aram Zadikian), maintained in part by Auth0. Thanks Aram!

## License

auth0-ember-simple-auth by Aram Zadikian. It is released under the MIT License.

__Enjoy!__
