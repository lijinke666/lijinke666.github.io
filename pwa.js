let deferredPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  // 这个 `event.userChoice` 是一个 Promise ，在用户选择后 resolve
  event.userChoice.then((result) => {
    console.log(result.outcome)
    // 'accepted': 添加到主屏
    // 'dismissed': 用户不想理你并向你扔了个取消
  })
})

window.addEventListener('appinstalled', (evt) => {
  console.log('PWA app 成功安装');
  Notification.requestPermission((status) => {
    const n = new Notification('李金珂的小屋安装成功', {
      icon: '/images/my.jpeg',
      body: '要想学仙术, 哪能不吃苦',
    })

    n.onshow = () => {
      setTimeout(n.close.bind(n), 5000)
    }

    n.onclick = () => {
      window.location.href = 'https://www.lijinke.cn'
    }
  })
});

if (navigator.serviceWorker != null) {
  navigator.serviceWorker
    .register('/sw.js') //返回一个promise对象
    .then((reg) => {
      console.log('service worker install success...', reg)
    })
    .catch((error) => {
      console.error('service worker install failed...', error)
  })
}
