// プロジェクトデータをJSONから読み込んで表示

let projectsData = {};

// JSONファイルを読み込む
async function loadProjectData() {
    try {
        const response = await fetch('./data/projects.json');
        projectsData = await response.json();
        displayProjectData();
    } catch (error) {
        console.error('プロジェクトデータの読み込みに失敗しました:', error);
        document.querySelector('.project-detail__inner').innerHTML = `
      <div style="text-align: center; padding: 4rem 0;">
        <h2>データの読み込みに失敗しました</h2>
        <p style="margin-top: 1rem;">
          <a href="index.html#portfolio" style="color: #f97316;">作品一覧に戻る</a>
        </p>
      </div>
    `;
    }
}

// URLパラメータからプロジェクトIDを取得
function getProjectId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// プロジェクトデータを表示
function displayProjectData() {
    const projectId = getProjectId();
    const project = projectsData[projectId];

    if (!project) {
        document.querySelector('.project-detail__inner').innerHTML = `
      <div style="text-align: center; padding: 4rem 0;">
        <h2>プロジェクトが見つかりません</h2>
        <p style="margin-top: 1rem;">
          <a href="index.html#portfolio" style="color: #f97316;">作品一覧に戻る</a>
        </p>
      </div>
    `;
        return;
    }

    // 基本情報
    document.getElementById('project-category').textContent = project.category || '';
    document.getElementById('project-title').textContent = project.title || '';
    document.getElementById('project-description').textContent = project.description || '';
    document.getElementById('project-timeline').textContent = project.timeline || '';
    document.getElementById('project-role').textContent = project.role || '';
    const image = document.getElementById("project-image");

    image.src = project.image;
    image.alt = project.title;
    // プロジェクト詳細説明
    if (project.longDescription) {
        document.getElementById('project-long-description').textContent = project.longDescription;
    } else {
        document.getElementById('long-description-section').style.display = 'none';
    }

    // 背景・課題
    if (project.challenge) {
        const challengeText = document.getElementById('project-challenge');
        // 改行を<br>に変換
        challengeText.innerHTML = project.challenge.replace(/\n/g, '<br><br>');
    } else {
        document.getElementById('challenge-section').style.display = 'none';
    }

    // ソリューション
    if (project.solution) {
        document.getElementById('project-solution').textContent = project.solution;
    } else {
        document.getElementById('solution-section').style.display = 'none';
    }

    // 担当業務
    if (project.responsibilities && project.responsibilities.length > 0) {
        const responsibilitiesList = document.getElementById('project-responsibilities');
        project.responsibilities.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            responsibilitiesList.appendChild(li);
        });
    } else {
        document.getElementById('responsibilities-section').style.display = 'none';
    }

    // 使用技術・ツール
    if (project.tools && project.tools.length > 0) {
        const toolsGrid = document.getElementById('project-tools');

        project.tools.forEach(tool => {
            const li = document.createElement('li');
            li.textContent = tool;
            toolsGrid.appendChild(li);
        });
    } else {
        document.getElementById('tools-section').style.display = 'none';
    }

    // 開発環境
    if (project.environment && project.environment.length > 0) {
        const environmentList = document.getElementById('project-environment');
        project.environment.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            environmentList.appendChild(li);
        });
    } else {
        document.getElementById('environment-section').style.display = 'none';
    }

    // 施策・デザインの工夫
    if (project.designDetails && project.designDetails.length > 0) {
        const designContainer = document.getElementById('project-design-details');
        project.designDetails.forEach(detail => {
            const item = document.createElement('div');
            item.className = 'design-details__item';

            const title = document.createElement('h3');
            title.className = 'design-details__title';
            title.textContent = detail.title;
            item.appendChild(title);

            const description = document.createElement('p');
            description.className = 'design-details__text';
            description.textContent = detail.description;
            item.appendChild(description);

            // 画像がある場合は表示
            if (detail.images) {
                detail.images.forEach(src => {
                    const img = document.createElement('img');
                    img.src = src;
                    item.appendChild(img);
                });
            }

            designContainer.appendChild(item);
        });
    } else {
        document.getElementById('design-section').style.display = 'none';
    }

    // 成果
    if (project.results && project.results.length > 0) {
        const resultsList = document.getElementById('project-results');
        project.results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = result;
            resultsList.appendChild(li);
        });
    } else {
        document.getElementById('results-section').style.display = 'none';
    }

    // 学び
    if (project.learnings) {
        document.getElementById('project-learnings').textContent = project.learnings;
    } else {
        document.getElementById('learnings-section').style.display = 'none';
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    // data-page属性を設定（パズルピースの色選択用）
    document.body.setAttribute('data-page', 'project-detail');

    loadProjectData();
});
// ===================================
// 落ちるパズルピースのアニメーション
// ===================================

const puzzleImages = [
    'blue@2x.webp',
    'green@2x.webp',
    'lightblue@2x.webp',
    'lightgreen@2x.webp',
    'navy@2x.webp',
    'orange@2x.webp',
    'pink@2x.webp',
    'purple@2x.webp',
    'red@2x.webp',
    'yellow@2x.webp'
];

function createFallingPuzzles() {
    const container = document.getElementById('falling-puzzles');
    if (!container) return;

    // ページごとに使用する色を決定
    const pageName = document.body.getAttribute('data-page') || 'home';
    let selectedPuzzle;

    if (pageName === 'profile') {
        // Profileページ: ランダムに1色選択
        selectedPuzzle = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    } else if (pageName === 'project-detail') {
        // Project Detailページ: ランダムに1色選択
        selectedPuzzle = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    } else {
        // Homeページ: オレンジ固定
        selectedPuzzle = 'orange@2x.webp';
    }

    // 10個のパズルピースを生成
    for (let i = 0; i < 10; i++) {
        const piece = document.createElement('div');
        piece.className = 'falling-puzzles__piece';

        const img = document.createElement('img');
        img.src = `images/${selectedPuzzle}`;
        img.alt = 'Puzzle piece';

        piece.appendChild(img);

        // ランダムな位置とアニメーション設定
        const leftPosition = Math.random() * 100;
        const rotation = Math.random() * 360;
        const scale = 0.5 + Math.random() * 0.8;
        const delay = Math.random() * 5;
        const duration = 15 + Math.random() * 10;

        piece.style.left = `${leftPosition}%`;
        piece.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        piece.style.animationDelay = `${delay}s`;
        piece.style.animationDuration = `${duration}s`;

        container.appendChild(piece);
    }
}

// ===================================
// スクロールトップボタン
// ===================================

function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;

    // スクロール時の表示/非表示
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight / 2) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // クリック時のスクロール
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// 現在の年を表示
// ===================================

function displayCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ===================================
// スムーススクロール
// ===================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// 初期化
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    createFallingPuzzles();
    initScrollToTop();
    displayCurrentYear();
    initSmoothScroll();
});