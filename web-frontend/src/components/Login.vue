<template>
  <m-rice-paper class="filter-div">
    <m-dialog v-model:visible="visible" class="m-height-login">
      <div class="login">
        <h1>道友，请注册登录</h1>
        <div class="login-form">
          <m-form>
            <m-form-item label="在下乃账号：" prop="account">
              <m-input />
            </m-form-item>
            <m-form-item label="在下乃密码：" prop="password">
              <m-input />
            </m-form-item>
          </m-form>
          <div class="login-footer">
            <div class="login-footer-end">
              <m-button class="button-1" text="以游客身份登录" />
              <m-button text="确定" />
            </div>
          </div>
        </div>
      </div>
    </m-dialog>
  </m-rice-paper>
</template>

<script lang="ts" setup>
import { useDialog } from "shuimo-ui";
import { onMounted } from "vue";

const { visible } = useDialog();

onMounted(() => {
  visible.value = true;
  setInterval(() => {
    if (visible.value === false) {
      visible.value = true;
    }
  }, 3000);
});
</script>

<style scoped>
.filter-div {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
}

.login {
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.login-footer {
  width: 100%;
}

.login-footer-end {
  display: flex;
  justify-content: flex-end;
}

.button-1 {
  margin-right: 10px;
}
</style>
