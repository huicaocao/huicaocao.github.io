// 塔罗牌数据（示例，您可以根据需要添加更多牌或更详细的解释）
// 建议您找一个完整的塔罗牌列表，包含牌名、图片文件名和简要牌义。
const tarotCards = [
    { name: "女祭司", image: "priestess.png", meaning: "魔盒之心。" },
    { name: "战车", image: "chariot.png", meaning: "旧日追索。" },
    { name: "权杖四", image: "Four of Wands.png", meaning: "家园，阿瓦隆之地。" },
    // ... 添加所有78张塔罗牌的数据
    // 确保 'image' 字段对应您 'images/' 文件夹中的实际图片文件名
];

const tarotCardImage = document.getElementById('tarotCardImage');
const cardName = document.getElementById('cardName');
const cardMeaning = document.getElementById('cardMeaning');
const drawCardButton = document.getElementById('drawCardButton');

// 存储已抽取的牌，防止重复抽取（如果需要）
let drawnCards = [];

function drawRandomCard() {
    // 如果所有牌都已抽取，可以重置或提示
    if (drawnCards.length === tarotCards.length) {
        alert("所有牌都已抽取完毕！即将重置牌组。");
        drawnCards = []; // 重置牌组
    }

    let availableCards = tarotCards.filter(card => !drawnCards.includes(card));
    
    // 随机选择一张未抽取的牌
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];

    // 将选中的牌添加到已抽取列表中
    drawnCards.push(selectedCard);

    // 更新页面显示
    tarotCardImage.src = `images/${selectedCard.image}`;
    tarotCardImage.alt = selectedCard.name;
    cardName.textContent = selectedCard.name;
    cardMeaning.textContent = selectedCard.meaning;
}

// 为按钮添加点击事件监听器
drawCardButton.addEventListener('click', drawRandomCard);

// 页面加载时显示牌背
window.onload = () => {
    tarotCardImage.src = "images/back.png"; // 确保您有一张名为 back.jpg 的牌背图片
    tarotCardImage.alt = "塔罗牌背面";
    cardName.textContent = "点击按钮抽取一张牌";
    cardMeaning.textContent = "";
};