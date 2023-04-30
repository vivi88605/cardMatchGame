const symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',//黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',//紅心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',//方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'//梅花
]
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameSuccess: 'GameSuccess'
}
const model = {
  revealedCards: [],

  isRevealedCardsMatch() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  tryCount: 0,
}

const view = {
  getCardElement(index) {
    return `
    <div class="card back" data-index="${index}"></div>
    `
  },
  getCardContent(index) {
    let number = this.transformNumber(Number(index % 13) + 1)
    let symbol = symbols[Number(Math.floor(index / 13))]
    return `
      <p>${number}</p>
      <img src=${symbol} alt="">
      <p>${number}</p>
    `
  },
  flipCards(...cards) {
    cards.map(card => {
      let index = Number(card.dataset.index)
      if (card.classList.contains('back')) {
        //classList contains 'back'=> return front
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(index)
        return
      }
      //classList doesn't contains 'back'=>return back
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const cardSection = document.querySelector(".card-section")
    for (const key of indexes) {
      // for (const key of utility.getRandomNumberArray(52)) {
      cardSection.innerHTML += this.getCardElement(key)
    }

    // for (i = 0; i < 52; i++) {
    //   cardSection.innerHTML += this.getCardElement(i)
    // }

    // cardSection.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `score: ${score}`
  },
  renderCount(tryCount) {
    document.querySelector('.tryCount').textContent = `tried: ${tryCount} times`
  },
  appendUnMatchAnimation(...cards) {
    cards.map(card => {
      card.classList.add('unMatch')
      card.addEventListener('animationend', function (event) {
        event.target.classList.remove('unMatch'), { once: true }
      })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('finishMessage')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count) {
    numList = Array.from(Array(count).keys())
    for (let index = numList.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[numList[index], numList[randomIndex]] = [numList[randomIndex], numList[index]]
    }
    return numList
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) return;
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderCount(++model.tryCount)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatch()) {//配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameSuccess
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {//配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendUnMatchAnimation(...model.revealedCards)
          // setTimeout(() => { }, 1000)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

// view.displayCards()
controller.generateCards()
// const cardSection = document.querySelector('.card-section')
// const card = document.querySelector('.card')
// cardSection.addEventListener('click', function (event) {
//   console.log(event)
//   view.flipCards(card)
// })
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // view.flipCards(card)
    controller.dispatchCardAction(card)
  })
})