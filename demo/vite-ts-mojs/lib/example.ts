import mojs from "@mojs/core";

const mojsFunc = (id = 1) => {
  if (id === 1) {
    const bouncyCircle = new mojs.Shape({
      parent: "#test",
      shape: "circle",
      fill: { "#F64040": "#FC46AD" },
      radius: { 20: 80 },
      duration: 2000,
      isYoyo: true,
      isShowStart: true,
      easing: "elastic.inout",
      repeat: 1,
    });

    bouncyCircle.play();
  }
};

export default mojsFunc;
