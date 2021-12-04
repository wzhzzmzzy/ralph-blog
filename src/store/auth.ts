import {defineStore} from "pinia";
import md5 from 'js-md5';
import {LOCAL_KEY} from "../lib/constants";

export const useAuthStore = defineStore({
  id: 'typing',
  state: () => ({
    userName: '',
    userToken: '',
    authFailed: false
  }),
  actions: {
    validateUser(userToken: string = '') {
      if (!userToken) {
        userToken = this.userToken;
      }
      if (md5(userToken.trim()) === 'de01cbdb4e06e9bbd91ccef41450b7dc') {
        this.userName = '玲玲酱';
        this.authFailed = false;
        this.userToken = userToken;
        window.localStorage.setItem(LOCAL_KEY.LAST_TOKEN, this.userToken);
        window.localStorage.setItem(LOCAL_KEY.LAST_LOGIN_TIME, String(Date.now()));
        return true;
      }
      this.authFailed = true;
      return false;
    }
  }
});
