
window.onload = () => {
  const date = new Date()
  const isDisasterDay = date.getFullYear() === 2020 && date.getMonth() + 1 === 4 && date.getDate() === 4

  if (isDisasterDay) {
    alert('今天是全国哀悼日, 向全国抗击新冠肺炎疫情斗争牺牲烈士和逝世同胞表示深切哀悼!')
    const body = document.querySelector('body')
    body.style.filter = 'grayscale(1)';
    body.style.transition = 'all 3s'
  }
}
