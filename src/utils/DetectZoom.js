export const detectZoom = () => {

    let ratio = 0,
      screen = window.screen,
      ua = navigator.userAgent.toLowerCase();
    if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    } else if (~ua.indexOf('msie')) {
      if (screen.deviceXDPI && screen.logicalXDPI) {
        ratio = screen.deviceXDPI / screen.logicalXDPI;
      }
    } else if (
      window.outerWidth !== undefined &&
      window.innerWidth !== undefined
    ) {
      ratio = window.outerWidth / window.innerWidth;
    }
    if (ratio) {
      ratio = Math.round(ratio * 100);
    }
    return ratio;
  };

export const zoom = (m) => {
    if (window.screen.width * window.devicePixelRatio >=3840) {
      switch (m) {
        // 4k ==> 100%
        case 100:
          document.body.style.zoom = 100 / (0.625 * 1920);
          break;
          // 4k ==> 125%
        case 125:
          document.body.style.zoom = 100 / (0.625 * 1920);
          break;
          // 4k ==> 150%
        case 150:
          document.body.style.zoom = 100 / (0.75 * 1920);
          break;
          // 4k ==> 175%
        case 175:
          document.body.style.zoom = 100 / (0.874715 * 1920);
          break;
          // 4k ==> 200%
        case 200:
          document.body.style.zoom = 1920 / 1920;
          break;
          // 4k ==> 225%
        case 225:
          document.body.style.zoom = 100 / (1.12485 * 1920);
          break;
      
        default:
          break;
      }
    }
    else if(m === 100 && window.devicePixelRatio === 1){
      document.body.style.zoom = window.screen.width / 1920;
      // console.log('正常屏');
      // console.log(window.screen.width + "====" + window.devicePixelRatio);
    }
    else if (window.screen.width <= 1915) {
      document.body.style.zoom = 1440 / 1920;
      // console.log('笔记本');
      // console.log(window.screen.width + "====" + window.devicePixelRatio);
    }
  }