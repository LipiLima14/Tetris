const CANVAS = document.querySelector('#screen')
const CTX = CANVAS.getContext('2d')

let isColision = false
let rightPiece = 0
let leftPiece = 0
let lowestPiece = 0
let velocity = 300
let modelBlock = []

let keys = {
    right: false,
    left: false
}

let blocks = [
    [{x: 0, y: 0}, {x: 20, y: 0}, {x: 20, y: 20}],
    [{x: 0, y: 0}, {x: 20, y: 0}, {x: 40, y: 0}, {x: 60, y: 0}],
    [{x: 0, y: 0}, {x: 20, y: 0}, {x: 40, y: 0}, {x: 20, y:20}]
]

let saveBlocks = []

function drawBlock(model_block) {
    let interval = setInterval(() => {
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height)
        if (lowestPiece + 40 >= CANVAS.height) {
            lowestPiece = 0
            rightPiece = 0
            leftPiece = 0
            clearInterval(interval)
            saveBlocks.push(model_block)
            randomBlock()
            savePositions()
            return
        }

        for (let indice_position = 0; indice_position <= model_block.length; indice_position++) {
            let positionX = model_block[indice_position].x
            let positionY = model_block[indice_position].y
            CTX.fillStyle = '#2253cfff'
            CTX.fillRect(positionX, positionY, 20, 20)

            if (positionY > lowestPiece) lowestPiece = positionY
            if (positionX > rightPiece) rightPiece = positionX
            if (positionY < CANVAS.height) model_block[indice_position].y += 20
        }
    }, velocity)
}

function randomBlock() {
    let random = Math.floor(Math.random() * blocks.length)   
    getModel(blocks[random])
}

function getModel(model) {
    modelBlock = model.map(p => ({...p}))
    drawBlock(modelBlock)
}

document.addEventListener('keydown', ({ key }) => {
    if (key == 'ArrowRight' && rightPiece + 20 < CANVAS.width) {
        keys.right = true
        movePiece()
    }

    if (key == 'ArrowLeft' && leftPiece > 0) {
        keys.left = true
        movePiece()
    }
})

function movePiece() {
    if (keys.right === true) {
        modelBlock.forEach(p => p.x += 20)
        keys.right = false
    }

    if (keys.left === true) {
        modelBlock.forEach(p => p.x -= 20)
        keys.left = false
    }

    // recalcular os limites
    leftPiece = Math.min(...modelBlock.map(p => p.x))
    rightPiece = Math.max(...modelBlock.map(p => p.x))
}

function savePositions() {
    for (let i = 0; i <= saveBlocks.length; i++) {
        for (let i2 = 0; i2 <= saveBlocks[i].length; i2++) {
            let px = saveBlocks[i][i2].x
            let py = saveBlocks[i][i2].y
            CTX.fillStyle = '#e23939ff'
            CTX.fillRect(px, py, 20, 20)
        }
    }
}

randomBlock()
