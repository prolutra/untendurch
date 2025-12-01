import { computed } from 'mobx';
import { Model, model, modelAction, prop } from 'mobx-keystone';
import Parse from 'parse';

@model('untendurch/Auth')
export class AuthStore extends Model({
  sessionToken: prop<string | null>(() => null).withSetter(),
}) {
  onAttachedToRootStore() {
    if (this.currentUser) {
      this.setSessionToken(this.currentUser.getSessionToken());
    }
  }

  @modelAction
  async login(username: string, password: string) {
    return Parse.User.logIn(username, password)
      .then((parseUser) => {
        this.setSessionToken(parseUser.getSessionToken());
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  @modelAction
  async logout() {
    // remove session token in any case
    this.setSessionToken(null);
    return Parse.User.logOut();
  }

  @computed
  get currentUser(): Parse.User | undefined {
    return Parse.User.current() ?? undefined;
  }
}
