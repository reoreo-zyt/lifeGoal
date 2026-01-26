<template>
  <m-rice-paper class="filter-div">
    <m-dialog v-model:visible="visible" class="m-height-login">
      <div class="login" v-if="!showVerify">
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
              <m-button
                class="button-1"
                text="以游客身份登录"
                @click="loginByTourist"
              />
              <m-button class="button-1" text="注册" @click="register" />
              <m-button text="确定" @click="login" />
            </div>
          </div>
        </div>
      </div>
      <slide-verify
        class="verify"
        v-if="showVerify"
        ref="block"
        :slider-text="text"
        :accuracy="accuracy"
        @again="onAgain"
        @success="onSuccess"
        @fail="onFail"
        @refresh="onRefresh"
      ></slide-verify>
    </m-dialog>
  </m-rice-paper>
</template>

<script lang="ts" setup>
import { useDialog, MMessage } from "shuimo-ui";
import { ref, onMounted } from "vue";
import SlideVerify, { type SlideVerifyInstance } from "vue3-slide-verify";
import "vue3-slide-verify/dist/style.css";

const { visible } = useDialog();

const showVerify = ref(false);
const showVerifyHandle = () => {
  callMessage("请先进行校验");
  showVerify.value = true;
};

const text = "向右滑动->";
const accuracy = 1;
const msg = ref("");
const block = ref<SlideVerifyInstance>();

const onAgain = () => {
  msg.value = "检测到非人为操作的哦！ try again";
  callMessage(msg.value);
  showVerify.value = false;
};

const onSuccess = (detail: { timestamp: number; left: number }) => {
  msg.value = `登录成功, 道友耗时${(detail.timestamp / 1000).toFixed(
    1,
  )}s, 移动距离${detail.left}px`;
  callMessage(msg.value);
  showVerify.value = false;
};

const onFail = () => {
  msg.value = "验证不通过";
  callMessage(msg.value, "error");
  showVerify.value = false;
};

const onRefresh = () => {
  msg.value = "已为道友重新刷新~";
  callMessage(msg.value);
};

// @ts-ignore
const handleClick = () => {
  // 刷新
  block.value?.refresh();
  msg.value = "";
};

const loginByTourist = () => {
  // 进入主界面路由
};
const register = () => {
  showVerifyHandle();
};
const login = () => {
  showVerifyHandle();
};

const callMessage = (text = "这是一条消息", type = "success") => {
  MMessage({
    type,
    content: text,
    direction: "top-center",
    dragAllow: true,
    dragConfig: {
      triggerBoandary: 2,
    },
  });
};

onMounted(() => {
  visible.value = true;
  // setInterval(() => {
  //   if (visible.value === false) {
  //     visible.value = true;
  //   }
  // }, 3000);
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

.verify {
  position: absolute;
  left: 20%;
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
