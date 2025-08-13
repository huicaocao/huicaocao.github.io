// 塔罗牌数据，现在只包含您提供的三张牌
const tarotCards = [
    { name: "战车", image: "https://bear-images.sfo2.cdn.digitaloceanspaces.com/huiye/chariot.webp", meaning: "旧日追索。" },
    { name: "权杖四", image: "https://bear-images.sfo2.cdn.digitaloceanspaces.com/huiye/four-of-wands.webp", meaning: "家园，阿瓦隆之地。" },
    { name: "女祭司", image: "https://bear-images.sfo2.cdn.digitaloceanspaces.com/huiye/priestess.webp", meaning: "魔盒之心。" },
];

const tarotCardImage = document.getElementById('tarotCardImage');
const cardName = document.getElementById('cardName');
const cardMeaning = document.getElementById('cardMeaning');
const drawCardButton = document.getElementById('drawCardButton');

let drawnCards = []; // 用于存储已抽取的牌，防止重复

function drawRandomCard() {
    // 如果所有牌都已抽取，可以重置或提示
    if (drawnCards.length === tarotCards.length) {
        alert("所有牌都已抽取完毕！即将重置牌组。");
        drawnCards = []; // 重置牌组
    }

    // 过滤掉已抽取的牌，只从剩余的牌中选择
    let availableCards = tarotCards.filter(card => !drawnCards.includes(card));
    
    // 如果没有可用的牌（理论上在上面的重置逻辑后不应该发生，但作为安全检查）
    if (availableCards.length === 0) {
        cardName.textContent = "没有可抽取的牌了！";
        cardMeaning.textContent = "请确保您的塔罗牌数据已正确配置。";
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];

    // 将选中的牌添加到已抽取列表中
    drawnCards.push(selectedCard);

    // 更新页面显示
    tarotCardImage.src = selectedCard.image; // 直接使用图床URL
    tarotCardImage.alt = selectedCard.name;
    cardName.textContent = selectedCard.name;
    cardMeaning.textContent = selectedCard.meaning;
}

// 为按钮添加点击事件监听器
drawCardButton.addEventListener('click', drawRandomCard);

// 页面加载时显示牌背
window.onload = () => {
    // 初始显示牌背图片和提示文字
    tarotCardImage.src = "https://bear-images.sfo2.cdn.digitaloceanspaces.com/huiye/back.webp"; // 您的牌背图床地址
    tarotCardImage.alt = "塔罗牌背面";
    cardName.textContent = "点击按钮抽取一张牌";
    cardMeaning.textContent = "";
};