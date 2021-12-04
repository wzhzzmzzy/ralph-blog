import {useAuthStore} from "../../store/auth";
import {LOCAL_KEY} from "../constants";
import {addDays, isAfter} from "date-fns";

export const setupAuthHooks = router => {
  router.beforeEach((to, from) => {
    const authStore = useAuthStore();
    if (!to.meta.noAuth && !authStore.userName) {
      let needLogin = true;
      const lastToken = window.localStorage.getItem(LOCAL_KEY.LAST_TOKEN);
      const lastLoginTime = window.localStorage.getItem(LOCAL_KEY.LAST_LOGIN_TIME);
      if (lastToken && authStore.validateUser(lastToken)) {
        // 七天过期时间
        if (!isNaN(lastLoginTime) && isAfter(addDays(+lastLoginTime, 7), Date.now())) {
          needLogin = false;
        }
      }
      if (needLogin) {
        return {
          name: 'login',
        }
      }
    }
    return true;
  });
}
