const CANVAS = document.querySelector('#screen')
const CTX = CANVAS.getContext('2d')
const AUDIO_COLLISION = new Audio('collision.mp3') 
const AUDIO_FULLROW = new Audio('fullrow.mp3')
const AUDIO_GAMEOVER = new Audio('gameover.mp3')

let velocity = 200
let currentPiece = []
let frozenPieces = []
let isGameOver = false

const pieces = [
    [{x:0,y:0},{x:20,y:0},{x:20,y:20}],
    [{x:0,y:0},{x:20,y:0},{x:40,y:0},{x:60,y:0}],
    [{x:0,y:0},{x:20,y:0},{x:40,y:0},{x:20,y:20}],
    [{x:0,y:0},{x:20,y:0},{x:20,y:20}, {x:20,y:40}, {x:0, y:40}],
    [{x:0,y:0},{x:20,y:0},{x:20,y:20}, {x:20,y:40}],
    [{x:0,y:0},{x:20,y:0},{x:20,y:20}, {x:0,y:20}],
]

function clearCanvas() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height)
}

function drawBlocks(blocks, color) {
    CTX.fillStyle = color
    for (let b of blocks) {
        CTX.fillRect(b.x, b.y, 20, 20)
    }
}

function moveDown() {
    currentPiece.forEach(p => p.y += 20)
}

function spawnPiece() {
    let random = Math.floor(Math.random() * pieces.length)
    currentPiece = pieces[random].map(p => ({...p}))
}

function drawGame() {
    gameOver()
    if (isGameOver) {
        AUDIO_GAMEOVER.play()
        return
    }
    clearCanvas()
    drawBlocks(frozenPieces.flat(), "#e23939ff")
    drawBlocks(currentPiece, "#2253cfff")
    clearFullLines()
}

function update() {
    if (isGameOver) return
    if (checkCollision()) {
        setTimeout(() => {
            frozenPieces.push(currentPiece)
            AUDIO_COLLISION.play()
            spawnPiece()
        }, 50);
    } else {
        moveDown()
    }
    drawGame()
}

function checkCollision() {
    for (let block of currentPiece) {
        if (block.y + 20 >= CANVAS.height) return true
        for (let frozen of frozenPieces.flat()) {
            if (block.x === frozen.x && block.y + 20 === frozen.y) {
                return true
            }
        }
    }
    return false
}

// === Funções auxiliares para verificar limites laterais ===
function canMoveRight() {
    for (let block of currentPiece) {
        if (block.x + 20 >= CANVAS.width) return false
        for (let frozen of frozenPieces.flat()) {
            if (block.x + 20 === frozen.x && block.y === frozen.y) {
                return false
            }
        }
    }
    return true
}

function canMoveLeft() {
    for (let block of currentPiece) {
        if (block.x - 20 < 0) return false
        for (let frozen of frozenPieces.flat()) {
            if (block.x - 20 === frozen.x && block.y === frozen.y) {
                return false
            }
        }
    }
    return true
}

function clearFullLines() {
    const blockSize = 20
    const blocksPerRow = CANVAS.width / blockSize

    // pega todos os blocos congelados
    let allBlocks = frozenPieces.flat()

    // conta quantos blocos tem em cada y
    let lineCount = {}
    for (let b of allBlocks) {
        lineCount[b.y] = (lineCount[b.y] || 0) + 1
    }

    // pega todas as linhas completas
    let fullLines = Object.keys(lineCount).filter(y => lineCount[y] === blocksPerRow)

    if (fullLines.length > 0) {
        // transforma para números e ordena de baixo para cima
        fullLines = fullLines.map(Number).sort((a, b) => b - a)

        for (let line of fullLines) {
            // remove blocos da linha completa
            allBlocks = allBlocks.filter(b => b.y !== line)

            // desce blocos que estão acima
            allBlocks.forEach(b => {
                if (b.y < line) b.y += blockSize
            })
        }

        // reagrupa em peças (cada peça como array de blocos)
        frozenPieces = groupPieces(allBlocks)
        AUDIO_FULLROW.play()
    }
}

// função auxiliar: reagrupa blocos em "peças" (opcional)
function groupPieces(blocks) {
    // aqui, podemos simplesmente colocar todos como uma única peça
    return [blocks]
}


function rotatePiece() {
    if (currentPiece.length === 0) return

    // === Pivot = peça de referencia ===
    let pivot = currentPiece[0]
    let rotated = currentPiece.map(block => {
        let x = block.x
        let y = block.y
        let cx = pivot.x
        let cy = pivot.y
        return {
            x: cx - (y - cy),
            y: cy + (x - cx)
        }
    })
    
    // === Verificando colisão antes de aplicar a rotação ===
    let isValid = rotated.every(block => {
        if (block.x < 0 || block.x >= CANVAS.width) return false
        if (block.y < 0 || block.y >= CANVAS.height) return false
        for (let frozen of frozenPieces.flat()) {
            if (block.x === frozen.x && block.y === frozen.y) return false
        }
        return true
    })

    if (isValid) currentPiece = rotated
}

function gameOver() {
    let allFrozenPieces = frozenPieces.flat()
    isGameOver = allFrozenPieces.some(frozen => frozen.y <= 0)
}

function hardDrop() {
  if (currentPiece.length === 0) return;

  let minDelta = Infinity; // menor deslocamento possível (em px)

  for (const block of currentPiece) {
    // distância até o piso
    let bestForThisBlock = CANVAS.height - (block.y + 20);

    for (const frozen of frozenPieces.flat()) {
      if (frozen.x === block.x && frozen.y >= block.y + 20) {
        const distance = frozen.y - (block.y + 20); // quantos px até encostar nesse frozen
        if (distance < bestForThisBlock) bestForThisBlock = distance;
      }
    }

    if (bestForThisBlock < minDelta) minDelta = bestForThisBlock;
  }

  // aplica o deslocamento em todos os blocos da peça atual
  currentPiece.forEach(b => b.y += minDelta);
  AUDIO_COLLISION.play()

  frozenPieces.push(currentPiece.map(p => ({ ...p })));
  spawnPiece();
}

// === Controles com checagem de borda ===
document.addEventListener("keydown", ({key}) => {
    if (key === "ArrowRight" && canMoveRight()) {
        currentPiece.forEach(p => p.x += 20)
    }
    if (key === "ArrowLeft" && canMoveLeft()) {
        currentPiece.forEach(p => p.x -= 20)
    }
    if (key === "ArrowUp") {
        hardDrop()
    }
    if (key === "z") {
        rotatePiece()
    }
})

// === iniciar jogo ===
spawnPiece()
setInterval(update, velocity)
